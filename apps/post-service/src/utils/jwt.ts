import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env.js";

export const userRoleSchema = z.enum(["user", "moderator", "admin"]);
export type UserRole = z.infer<typeof userRoleSchema>;

// Forme attendue du payload : on la valide au runtime, jamais un simple cast.
const jwtPayloadSchema = z.object({
  sub: z.string().min(1),
  role: userRoleSchema,
});
export type JwtPayload = z.infer<typeof jwtPayloadSchema>;

// Vérifie la signature, puis valide la structure du payload (sub + role).
export function verifyAccessToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, env.jwtAccessSecret);
  return jwtPayloadSchema.parse(decoded);
}
