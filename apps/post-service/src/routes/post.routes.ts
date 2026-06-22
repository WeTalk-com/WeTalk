import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import { createPost, listPosts, feed, getPost, updatePost, deletePost } from "../controllers/post.controller.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 52428800, files: 1 } });

export const postRouter = Router();

postRouter.post("/", requireAuth, upload.single("media"), createPost);
postRouter.get("/", requireAuth, listPosts);
postRouter.get("/feed", requireAuth, feed);
postRouter.get("/:id", requireAuth, getPost);
postRouter.patch("/:id", requireAuth, updatePost);
postRouter.delete("/:id", requireAuth, deletePost);
