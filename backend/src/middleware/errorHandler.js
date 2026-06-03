const { ZodError } = require('zod');
const { Prisma } = require('@prisma/client');
const { MulterError } = require('multer');

const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Greška validacije',
      details: err.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
    });
  }

  if (err instanceof MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Slika je prevelika. Maksimalna veličina je 5 MB.' });
    }

    return res.status(400).json({ error: 'Neuspješan prijenos datoteke.' });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Zapis s tim podacima već postoji' });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Zapis nije pronađen' });
    }
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Interna greška servera',
  });
};

const createError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

module.exports = { errorHandler, createError };
