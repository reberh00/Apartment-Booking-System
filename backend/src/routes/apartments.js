const router = require('express').Router();
const { z } = require('zod');
const prisma = require('../utils/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { createError } = require('../middleware/errorHandler');

const apartmentSchema = z.object({
  title:              z.string().min(5),
  description:        z.string().min(20),
  city:               z.string().min(2),
  country:            z.string().min(2),
  address:            z.string().min(5),
  latitude:           z.number().min(-90).max(90),
  longitude:          z.number().min(-180).max(180),
  pricePerNight:      z.number().positive(),
  maxGuests:          z.number().int().positive(),
  minNights:          z.number().int().positive().default(1),
  cancellationPolicy: z.enum(['FLEXIBLE', 'MODERATE', 'STRICT']).default('FLEXIBLE'),
  contentIds:         z.array(z.string().uuid()).optional(),
});

const availabilityBlockSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().max(500).optional(),
});

async function isApartmentOwner(apartmentId, user) {
  const apartment = await prisma.apartment.findUnique({ where: { id: apartmentId } });
  if (!apartment) {
    throw createError('Apartman nije pronađen', 404);
  }

  if (user.role === 'OWNER' && apartment.ownerId !== user.id) {
    throw createError('Nemate ovlasti za ovaj apartman', 403);
  }

  return apartment;
}

function startOfDay(date) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

function monthLabel(year, month) {
  const mm = String(month).padStart(2, '0');
  return `${mm}/${year}`;
}

function monthKey(year, month) {
  const mm = String(month).padStart(2, '0');
  return `${year}-${mm}`;
}

function parseDateOnly(value) {
  const parsed = new Date(value);
  parsed.setHours(0, 0, 0, 0);
  return parsed;
}

function toDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
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

