const router = require('express').Router();
const prisma = require('../utils/prisma');

router.get('/', async (req, res, next) => {
  try {
    const contents = await prisma.content.findMany({
      orderBy: { name: 'asc' },
    });

    res.json(contents);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
