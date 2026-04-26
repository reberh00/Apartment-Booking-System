const router = require('express').Router();
const { z } = require('zod');
const prisma = require('../utils/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { createError } = require('../middleware/errorHandler');

router.use(authenticate, authorize('ADMIN'));

router.get('/apartments', async (req, res, next) => {
  try {
    const { status } = req.query;
    let where = {};

    if (status) {
      where = { status };
    }

    const apartments = await prisma.apartment.findMany({
      where,
      include: { owner: { select: { id: true, firstName: true, lastName: true, email: true } }, _count: { select: { reservations: true, reviews: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(apartments);
  } catch (err) {
    next(err);
  }
});

router.patch('/apartments/:id/status', async (req, res, next) => {
  try {
    const { status } = z.object({ status: z.enum(['APPROVED', 'REJECTED']) }).parse(req.body);

    const apartment = await prisma.$transaction(async (tx) => {
      const apt = await tx.apartment.update({
        where: { id: req.params.id },
        data:  { status },
        include: { owner: { select: { id: true } } },
      });

      let notificationType = 'APARTMENT_REJECTED';
      let actionText = 'odbijen';

      if (status === 'APPROVED') {
        notificationType = 'APARTMENT_APPROVED';
        actionText = 'odobren';
      }

      await tx.notification.create({
        data: {
          userId:  apt.owner.id,
          type:    notificationType,
          content: `Vaš oglas "${apt.title}" je ${actionText}`,
        },
      });

      return apt;
    });

    res.json(apartment);
  } catch (err) {
    next(err);
  }
});

router.get('/users', async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true, _count: { select: { apartments: true, reservations: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

router.delete('/users/:id', async (req, res, next) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'Korisnik obrisan' });
  } catch (err) {
    next(err);
  }
});

router.delete('/reviews/:id', async (req, res, next) => {
  try {
    await prisma.review.delete({ where: { id: req.params.id } });
    res.json({ message: 'Recenzija obrisana' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
