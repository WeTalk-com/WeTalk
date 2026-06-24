import express, { type Request, type Response, type NextFunction } from "express";
import cookieParser from "cookie-parser";
import cors, { type CorsOptions } from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { env } from "./config/env.js";
import { registry } from "./config/openapi.js";
import { logger } from "./utils/logger.js";
import { postRouter } from "./routes/post.routes.js";
import { commentRouter } from "./routes/comment.routes.js";
import { tagRouter } from "./routes/tag.routes.js";
import { adminRouter } from "./routes/admin.routes.js";

export function createApp() {
  const app = express();

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

  const generator = new OpenApiGeneratorV3(registry.definitions);
  const openApiDoc = generator.generateDocument({
    openapi: "3.0.3",
    info: { title: "Post Service", version: "0.1.0" },
    servers: [{ url: "http://localhost:4002" }],
  });
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDoc));

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", service: "post-service" });
  });

  app.use("/posts", postRouter);
  app.use("/comments", commentRouter);
  app.use("/tags", tagRouter);
  app.use("/admin", adminRouter);

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

  return app;
}
