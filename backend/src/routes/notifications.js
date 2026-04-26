const router = require('express').Router();
const prisma = require('../utils/prisma');
const { authenticate } = require('../middleware/auth');

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

module.exports = router;