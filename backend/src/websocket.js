const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const prisma = require("./utils/prisma");

let websocketServer = null;

function initWebSocket(httpServer) {
  websocketServer = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "*",
      credentials: true,
    },
  });

  websocketServer.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          role: true,
          firstName: true,
          lastName: true,
        },
      });

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  websocketServer.on("connection", (socket) => {
    socket.on("subscribe", (apartmentId) => {
      if (!apartmentId || typeof apartmentId !== "string") return;
      socket.join(`apartment:${apartmentId}`);
    });

    socket.on("unsubscribe", (apartmentId) => {
      if (!apartmentId || typeof apartmentId !== "string") return;
      socket.leave(`apartment:${apartmentId}`);
    });
  });

  return websocketServer;
}

function broadcastAvailabilityChanged(apartmentId) {
  if (!websocketServer || !apartmentId) return;
  websocketServer.to(`apartment:${apartmentId}`).emit("availabilityChanged", {
    apartmentId,
  });
}

module.exports = { initWebSocket, broadcastAvailabilityChanged };
