const fs = require("fs");
const router = require("express").Router();
const { z } = require("zod");
const prisma = require("../utils/prisma");
const { authenticate, authorize } = require("../middleware/auth");
const { createError } = require("../middleware/errorHandler");
const { broadcastAvailabilityChanged } = require("../websocket");
const {
  uploadApartmentPhoto,
  apartmentPhotoFilePath,
} = require("../middleware/upload");

const APARTMENT_PHOTO_URL_PREFIX = "/uploads/apartments/";
const MAX_PHOTOS_PER_APARTMENT = 15;
const UUID = "[0-9a-fA-F-]{36}";

const apartmentSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  city: z.string().min(2),
  country: z.string().min(2),
  countryCode: z.string().length(2).optional(),
  address: z.string().min(5),
  placeId: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  pricePerNight: z.number().positive().max(9999),
  maxGuests: z.number().int().positive().max(10),
  minNights: z.number().int().positive().max(19).default(1),
  cancellationPolicy: z
    .enum(["FLEXIBLE", "MODERATE", "STRICT"])
    .default("FLEXIBLE"),
  contentIds: z.array(z.string().uuid()).optional(),
});

function normalizeCity(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const availabilityBlockSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().max(500).optional(),
});

const photoReorderSchema = z.object({
  photoIds: z.array(z.string().uuid()).min(1),
});

async function isApartmentOwner(apartmentId, user) {
  const apartment = await prisma.apartment.findUnique({
    where: { id: apartmentId },
  });
  if (!apartment) {
    throw createError("Apartman nije pronađen", 404);
  }

  if (user.role === "OWNER" && apartment.ownerId !== user.id) {
    throw createError("Nemate ovlasti za ovaj apartman", 403);
  }

  return apartment;
}

function removeLocalPhotoFile(url) {
  if (!url || !url.startsWith(APARTMENT_PHOTO_URL_PREFIX)) {
    return;
  }

  const filename = url.slice(APARTMENT_PHOTO_URL_PREFIX.length);
  if (!filename) {
    return;
  }

  fs.promises.unlink(apartmentPhotoFilePath(filename)).catch(() => {});
}

function startOfDay(date) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

function monthLabel(year, month) {
  const mm = String(month).padStart(2, "0");
  return `${mm}/${year}`;
}

function monthKey(year, month) {
  const mm = String(month).padStart(2, "0");
  return `${year}-${mm}`;
}

function parseDateOnly(value) {
  const parsed = new Date(value);
  parsed.setHours(0, 0, 0, 0);
  return parsed;
}

function toDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function mergeUnavailableRanges(ranges) {
  if (!ranges.length) {
    return [];
  }

  const sortedRanges = ranges
    .map((range) => ({
      from: parseDateOnly(range.from),
      to: parseDateOnly(range.to),
    }))
    .sort((a, b) => a.from - b.from);

  const merged = [sortedRanges[0]];

  for (let index = 1; index < sortedRanges.length; index += 1) {
    const current = sortedRanges[index];
    const last = merged[merged.length - 1];
    const contiguousBoundary = addDays(last.to, 1);

    if (current.from <= contiguousBoundary) {
      if (current.to > last.to) {
        last.to = current.to;
      }
    } else {
      merged.push(current);
    }
  }

  return merged;
}

