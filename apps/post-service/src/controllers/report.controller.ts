import type { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { ReportModel } from "../models/report.js";
import { PostModel } from "../models/post.js";
import { logger } from "../utils/logger.js";
import { forwardAuth, fetchAuthors } from "./post.controller.js";
import { reportBodySchema, reportsQuerySchema } from "../schemas/report.schemas.js";

//  Signaler un post
export async function createReport(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    res.status(400).json({ error: "Invalid post id" });
    return;
  }
  const parsed = reportBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    return;
  }

  const post = await PostModel.findById(id).select({ _id: 1 }).lean();
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  try {
    const report = await ReportModel.create({
      postId: id,
      reporterId: req.user!.sub,
      reason: parsed.data.reason,
      details: parsed.data.details,
    });
    logger.info("report created", {
      id: String(report._id),
      postId: id,
      reporterId: req.user!.sub,
      reason: parsed.data.reason,
    });
    res.status(201).json({ report });
  } catch (err) {
    // Doublon (index unique postId+reporterId) : déjà signalé, on reste idempotent.
    if (err instanceof Error && (err as { code?: number }).code === 11000) {
      res.status(200).json({ duplicate: true });
      return;
    }
    throw err;
  }
}

// File de modération
export async function listReports(req: Request, res: Response): Promise<void> {
  const parsed = reportsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    return;
  }

  const reports = await ReportModel.find({ status: parsed.data.status })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const postIds = reports.map((r) => String(r.postId));
  const posts = await PostModel.find({ _id: { $in: postIds } }).lean();
  const postMap = new Map(posts.map((p) => [String(p._id), p]));

  // Auteurs des posts + signaleurs, résolus en un seul appel batch user-service.
  const authorIds = posts.map((p) => p.authorId);
  const reporterIds = reports.map((r) => r.reporterId);
  const userMap = await fetchAuthors([...authorIds, ...reporterIds], forwardAuth(req));

  const enriched = reports.map((r) => {
    const post = postMap.get(String(r.postId));
    return {
      id: String(r._id),
      reason: r.reason,
      details: r.details ?? null,
      status: r.status,
      reportedAt: r.createdAt,
      reporter: userMap.get(r.reporterId) ?? null,
      post: post
        ? {
            _id: String(post._id),
            authorId: post.authorId,
            content: post.content,
            createdAt: post.createdAt,
            author: userMap.get(post.authorId) ?? null,
          }
        : null,
    };
  });

  res.json({ reports: enriched });
}

// Ignorer le signalement
export async function dismissReport(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    res.status(400).json({ error: "Invalid report id" });
    return;
  }
  const report = await ReportModel.findByIdAndUpdate(
    id,
    { status: "dismissed" },
    { new: true },
  ).lean();
  if (!report) {
    res.status(404).json({ error: "Report not found" });
    return;
  }
  logger.info("report dismissed", { id, by: req.user!.sub });
  res.json({ report });
}

// supprimer le post signalé
export async function removeReportedPost(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    res.status(400).json({ error: "Invalid report id" });
    return;
  }
  const report = await ReportModel.findById(id);
  if (!report) {
    res.status(404).json({ error: "Report not found" });
    return;
  }

  await PostModel.findByIdAndDelete(report.postId);
  report.status = "resolved";
  await report.save();

  logger.info("reported post removed", {
    id,
    postId: String(report.postId),
    by: req.user!.sub,
  });
  res.json({ removed: true });
}
