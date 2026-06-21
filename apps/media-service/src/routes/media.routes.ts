import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { uploadSingle } from "../middleware/upload.js";
import { upload, serve, remove } from "../controllers/media.controller.js";

export const mediaRouter = Router();

mediaRouter.post("/", requireAuth, uploadSingle, upload); // upload
mediaRouter.get("/:filename", serve); // lecture
mediaRouter.delete("/:filename", requireAuth, remove); // remove
