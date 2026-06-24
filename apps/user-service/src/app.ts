import express, {type Request, type Response, type NextFunction, type Express} from "express";
import cors, { type CorsOptions } from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { env } from "./config/env.js";
import { registry } from "./config/openapi.js";
import { userRouter } from "./routes/user.routes.js";
import { apiLimiter } from "./middleware/rateLimit.js";
import { logger } from "./utils/logger.js";
import qs from "qs";

export function createApp(): Express {
  const app = express();

	// Service derrière la gateway Nginx : fait confiance au 1er proxy pour que
	// req.ip = vraie IP client (X-Forwarded-For), nécessaire au rate-limiting.
	app.set("trust proxy", 1);

	// app.set("query parser", (str: string) => qs.parse(str, {}));
	app.set("query parser", "extended");

	// CORS : si CORS_ORIGIN est défini -> liste blanche stricte.
	// Sinon, en dev on reflète l'origine (true) ; en prod on bloque (false).
	// Jamais "*" avec credentials: true (interdit par la spec).
	const corsOptions: CorsOptions = {
		origin:
			env.corsOrigins.length > 0
				? env.corsOrigins
				: env.nodeEnv !== "production",
		credentials: true,
	};
	if (env.corsOrigins.length === 0 && env.nodeEnv === "production") {
		logger.warn("CORS_ORIGIN not set in production: cross-origin requests are blocked");
	}

	app.use(helmet());
	app.use(cors(corsOptions));
	app.use(express.json());

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

	const generator = new OpenApiGeneratorV3(registry.definitions);
	const openApiDoc = generator.generateDocument({
		openapi: "3.0.3",
		info: { title: "User Service", version: "1.0.0" },
		servers: [{ url: "http://localhost:4001" }],
	});
	app.use("/api-docs", ...(swaggerUi.serve as any), swaggerUi.setup(openApiDoc) as any);

	app.get("/health", (_req: Request, res: Response) => {
		res.json({ status: "ok", service: "user-service" });
	});

	app.use("/users", apiLimiter, userRouter);

	// 404
	app.use((_req: Request, res: Response) => {
		res.status(404).json({ error: "Not found" });
	});

	// Gestionnaire d'erreurs centralisé
	app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
		if (res.headersSent) {
			return _next(err);
		}
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
