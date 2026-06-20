import type { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { CommentModel } from "../models/comment.js";
import { PostModel } from "../models/post.js";
import { forwardAuth, withAuthors, authorPostingBlock } from "./post.controller.js";

const createSchema = z.object({
  content: z.string().trim().min(1).max(280),
  // parentId présent = réponse à un commentaire existant (1 niveau).
  parentId: z.string().refine(isValidObjectId, "Invalid parentId").optional(),
});

const listQuerySchema = z.object({
  cursor: z.string().refine(isValidObjectId, "Invalid cursor").optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

// POST /posts/:id/comments — commenter un post.
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

  const post = await PostModel.findById(id).lean();
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  // L'auteur ne doit être ni banni ni suspendu (Fx21), même règle que la publication d'un post.
  const { blocked, reason, status } = await authorPostingBlock(req.user!.sub, forwardAuth(req));
  if (blocked) {
    res.status(status).json({ error: reason });
    return;
  }

  // Une réponse doit cibler un commentaire existant du même post.
  if (parsed.data.parentId) {
    const parent = await CommentModel.findById(parsed.data.parentId).lean();
    if (!parent || String(parent.postId) !== id) {
      res.status(404).json({ error: "Parent comment not found" });
      return;
    }
  }

  const comment = await CommentModel.create({
    postId: id,
    authorId: req.user!.sub,
    content: parsed.data.content,
    parentId: parsed.data.parentId ?? null,
  });
  res.status(201).json({ comment });
}

// GET /posts/:id/comments — liste paginée (cursor _id décroissant), auteurs enrichis.
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
  const { cursor, limit } = parsed.data;

  const filter: Record<string, unknown> = { postId: id };
  if (cursor) filter._id = { $lt: cursor };
  const comments = await CommentModel.find(filter).sort({ _id: -1 }).limit(limit).lean();
  const last = comments.at(-1);
  const nextCursor = comments.length === limit && last ? String(last._id) : null;

  // Auteur enrichi + likeCount/likedByMe ; likedBy (ids des likers) jamais expose.
  const authored = await withAuthors(comments, forwardAuth(req));
  const me = req.user!.sub;
  const enriched = authored.map((c) => {
    const { likedBy, ...rest } = c;
    return { ...rest, likeCount: likedBy.length, likedByMe: likedBy.includes(me) };
  });
  res.json({ comments: enriched, nextCursor });
}

// DELETE /comments/:id — supprimer son propre commentaire.
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
  await comment.deleteOne();
  res.status(204).send();
}

// Like idempotent : $addToSet évite les doublons, re-liker = no-op.
export async function likeComment(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    res.status(400).json({ error: "Invalid comment id" });
    return;
  }
  const comment = await CommentModel.findByIdAndUpdate(
    id,
    { $addToSet: { likedBy: req.user!.sub } },
    { new: true },
  ).lean();
  if (!comment) {
    res.status(404).json({ error: "Comment not found" });
    return;
  }
  res.json({ likeCount: comment.likedBy.length, likedByMe: true });
}

// Unlike idempotent : $pull, retirer un like absent = no-op.
export async function unlikeComment(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    res.status(400).json({ error: "Invalid comment id" });
    return;
  }
  const comment = await CommentModel.findByIdAndUpdate(
    id,
    { $pull: { likedBy: req.user!.sub } },
    { new: true },
  ).lean();
  if (!comment) {
    res.status(404).json({ error: "Comment not found" });
    return;
  }
  res.json({ likeCount: comment.likedBy.length, likedByMe: false });
}
