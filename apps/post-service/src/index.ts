import { createApp } from "./app.js";
import { connectDb, mongoose } from "./config/db.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";

async function main(): Promise<void> {
  await connectDb();
  logger.info("connected to MongoDB");

  const app = createApp();
  const server = app.listen(env.port, () => {
    logger.info("post-service listening", { port: env.port, env: env.nodeEnv });
  });

  // Arrête le serveur puis ferme la connexion à la base.
  async function shutdown(signal: string): Promise<void> {
    logger.info("shutting down", { signal });
    server.close();
    await mongoose.connection.close();
    process.exit(0);
  }

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

main().catch((err) => {
  logger.error("failed to start post-service", {
    error: err instanceof Error ? err.message : String(err),
  });
  process.exit(1);
});
