import "dotenv/config";

function required(name: string, fallback?: string): string {
  const value = (process.env[name] ?? fallback)?.trim();
  if (!value) {
    throw new Error(`Missing or empty required env var: ${name}`);
  }
  return value;
}

// Port Invalidation between 1 and 65535
function requiredPort(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1 || n > 65535) {
    throw new Error(`Invalid ${name}: "${raw}" (expected integer 1-65535)`);
  }
  return n;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: requiredPort("PORT", 4002),
  mongoUri: required("MONGO_URI", "mongodb://localhost:27017/post_db"),
  userServiceUrl: required("USER_SERVICE_URL", "http://user-service:4001"),
  mediaServiceUrl: required("MEDIA_SERVICE_URL", "http://media-service:4004"),
  notificationServiceUrl: required("NOTIFICATION_SERVICE_URL", "http://notification-service:4003"),
  jwtAccessSecret: required("JWT_ACCESS_SECRET", "dev-access-secret-change-me"),
  corsOrigins: (process.env.CORS_ORIGIN ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
} as const;

// Prevents starting in production with the default secret
if (env.nodeEnv === "production" && env.jwtAccessSecret === "dev-access-secret-change-me") {
  throw new Error("Refusing to start in production with the default JWT secret.");
}
