import { OpenAPIRegistry, extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import {
  createSchema,
  listQuerySchema,
  feedQuerySchema,
  likesQuerySchema,
  likedQuerySchema,
  tagsQuerySchema,
  postResponseSchema,
  authorLiteSchema,
} from "../schemas/post.schemas.js";

// Active l'extension .openapi() de Zod (requise par zod-to-openapi avant la génération du doc).
extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

const bearerAuth = registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

const errorSchema = z.object({ error: z.string() });
const postListSchema = z.object({ posts: z.array(postResponseSchema), nextCursor: z.string().nullable() });
const postSingleSchema = z.object({ post: postResponseSchema });
// Forme brute renvoyée par create/updateComment (likedBy jamais exposé).
const commentResponseSchema = z.object({
  _id: z.string(),
  postId: z.string(),
  authorId: z.string(),
  content: z.string(),
  parentId: z.string().nullable(),
  tags: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});
const commentSingleSchema = z.object({ comment: commentResponseSchema });
const updateCommentSchema = z.object({ content: z.string().min(1).max(280) });
// cursor = offset numérique dans likedBy, total = nb de likers
const likersSchema = z.object({
  likers: z.array(authorLiteSchema),
  nextCursor: z.number().nullable(),
  total: z.number(),
});
const tagsSchema = z.object({ tags: z.array(z.object({ tag: z.string(), count: z.number() })) });

registry.registerPath({
  method: "post",
  path: "/posts",
  summary: "Create a new post",
  security: [{ [bearerAuth.name]: [] }],
  tags: ["Posts"],
  request: { body: { content: { "application/json": { schema: createSchema } } } },
  responses: {
    201: { description: "Post created", content: { "application/json": { schema: postSingleSchema } } },
    400: { description: "Validation error", content: { "application/json": { schema: errorSchema } } },
  },
});

registry.registerPath({
  method: "get",
  path: "/posts",
  summary: "List posts (optionally by author)",
  security: [{ [bearerAuth.name]: [] }],
  tags: ["Posts"],
  request: { query: listQuerySchema },
  responses: {
    200: { description: "Paginated posts", content: { "application/json": { schema: postListSchema } } },
  },
});

registry.registerPath({
  method: "get",
  path: "/posts/feed",
  summary: "Get feed of followed users",
  security: [{ [bearerAuth.name]: [] }],
  tags: ["Posts"],
  request: { query: feedQuerySchema },
  responses: {
    200: { description: "Paginated feed", content: { "application/json": { schema: postListSchema } } },
  },
});

registry.registerPath({
  method: "get",
  path: "/posts/{id}",
  summary: "Get a single post by ID",
  security: [{ [bearerAuth.name]: [] }],
  tags: ["Posts"],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: { description: "Post", content: { "application/json": { schema: postSingleSchema } } },
    404: { description: "Not found", content: { "application/json": { schema: errorSchema } } },
  },
});

registry.registerPath({
  method: "delete",
  path: "/posts/{id}",
  summary: "Delete own post",
  security: [{ [bearerAuth.name]: [] }],
  tags: ["Posts"],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    204: { description: "Post deleted" },
    403: { description: "Forbidden (not author)", content: { "application/json": { schema: errorSchema } } },
    404: { description: "Not found", content: { "application/json": { schema: errorSchema } } },
  },
});

// Note : GET /posts?tag= est déjà couvert par GET /posts (filtre `tag` ajouté à listQuerySchema).

registry.registerPath({
  method: "get",
  path: "/posts/liked",
  summary: "List posts liked by a user (current user if userId omitted)",
  security: [{ [bearerAuth.name]: [] }],
  tags: ["Posts"],
  request: { query: likedQuerySchema },
  responses: {
    200: { description: "Paginated liked posts", content: { "application/json": { schema: postListSchema } } },
  },
});

registry.registerPath({
  method: "get",
  path: "/posts/{id}/likes",
  summary: "List users who liked a post (paginated)",
  security: [{ [bearerAuth.name]: [] }],
  tags: ["Posts"],
  request: { params: z.object({ id: z.string() }), query: likesQuerySchema },
  responses: {
    200: { description: "Paginated likers", content: { "application/json": { schema: likersSchema } } },
    404: { description: "Not found", content: { "application/json": { schema: errorSchema } } },
  },
});

registry.registerPath({
  method: "patch",
  path: "/comments/{id}",
  summary: "Edit own comment or reply",
  security: [{ [bearerAuth.name]: [] }],
  tags: ["Comments"],
  request: {
    params: z.object({ id: z.string() }),
    body: { content: { "application/json": { schema: updateCommentSchema } } },
  },
  responses: {
    200: { description: "Comment updated", content: { "application/json": { schema: commentSingleSchema } } },
    403: { description: "Forbidden (not author)", content: { "application/json": { schema: errorSchema } } },
    404: { description: "Not found", content: { "application/json": { schema: errorSchema } } },
  },
});

registry.registerPath({
  method: "get",
  path: "/comments/{id}/likes",
  summary: "List users who liked a comment (paginated)",
  security: [{ [bearerAuth.name]: [] }],
  tags: ["Comments"],
  request: { params: z.object({ id: z.string() }), query: likesQuerySchema },
  responses: {
    200: { description: "Paginated likers", content: { "application/json": { schema: likersSchema } } },
    404: { description: "Not found", content: { "application/json": { schema: errorSchema } } },
  },
});

registry.registerPath({
  method: "get",
  path: "/tags",
  summary: "List most-used tags (posts + comments)",
  security: [{ [bearerAuth.name]: [] }],
  tags: ["Tags"],
  request: { query: tagsQuerySchema },
  responses: {
    200: { description: "Top tags by usage", content: { "application/json": { schema: tagsSchema } } },
  },
});
