import { OpenAPIRegistry, extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { idParamSchema, sendMessageBody } from "../schemas/message.schemas.js";

// Active l'extension .openapi() de Zod (requise par zod-to-openapi avant la génération du doc).
extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

const bearerAuth = registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

const errorResponseSchema = z.object({ error: z.string() }).openapi("Error");

const messageSchema = z
  .object({
    id: z.string(),
    senderId: z.string(),
    recipientId: z.string(),
    content: z.string(),
    read: z.boolean(),
    createdAt: z.string(),
  })
  .openapi("Message");

const conversationSchema = z
  .object({
    userId: z.string(),
    lastMessage: z.string().optional(),
    unread: z.number().int().optional(),
    updatedAt: z.string().optional(),
  })
  .openapi("Conversation");

registry.registerPath({
  method: "get",
  path: "/messages",
  summary: "List the current user's conversations",
  security: [{ [bearerAuth.name]: [] }],
  tags: ["Messages"],
  responses: {
    200: {
      description: "Conversation list",
      content: { "application/json": { schema: z.object({ conversations: z.array(conversationSchema) }) } },
    },
    401: { description: "Not authenticated", content: { "application/json": { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: "get",
  path: "/messages/{id}",
  summary: "Get the conversation between the current user and {id}",
  security: [{ [bearerAuth.name]: [] }],
  tags: ["Messages"],
  request: { params: idParamSchema },
  responses: {
    200: {
      description: "Messages in the conversation",
      content: { "application/json": { schema: z.object({ messages: z.array(messageSchema) }) } },
    },
    401: { description: "Not authenticated", content: { "application/json": { schema: errorResponseSchema } } },
    404: { description: "No conversation found", content: { "application/json": { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: "post",
  path: "/messages/{id}",
  summary: "Send a message to user {id}",
  security: [{ [bearerAuth.name]: [] }],
  tags: ["Messages"],
  request: {
    params: idParamSchema,
    body: { content: { "application/json": { schema: sendMessageBody } } },
  },
  responses: {
    201: {
      description: "Message sent",
      content: { "application/json": { schema: z.object({ message: messageSchema }) } },
    },
    400: { description: "Validation error", content: { "application/json": { schema: errorResponseSchema } } },
    401: { description: "Not authenticated", content: { "application/json": { schema: errorResponseSchema } } },
    403: { description: "Sender or recipient suspended/banned", content: { "application/json": { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: "patch",
  path: "/messages/{id}/read",
  summary: "Mark messages received from {id} as read",
  security: [{ [bearerAuth.name]: [] }],
  tags: ["Messages"],
  request: { params: idParamSchema },
  responses: {
    200: {
      description: "Conversation marked as read",
      content: { "application/json": { schema: z.object({ message: z.string(), modified: z.number().int() }) } },
    },
    401: { description: "Not authenticated", content: { "application/json": { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: "delete",
  path: "/messages/{id}",
  summary: "Delete the conversation with {id}",
  security: [{ [bearerAuth.name]: [] }],
  tags: ["Messages"],
  request: { params: idParamSchema },
  responses: {
    200: {
      description: "Conversation deleted",
      content: { "application/json": { schema: z.object({ message: z.string() }) } },
    },
    401: { description: "Not authenticated", content: { "application/json": { schema: errorResponseSchema } } },
    403: { description: "Conversation does not exist", content: { "application/json": { schema: errorResponseSchema } } },
  },
});
