import { randomUUID } from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import multer from "multer";
import { env } from "../config/env.js";
import { isAllowedMime, typeForMime } from "../services/storage.service.js";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, env.uploadDir),
  filename: (_req, file, cb) => {
    const info = typeForMime(file.mimetype);
    const ext = info?.ext ?? "bin";
    cb(null, `${randomUUID()}.${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: env.maxVideoBytes, files: 1 }, // Limite haute = vidéo
  fileFilter: (_req, file, cb) => {
    if (!isAllowedMime(file.mimetype)) {
      cb(new Error("UNSUPPORTED_MEDIA_TYPE"));
      return;
    }
    cb(null, true);
  },
});

const single = upload.single("file");

export function uploadSingle(req: Request, res: Response, next: NextFunction): void {
  single(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        res.status(413).json({ error: "File too large" });
        return;
      }
      res.status(400).json({ error: `Upload error: ${err.code}` });
      return;
    }
    if (err instanceof Error && err.message === "UNSUPPORTED_MEDIA_TYPE") {
      res.status(415).json({ error: "Unsupported media type" });
      return;
    }
    if (err) {
      next(err);
      return;
    }
    next();
  });
}
