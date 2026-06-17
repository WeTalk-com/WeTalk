import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { updateComment, deleteComment } from "../controllers/comment.controller.js";

export const commentRouter = Router();

commentRouter.patch("/:id", requireAuth, updateComment);
commentRouter.delete("/:id", requireAuth, deleteComment);
