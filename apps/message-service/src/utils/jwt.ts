import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { UserRole } from "../models/user.js";

export interface JwtPayload {
	sub: string; // user id
	role: UserRole;
}

// Le message-service ne fait que vérifier l'access token (secret partagé entre
// services). L'émission des tokens et le refresh sont la responsabilité d'auth-service.
export function verifyAccessToken(token: string): JwtPayload {
	const decoded = jwt.verify(token, env.jwtAccessSecret);
	if (
		!decoded ||
		typeof decoded !== "object" ||
		typeof decoded.sub !== "string" ||
		!["user", "moderator", "admin"].includes(decoded.role)
	) {
		throw new Error("Invalid access token payload");
	}
	return { sub: decoded.sub, role: decoded.role };
}