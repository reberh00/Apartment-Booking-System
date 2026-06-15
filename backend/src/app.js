require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { UPLOAD_ROOT } = require("./middleware/upload");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const apartmentRoutes = require("./routes/apartments");
const contentRoutes = require("./routes/contents");
const reservationRoutes = require("./routes/reservations");
const reviewRoutes = require("./routes/reviews");
const messageRoutes = require("./routes/messages");
const notificationRoutes = require("./routes/notifications");
const adminRoutes = require("./routes/admin");
const analyticsRoutes = require("./routes/analytics");

const { errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(UPLOAD_ROOT),
);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/apartments", apartmentRoutes);
app.use("/api/contents", contentRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/analytics", analyticsRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use(errorHandler);

module.exports = app;
