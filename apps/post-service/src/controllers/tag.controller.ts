import type { Request, Response } from "express";
import { PostModel } from "../models/post.js";
import { CommentModel } from "../models/comment.js";
import { tagsQuerySchema } from "../schemas/post.schemas.js";

// GET /tags — tags les plus utilisés (explorer), agrégés sur posts + commentaires.
export async function listPopularTags(req: Request, res: Response): Promise<void> {
  const parsed = tagsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    return;
  }
  const { limit } = parsed.data;

  // Une passe d'agrégation par collection : unwind des tags puis comptage.
  const pipeline = [{ $unwind: "$tags" }, { $group: { _id: "$tags", count: { $sum: 1 } } }];
  const [postTags, commentTags] = await Promise.all([
    PostModel.aggregate<{ _id: string; count: number }>(pipeline),
    CommentModel.aggregate<{ _id: string; count: number }>(pipeline),
  ]);

  // Fusion des comptes post + commentaire, tri décroissant, top {limit}.
  const counts = new Map<string, number>();
  for (const { _id, count } of [...postTags, ...commentTags]) {
    counts.set(_id, (counts.get(_id) ?? 0) + count);
  }
  const tags = [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  res.json({ tags });
}
