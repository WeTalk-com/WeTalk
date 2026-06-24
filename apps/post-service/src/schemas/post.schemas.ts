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

export const listQuerySchema = z.object({
  authorId: z.string().trim().min(1).optional(),
  tag: z.string().trim().min(1).optional(), // filtre par tag (#hashtag), normalisé lowercase côté handler
  cursor: z.string().refine(isValidObjectId, "Invalid cursor").optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const feedQuerySchema = z.object({
  cursor: z.string().refine(isValidObjectId, "Invalid cursor").optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

// Likers d'un post/commentaire : cursor = index (offset) dans le tableau likedBy,
// pas un ObjectId — ici on pagine un tableau en mémoire, pas une collection.
export const likesQuerySchema = z.object({
  cursor: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

// Posts likés par un user : userId absent = user courant, présent = un autre profil.
export const likedQuerySchema = z.object({
  userId: z.string().trim().min(1).optional(),
  cursor: z.string().refine(isValidObjectId, "Invalid cursor").optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

// Tags les plus utilisés (explorer) : limit = nombre de tags renvoyés.
export const tagsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
