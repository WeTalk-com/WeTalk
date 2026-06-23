import { z } from "zod";
import { isValidObjectId } from "mongoose";

export const idParamSchema = z.object({
  id: z.string().refine((v) => isValidObjectId(v), "Invalid notification id"),
});

export const listQuerySchema = z.object({
  cursor: z.string().refine((v) => isValidObjectId(v), "Invalid cursor").optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const internalCreateSchema = z.object({
  type: z.enum(["like", "comment", "follow"]),
  recipientId: z.string().min(1),
  postId: z.string().optional(),
  commentId: z.string().optional(),
  preview: z.string().max(280).optional(),
});
