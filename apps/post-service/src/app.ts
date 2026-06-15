import express, { type Request, type Response, type NextFunction } from "express";
import cors, { type CorsOptions } from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { postRouter } from "./routes/post.routes.js";

export function createApp() {
  const app = express();

  // Le service tourne derrière la passerelle : on récupère la vraie IP du client.
  app.set("trust proxy", 1);

  // Autorise les origines configurées, sinon bloque les appels externes en production.
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

  // Journalise chaque requête une fois la réponse envoyée.
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
    res.json({ status: "ok", service: "post-service" });
  });

  app.use("/posts", postRouter);

  // Répond aux routes inconnues.
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: "Not found" });
  });

  // Capture les erreurs non gérées.
  app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    logger.error("unhandled error", {
      method: req.method,
      path: req.originalUrl,
      error: err.message,
    });
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}
