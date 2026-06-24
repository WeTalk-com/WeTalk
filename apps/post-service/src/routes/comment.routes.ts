import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { deleteComment, updateComment, likeComment, unlikeComment, listCommentLikers } from "../controllers/comment.controller.js";

export const commentRouter = Router();

commentRouter.patch("/:id", requireAuth, updateComment);
commentRouter.delete("/:id", requireAuth, deleteComment);
commentRouter.post("/:id/like", requireAuth, likeComment);
commentRouter.delete("/:id/like", requireAuth, unlikeComment);
commentRouter.get("/:id/likes", requireAuth, listCommentLikers);
