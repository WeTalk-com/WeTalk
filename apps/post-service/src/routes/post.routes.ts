import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { createPost, listPosts, getPost, updatePost, deletePost } from "../controllers/post.controller.js";
import { likePost, unlikePost, listLikes } from "../controllers/like.controller.js";
import { createComment, listComments } from "../controllers/comment.controller.js";

export const postRouter = Router();

postRouter.post("/", requireAuth, createPost);
postRouter.get("/", requireAuth, listPosts);
postRouter.get("/:id", requireAuth, getPost);
postRouter.patch("/:id", requireAuth, updatePost);
postRouter.delete("/:id", requireAuth, deletePost);

postRouter.post("/:id/like", requireAuth, likePost);
postRouter.delete("/:id/like", requireAuth, unlikePost);
postRouter.get("/:id/likes", requireAuth, listLikes);

postRouter.post("/:id/comments", requireAuth, createComment);
postRouter.get("/:id/comments", requireAuth, listComments);

// TODO(Fx5): two feeds, both chronological + cursor-paginated:
//   - GET /feed              — global feed: most recent posts from everyone (no follow data needed).
//   - GET /feed/following    — following feed: posts from the user's subscriptions only.
//                              Cross-service: needs the following list from user-service (define the contract first).
// TODO(Fx13): tag search — extend GET /posts with a `?tag=` filter (reuse existing cursor pagination).
// TODO(Fx18/Fx19): POST /:id/media — upload images/videos (multer + storage backend + size/type limits).
// TODO(Fx20): POST /:id/report — report inappropriate content (Report model; clarify moderation ownership).
