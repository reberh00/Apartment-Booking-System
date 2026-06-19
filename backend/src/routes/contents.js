const router = require("express").Router();
const { z } = require("zod");
const prisma = require("../utils/prisma");
const { authenticate, authorize } = require("../middleware/auth");

const contentSchema = z.object({
  name: z.string().trim().min(2).max(50),
  icon: z.string().trim().min(1).max(50).optional(),
  apartmentId: z.string().uuid().optional(),
});

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

      const content = await prisma.content.create({
        data: { name, icon: icon || "star", apartmentId: apartmentId || null },
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
