import "dotenv/config";

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT) || 4000,

  // PostgreSQL (Sequelize) — datastore des utilisateurs
  dbHost: required("DB_HOST", "localhost"),
  dbPort: Number(process.env.DB_PORT) || 5432,
  dbName: required("DB_NAME", "auth_db"),
  dbUser: required("DB_USER", "auth"),
  dbPassword: required("DB_PASSWORD", "auth"),

  // JWT
  jwtAccessSecret: required("JWT_ACCESS_SECRET", "dev-access-secret-change-me"),
  jwtRefreshSecret: required("JWT_REFRESH_SECRET", "dev-refresh-secret-change-me"),
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
  // TTL (s) de la denylist de révocation d'access token dans Redis. Doit couvrir
  // la durée de vie d'un access token (>= JWT_ACCESS_EXPIRES_IN). 15 min par défaut.
  // Doit rester aligné avec la même variable côté user-service (clé Redis partagée).
  accessRevokeTtlSeconds: Number(process.env.ACCESS_REVOKE_TTL_SECONDS ?? 15 * 60),
  // Durée de vie du refresh token, en secondes (sert au JWT ET au TTL Redis). 7j par défaut.
  refreshTtlSeconds: Number(process.env.REFRESH_TTL_SECONDS ?? 60 * 60 * 24 * 7),

  // Redis (allowlist des refresh tokens)
  redisUrl: required("REDIS_URL", "redis://localhost:6379"),

  // CORS : liste blanche d'origines séparées par des virgules.
  // Vide => dev: reflète l'origine (permissif) / prod: bloque le cross-origin.
  corsOrigins: (process.env.CORS_ORIGIN ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
} as const;

// Sécurité : interdit de démarrer en production avec les secrets JWT par défaut.
const DEFAULT_SECRETS = ["dev-access-secret-change-me", "dev-refresh-secret-change-me"];
if (
  env.nodeEnv === "production" &&
  (DEFAULT_SECRETS.includes(env.jwtAccessSecret) ||
    DEFAULT_SECRETS.includes(env.jwtRefreshSecret))
) {
  throw new Error(
    "Refusing to start in production with default JWT secrets. Set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET.",
  );
}
