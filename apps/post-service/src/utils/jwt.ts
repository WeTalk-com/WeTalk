import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env.js";

export const userRoleSchema = z.enum(["user", "moderator", "admin"]);
export type UserRole = z.infer<typeof userRoleSchema>;

const jwtPayloadSchema = z.object({
  sub: z.string().min(1),
  role: userRoleSchema,
});
export type JwtPayload = z.infer<typeof jwtPayloadSchema>;

export function verifyAccessToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, env.jwtAccessSecret, { algorithms: ["HS256"] });
  return jwtPayloadSchema.parse(decoded);
}
