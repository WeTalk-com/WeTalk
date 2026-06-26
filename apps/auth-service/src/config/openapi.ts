import { OpenAPIRegistry, extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  userResponseSchema,
  errorResponseSchema,
  verifyResponseSchema,
} from "../schemas/auth.schemas.js";

// Active l'extension .openapi() de Zod (requise par zod-to-openapi avant la génération du doc).
extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

const bearerAuth = registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

registry.registerPath({
  method: "post",
  path: "/auth/register",
  summary: "Register a new user",
  tags: ["Auth"],
  request: {
    body: {
      content: { "application/json": { schema: registerSchema } },
    },
  },
  responses: {
    201: {
      description: "User registered successfully",
      content: { "application/json": { schema: userResponseSchema } },
    },
    400: {
      description: "Validation error",
      content: { "application/json": { schema: errorResponseSchema } },
    },
    409: {
      description: "Email already in use",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/login",
  summary: "Login with email and password",
  tags: ["Auth"],
  request: {
    body: {
      content: { "application/json": { schema: loginSchema } },
    },
  },
  responses: {
    200: {
      description: "Login successful, sets httpOnly cookies",
      headers: z.object({
        "Set-Cookie": z.string().describe("access_token + refresh_token cookies"),
      }),
    },
    401: {
      description: "Invalid credentials",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/refresh",
  summary: "Refresh access token",
  tags: ["Auth"],
  request: {
    body: {
      content: { "application/json": { schema: refreshSchema } },
    },
  },
  responses: {
    200: {
      description: "Token refreshed, new cookies set",
    },
    401: {
      description: "Invalid or expired refresh token",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/logout",
  summary: "Logout and clear auth cookies",
  tags: ["Auth"],
  responses: {
    200: {
      description: "Logged out successfully",
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/auth/me",
  summary: "Get current authenticated user",
  security: [{ [bearerAuth.name]: [] }],
  tags: ["Auth"],
  responses: {
    200: {
      description: "Current user info",
      content: { "application/json": { schema: userResponseSchema } },
    },
    401: {
      description: "Not authenticated",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/auth/verify",
  summary: "Verify authentication token validity",
  security: [{ [bearerAuth.name]: [] }],
  tags: ["Auth"],
  responses: {
    200: {
      description: "Token is valid",
      content: { "application/json": { schema: verifyResponseSchema } },
    },
    401: {
      description: "Invalid or expired token",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/admin/users",
  summary: "Create user with specific role (admin only)",
  security: [{ [bearerAuth.name]: [] }],
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: registerSchema.extend({ role: z.enum(["user", "moderator", "admin"]).optional() }),
        },
      },
    },
  },
  responses: {
    201: {
      description: "User created",
      content: { "application/json": { schema: userResponseSchema } },
    },
    403: { description: "Forbidden (not admin)" },
  },
});
