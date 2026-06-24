import { createApp } from "./app.js";
import { connectDb, sequelize } from "./config/db.js";
import { connectRedis, redis } from "./config/redis.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { createUsers } from "./seeds/users.js";
import { createFollow } from "./seeds/follows.js";

async function main(): Promise<void> {
	await connectDb();
	logger.info("connected to PostgreSQL");
	
	await createUsers();
	await createFollow();

	await connectRedis();
	logger.info("connected to Redis");

	const app = createApp();
	const server = app.listen(env.port, () => {
		logger.info("user-service listening", { port: env.port, env: env.nodeEnv });
	});

	// Arrêt propre : ferme le serveur HTTP puis les connexions DB/Redis.
	async function shutdown(signal: string): Promise<void> {
		logger.info("shutting down", { signal });
		await new Promise<void>((resolve, reject) => {
			server.close((err) => (err ? reject(err) : resolve()));
		});
		await Promise.allSettled([redis.quit(), sequelize.close()]);
		process.exit(0);
	}

	process.on("SIGTERM", () => void shutdown("SIGTERM"));
	process.on("SIGINT", () => void shutdown("SIGINT"));
}

main().catch((err) => {
	logger.error("failed to start user-service", {
		error: err instanceof Error ? err.message : String(err),
		// error: JSON.stringify(err),
	});
	process.exit(1);
});
