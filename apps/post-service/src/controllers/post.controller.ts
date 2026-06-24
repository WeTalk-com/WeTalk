import type { Request, Response } from "express";
import { isValidObjectId, Types } from "mongoose";
import { z } from "zod";
import { PostModel } from "../models/post.js";
import { CommentModel } from "../models/comment.js";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

// Headers d'auth à réémettre vers user-service : on relaie le cookie (front) et/ou le Bearer (est-ouest).
export function forwardAuth(req: Request): Record<string, string> {
  const headers: Record<string, string> = {};
  if (req.headers.authorization) headers.authorization = req.headers.authorization;
  if (req.headers.cookie) headers.cookie = req.headers.cookie;
  return headers;
}

// Vérifie auprès du user-service si l'auteur peut publier
export async function authorPostingBlock(
  userId: string,
  headers: Record<string, string>,
): Promise<{ blocked: boolean; reason: string; status: number }> {
  try {
    const res = await fetch(`${env.userServiceUrl}/users/${userId}`, {
      headers,
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

// Erreur d'upload média
class MediaUploadError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

async function uploadMediaToService(
  file: Express.Multer.File,
  headers: Record<string, string>,
): Promise<{ id: string; url: string; type: "image" | "video" }> {
  const form = new FormData();
  form.append("file", new Blob([file.buffer], { type: file.mimetype }), file.originalname);
  const res = await fetch(`${env.mediaServiceUrl}/media`, {
    method: "POST",
    headers,
    body: form,
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    const status = res.status >= 400 && res.status < 500 ? res.status : 502;
    throw new MediaUploadError(status, body.error ?? `media-service responded ${res.status}`);
  }
  const data = (await res.json()) as { id?: string; url?: string; type?: string };
  if (!data.id || !data.url || (data.type !== "image" && data.type !== "video")) {
    throw new MediaUploadError(502, "media-service returned an invalid payload");
  }
  return { id: data.id, url: data.url, type: data.type };
}

async function deleteMediaFromService(id: string, headers: Record<string, string>): Promise<void> {
  try {
    await fetch(`${env.mediaServiceUrl}/media/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers,
      signal: AbortSignal.timeout(5000),
    });
  } catch (err) {
    logger.warn("orphan media cleanup failed", {
      id,
      error: err instanceof Error ? err.message : String(err),
    });
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

async function fetchFollowingIds(userId: string, headers: Record<string, string>): Promise<string[]> {
  try {
    const res = await fetch(`${env.userServiceUrl}/users/${userId}/following/ids`, {
      headers,
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
  headers: Record<string, string>,
): Promise<Map<string, AuthorLite>> {
  const map = new Map<string, AuthorLite>();
  const unique = [...new Set(ids)];
  if (unique.length === 0) return map;
  try {
    const res = await fetch(`${env.userServiceUrl}/users?ids=${unique.join(",")}`, {
      headers,
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
export async function withAuthors<T extends { authorId: string }>(
  posts: T[],
  headers: Record<string, string>,
) {
  const authors = await fetchAuthors(posts.map((p) => p.authorId), headers);
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

// Nombre de commentaires par post, en une seule passe d'agrégation.
async function commentCounts(postIds: string[]): Promise<Map<string, number>> {
  if (postIds.length === 0) return new Map();
  const rows = await CommentModel.aggregate<{ _id: Types.ObjectId; count: number }>([
    { $match: { postId: { $in: postIds.map((id) => new Types.ObjectId(id)) } } },
    { $group: { _id: "$postId", count: { $sum: 1 } } },
  ]);
  return new Map(rows.map((r) => [String(r._id), r.count]));
}

// Enrichit pour le lecteur courant : auteur (+ masquage banni) puis likeCount /
// likedByMe / commentCount. likedBy (ids des likers) n'est jamais renvoyé au client.
async function enrichForViewer<T extends { _id: unknown; authorId: string; likedBy: string[] }>(
  posts: T[],
  req: Request,
) {
  const authored = await withAuthors(posts, forwardAuth(req));
  const counts = await commentCounts(posts.map((p) => String(p._id)));
  const me = req.user!.sub;
  return authored.map((p) => {
    // likedBy peut manquer sur d'anciens documents (champ ajouté après coup) :
    // le default Mongoose ne s'applique qu'à la création, pas à la lecture.
    const { likedBy = [], ...rest } = p;
    return {
      ...rest,
      likeCount: likedBy.length,
      likedByMe: likedBy.includes(me),
      commentCount: counts.get(String(p._id)) ?? 0,
    };
  });
}

export async function createPost(req: Request, res: Response): Promise<void> {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    return;
  }

  // L'auteur ne doit être ni banni ni suspendu (Fx21).
  const { blocked, reason, status } = await authorPostingBlock(req.user!.sub, forwardAuth(req));
  if (blocked) {
    res.status(status).json({ error: reason });
    return;
  }

  // media optionnel
  let media: { id: string; url: string; type: "image" | "video" } | undefined;
  if (req.file) {
    try {
      media = await uploadMediaToService(req.file, forwardAuth(req));
    } catch (err) {
      const status = err instanceof MediaUploadError ? err.status : 502;
      logger.error("media upload failed", {
        status,
        error: err instanceof Error ? err.message : String(err),
      });
      res.status(status).json({
        error: status === 502 ? "Media upload failed" : (err as MediaUploadError).message,
      });
      return;
    }
  }

  let post;
  try {
    post = await PostModel.create({
      authorId: req.user!.sub,
      content: parsed.data.content,
      ...(media ? { media: { url: media.url, type: media.type } } : {}),
    });
  } catch (err) {
    if (media) await deleteMediaFromService(media.id, forwardAuth(req));
    throw err;
  }
  // likedBy (ids des likers) n'est jamais exposé au client.
  const { likedBy: _likedBy, ...postOut } = post.toObject();
  res.status(201).json({ post: postOut });
}

export async function countPosts(req: Request, res: Response): Promise<void> {
  const { authorId } = req.query;
  if (!authorId || typeof authorId !== "string") {
    res.status(400).json({ error: "authorId query param required" });
    return;
  }
  const count = await PostModel.countDocuments({ authorId });
  res.json({ count });
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

  const enriched = await enrichForViewer(posts, req);
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

  const following = await fetchFollowingIds(me, forwardAuth(req));
  const authorIds = [...new Set([me, ...following])];

  const filter: Record<string, unknown> = { authorId: { $in: authorIds } };
  if (cursor) filter._id = { $lt: cursor };

  const posts = await PostModel.find(filter).sort({ _id: -1 }).limit(limit).lean();
  const last = posts[posts.length - 1];
  const nextCursor = posts.length === limit && last ? String(last._id) : null;

  const enriched = await enrichForViewer(posts, req);
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
  const [enriched] = await enrichForViewer([post], req);
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

// Like idempotent : $addToSet évite les doublons, re-liker = no-op.
export async function likePost(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    res.status(400).json({ error: "Invalid post id" });
    return;
  }
  const post = await PostModel.findByIdAndUpdate(
    id,
    { $addToSet: { likedBy: req.user!.sub } },
    { new: true },
  ).lean();
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  res.json({ likeCount: (post.likedBy ?? []).length, likedByMe: true });
}

// Unlike idempotent : $pull, retirer un like absent = no-op.
export async function unlikePost(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    res.status(400).json({ error: "Invalid post id" });
    return;
  }
  const post = await PostModel.findByIdAndUpdate(
    id,
    { $pull: { likedBy: req.user!.sub } },
    { new: true },
  ).lean();
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  res.json({ likeCount: (post.likedBy ?? []).length, likedByMe: false });
}
