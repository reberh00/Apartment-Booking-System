const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const prisma = require('../utils/prisma');
const { authenticate } = require('../middleware/auth');

const registerSchema = z.object({
  email:     z.string().email('Nevažeća email adresa'),
  password:  z.string().min(8, 'Lozinka mora imati najmanje 8 znakova'),
  firstName: z.string().min(2),
  lastName:  z.string().min(2),
  role:      z.enum(['GUEST', 'OWNER']).default('GUEST'),
  phone:     z.string().optional(),
});

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

router.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return res.status(409).json({ error: 'Email je već u upotrebi' });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName:  data.lastName,
        role:      data.role,
        phone:     data.phone,
      },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Pogrešan email ili lozinka' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Pogrešan email ili lozinka' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    const { passwordHash, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (err) {
    next(err);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, avatarUrl: true, phone: true, createdAt: true },
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
