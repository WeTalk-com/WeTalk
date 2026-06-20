import express, { type Request, type Response, type NextFunction } from "express";
import cookieParser from "cookie-parser";
import cors, { type CorsOptions } from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import { authRouter } from "./routes/auth.routes.js";
import { logger } from "./utils/logger.js";

export function createApp() {
  const app = express();

  // Service derrière la gateway Nginx : fait confiance au 1er proxy pour que
  // req.ip = vraie IP client (X-Forwarded-For), nécessaire au rate-limiting.
  app.set("trust proxy", 1);

  // CORS : si CORS_ORIGIN est défini -> liste blanche stricte.
  // Sinon, en dev on reflète l'origine (true) ; en prod on bloque (false).
  // Jamais "*" avec credentials: true (interdit par la spec).
  const corsOptions: CorsOptions = {
    origin:
      env.corsOrigins.length > 0
        ? env.corsOrigins
        : env.nodeEnv === "production"
          ? false
          : true,
    credentials: true,
  };
  if (env.corsOrigins.length === 0 && env.nodeEnv === "production") {
    logger.warn("CORS_ORIGIN not set in production: cross-origin requests are blocked");
  }

  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(cookieParser());

  // Access log : une ligne par requête une fois la réponse terminée.
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

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", service: "auth-service" });
  });

  app.use("/auth", authRouter);

  // 404
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: "Not found" });
  });

  // Gestionnaire d'erreurs centralisé
  app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    logger.error("unhandled error", {
      method: req.method,
      path: req.originalUrl,
      error: err.message,
      stack: err.stack,
    });
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}
