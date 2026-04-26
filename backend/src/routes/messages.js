const router = require('express').Router();
const { z } = require('zod');
const prisma = require('../utils/prisma');
const { authenticate } = require('../middleware/auth');
const { createError } = require('../middleware/errorHandler');

router.get('/:reservationId', authenticate, async (req, res, next) => {
  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: req.params.reservationId },
      include: { apartment: { select: { ownerId: true } } },
    });
    if (!reservation) {
      return next(createError('Rezervacija nije pronađena', 404));
    }

    const isGuest = req.user.id === reservation.guestId;
    const isOwner = req.user.id === reservation.apartment.ownerId;
    const isParticipant = isGuest || isOwner;

    if (!isParticipant) {
      return next(createError('Nemate pristup ovom chatu', 403));
    }

    const messages = await prisma.message.findMany({
      where:   { reservationId: req.params.reservationId },
      include: { sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
      orderBy: { createdAt: 'asc' },
    });

    res.json(messages);
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const createMessageSchema = z.object({
      reservationId: z.string().uuid(),
      content:       z.string().min(1).max(2000),
    });

    const { reservationId, content } = createMessageSchema.parse(req.body);

    const reservation = await prisma.reservation.findUnique({
      where:   { id: reservationId },
      include: { apartment: { select: { ownerId: true } } },
    });
    if (!reservation) {
      return next(createError('Rezervacija nije pronađena', 404));
    }

    const isGuest = req.user.id === reservation.guestId;
    const isOwner = req.user.id === reservation.apartment.ownerId;
    const isParticipant = isGuest || isOwner;

    if (!isParticipant) {
      return next(createError('Nemate pristup', 403));
    }

    const message = await prisma.$transaction(async (tx) => {
      const msg = await tx.message.create({
        data:    { reservationId, senderId: req.user.id, content },
        include: { sender: { select: { id: true, firstName: true, lastName: true } } },
      });

      let recipientId;

      if (isGuest) {
        recipientId = reservation.apartment.ownerId;
      } else {
        recipientId = reservation.guestId;
      }

      await tx.notification.create({
        data: {
          userId:  recipientId,
          type:    'MESSAGE_NEW',
          content: `Nova poruka od ${msg.sender.firstName} ${msg.sender.lastName}`,
        },
      });

      return msg;
    });

    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
