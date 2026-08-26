/**
 * services/socketService.js — Socket.IO singleton for real-time events.
 * Handles connection, JWT auth on handshake, room management, and event emission.
 */
import { Server } from "socket.io";
import { verifyAccessToken } from "../utils/jwt.js";
import { User } from "../models/index.js";
import logger from "../utils/logger.js";

let io = null;

const LOW_STOCK_THRESHOLD = 5;

function init(httpServer, corsOrigin) {
  io = new Server(httpServer, {
    cors: {
      origin: corsOrigin,
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.query?.token;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const payload = verifyAccessToken(token);
      const user = await User.findById(payload.sub).select("name email role isActive");
      if (!user) return next(new Error("User not found"));
      if (!user.isActive) return next(new Error("Account disabled"));

      socket.user = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      };
      next();
    } catch (_err) {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    const { id, role } = socket.user;
    logger.info("Socket connected", { userId: id, socketId: socket.id });

    socket.join(`user:${id}`);

    if (role === "admin" || role === "order_manager" || role === "book_manager") {
      socket.join("admin");
    }

    if (role === "admin" || role === "book_manager") {
      socket.join("inventory");
    }

    socket.on("disconnect", (reason) => {
      logger.debug("Socket disconnected", { userId: id, reason });
    });
  });

  logger.info("Socket.IO server initialized");
  return io;
}

function getIO() {
  if (!io) throw new Error("Socket.IO not initialized — call init() first");
  return io;
}

function emitToUser(userId, event, data) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
}

function emitToAdmins(event, data) {
  if (!io) return;
  io.to("admin").emit(event, data);
}

function emitToInventory(event, data) {
  if (!io) return;
  io.to("inventory").emit(event, data);
}

function isLowStock(stock) {
  return stock >= 0 && stock <= LOW_STOCK_THRESHOLD;
}

export default {
  init,
  getIO,
  emitToUser,
  emitToAdmins,
  emitToInventory,
  isLowStock,
  LOW_STOCK_THRESHOLD,
};
