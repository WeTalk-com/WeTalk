import { redis } from "../config/redis.js";
import { env } from "../config/env.js";

// Allowlist des refresh tokens valides, indexés par (userId, jti).
// Présence dans Redis = token valide. Absence = révoqué / déjà utilisé.
const key = (userId: string, jti: string) => `refresh:${userId}:${jti}`;

export async function storeRefresh(userId: string, jti: string): Promise<void> {
  await redis.set(key(userId, jti), "1", { EX: env.refreshTtlSeconds });
}

export async function isRefreshValid(userId: string, jti: string): Promise<boolean> {
  return (await redis.exists(key(userId, jti))) === 1;
}

export async function revokeRefresh(userId: string, jti: string): Promise<void> {
  await redis.del(key(userId, jti));
}
