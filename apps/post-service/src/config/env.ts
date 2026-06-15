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
  port: Number(process.env.PORT ?? 4002),

  // Adresse de la base de données des posts.
  mongoUri: required("MONGO_URI", "mongodb://localhost:27017/post_db"),

  // Secret partagé pour vérifier les tokens émis par auth-service.
  jwtAccessSecret: required("JWT_ACCESS_SECRET", "dev-access-secret-change-me"),

  // Origines autorisées à appeler le service.
  corsOrigins: (process.env.CORS_ORIGIN ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
} as const;

// Empêche le démarrage en production avec le secret par défaut.
if (env.nodeEnv === "production" && env.jwtAccessSecret === "dev-access-secret-change-me") {
  throw new Error("Refusing to start in production with the default JWT secret.");
}
