import "dotenv/config";

function required(name: string, fallback?: string): string {
  const value = (process.env[name] ?? fallback)?.trim();
  if (!value) {
    throw new Error(`Missing or empty required env var: ${name}`);
  }
  return value;
}

// Port valide entre 1 et 65535.
function requiredPort(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1 || n > 65535) {
    throw new Error(`Invalid ${name}: "${raw}" (expected integer 1-65535)`);
  }
  return n;
}

function requiredBytes(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === "") return fallback;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1) {
    throw new Error(`Invalid ${name}: "${raw}" (expected positive integer)`);
  }
  return n;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: requiredPort("PORT", 4004),
  uploadDir: required("UPLOAD_DIR", "/data/uploads"),
  maxImageBytes: requiredBytes("MAX_IMAGE_BYTES", 5 * 1024 * 1024),
  maxVideoBytes: requiredBytes("MAX_VIDEO_BYTES", 50 * 1024 * 1024),
  jwtAccessSecret: required("JWT_ACCESS_SECRET", "dev-access-secret-change-me"),
  corsOrigins: (process.env.CORS_ORIGIN ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
} as const;

// Empêche le démarrage en production avec le secret par défaut.
if (env.nodeEnv === "production" && env.jwtAccessSecret === "dev-access-secret-change-me") {
  throw new Error("Refusing to start in production with the default JWT secret.");
}
