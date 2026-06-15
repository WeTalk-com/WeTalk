import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export type UserRole = "user" | "moderator" | "admin";

export interface JwtPayload {
  sub: string;
  role: UserRole;
}

// Vérifie un token d'accès avec le secret partagé.
export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtAccessSecret) as JwtPayload;
}
