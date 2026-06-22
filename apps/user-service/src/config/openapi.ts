import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { idParamSchema, updateMeSchema, suspendBodySchema, listUsersQuerySchema, followListQuerySchema } from "../schemas/user.schemas.js";

export const registry = new OpenAPIRegistry();

const bearerAuth = registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

const userResponseSchema = z.object({
  id: z.string(),
  username: z.string(),
  displayName: z.string().nullable(),
  profileImage: z.string().nullable(),
  profileBanner: z.string().nullable(),
  description: z.string().nullable(),
  role: z.enum(["user", "moderator", "admin"]),
  isBanned: z.boolean(),
  isSuspended: z.boolean(),
  createdAt: z.string(),
});

const errorSchema = z.object({ error: z.string() });

// Profils
registry.registerPath({
  method: "get",
  path: "/users",
  summary: "List users with search & pagination",
  security: [{ [bearerAuth.name]: [] }],
  tags: ["Users"],
  request: { query: listUsersQuerySchema },
  responses: {
    200: { description: "Paginated user list", content: { "application/json": { schema: z.object({ users: z.array(userResponseSchema), nextCursor: z.number().nullish() }) } } },
  },
});

registry.registerPath({
  method: "get",
  path: "/users/me",
  summary: "Get own profile",
  security: [{ [bearerAuth.name]: [] }],
  tags: ["Users"],
  responses: {
    200: { description: "Current user", content: { "application/json": { schema: userResponseSchema } } },
  },
});

registry.registerPath({
  method: "get",
  path: "/users/{id}",
  summary: "Get public profile by ID or username",
  security: [{ [bearerAuth.name]: [] }],
  tags: ["Users"],
  request: { params: idParamSchema },
  responses: {
    200: { description: "User profile", content: { "application/json": { schema: userResponseSchema } } },
    404: { description: "Not found", content: { "application/json": { schema: errorSchema } } },
  },
});

registry.registerPath({
  method: "patch",
  path: "/users/me",
  summary: "Update own profile",
  security: [{ [bearerAuth.name]: [] }],
  tags: ["Users"],
  request: { body: { content: { "application/json": { schema: updateMeSchema } } } },
  responses: {
    200: { description: "Profile updated", content: { "application/json": { schema: userResponseSchema } } },
  },
});

registry.registerPath({
  method: "delete",
  path: "/users/me",
  summary: "Delete own account",
  security: [{ [bearerAuth.name]: [] }],
  tags: ["Users"],
  responses: {
    204: { description: "Account deleted" },
  },
});

// Abonnements
registry.registerPath({
  method: "get",
  path: "/users/{id}/following",
  summary: "Get users that :id follows",
  security: [{ [bearerAuth.name]: [] }],
  tags: ["Follows"],
  request: { params: idParamSchema, query: followListQuerySchema },
  responses: {
    200: { description: "Followed users", content: { "application/json": { schema: z.object({ users: z.array(userResponseSchema), nextCursor: z.number().nullish() }) } } },
  },
});

registry.registerPath({
  method: "get",
  path: "/users/{id}/following/ids",
  summary: "Get raw IDs of followed users (for post feed)",
  security: [{ [bearerAuth.name]: [] }],
  tags: ["Follows"],
  request: { params: idParamSchema },
  responses: {
    200: { description: "List of user IDs", content: { "application/json": { schema: z.object({ ids: z.array(z.string()) }) } } },
  },
});

registry.registerPath({
  method: "get",
  path: "/users/{id}/followers",
  summary: "Get followers of :id",
  security: [{ [bearerAuth.name]: [] }],
  tags: ["Follows"],
  request: { params: idParamSchema, query: followListQuerySchema },
  responses: {
    200: { description: "Followers list", content: { "application/json": { schema: z.object({ users: z.array(userResponseSchema), nextCursor: z.number().nullish() }) } } },
  },
});

registry.registerPath({
  method: "post",
  path: "/users/{id}/follow",
  summary: "Follow a user",
  security: [{ [bearerAuth.name]: [] }],
  tags: ["Follows"],
  request: { params: idParamSchema },
  responses: {
    204: { description: "Followed successfully" },
    404: { description: "User not found", content: { "application/json": { schema: errorSchema } } },
  },
});

registry.registerPath({
  method: "delete",
  path: "/users/{id}/follow",
  summary: "Unfollow a user",
  security: [{ [bearerAuth.name]: [] }],
  tags: ["Follows"],
  request: { params: idParamSchema },
  responses: {
    204: { description: "Unfollowed successfully" },
    404: { description: "User not found", content: { "application/json": { schema: errorSchema } } },
  },
});

// Modération
registry.registerPath({
  method: "post",
  path: "/users/{id}/ban",
  summary: "Ban a user (moderator/admin)",
  security: [{ [bearerAuth.name]: [] }],
  tags: ["Moderation"],
  request: { params: idParamSchema },
  responses: { 204: { description: "User banned" } },
});

registry.registerPath({
  method: "delete",
  path: "/users/{id}/ban",
  summary: "Unban a user (moderator/admin)",
  security: [{ [bearerAuth.name]: [] }],
  tags: ["Moderation"],
  request: { params: idParamSchema },
  responses: { 204: { description: "User unbanned" } },
});

registry.registerPath({
  method: "post",
  path: "/users/{id}/suspend",
  summary: "Suspend a user's posting ability (moderator/admin)",
  security: [{ [bearerAuth.name]: [] }],
  tags: ["Moderation"],
  request: { params: idParamSchema, body: { content: { "application/json": { schema: suspendBodySchema } } } },
  responses: { 204: { description: "User suspended" } },
});

registry.registerPath({
  method: "delete",
  path: "/users/{id}/suspend",
  summary: "Unsuspend a user (moderator/admin)",
  security: [{ [bearerAuth.name]: [] }],
  tags: ["Moderation"],
  request: { params: idParamSchema },
  responses: { 204: { description: "User unsuspended" } },
});
