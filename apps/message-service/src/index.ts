import { createApp } from "./app.js";
import { connectDb, mongoose } from "./config/db.js";
import { connectRedis, redis } from "./config/redis.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";

async function main(): Promise<void> {
	await connectDb();
	logger.info("connected to MongoDB");
	
	await connectRedis();
	logger.info("connected to Redis");
	
	const app = createApp();
	const server = app.listen(env.port, () => {
		logger.info("message-service listening", { port: env.port, env: env.nodeEnv });
	});
	
	// Arrêt propre : ferme le serveur HTTP puis les connexions DB/Redis.
	async function shutdown(signal: string): Promise<void> {
		logger.info("shutting down", { signal });
		await new Promise<void>((resolve, reject) => {
			server.close((err) => (err ? reject(err) : resolve()));
		});
		await Promise.allSettled([mongoose.disconnect(), redis.quit()]);
		process.exit(0);
	}
	
	process.on("SIGTERM", () => void shutdown("SIGTERM"));
	process.on("SIGINT", () => void shutdown("SIGINT"));
}

main().catch((err) => {
	logger.error("failed to start message-service", {
		error: err instanceof Error ? err.message : String(err),
		// error: JSON.stringify(err),
	});
	process.exit(1);
});
