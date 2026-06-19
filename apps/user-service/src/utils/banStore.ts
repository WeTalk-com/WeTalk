import { redis } from "../config/redis.js";
import { env } from "../config/env.js";

// Denylist de révocation d'access token.
const key = (userId: string) => `banned:${userId}`;

export async function markAccessBanned(userId: string): Promise<void> {
  await redis.set(key(userId), "1", { EX: env.accessRevokeTtlSeconds });
}

export async function clearAccessBanned(userId: string): Promise<void> {
  await redis.del(key(userId));
}

export async function isAccessBanned(userId: string): Promise<boolean> {
  return (await redis.exists(key(userId))) === 1;
}
