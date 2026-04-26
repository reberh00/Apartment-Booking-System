const router = require('express').Router();
const { z } = require('zod');
const prisma = require('../utils/prisma');
const { authenticate } = require('../middleware/auth');

router.patch('/me', authenticate, async (req, res, next) => {
  try {
    const updateProfileSchema = z.object({
      firstName: z.string().min(2).optional(),
      lastName:  z.string().min(2).optional(),
      phone:     z.string().optional(),
      avatarUrl: z.string().url().optional(),
    });

    const data = updateProfileSchema.parse(req.body);

    const user = await prisma.user.update({
      where:  { id: req.user.id },
      data,
      select: { id: true, email: true, firstName: true, lastName: true, role: true, avatarUrl: true, phone: true },
    });

    res.json(user);
  } catch (err) {
    next(err);
  }
});

module.exports = router;