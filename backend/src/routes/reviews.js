const router = require('express').Router();
const { z } = require('zod');
const prisma = require('../utils/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { createError } = require('../middleware/errorHandler');

const reviewSchema = z.object({
  reservationId: z.string().uuid(),
  rating:        z.number().int().min(1).max(5),
  comment:       z.string().min(10).max(1000),
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const data = reviewSchema.parse(req.body);

    const reservation = await prisma.reservation.findUnique({
      where: { id: data.reservationId },
      include: { review: true },
    });

    if (!reservation) {
      return next(createError('Rezervacija nije pronađena', 404));
    }

    if (reservation.guestId !== req.user.id) {
      return next(createError('Nije vaša rezervacija', 403));
    }

    if (reservation.status !== 'COMPLETED') {
      return next(createError('Možete recenzirati samo posjećene apartmane'));
    }

    if (reservation.review) {
      return next(createError('Već ste ostavili recenziju za ovaj apartman'));
    }

    const review = await prisma.review.create({
      data: {
        reservationId: data.reservationId,
        apartmentId:   reservation.apartmentId,
        guestId:       req.user.id,
        rating:        data.rating,
        comment:       data.comment,
      },
      include: { guest: { select: { firstName: true, lastName: true, avatarUrl: true } } },
    });

    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/reply', authenticate, authorize('OWNER'), async (req, res, next) => {
  try {
    const replySchema = z.object({
      reply: z.string().min(5).max(500),
    });

    const { reply } = replySchema.parse(req.body);

    const review = await prisma.review.findUnique({
      where:   { id: req.params.id },
      include: { apartment: { select: { ownerId: true } } },
    });

    if (!review) {
      return next(createError('Recenzija nije pronađena', 404));
    }

    if (review.apartment.ownerId !== req.user.id) {
      return next(createError('Nije vaš apartman', 403));
    }

    const updated = await prisma.review.update({
      where: { id: req.params.id },
      data:  { ownerReply: reply },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
