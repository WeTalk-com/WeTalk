import { z } from "zod";

// ── Request schemas ──

export const userRoleSchema = z.enum(["user", "moderator", "admin"]);

export const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const adminCreateSchema = registerSchema.extend({
  role: userRoleSchema.optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

// ── Response schemas ──

export const userResponseSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  email: z.string().email(),
  role: userRoleSchema,
});

export const singleUserResponseSchema = z.object({
  user: userResponseSchema,
});

export const tokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const authResponseSchema = z.object({
  user: userResponseSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const errorResponseSchema = z.object({
  error: z.string(),
});

export const validationErrorSchema = errorResponseSchema.extend({
  details: z.any(),
});

export const verifyResponseSchema = z.object({
  valid: z.literal(true),
  user: z.object({
    sub: z.string(),
    role: userRoleSchema,
  }),
});
