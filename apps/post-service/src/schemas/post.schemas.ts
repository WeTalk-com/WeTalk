import { z } from "zod";
import { isValidObjectId } from "mongoose";

export const authorLiteSchema = z.object({
  id: z.string(),
  username: z.string(),
  displayName: z.string().nullable(),
  profileImage: z.string().nullable(),
  isBanned: z.boolean(),
});

export const postResponseSchema = z.object({
  _id: z.string(),
  authorId: z.string(),
  content: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  authorBanned: z.boolean(),
  author: authorLiteSchema.nullable(),
});

export const createSchema = z.object({
  content: z.string().trim().min(1).max(280),
});

export const updateSchema = createSchema;

export const listQuerySchema = z.object({
  authorId: z.string().trim().min(1).optional(),
  cursor: z.string().refine(isValidObjectId, "Invalid cursor").optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const feedQuerySchema = z.object({
  cursor: z.string().refine(isValidObjectId, "Invalid cursor").optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
