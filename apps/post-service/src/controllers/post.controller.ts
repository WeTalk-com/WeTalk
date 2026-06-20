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

const feedQuerySchema = z.object({
  cursor: z.string().refine(isValidObjectId, "Invalid cursor").optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

type AuthorLite = {
  id: string;
  username: string;
  displayName: string | null;
  profileImage: string | null;
  isBanned: boolean;
};

async function fetchFollowingIds(userId: string, authHeader: string | undefined): Promise<string[]> {
  try {
    const res = await fetch(`${env.userServiceUrl}/users/${userId}/following/ids`, {
      headers: authHeader ? { authorization: authHeader } : {},
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) {
      logger.warn("following ids lookup non-ok", { userId, status: res.status });
      return [];
    }
    const data = (await res.json()) as { ids?: string[] };
    return Array.isArray(data.ids) ? data.ids : [];
  } catch (err) {
    logger.warn("following ids lookup failed", {
      userId,
      error: err instanceof Error ? err.message : String(err),
    });
    return [];
  }
}

async function fetchAuthors(
  ids: string[],
  authHeader: string | undefined,
): Promise<Map<string, AuthorLite>> {
  const map = new Map<string, AuthorLite>();
  const unique = [...new Set(ids)];
  if (unique.length === 0) return map;
  try {
    const res = await fetch(`${env.userServiceUrl}/users?ids=${unique.join(",")}`, {
      headers: authHeader ? { authorization: authHeader } : {},
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) {
      logger.warn("authors lookup non-ok", { status: res.status });
      return map;
    }
    const users = (await res.json()) as AuthorLite[];
    for (const u of users) {
      map.set(u.id, {
        id: u.id,
        username: u.username,
        displayName: u.displayName ?? null,
        profileImage: u.profileImage ?? null,
        isBanned: Boolean(u.isBanned),
      });
    }
  } catch (err) {
    logger.warn("authors lookup failed", {
      error: err instanceof Error ? err.message : String(err),
    });
  }
  return map;
}

// Attache l'auteur à chaque post. Si l'auteur est banni, on masque le post au
// read-time : contenu non servi + author anonymisé + flag authorBanned. Rien
// n'est muté en base, donc c'est réversible automatiquement à l'unban. Le front
// affiche un message dédié quand authorBanned est vrai.
async function withAuthors<T extends { authorId: string }>(
  posts: T[],
  authHeader: string | undefined,
) {
  const authors = await fetchAuthors(posts.map((p) => p.authorId), authHeader);
  return posts.map((p) => {
    const author = authors.get(p.authorId) ?? null;
    if (author?.isBanned) {
      return {
        ...p,
        content: null,
        authorBanned: true,
        author: { ...author, displayName: "Utilisateur banni", profileImage: null },
      };
    }
    return { ...p, authorBanned: false, author };
  });
}

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

  const enriched = await withAuthors(posts, req.headers.authorization);
  res.json({ posts: enriched, nextCursor });
}

export async function feed(req: Request, res: Response): Promise<void> {
  const parsed = feedQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    return;
  }
  const { cursor, limit } = parsed.data;
  const me = req.user!.sub;

  const following = await fetchFollowingIds(me, req.headers.authorization);
  const authorIds = [...new Set([me, ...following])];

  const filter: Record<string, unknown> = { authorId: { $in: authorIds } };
  if (cursor) filter._id = { $lt: cursor };

  const posts = await PostModel.find(filter).sort({ _id: -1 }).limit(limit).lean();
  const last = posts[posts.length - 1];
  const nextCursor = posts.length === limit && last ? String(last._id) : null;

  const enriched = await withAuthors(posts, req.headers.authorization);
  res.json({ posts: enriched, nextCursor });
}

export async function getPost(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    res.status(400).json({ error: "Invalid post id" });
    return;
  }
  const post = await PostModel.findById(id).lean();
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  const [enriched] = await withAuthors([post], req.headers.authorization);
  res.json({ post: enriched });
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