router.get('/', async (req, res, next) => {
  try {
    const { city, checkIn, checkOut, guests, minPrice, maxPrice, page = 1, limit = 12 } = req.query;

    const where = { status: 'APPROVED' };

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
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
              status: { in: ['PENDING', 'CONFIRMED'] },
              OR: [
                { checkIn: { lt: co }, checkOut: { gt: ci } },
              ],
            },
          },
        },
        {
          availabilityBlocks: {
            none: {
              startDate: { lt: co },
              endDate:   { gt: ci },
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
          reviews:  { select: { rating: true } },
          contents: { include: { content: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.apartment.count({ where }),
    ]);

    const result = apartments.map((apt) => {
      let avgRating = null;

      if (apt.reviews.length > 0) {
        const ratingSum = apt.reviews.reduce((sum, review) => sum + review.rating, 0);
        avgRating = ratingSum / apt.reviews.length;
      }

      return {
        ...apt,
        avgRating,
        reviewCount: apt.reviews.length,
      };
    });

    res.json({ apartments: result, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    next(err);
  }
});

router.get('/:id([0-9a-fA-F-]{36})/stats', authenticate, authorize('OWNER', 'ADMIN'), async (req, res, next) => {
  try {
    const apartment = await prisma.apartment.findUnique({
      where: { id: req.params.id },
      select: { id: true, ownerId: true, title: true },
    });

    if (!apartment) {
      return next(createError('Apartman nije pronađen', 404));
    }

    if (req.user.role === 'OWNER' && apartment.ownerId !== req.user.id) {
      return next(createError('Nemate ovlasti za ovaj apartman', 403));
    }

    const reservations = await prisma.reservation.findMany({
      where: { apartmentId: req.params.id },
      select: {
        status: true,
        checkIn: true,
        checkOut: true,
        totalPrice: true,
      },
      orderBy: { checkIn: 'asc' },
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

      if (reservation.status === 'PENDING') {
        pendingReservations += 1;
      }

      if (reservation.status === 'CANCELLED') {
        cancelledReservations += 1;
      }

      if (reservation.status === 'REJECTED') {
        rejectedReservations += 1;
      }

      const checkOutDate = startOfDay(reservation.checkOut);
      const isRealizedStay = reservation.status === 'COMPLETED'
        || (reservation.status === 'CONFIRMED' && checkOutDate <= today);

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
    const cursor = new Date(today.getFullYear(), today.getMonth() - 11, 1);

    for (let index = 0; index < 12; index += 1) {
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

    const yearlyTrend = Object.values(yearlyMap)
      .sort((a, b) => a.year - b.year);

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
});

router.get('/:id([0-9a-fA-F-]{36})/calendar-availability', async (req, res, next) => {
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
      return next(createError('Apartman nije pronađen', 404));
    }

    const requestedFrom = req.query.from ? parseDateOnly(req.query.from) : startOfDay(new Date());
    const requestedTo = req.query.to ? parseDateOnly(req.query.to) : addDays(requestedFrom, 365);

    if (Number.isNaN(requestedFrom.getTime()) || Number.isNaN(requestedTo.getTime())) {
      return next(createError('Neispravan datum. Koristite format YYYY-MM-DD.', 400));
    }

    if (requestedFrom >= requestedTo) {
      return next(createError('Parametar "from" mora biti prije parametra "to".', 400));
    }

    const [activeReservations, availabilityBlocks] = await prisma.$transaction([
      prisma.reservation.findMany({
        where: {
          apartmentId: req.params.id,
          status: { in: ['PENDING', 'CONFIRMED'] },
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

    const unavailableRanges = mergeUnavailableRanges(rawUnavailableRanges)
      .map((range) => ({
        from: toDateString(range.from),
        to: toDateString(range.to),
      }));

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

router.get('/owner/mine', authenticate, authorize('OWNER'), async (req, res, next) => {
  try {
    const apartments = await prisma.apartment.findMany({
      where: { ownerId: req.user.id },
      include: {
        reviews:  { select: { rating: true } },
        contents: { include: { content: true } },
        _count:   { select: { reservations: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const result = apartments.map((apt) => {
      let avgRating = null;

      if (apt.reviews.length > 0) {
        const ratingSum = apt.reviews.reduce((sum, review) => sum + review.rating, 0);
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
});

router.get('/:id', async (req, res, next) => {
  try {
    const apartment = await prisma.apartment.findUnique({
      where: { id: req.params.id },
      include: {
        owner:    { select: { id: true, firstName: true, lastName: true, avatarUrl: true, createdAt: true } },
        contents: { include: { content: true } },
        reviews:  {
          include: { guest: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!apartment) {
      return next(createError('Apartman nije pronađen', 404));
    }

    let avgRating = null;

    if (apartment.reviews.length > 0) {
      const ratingSum = apartment.reviews.reduce((sum, review) => sum + review.rating, 0);
      avgRating = ratingSum / apartment.reviews.length;
    }

    res.json({ ...apartment, avgRating, reviewCount: apartment.reviews.length });
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, authorize('OWNER', 'ADMIN'), async (req, res, next) => {
  try {
    const { contentIds, ...data } = apartmentSchema.parse(req.body);

    const apartmentData = {
      ...data,
      ownerId: req.user.id,
      status: 'PENDING',
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

    res.status(201).json(apartment);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authenticate, authorize('OWNER', 'ADMIN'), async (req, res, next) => {
  try {
    const apartment = await prisma.apartment.findUnique({ where: { id: req.params.id } });
    if (!apartment) {
      return next(createError('Apartman nije pronađen', 404));
    }

    if (req.user.role === 'OWNER' && apartment.ownerId !== req.user.id) {
      return next(createError('Nemate ovlasti za ovaj apartman', 403));
    }

    const { contentIds, ...data } = apartmentSchema.partial().parse(req.body);

    const updated = await prisma.$transaction(async (tx) => {
      if (contentIds !== undefined) {
        await tx.apartmentContent.deleteMany({ where: { apartmentId: req.params.id } });
        if (contentIds.length) {
          await tx.apartmentContent.createMany({
            data: contentIds.map(id => ({ apartmentId: req.params.id, contentId: id })),
          });
        }
      }

      return tx.apartment.update({
        where:   { id: req.params.id },
        data,
        include: { contents: { include: { content: true } } },
      });
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, authorize('OWNER', 'ADMIN'), async (req, res, next) => {
  try {
    const apartment = await prisma.apartment.findUnique({ where: { id: req.params.id } });
    if (!apartment) {
      return next(createError('Apartman nije pronađen', 404));
    }

    if (req.user.role === 'OWNER' && apartment.ownerId !== req.user.id) {
      return next(createError('Nemate ovlasti za ovaj apartman', 403));
    }

    await prisma.apartment.delete({ where: { id: req.params.id } });
    res.json({ message: 'Apartman obrisan' });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/availability-blocks', authenticate, authorize('OWNER', 'ADMIN'), async (req, res, next) => {
  try {
    await isApartmentOwner(req.params.id, req.user);

    const blocks = await prisma.availabilityBlock.findMany({
      where: { apartmentId: req.params.id },
      orderBy: { startDate: 'asc' },
    });

    res.json(blocks);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/availability-blocks', authenticate, authorize('OWNER', 'ADMIN'), async (req, res, next) => {
  try {
    const data = availabilityBlockSchema.parse(req.body);
    await isApartmentOwner(req.params.id, req.user);

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    if (startDate >= endDate) {
      return next(createError('Datum završetka mora biti nakon datuma početka'));
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
          status: { in: ['PENDING', 'CONFIRMED'] },
          checkIn: { lt: endDate },
          checkOut: { gt: startDate },
        },
      }),
    ]);

    if (existingBlock) {
      return next(createError('Termin je već blokiran', 409));
    }
    if (activeReservation) {
      return next(createError('Termin se preklapa s aktivnom rezervacijom', 409));
    }

    const block = await prisma.availabilityBlock.create({
      data: {
        apartmentId: req.params.id,
        startDate,
        endDate,
        reason: data.reason,
      },
    });

    res.status(201).json(block);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id/availability-blocks/:blockId', authenticate, authorize('OWNER', 'ADMIN'), async (req, res, next) => {
  try {
    await isApartmentOwner(req.params.id, req.user);

    const block = await prisma.availabilityBlock.findUnique({ where: { id: req.params.blockId } });
    if (!block || block.apartmentId !== req.params.id) {
      return next(createError('Blokada nije pronađena', 404));
    }

    await prisma.availabilityBlock.delete({ where: { id: req.params.blockId } });
    res.json({ message: 'Blokada obrisana' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
