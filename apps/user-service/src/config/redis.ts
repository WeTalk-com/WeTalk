import { createClient } from "redis";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

export const redis = createClient({ url: env.redisUrl });

redis.on("error", (err) => {
  logger.error("redis error", { error: err instanceof Error ? err.message : String(err) });
});

export async function connectRedis(): Promise<void> {
  await redis.connect();
}
