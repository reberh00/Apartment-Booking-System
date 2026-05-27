const router = require('express').Router();
const prisma = require('../utils/prisma');
const { authenticate } = require('../middleware/auth');
const { createError } = require('../middleware/errorHandler');

router.get('/', authenticate, async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where:   { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take:    50,
    });
    res.json(notifications);
  } catch (err) {
    next(err);
  }
});

router.patch('/read-all', authenticate, async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data:  { isRead: true },
    });
    res.json({ message: 'Sve obavijesti označene kao pročitane' });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/read', authenticate, async (req, res, next) => {
  try {
    const updated = await prisma.notification.updateMany({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      data: { isRead: true },
    });

    if (!updated.count) {
      return next(createError('Obavijest nije pronađena', 404));
    }

    res.json({ message: 'Obavijest je označena kao pročitana' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

