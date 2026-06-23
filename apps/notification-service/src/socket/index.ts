import { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import { env } from "../config/env.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { logger } from "../utils/logger.js";

const ACCESS_COOKIE = "wetalk_session";

function parseCookie(cookieStr: string, name: string): string | undefined {
  for (const part of cookieStr.split(";")) {
    const [key, val] = part.split("=");
    if (key?.trim() === name) return val?.trim();
  }
  return undefined;
}

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

  io.use((socket, next) => {
    try {
      const cookieStr = socket.handshake.headers.cookie ?? "";
      const token = parseCookie(cookieStr, ACCESS_COOKIE);

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const payload = verifyAccessToken(token);
      (socket as unknown as Record<string, unknown>).userId = payload.sub;
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

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
