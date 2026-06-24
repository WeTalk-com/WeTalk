import { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import { env } from "../config/env.js";
import { socketRequireAuth } from "../middleware/auth.js";
import { logger } from "../utils/logger.js";

export function createSocketServer(httpServer: HttpServer): SocketServer {
  const io = new SocketServer(httpServer, {
    cors: {
      origin:
        env.corsOrigins.length > 0
          ? env.corsOrigins
          : env.nodeEnv === "production"
            ? false
            : true,
      credentials: true,
    },
    path: "/socket.io",
  });

  io.use(socketRequireAuth());

  io.on("connection", (socket) => {
    const userId = (socket as unknown as Record<string, unknown>).userId as string;
    socket.join(`user:${userId}`);
    logger.info("socket connected", { userId, socketId: socket.id });

    socket.on("disconnect", () => {
      logger.info("socket disconnected", { userId, socketId: socket.id });
    });
  });

  return io;
}
