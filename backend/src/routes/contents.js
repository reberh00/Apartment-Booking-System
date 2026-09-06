const router = require("express").Router();
const { z } = require("zod");
const prisma = require("../utils/prisma");
const { authenticate, authorize } = require("../middleware/auth");

const contentSchema = z.object({
  name: z.string().trim().min(2).max(50),
  icon: z.string().trim().min(1).max(50).optional(),
  apartmentId: z.string().uuid().optional(),
});

// Two contents in the same scope (global, or the same apartment) are
// considered duplicates if they only differ by case or surrounding
// whitespace, e.g. "PS5" and " ps5 ". This mirrors normalizeCity() in
// apartments.js, kept separate here since content names don't need the
// diacritic-stripping that city names do.
function normalizeContentName(name) {
  return name.trim().toLowerCase();
}

router.get("/", async (req, res, next) => {
  try {
    const { apartmentId } = req.query;
    const where = apartmentId
      ? {
          OR: [
            { apartmentId: null },
            { apartmentId },
            { apartments: { some: { apartmentId } } },
          ],
        }
      : { apartmentId: null };

    const contents = await prisma.content.findMany({
      where,
      orderBy: { name: "asc" },
    });

    res.json(contents);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/",
  authenticate,
  authorize("OWNER", "ADMIN"),
  async (req, res, next) => {
    try {
      const { name, icon, apartmentId } = contentSchema.parse(req.body);
      const nameNormalized = normalizeContentName(name);

      const existing = await prisma.content.findFirst({
        where: {
          nameNormalized,
          apartmentId: apartmentId || null,
        },
      });

      if (existing) {
        return res.status(400).json({
          error: `Sadržaj "${existing.name}" već postoji za ovaj apartman.`,
        });
      }

      // The nameNormalized/apartmentId pair also has a database-level unique
      // constraint, so a duplicate created by a concurrent request still
      // can't slip through even though we already checked above; it'll
      // surface as a generic P2002 -> 409 via the global error handler.
      const content = await prisma.content.create({
        data: {
          name,
          nameNormalized,
          icon: icon || "star",
          apartmentId: apartmentId || null,
        },
      });

      res.status(201).json(content);
    } catch (err) {
      next(err);
    }
  },
);

router.delete(
  "/:id",
  authenticate,
  authorize("OWNER", "ADMIN"),
  async (req, res, next) => {
    try {
      await prisma.content.delete({
        where: { id: req.params.id },
      });
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
