import { OpenAPIRegistry, extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { createSchema, listQuerySchema, feedQuerySchema, postResponseSchema } from "../schemas/post.schemas.js";

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
