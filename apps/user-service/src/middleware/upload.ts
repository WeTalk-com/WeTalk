import type { Request, Response, NextFunction, RequestHandler } from "express";
import multer from "multer";
import { env } from "../config/env.js";

const ALLOWED_IMAGE_MIMES = new Set([
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/gif",
]);

// Avatar/bannière en mémoire
const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: env.maxProfileImageBytes, files: 2 },
	fileFilter: (_req, file, cb) => {
		if (!ALLOWED_IMAGE_MIMES.has(file.mimetype)) {
			cb(new Error("UNSUPPORTED_MEDIA_TYPE"));
			return;
		}
		cb(null, true);
	},
});

const fields = upload.fields([
	{ name: "avatar", maxCount: 1 },
	{ name: "banner", maxCount: 1 },
]) as unknown as RequestHandler;

// Enveloppe pour traduire les erreurs multer en réponses JSON propres.
export function uploadProfileMedia(req: Request, res: Response, next: NextFunction): void {
	fields(req, res, (err: unknown) => {
		if (err instanceof multer.MulterError) {
			if (err.code === "LIMIT_FILE_SIZE") {
				res.status(413).json({ error: "Fichier trop volumineux." });
				return;
			}
			res.status(400).json({ error: `Erreur d'upload: ${err.code}` });
			return;
		}
		if (err instanceof Error && err.message === "UNSUPPORTED_MEDIA_TYPE") {
			res.status(415).json({ error: "Type de fichier non supporté." });
			return;
		}
		if (err) {
			next(err);
			return;
		}
		next();
	});
}
