const router = require("express").Router();
const prisma = require("../utils/prisma");
const { authenticate, authorize } = require("../middleware/auth");

router.get(
  "/owner",
  authenticate,
  authorize("OWNER"),
  async (req, res, next) => {
    try {
      const { startDate, endDate } = req.query;

      const apartments = await prisma.apartment.findMany({
        where: { ownerId: req.user.id },
        select: { id: true, title: true },
      });

      const aptIds = apartments.map((a) => a.id);

      const reservationStats = await prisma.reservation.groupBy({
        by: ["status", "apartmentId"],
        where: { apartmentId: { in: aptIds } },
        _count: true,
        _sum: { totalPrice: true },
      });

      // Use custom date range if provided, otherwise default to 12 months
      let checkInFilter = {};
      if (startDate && endDate) {
        checkInFilter = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      } else {
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
        checkInFilter = { gte: twelveMonthsAgo };
      }

      const completedReservations = await prisma.reservation.findMany({
        where: {
          apartmentId: { in: aptIds },
          status: "COMPLETED",
          checkIn: checkInFilter,
        },
        select: {
          checkIn: true,
          totalPrice: true,
        },
        orderBy: { checkIn: "asc" },
      });

      const monthlyIncomeMap = {};

      for (const reservation of completedReservations) {
        const monthDate = new Date(reservation.checkIn);
        monthDate.setDate(1);
        monthDate.setHours(0, 0, 0, 0);
        const monthKey = monthDate.toISOString();

        if (!monthlyIncomeMap[monthKey]) {
          monthlyIncomeMap[monthKey] = {
            month: monthDate,
            income: 0,
            bookings: 0,
          };
        }

        monthlyIncomeMap[monthKey].income += parseFloat(reservation.totalPrice);
        monthlyIncomeMap[monthKey].bookings += 1;
      }

      const monthlyIncome = Object.values(monthlyIncomeMap);

      const avgRatings = await prisma.review.groupBy({
        by: ["apartmentId"],
        where: { apartmentId: { in: aptIds } },
        _avg: { rating: true },
        _count: true,
      });

      res.json({ apartments, reservationStats, monthlyIncome, avgRatings });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
