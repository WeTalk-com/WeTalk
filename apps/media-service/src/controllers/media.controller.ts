import { promises as fs } from "node:fs";
import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";
import {
  contentTypeForFile,
  deleteFile,
  kindForFile,
  resolveUploadPath,
} from "../services/storage.service.js";

export async function upload(req: Request, res: Response): Promise<void> {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: "No file provided (field 'file')" });
    return;
  }

  const kind = kindForFile(file.filename);

  if (kind === "image" && file.size > env.maxImageBytes) {
    await deleteFile(file.filename);
    res.status(413).json({ error: "Image too large" });
    return;
  }

  logger.info("media stored", { filename: file.filename, kind, size: file.size });

  res.status(201).json({
    id: file.filename,
    url: `/api/media/${file.filename}`,
    type: kind,
    mimeType: file.mimetype,
  });
}

export async function serve(req: Request, res: Response): Promise<void> {
  const { filename } = req.params;
  const full = filename ? resolveUploadPath(filename) : null;
  if (!full || !filename) {
    res.status(400).json({ error: "Invalid filename" });
    return;
  }

  try {
    await fs.access(full);
  } catch {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.setHeader("Content-Type", contentTypeForFile(filename));
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  res.sendFile(full, (err) => {
    if (err && !res.headersSent) {
      res.status(500).json({ error: "Failed to serve file" });
    }
  });
}

export async function remove(req: Request, res: Response): Promise<void> {
  const { filename } = req.params;
  const full = filename ? resolveUploadPath(filename) : null;
  if (!full || !filename) {
    res.status(400).json({ error: "Invalid filename" });
    return;
  }
  await deleteFile(filename);
  res.status(204).send();
}
