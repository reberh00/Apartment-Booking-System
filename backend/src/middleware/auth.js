const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

const authenticate = async (req, res, next) => {

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Token nije pronađen' });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token nije pronađen' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, firstName: true, lastName: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Korisnik ne postoji' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Nevažeći token' });
  }
};

const authorize = (...roles) => (req, res, next) => {

  const hasRole = roles.includes(req.user.role);

  if (!hasRole) {
    return res.status(403).json({ error: 'Nemate ovlasti za ovu akciju' });
  }

  next();
};

module.exports = { authenticate, authorize };