import { redis } from "../config/redis.js";

// Denylist de révocation d'access token, partagée avec user-service
const key = (userId: string) => `banned:${userId}`;

export async function isAccessBanned(userId: string): Promise<boolean> {
  return (await redis.exists(key(userId))) === 1;
}
