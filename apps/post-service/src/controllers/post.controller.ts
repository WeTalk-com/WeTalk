import type { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { PostModel } from "../models/post.js";

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
