import express, { type Request, type Response, type NextFunction } from "express";
import cookieParser from "cookie-parser";
import cors, { type CorsOptions } from "cors";
import helmet from "helmet";
import { createServer } from "http";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { apiLimiter } from "./middleware/rateLimit.js";
import { createNotificationRouter } from "./routes/notification.routes.js";
import { createSocketServer } from "./socket/index.js";
import type { Server as SocketServer } from "socket.io";

export function createApp(): { app: express.Application; httpServer: ReturnType<typeof createServer>; io: SocketServer } {
  const app = express();
  const httpServer = createServer(app);

  app.set("trust proxy", 1);

  const corsOptions: CorsOptions = {
    origin:
      env.corsOrigins.length > 0
        ? env.corsOrigins
        : env.nodeEnv === "production"
          ? false
          : true,
    credentials: true,
  };

  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(cookieParser());
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on("finish", () => {
      logger.info("request", {
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        durationMs: Date.now() - start,
        ip: req.ip,
      });
    });
    next();
  });

  const io = createSocketServer(httpServer);

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", service: "notification-service" });
  });

  app.use("/notifications", apiLimiter, createNotificationRouter(io));

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: "Not found" });
  });

  app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    logger.error("unhandled error", {
      method: req.method,
      path: req.originalUrl,
      error: err.message,
    });
    res.status(500).json({ error: "Internal server error" });
  });

  return { app, httpServer, io };
}
