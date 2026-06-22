import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { ensureUploadDir } from "./services/storage.service.js";
import { logger } from "./utils/logger.js";

async function main(): Promise<void> {
  await ensureUploadDir();
  logger.info("upload dir ready", { uploadDir: env.uploadDir });

  const app = createApp();
  const server = app.listen(env.port, () => {
    logger.info("media-service listening", { port: env.port, env: env.nodeEnv });
  });

  async function shutdown(signal: string): Promise<void> {
    logger.info("shutting down", { signal });
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
    process.exit(0);
  }

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

main().catch((err) => {
  logger.error("failed to start media-service", {
    error: err instanceof Error ? err.message : String(err),
  });
  process.exit(1);
});
