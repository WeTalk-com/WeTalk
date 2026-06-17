import type { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { PostModel } from "../models/post.js";
import { CommentModel } from "../models/comment.js";

const createSchema = z.object({
  content: z.string().trim().min(1).max(280),
  parentId: z.string().refine(isValidObjectId, "Invalid parentId").optional(),
});

const updateSchema = z.object({
  content: z.string().trim().min(1).max(280),
});

const listQuerySchema = z.object({
  parentId: z.string().refine(isValidObjectId, "Invalid parentId").optional(),
  cursor: z.string().refine(isValidObjectId, "Invalid cursor").optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export async function createComment(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    res.status(400).json({ error: "Invalid post id" });
    return;
  }
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    return;
  }
  const exists = await PostModel.exists({ _id: id });
  if (!exists) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  if (parsed.data.parentId) {
    const parent = await CommentModel.findById(parsed.data.parentId).select("postId").lean();
    if (!parent || String(parent.postId) !== id) {
      res.status(400).json({ error: "Invalid parentId" });
      return;
    }
  }
  const comment = await CommentModel.create({
    postId: id,
    parentId: parsed.data.parentId ?? null,
    authorId: req.user!.sub,
    content: parsed.data.content,
  });
  res.status(201).json({ comment });
}

export async function listComments(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    res.status(400).json({ error: "Invalid post id" });
    return;
  }
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    return;
  }
  const { parentId, cursor, limit } = parsed.data;

  const filter: Record<string, unknown> = { postId: id, parentId: parentId ?? null };

  if (cursor) filter._id = { $gt: cursor };

  const comments = await CommentModel.find(filter).sort({ _id: 1 }).limit(limit).lean();
  const last = comments[comments.length - 1];
  const nextCursor = comments.length === limit && last ? String(last._id) : null;

  res.json({ comments, nextCursor });
}

export async function updateComment(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    res.status(400).json({ error: "Invalid comment id" });
    return;
  }
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    return;
  }
  const comment = await CommentModel.findById(id);
  if (!comment) {
    res.status(404).json({ error: "Comment not found" });
    return;
  }
  if (comment.authorId !== req.user!.sub) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  comment.content = parsed.data.content;
  await comment.save();
  res.json({ comment });
}

export async function deleteComment(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    res.status(400).json({ error: "Invalid comment id" });
    return;
  }
  const comment = await CommentModel.findById(id);
  if (!comment) {
    res.status(404).json({ error: "Comment not found" });
    return;
  }
  if (comment.authorId !== req.user!.sub) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  
  await CommentModel.deleteMany({ $or: [{ _id: id }, { parentId: id }] });
  res.status(204).send();
}
