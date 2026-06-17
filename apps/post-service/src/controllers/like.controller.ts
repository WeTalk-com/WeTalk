import type { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { PostModel } from "../models/post.js";
import { LikeModel } from "../models/like.js";

const listQuerySchema = z.object({
  cursor: z.string().refine(isValidObjectId, "Invalid cursor").optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export async function likePost(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    res.status(400).json({ error: "Invalid post id" });
    return;
  }
  const exists = await PostModel.exists({ _id: id });
  if (!exists) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  
  await LikeModel.updateOne(
    { postId: id, userId: req.user!.sub },
    { $setOnInsert: { postId: id, userId: req.user!.sub } },
    { upsert: true },
  );
  res.status(204).send();
}

export async function unlikePost(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    res.status(400).json({ error: "Invalid post id" });
    return;
  }
  await LikeModel.deleteOne({ postId: id, userId: req.user!.sub });
  res.status(204).send();
}

export async function listLikes(req: Request, res: Response): Promise<void> {
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

  const [likes, count] = await Promise.all([
    LikeModel.find(filter).sort({ _id: -1 }).limit(limit).lean(),
    LikeModel.countDocuments({ postId: id }),
  ]);
  const last = likes[likes.length - 1];
  const nextCursor = likes.length === limit && last ? String(last._id) : null;

  res.json({ count, likes, nextCursor });
}
