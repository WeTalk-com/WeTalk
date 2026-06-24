import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import { createPost, countPosts, listPosts, feed, getPost, deletePost, likePost, unlikePost, listPostLikers, listLikedPosts } from "../controllers/post.controller.js";
import { createComment, listComments } from "../controllers/comment.controller.js";
import { createReport } from "../controllers/report.controller.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 52428800, files: 1 } });

export const postRouter = Router();

postRouter.post("/", requireAuth, upload.single("media"), createPost);
postRouter.get("/count", requireAuth, countPosts);
postRouter.get("/", requireAuth, listPosts);
postRouter.get("/feed", requireAuth, feed);
postRouter.get("/liked", requireAuth, listLikedPosts);
postRouter.get("/:id", requireAuth, getPost);
postRouter.delete("/:id", requireAuth, deletePost);
postRouter.post("/:id/like", requireAuth, likePost);
postRouter.delete("/:id/like", requireAuth, unlikePost);
postRouter.get("/:id/likes", requireAuth, listPostLikers);
postRouter.post("/:id/comments", requireAuth, createComment);
postRouter.get("/:id/comments", requireAuth, listComments);
postRouter.post("/:id/report", requireAuth, createReport);
