import type { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { PostModel } from "../models/post.js";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

// Vérifie auprès du user-service si l'auteur peut publier
async function authorPostingBlock(
  userId: string,
  authHeader: string | undefined,
): Promise<{ blocked: boolean; reason: string; status: number }> {
  try {
    const res = await fetch(`${env.userServiceUrl}/users/${userId}`, {
      headers: authHeader ? { authorization: authHeader } : {},
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) {
      logger.warn("user status lookup non-ok", { userId, status: res.status });
      return { blocked: true, reason: "Unable to verify account status", status: 503 };
    }
    const user = (await res.json()) as { isBanned?: boolean; isSuspended?: boolean };
    if (user.isBanned) return { blocked: true, reason: "Account banned", status: 403 };
    if (user.isSuspended) {
      return { blocked: true, reason: "Account suspended from posting", status: 403 };
    }
    return { blocked: false, reason: "", status: 200 };
  } catch (err) {
    logger.warn("user status lookup failed", {
      userId,
      error: err instanceof Error ? err.message : String(err),
    });
    return { blocked: true, reason: "Unable to verify account status", status: 503 };
  }
}

const createSchema = z.object({
  content: z.string().trim().min(1).max(280),
});

const updateSchema = createSchema;

const listQuerySchema = z.object({
  authorId: z.string().trim().min(1).optional(),
  cursor: z.string().refine(isValidObjectId, "Invalid cursor").optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export async function createPost(req: Request, res: Response): Promise<void> {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    return;
  }

  // L'auteur ne doit être ni banni ni suspendu (Fx21).
  const { blocked, reason, status } = await authorPostingBlock(req.user!.sub, req.headers.authorization);
  if (blocked) {
    res.status(status).json({ error: reason });
    return;
  }

  const post = await PostModel.create({
    authorId: req.user!.sub,
    content: parsed.data.content,
  });
  res.status(201).json({ post });
}

export async function listPosts(req: Request, res: Response): Promise<void> {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    return;
  }
  const { authorId, cursor, limit } = parsed.data;

  const filter: Record<string, unknown> = {};
  if (authorId) filter.authorId = authorId;
  // _id décroissant ≈ createdAt décroissant (ObjectId monotone), curseur stable.
  if (cursor) filter._id = { $lt: cursor };

  const posts = await PostModel.find(filter).sort({ _id: -1 }).limit(limit).lean();
  const last = posts[posts.length - 1];
  const nextCursor = posts.length === limit && last ? String(last._id) : null;

  res.json({ posts, nextCursor });
}

export async function getPost(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    res.status(400).json({ error: "Invalid post id" });
    return;
  }
  const post = await PostModel.findById(id);
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  res.json({ post });
}

export async function updatePost(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    res.status(400).json({ error: "Invalid post id" });
    return;
  }
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    return;
  }
  const post = await PostModel.findById(id);
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  if (post.authorId !== req.user!.sub) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  post.content = parsed.data.content;
  await post.save();
  res.json({ post });
}

export async function deletePost(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    res.status(400).json({ error: "Invalid post id" });
    return;
  }
  const post = await PostModel.findById(id);
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  if (post.authorId !== req.user!.sub) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  await post.deleteOne();
  res.status(204).send();
}
