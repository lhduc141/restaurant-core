import { Server } from "socket.io";

let ioInstance = null;

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.PORTAL_ORIGIN?.split(",") || ["http://localhost:5173"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.auth?.userId || "guest";
    socket.join(`user:${userId}`);

    socket.on("disconnect", () => {
      // place for cleanup if needed
    });
  });

  ioInstance = io;
  return io;
}

export function emitToUser(userId, event, payload) {
  if (!ioInstance) return;
  ioInstance.to(`user:${userId}`).emit(event, payload);
}