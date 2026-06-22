import { promises as fs } from "node:fs";
import path from "node:path";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

export type MediaKind = "image" | "video";

type TypeInfo = { ext: string; kind: MediaKind };

// MIME autorisés
const MIME_TO_TYPE: Record<string, TypeInfo> = {
  "image/jpeg": { ext: "jpg", kind: "image" },
  "image/png": { ext: "png", kind: "image" },
  "image/webp": { ext: "webp", kind: "image" },
  "image/gif": { ext: "gif", kind: "image" },
  "video/mp4": { ext: "mp4", kind: "video" },
  "video/webm": { ext: "webm", kind: "video" },
};

// file Content-Type
const EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  mp4: "video/mp4",
  webm: "video/webm",
};

export function typeForMime(mime: string): TypeInfo | undefined {
  return MIME_TO_TYPE[mime];
}

export function isAllowedMime(mime: string): boolean {
  return mime in MIME_TO_TYPE;
}

export function contentTypeForFile(filename: string): string {
  const ext = path.extname(filename).slice(1).toLowerCase();
  return EXT_TO_MIME[ext] ?? "application/octet-stream";
}

export function kindForFile(filename: string): MediaKind {
  const ext = path.extname(filename).slice(1).toLowerCase();
  return ext === "mp4" || ext === "webm" ? "video" : "image";
}

// Only `<uuid>.<ext>` are accepetd
const SAFE_NAME = /^[a-zA-Z0-9_-]+\.[a-z0-9]+$/;

export function isSafeFilename(name: string): boolean {
  return SAFE_NAME.test(name);
}

export function resolveUploadPath(filename: string): string | null {
  if (!isSafeFilename(filename)) return null;
  const base = path.resolve(env.uploadDir);
  const full = path.resolve(base, filename);
  if (full !== path.join(base, filename) || !full.startsWith(base + path.sep)) {
    return null;
  }
  return full;
}

export async function ensureUploadDir(): Promise<void> {
  await fs.mkdir(env.uploadDir, { recursive: true });
}

export async function deleteFile(filename: string): Promise<boolean> {
  const full = resolveUploadPath(filename);
  if (!full) return false;
  try {
    await fs.unlink(full);
    return true;
  } catch (err) {
    logger.warn("delete failed", {
      filename,
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}
