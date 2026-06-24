import { OpenAPIRegistry, extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

// Active l'extension .openapi() de Zod (requise par zod-to-openapi avant la génération du doc).
extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

const bearerAuth = registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

const errorResponseSchema = z.object({ error: z.string() }).openapi("Error");

const filenameParamSchema = z.object({
  filename: z.string().openapi({ example: "a1b2c3.webp" }),
});

const mediaResponseSchema = z
  .object({
    id: z.string(),
    url: z.string(),
    type: z.enum(["image", "video"]),
    mimeType: z.string(),
  })
  .openapi("Media");

registry.registerPath({
  method: "post",
  path: "/media",
  summary: "Upload a media file (field 'file')",
  security: [{ [bearerAuth.name]: [] }],
  tags: ["Media"],
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: z.object({
            file: z.string().openapi({ type: "string", format: "binary" }),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: "File stored",
      content: { "application/json": { schema: mediaResponseSchema } },
    },
    400: { description: "No file provided", content: { "application/json": { schema: errorResponseSchema } } },
    401: { description: "Not authenticated", content: { "application/json": { schema: errorResponseSchema } } },
    413: { description: "File too large", content: { "application/json": { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: "get",
  path: "/media/{filename}",
  summary: "Serve a stored media file",
  tags: ["Media"],
  request: { params: filenameParamSchema },
  responses: {
    200: {
      description: "Binary file content",
      content: { "application/octet-stream": { schema: z.string().openapi({ type: "string", format: "binary" }) } },
    },
    404: { description: "Not found", content: { "application/json": { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: "delete",
  path: "/media/{filename}",
  summary: "Delete a stored media file",
  security: [{ [bearerAuth.name]: [] }],
  tags: ["Media"],
  request: { params: filenameParamSchema },
  responses: {
    204: { description: "File deleted" },
    401: { description: "Not authenticated", content: { "application/json": { schema: errorResponseSchema } } },
  },
});
