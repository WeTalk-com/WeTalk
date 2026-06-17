import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { createPost, listPosts, getPost, updatePost, deletePost } from "../controllers/post.controller.js";

export const postRouter = Router();

postRouter.post("/", requireAuth, createPost);
postRouter.get("/", requireAuth, listPosts);
postRouter.get("/:id", requireAuth, getPost);
postRouter.patch("/:id", requireAuth, updatePost);
postRouter.delete("/:id", requireAuth, deletePost);
