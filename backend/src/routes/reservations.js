const router = require('express').Router();
const { z } = require('zod');
const prisma = require('../utils/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { createError } = require('../middleware/errorHandler');

const MAX_RESERVATION_RETRIES = 3;

const reservationSchema = z.object({
  apartmentId: z.string().uuid(),
  checkIn:     z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format: YYYY-MM-DD'),
  checkOut:    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format: YYYY-MM-DD'),
  numGuests:   z.number().int().positive(),
});

async function checkAvailability(db, apartmentId, checkIn, checkOut, excludeReservationId = null) {
  const ci = new Date(checkIn);
  const co = new Date(checkOut);

  const conflictingReservation = await db.reservation.findFirst({
    where: {
      apartmentId,
      id:     { not: excludeReservationId || undefined },
      status: { in: ['PENDING', 'CONFIRMED'] },
      checkIn:  { lt: co },
      checkOut: { gt: ci },
    },
  });

  const conflictingBlock = await db.availabilityBlock.findFirst({
    where: {
      apartmentId,
      startDate: { lt: co },
      endDate:   { gt: ci },
    },
  });

  return { available: !conflictingReservation && !conflictingBlock, conflictingReservation, conflictingBlock };
}

function isSerializableRetryError(error) {
  return error?.code === 'P2034';
}

async function createReservationWithRetry(payload) {
  let attempt = 0;

  while (attempt < MAX_RESERVATION_RETRIES) {
    try {
      return await prisma.$transaction(async (tx) => {
        const apartment = await tx.apartment.findFirst({
          where: { id: payload.apartmentId, status: 'APPROVED' },
          select: {
            id: true,
            ownerId: true,
            title: true,
            maxGuests: true,
            minNights: true,
            pricePerNight: true,
          },
        });

        if (!apartment) {
          throw createError('Apartman nije pronađen ili nije dostupan', 404);
        }

        if (apartment.ownerId === payload.guestId) {
          throw createError('Ne možete rezervirati vlastiti apartman', 403);
        }

        if (payload.numGuests > apartment.maxGuests) {
          throw createError(`Apartman prima maksimalno ${apartment.maxGuests} gostiju`);
        }

        const nights = Math.ceil((payload.checkOut - payload.checkIn) / (1000 * 60 * 60 * 24));
        if (nights < apartment.minNights) {
          throw createError(`Minimalni boravak je ${apartment.minNights} noć/i`);
        }

        const { available } = await checkAvailability(
          tx,
          payload.apartmentId,
          payload.checkIn,
          payload.checkOut,
        );
        if (!available) {
          throw createError('Apartman nije dostupan u odabranom terminu', 409);
        }

        const totalPrice = parseFloat(apartment.pricePerNight) * nights;

        const newReservation = await tx.reservation.create({
          data: {
            apartmentId: payload.apartmentId,
            guestId: payload.guestId,
            checkIn: payload.checkIn,
            checkOut: payload.checkOut,
            numGuests: payload.numGuests,
            totalPrice,
            status: 'PENDING',
          },
          include: {
            apartment: { select: { id: true, title: true, ownerId: true } },
            guest: { select: { id: true, firstName: true, lastName: true } },
          },
        });

        await tx.notification.create({
          data: {
            userId: newReservation.apartment.ownerId,
            type: 'RESERVATION_NEW',
            content: `Nova rezervacija za "${newReservation.apartment.title}" od ${newReservation.guest.firstName} ${newReservation.guest.lastName}`,
          },
        });

        return newReservation;
      }, {
        isolationLevel: 'Serializable',
      });
    } catch (error) {
      attempt += 1;
      if (!isSerializableRetryError(error) || attempt >= MAX_RESERVATION_RETRIES) {
        throw error;
      }
    }
  }

  throw createError('Došlo je do konflikta pri rezervaciji. Pokušajte ponovno.', 409);
}

function startOfDay(date) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

function getCancellationNotice(cancellationPolicy) {
  if (cancellationPolicy === 'STRICT') {
    return 'Otkazivanje nije dopušteno';
  }

  let minimumDays = 1;

  if (cancellationPolicy === 'MODERATE') {
    minimumDays = 5;
  }

  return `Rezervaciju možete otkazati najkasnije ${minimumDays} dana prije check-ina`;
}

router.get('/my', authenticate, async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = { guestId: req.user.id };

    if (status) {
      where.status = status;
    }

    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        apartment: true,
        review: { select: { id: true, rating: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(reservations);
  } catch (err) {
    next(err);
  }
});

router.get('/owner', authenticate, authorize('OWNER'), async (req, res, next) => {
  try {
    const { status, apartmentId } = req.query;
    const where = {
      apartment: { ownerId: req.user.id },
    };

    if (status) {
      where.status = status;
    }

    if (apartmentId) {
      where.apartmentId = apartmentId;
    }

    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        apartment: { select: { id: true, title: true } },
        guest:     { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
        review:    { select: { id: true, rating: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(reservations);
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const data = reservationSchema.parse(req.body);
    const ci = new Date(data.checkIn);
    const co = new Date(data.checkOut);

    if (ci >= co) {
      return next(createError('Datum check-out mora biti nakon check-in'));
    }

    if (ci < startOfDay(new Date())) {
      return next(createError('Check-in ne može biti u prošlosti'));
    }

    const reservation = await createReservationWithRetry({
      apartmentId: data.apartmentId,
      guestId: req.user.id,
      checkIn: ci,
      checkOut: co,
      numGuests: data.numGuests,
    });

    res.status(201).json(reservation);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/status', authenticate, async (req, res, next) => {
  try {
    const { status } = z.object({
      status: z.enum(['CONFIRMED', 'REJECTED', 'CANCELLED']),
    }).parse(req.body);

    const reservation = await prisma.reservation.findUnique({
      where:   { id: req.params.id },
      include: {
        apartment: { select: { ownerId: true, title: true, cancellationPolicy: true } },
        guest:     { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (!reservation) {
      return next(createError('Rezervacija nije pronađena', 404));
    }

    const isOwner = req.user.id === reservation.apartment.ownerId;
    const isGuest = req.user.id === reservation.guestId;

    if (!isOwner && !isGuest) {
      return next(createError('Nemate ovlasti', 403));
    }

    if (isGuest && status !== 'CANCELLED') {
      return next(createError('Gost može samo otkazati rezervaciju', 403));
    }

    if (isOwner && status === 'CANCELLED') {
      return next(createError('Vlasnik ne može otkazati — koristi REJECTED', 403));
    }

    if (isGuest && status === 'CANCELLED') {
      if (!['PENDING', 'CONFIRMED'].includes(reservation.status)) {
        return next(createError('Rezervaciju nije moguće otkazati u ovom statusu', 400));
      }

      if (reservation.status === 'CONFIRMED') {
        const today = startOfDay(new Date());
        const checkIn = startOfDay(reservation.checkIn);
        const daysUntilCheckIn = Math.floor((checkIn - today) / (1000 * 60 * 60 * 24));

        const minDaysByPolicy = {
          FLEXIBLE: 1,
          MODERATE: 5,
          STRICT: Number.POSITIVE_INFINITY,
        };

        let requiredDays = minDaysByPolicy[reservation.apartment.cancellationPolicy];
        if (requiredDays === undefined) {
          requiredDays = 1;
        }

        if (daysUntilCheckIn < requiredDays) {
          return next(createError(getCancellationNotice(reservation.apartment.cancellationPolicy), 400));
        }
      }
    }

    let targetUserId;

    if (isOwner) {
      targetUserId = reservation.guestId;
    } else {
      targetUserId = reservation.apartment.ownerId;
    }

    let statusText = 'otkazana';

    if (status === 'CONFIRMED') {
      statusText = 'potvrđena';
    } else if (status === 'REJECTED') {
      statusText = 'odbijena';
    }

    const [updated] = await prisma.$transaction([
      prisma.reservation.update({
        where: { id: req.params.id },
        data:  { status },
      }),
      prisma.notification.create({
        data: {
          userId:  targetUserId,
          type:    `RESERVATION_${status}`,
          content: `Rezervacija za "${reservation.apartment.title}" je ${statusText}`,
        },
      }),
    ]);

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.get('/check-availability', async (req, res, next) => {
  try {
    const { apartmentId, checkIn, checkOut } = req.query;
    if (!apartmentId || !checkIn || !checkOut) {
      return next(createError('Nedostaju parametri: apartmentId, checkIn, checkOut'));
    }

    const { available } = await checkAvailability(prisma, apartmentId, checkIn, checkOut);
    res.json({ available });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
