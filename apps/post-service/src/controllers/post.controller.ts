import type { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { PostModel } from "../models/post.js";

const createSchema = z.object({
  content: z.string().min(1).max(280),
});

// Fx3 — publie un message court.
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

// Fx4 / Fx11 / Fx5 — liste les posts, du plus récent au plus ancien.
export async function listPosts(req: Request, res: Response): Promise<void> {
  const { authorId } = req.query;
  const filter = typeof authorId === "string" ? { authorId } : {};
  const posts = await PostModel.find(filter).sort({ createdAt: -1 }).limit(50);
  res.json({ posts });
}

// Affiche un post par son identifiant.
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

// Supprime un post. Seul son auteur peut le faire.
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
