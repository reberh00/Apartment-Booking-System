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
