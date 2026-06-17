import "dotenv/config";

function required(name: string, fallback?: string): string {
  // Nettoie les espaces ; rejette aussi bien l'absence qu'une valeur vide.
  const value = (process.env[name] ?? fallback)?.trim();
  if (!value) {
    throw new Error(`Missing or empty required env var: ${name}`);
  }
  return value;
}

// Valide un port : entier dans 1..65535, sinon échec explicite au démarrage.
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