router.get("/", async (req, res, next) => {
  try {
    const {
      city,
      checkIn,
      checkOut,
      guests,
      minPrice,
      maxPrice,
      page = 1,
      limit = 12,
    } = req.query;

    const where = { status: "APPROVED" };

    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }

    if (guests) {
      where.maxGuests = { gte: parseInt(guests) };
    }

    if (minPrice) {
      where.pricePerNight = { gte: parseFloat(minPrice) };
    }

    if (maxPrice) {
      if (!where.pricePerNight) {
        where.pricePerNight = {};
      }

      where.pricePerNight.lte = parseFloat(maxPrice);
    }

    if (checkIn && checkOut) {
      const ci = new Date(checkIn);
      const co = new Date(checkOut);

      where.AND = [
        {
          reservations: {
            none: {
              status: { in: ["PENDING", "CONFIRMED"] },
              OR: [{ checkIn: { lt: co }, checkOut: { gt: ci } }],
            },
          },
        },
        {
          availabilityBlocks: {
            none: {
              startDate: { lt: co },
              endDate: { gt: ci },
            },
          },
        },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [apartments, total] = await prisma.$transaction([
      prisma.apartment.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          owner: { select: { id: true, firstName: true, lastName: true } },
          photos: { orderBy: { displayOrder: "asc" }, take: 1 },
          reviews: { select: { rating: true } },
          contents: { include: { content: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.apartment.count({ where }),
    ]);

    const result = apartments.map((apt) => {
      let avgRating = null;

      if (apt.reviews.length > 0) {
        const ratingSum = apt.reviews.reduce(
          (sum, review) => sum + review.rating,
          0,
        );
        avgRating = ratingSum / apt.reviews.length;
      }

      return {
        ...apt,
        avgRating,
        reviewCount: apt.reviews.length,
      };
    });

    res.json({
      apartments: result,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    next(err);
  }
});

router.get(
  `/:id(${UUID})/stats`,
  authenticate,
  authorize("OWNER", "ADMIN"),
  async (req, res, next) => {
    try {
      const apartment = await prisma.apartment.findUnique({
        where: { id: req.params.id },
        select: { id: true, ownerId: true, title: true },
      });

      if (!apartment) {
        return next(createError("Apartman nije pronađen", 404));
      }

      if (req.user.role === "OWNER" && apartment.ownerId !== req.user.id) {
        return next(createError("Nemate ovlasti za ovaj apartman", 403));
      }

      const parseMonthInput = (monthStr) => {
        const [year, month] = monthStr.split("-").map(Number);
        return new Date(year, month - 1, 1);
      };

      const startDate = req.query.startDate
        ? parseMonthInput(req.query.startDate)
        : new Date(new Date().setMonth(new Date().getMonth() - 11));
      const endDate = req.query.endDate
        ? new Date(
            parseMonthInput(req.query.endDate).getFullYear(),
            parseMonthInput(req.query.endDate).getMonth() + 1,
            0,
          )
        : new Date();

      if (startDate >= endDate) {
        return next(
          createError('Parametar "startDate" mora biti prije "endDate"', 400),
        );
      }

      const reservations = await prisma.reservation.findMany({
        where: {
          apartmentId: req.params.id,
          checkIn: { gte: startDate, lte: endDate },
        },
        select: {
          status: true,
          checkIn: true,
          checkOut: true,
          totalPrice: true,
        },
        orderBy: { checkIn: "asc" },
      });

      const today = startOfDay(new Date());

      const monthlyMap = {};
      const yearlyMap = {};

      let totalReservations = 0;
      let pendingReservations = 0;
      let cancelledReservations = 0;
      let rejectedReservations = 0;
      let completedReservations = 0;
      let totalIncome = 0;

      for (const reservation of reservations) {
        totalReservations += 1;

        if (reservation.status === "PENDING") {
          pendingReservations += 1;
        }

        if (reservation.status === "CANCELLED") {
          cancelledReservations += 1;
        }

        if (reservation.status === "REJECTED") {
          rejectedReservations += 1;
        }

        const checkOutDate = startOfDay(reservation.checkOut);
        const isRealizedStay =
          reservation.status === "COMPLETED" ||
          (reservation.status === "CONFIRMED" && checkOutDate <= today);

        if (!isRealizedStay) {
          continue;
        }

        completedReservations += 1;

        const amount = Number(reservation.totalPrice || 0);
        totalIncome += amount;

        const checkInDate = new Date(reservation.checkIn);
        const year = checkInDate.getFullYear();
        const month = checkInDate.getMonth() + 1;
        const key = monthKey(year, month);

        if (!monthlyMap[key]) {
          monthlyMap[key] = {
            year,
            month,
            label: monthLabel(year, month),
            reservations: 0,
            income: 0,
          };
        }

        monthlyMap[key].reservations += 1;
        monthlyMap[key].income += amount;

        if (!yearlyMap[year]) {
          yearlyMap[year] = {
            year,
            label: String(year),
            reservations: 0,
            income: 0,
          };
        }

        yearlyMap[year].reservations += 1;
        yearlyMap[year].income += amount;
      }

      const monthlyTrend = [];
      const cursor = new Date(startDate);
      cursor.setDate(1);

      while (cursor <= endDate) {
        const year = cursor.getFullYear();
        const month = cursor.getMonth() + 1;
        const key = monthKey(year, month);
        const existing = monthlyMap[key];

        if (existing) {
          monthlyTrend.push(existing);
        } else {
          monthlyTrend.push({
            year,
            month,
            label: monthLabel(year, month),
            reservations: 0,
            income: 0,
          });
        }

        cursor.setMonth(cursor.getMonth() + 1);
      }

      const yearlyTrend = Object.values(yearlyMap).sort(
        (a, b) => a.year - b.year,
      );

      res.json({
        apartmentId: apartment.id,
        apartmentTitle: apartment.title,
        totalReservations,
        pendingReservations,
        cancelledReservations,
        rejectedReservations,
        completedReservations,
        totalIncome,
        monthlyTrend,
        yearlyTrend,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get(`/:id(${UUID})/calendar-availability`, async (req, res, next) => {
  try {
    const apartment = await prisma.apartment.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        minNights: true,
        cancellationPolicy: true,
        pricePerNight: true,
      },
    });

    if (!apartment) {
      return next(createError("Apartman nije pronađen", 404));
    }

    const requestedFrom = req.query.from
      ? parseDateOnly(req.query.from)
      : startOfDay(new Date());
    const requestedTo = req.query.to
      ? parseDateOnly(req.query.to)
      : addDays(requestedFrom, 365);

    if (
      Number.isNaN(requestedFrom.getTime()) ||
      Number.isNaN(requestedTo.getTime())
    ) {
      return next(
        createError("Neispravan datum. Koristite format YYYY-MM-DD.", 400),
      );
    }

    if (requestedFrom >= requestedTo) {
      return next(
        createError('Parametar "from" mora biti prije parametra "to".', 400),
      );
    }

    const [activeReservations, availabilityBlocks] = await prisma.$transaction([
      prisma.reservation.findMany({
        where: {
          apartmentId: req.params.id,
          status: { in: ["PENDING", "CONFIRMED"] },
          checkIn: { lt: requestedTo },
          checkOut: { gt: requestedFrom },
        },
        select: {
          checkIn: true,
          checkOut: true,
        },
      }),
      prisma.availabilityBlock.findMany({
        where: {
          apartmentId: req.params.id,
          startDate: { lt: requestedTo },
          endDate: { gt: requestedFrom },
        },
        select: {
          startDate: true,
          endDate: true,
        },
      }),
    ]);

    const rawUnavailableRanges = [
      ...activeReservations.map((reservation) => ({
        from: reservation.checkIn,
        to: addDays(reservation.checkOut, -1),
      })),
      ...availabilityBlocks.map((block) => ({
        from: block.startDate,
        to: addDays(block.endDate, -1),
      })),
    ].filter((range) => range.to >= range.from);

    const unavailableRanges = mergeUnavailableRanges(rawUnavailableRanges).map(
      (range) => ({
        from: toDateString(range.from),
        to: toDateString(range.to),
      }),
    );

    res.json({
      apartmentId: apartment.id,
      minNights: apartment.minNights,
      cancellationPolicy: apartment.cancellationPolicy,
      pricePerNight: Number(apartment.pricePerNight || 0),
      from: toDateString(requestedFrom),
      to: toDateString(requestedTo),
      unavailableRanges,
    });
  } catch (err) {
    next(err);
  }
});

router.get(
  "/owner/mine",
  authenticate,
  authorize("OWNER"),
  async (req, res, next) => {
    try {
      const apartments = await prisma.apartment.findMany({
        where: { ownerId: req.user.id },
        include: {
          photos: { orderBy: { displayOrder: "asc" }, take: 1 },
          reviews: { select: { rating: true } },
          contents: { include: { content: true } },
          _count: { select: { reservations: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      const result = apartments.map((apt) => {
        let avgRating = null;

        if (apt.reviews.length > 0) {
          const ratingSum = apt.reviews.reduce(
            (sum, review) => sum + review.rating,
            0,
          );
          avgRating = ratingSum / apt.reviews.length;
        }

        return {
          ...apt,
          avgRating,
        };
      });

      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

router.get("/:id", async (req, res, next) => {
  try {
    const apartment = await prisma.apartment.findUnique({
      where: { id: req.params.id },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            createdAt: true,
          },
        },
        photos: { orderBy: { displayOrder: "asc" } },
        contents: { include: { content: true } },
        reviews: {
          include: {
            guest: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!apartment) {
      return next(createError("Apartman nije pronađen", 404));
    }

    let avgRating = null;

    if (apartment.reviews.length > 0) {
      const ratingSum = apartment.reviews.reduce(
        (sum, review) => sum + review.rating,
        0,
      );
      avgRating = ratingSum / apartment.reviews.length;
    }

    res.json({
      ...apartment,
      avgRating,
      reviewCount: apartment.reviews.length,
    });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/",
  authenticate,
  authorize("OWNER", "ADMIN"),
  async (req, res, next) => {
    try {
      const { contentIds, ...data } = apartmentSchema.parse(req.body);

      const apartmentData = {
        ...data,
        countryCode: data.countryCode ? data.countryCode.toUpperCase() : null,
        cityNormalized: normalizeCity(data.city),
        ownerId: req.user.id,
        status: "PENDING",
      };

      if (contentIds && contentIds.length > 0) {
        apartmentData.contents = {
          create: contentIds.map((id) => ({ contentId: id })),
        };
      }

      const apartment = await prisma.apartment.create({
        data: {
          ...apartmentData,
        },
        include: { contents: { include: { content: true } } },
      });

      if (contentIds && contentIds.length > 0) {
        await prisma.content.updateMany({
          where: { id: { in: contentIds }, apartmentId: null },
          data: { apartmentId: apartment.id },
        });
      }

      const admins = await prisma.user.findMany({
        where: { role: "ADMIN", id: { not: req.user.id } },
        select: { id: true },
      });

      if (admins.length > 0) {
        await prisma.notification.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            type: "APARTMENT_NEW",
            content: `Novi apartman "${apartment.title}" čeka moderaciju [apartment:${apartment.id}]`,
          })),
        });
      }

      res.status(201).json(apartment);
    } catch (err) {
      next(err);
    }
  },
);

router.put(
  "/:id",
  authenticate,
  authorize("OWNER", "ADMIN"),
  async (req, res, next) => {
    try {
      const apartment = await prisma.apartment.findUnique({
        where: { id: req.params.id },
      });
      if (!apartment) {
        return next(createError("Apartman nije pronađen", 404));
      }

      if (req.user.role === "OWNER" && apartment.ownerId !== req.user.id) {
        return next(createError("Nemate ovlasti za ovaj apartman", 403));
      }

      const { contentIds, ...data } = apartmentSchema.partial().parse(req.body);

      if (data.city) {
        data.cityNormalized = normalizeCity(data.city);
      }
      if (data.countryCode) {
        data.countryCode = data.countryCode.toUpperCase();
      }

      const updated = await prisma.$transaction(async (tx) => {
        if (contentIds !== undefined) {
          await tx.apartmentContent.deleteMany({
            where: { apartmentId: req.params.id },
          });
          if (contentIds.length) {
            await tx.apartmentContent.createMany({
              data: contentIds.map((id) => ({
                apartmentId: req.params.id,
                contentId: id,
              })),
            });
          }
        }

        return tx.apartment.update({
          where: { id: req.params.id },
          data,
          include: { contents: { include: { content: true } }, photos: true },
        });
      });

      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
);

router.delete(
  "/:id",
  authenticate,
  authorize("OWNER", "ADMIN"),
  async (req, res, next) => {
    try {
      const apartment = await prisma.apartment.findUnique({
        where: { id: req.params.id },
      });
      if (!apartment) {
        return next(createError("Apartman nije pronađen", 404));
      }

      if (req.user.role === "OWNER" && apartment.ownerId !== req.user.id) {
        return next(createError("Nemate ovlasti za ovaj apartman", 403));
      }

      const photos = await prisma.apartmentPhoto.findMany({
        where: { apartmentId: req.params.id },
        select: { url: true },
      });

      await prisma.apartment.delete({ where: { id: req.params.id } });
      photos.forEach((photo) => removeLocalPhotoFile(photo.url));
      res.json({ message: "Apartman obrisan" });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/:id/availability-blocks",
  authenticate,
  authorize("OWNER", "ADMIN"),
  async (req, res, next) => {
    try {
      await isApartmentOwner(req.params.id, req.user);

      const blocks = await prisma.availabilityBlock.findMany({
        where: { apartmentId: req.params.id },
        orderBy: { startDate: "asc" },
      });

      res.json(blocks);
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  "/:id/availability-blocks",
  authenticate,
  authorize("OWNER", "ADMIN"),
  async (req, res, next) => {
    try {
      const data = availabilityBlockSchema.parse(req.body);
      await isApartmentOwner(req.params.id, req.user);

      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      if (startDate >= endDate) {
        return next(
          createError("Datum završetka mora biti nakon datuma početka"),
        );
      }

      const [existingBlock, activeReservation] = await prisma.$transaction([
        prisma.availabilityBlock.findFirst({
          where: {
            apartmentId: req.params.id,
            startDate: { lt: endDate },
            endDate: { gt: startDate },
          },
        }),
        prisma.reservation.findFirst({
          where: {
            apartmentId: req.params.id,
            status: { in: ["PENDING", "CONFIRMED"] },
            checkIn: { lt: endDate },
            checkOut: { gt: startDate },
          },
        }),
      ]);

      if (existingBlock) {
        return next(createError("Termin je već blokiran", 409));
      }
      if (activeReservation) {
        return next(
          createError("Termin se preklapa s aktivnom rezervacijom", 409),
        );
      }

      const block = await prisma.availabilityBlock.create({
        data: {
          apartmentId: req.params.id,
          startDate,
          endDate,
          reason: data.reason,
        },
      });

      broadcastAvailabilityChanged(req.params.id);
      res.status(201).json(block);
    } catch (err) {
      next(err);
    }
  },
);

router.delete(
  "/:id/availability-blocks/:blockId",
  authenticate,
  authorize("OWNER", "ADMIN"),
  async (req, res, next) => {
    try {
      await isApartmentOwner(req.params.id, req.user);

      const block = await prisma.availabilityBlock.findUnique({
        where: { id: req.params.blockId },
      });
      if (!block || block.apartmentId !== req.params.id) {
        return next(createError("Blokada nije pronađena", 404));
      }

      await prisma.availabilityBlock.delete({
        where: { id: req.params.blockId },
      });

      broadcastAvailabilityChanged(req.params.id);
      res.json({ message: "Blokada obrisana" });
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  "/:id/photos",
  authenticate,
  authorize("OWNER", "ADMIN"),
  uploadApartmentPhoto,
  async (req, res, next) => {
    try {
      if (!req.file) {
        return next(createError('Slika je obavezna (polje "photo").', 400));
      }

      await isApartmentOwner(req.params.id, req.user);

      const photoCount = await prisma.apartmentPhoto.count({
        where: { apartmentId: req.params.id },
      });
      if (photoCount >= MAX_PHOTOS_PER_APARTMENT) {
        removeLocalPhotoFile(
          `${APARTMENT_PHOTO_URL_PREFIX}${req.file.filename}`,
        );
        return next(
          createError(
            `Dosegnut je maksimalni broj fotografija (${MAX_PHOTOS_PER_APARTMENT}).`,
            409,
          ),
        );
      }

      const latestPhoto = await prisma.apartmentPhoto.findFirst({
        where: { apartmentId: req.params.id },
        orderBy: { displayOrder: "desc" },
      });

      const nextDisplayOrder = latestPhoto ? latestPhoto.displayOrder + 1 : 0;

      const photo = await prisma.apartmentPhoto.create({
        data: {
          apartmentId: req.params.id,
          url: `${APARTMENT_PHOTO_URL_PREFIX}${req.file.filename}`,
          displayOrder: nextDisplayOrder,
        },
      });

      res.status(201).json(photo);
    } catch (err) {
      if (req.file) {
        removeLocalPhotoFile(
          `${APARTMENT_PHOTO_URL_PREFIX}${req.file.filename}`,
        );
      }
      next(err);
    }
  },
);

router.delete(
  "/:id/photos/:photoId",
  authenticate,
  authorize("OWNER", "ADMIN"),
  async (req, res, next) => {
    try {
      await isApartmentOwner(req.params.id, req.user);

      const photo = await prisma.apartmentPhoto.findUnique({
        where: { id: req.params.photoId },
      });
      if (!photo || photo.apartmentId !== req.params.id) {
        return next(createError("Fotografija nije pronađena", 404));
      }

      await prisma.apartmentPhoto.delete({ where: { id: req.params.photoId } });
      removeLocalPhotoFile(photo.url);
      res.json({ message: "Fotografija obrisana" });
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  "/:id/photos/reorder",
  authenticate,
  authorize("OWNER", "ADMIN"),
  async (req, res, next) => {
    try {
      const { photoIds } = photoReorderSchema.parse(req.body);
      await isApartmentOwner(req.params.id, req.user);

      const uniquePhotoIds = [...new Set(photoIds)];
      if (uniquePhotoIds.length !== photoIds.length) {
        return next(createError("Lista fotografija sadrži duplikate.", 400));
      }

      const photos = await prisma.apartmentPhoto.findMany({
        where: { apartmentId: req.params.id },
        select: { id: true },
      });

      if (
        photos.length !== photoIds.length ||
        !photos.every((photo) => photoIds.includes(photo.id))
      ) {
        return next(
          createError("Lista mora sadržavati sve fotografije apartmana.", 400),
        );
      }

      await prisma.$transaction(
        photoIds.map((photoId, index) =>
          prisma.apartmentPhoto.update({
            where: { id: photoId },
            data: { displayOrder: index },
          }),
        ),
      );

      res.json({ message: "Redoslijed fotografija je ažuriran" });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
