import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const userResponseSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  displayName: z.string().nullable(),
  profileImage: z.string().url().nullable(),
  profileBanner: z.string().url().nullable(),
  description: z.string().nullable(),
  role: z.enum(["user", "moderator", "admin"]),
  isBanned: z.boolean(),
  isSuspended: z.boolean(),
  createdAt: z.string(),
});

export const errorResponseSchema = z.object({
  error: z.string(),
});

export const verifyResponseSchema = z.object({
  valid: z.boolean(),
  user: z.object({
    id: z.string(),
    username: z.string(),
    role: z.enum(["user", "moderator", "admin"]),
  }),
});
