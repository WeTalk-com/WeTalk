import "dotenv/config";
import process from "process";

function required(name: string, fallback?: string): string {
	const raw = process.env[name];
	const value = raw !== undefined && raw.trim() !== "" ? raw : fallback;
	if (value === undefined || value.trim() === "") {
		throw new Error(`Missing required env var: ${name}`);
	}
	return value;
}

function positiveInt(name: string, fallback: number): number {
	const raw = process.env[name];
	const n = raw === undefined ? fallback : Number(raw);
	if (!Number.isInteger(n) || n <= 0) {
		throw new Error(`Invalid ${name}: expected positive integer`);
	}
	return n;
}

export const env = {
	nodeEnv: process.env.NODE_ENV ?? "development",
	port: Number(process.env.PORT) || 4004,
	mongoUri: required("MONGO_URI", "mongodb://localhost:27017/message_db"),
	userServiceUrl: required("USER_SERVICE_URL", "http://user-service:4001"),

	// JWT : vérification de l'access token uniquement (secret partagé entre services).
	jwtAccessSecret: required("JWT_ACCESS_SECRET", "dev-access-secret-change-me"),
	// TTL (s) de la denylist de révocation d'access token dans Redis. Doit couvrir
	// la durée de vie d'un access token. 15 min par défaut.
	accessRevokeTtlSeconds: positiveInt("ACCESS_REVOKE_TTL_SECONDS", 15 * 60),

	// Redis (denylist de révocation des access tokens bannis).
	redisUrl: required("REDIS_URL", "redis://localhost:6379"),
	
	// CORS : liste blanche d'origines séparées par des virgules.
	// Vide => dev: reflète l'origine (permissif) / prod: bloque le cross-origin.
	corsOrigins: (process.env.CORS_ORIGIN ?? "")
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean),
} as const;

// Sécurité : interdit de démarrer en production avec le secret JWT par défaut.
const DEFAULT_SECRETS = ["dev-access-secret-change-me"];
if (
	env.nodeEnv === "production" &&
	(DEFAULT_SECRETS.includes(env.jwtAccessSecret) || env.jwtAccessSecret.trim() === "")
) {
	throw new Error(
		"Refusing to start in production with default JWT secret. Set JWT_ACCESS_SECRET.",
	);
}
