import { OpenAPIRegistry, extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { idParamSchema, listQuerySchema } from "../schemas/notification.schemas.js";

// Active l'extension .openapi() de Zod (requise par zod-to-openapi avant la génération du doc).
extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

const bearerAuth = registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

const errorResponseSchema = z.object({ error: z.string() }).openapi("Error");

const notificationSchema = z
  .object({
    id: z.string(),
    type: z.enum(["like", "comment", "follow"]),
    actorId: z.string(),
    postId: z.string().optional(),
    commentId: z.string().optional(),
    preview: z.string().optional(),
    read: z.boolean(),
    createdAt: z.string(),
  })
  .openapi("Notification");

registry.registerPath({
  method: "get",
  path: "/notifications",
  summary: "List the current user's notifications (paginated by cursor)",
  security: [{ [bearerAuth.name]: [] }],
  tags: ["Notifications"],
  request: { query: listQuerySchema },
  responses: {
    200: {
      description: "Paginated notifications",
      content: {
        "application/json": {
          schema: z.object({
            notifications: z.array(notificationSchema),
            nextCursor: z.string().nullable(),
          }),
        },
      },
    },
    401: {
      description: "Not authenticated",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/notifications/unread",
  summary: "Count unread notifications for the current user",
  security: [{ [bearerAuth.name]: [] }],
  tags: ["Notifications"],
  responses: {
    200: {
      description: "Unread count",
      content: { "application/json": { schema: z.object({ count: z.number().int() }) } },
    },
    401: {
      description: "Not authenticated",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/notifications/{id}/read",
  summary: "Mark a notification as read",
  security: [{ [bearerAuth.name]: [] }],
  tags: ["Notifications"],
  request: { params: idParamSchema },
  responses: {
    200: {
      description: "Notification marked as read",
      content: { "application/json": { schema: z.object({ notification: notificationSchema }) } },
    },
    401: {
      description: "Not authenticated",
      content: { "application/json": { schema: errorResponseSchema } },
    },
    404: {
      description: "Notification not found",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});
