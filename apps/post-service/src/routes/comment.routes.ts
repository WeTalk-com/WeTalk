import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { deleteComment, likeComment, unlikeComment } from "../controllers/comment.controller.js";

export const commentRouter = Router();

commentRouter.delete("/:id", requireAuth, deleteComment);
commentRouter.post("/:id/like", requireAuth, likeComment);
commentRouter.delete("/:id/like", requireAuth, unlikeComment);
