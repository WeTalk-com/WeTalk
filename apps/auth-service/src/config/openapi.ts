import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import {
  registerSchema,
  adminCreateSchema,
  loginSchema,
  refreshSchema,
  singleUserResponseSchema,
  authResponseSchema,
  tokenResponseSchema,
  errorResponseSchema,
  validationErrorSchema,
  verifyResponseSchema,
} from "../schemas/auth.schemas.js";

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

// ── POST /auth/register ──
registry.registerPath({
  method: "post",
  path: "/auth/register",
  summary: "Register a new user account",
  description: "Creates a new user with role 'user'. Public endpoint.",
  tags: ["Auth"],
  request: {
    body: {
      content: { "application/json": { schema: registerSchema } },
    },
  },
  responses: {
    201: {
      description: "User created successfully",
      content: { "application/json": { schema: singleUserResponseSchema } },
    },
    400: {
      description: "Validation failed",
      content: { "application/json": { schema: validationErrorSchema } },
    },
    409: {
      description: "Email or username already registered",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

// ── POST /auth/login ──
registry.registerPath({
  method: "post",
  path: "/auth/login",
  summary: "Authenticate with email and password",
  description: "Returns access and refresh tokens on success.",
  tags: ["Auth"],
  request: {
    body: {
      content: { "application/json": { schema: loginSchema } },
    },
  },
  responses: {
    200: {
      description: "Login successful",
      content: { "application/json": { schema: authResponseSchema } },
    },
    400: {
      description: "Validation failed",
      content: { "application/json": { schema: validationErrorSchema } },
    },
    401: {
      description: "Invalid credentials",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

// ── POST /auth/refresh ──
registry.registerPath({
  method: "post",
  path: "/auth/refresh",
  summary: "Refresh access token",
  description: "Issues a new access/refresh token pair using a valid refresh token (rotation).",
  tags: ["Auth"],
  request: {
    body: {
      content: { "application/json": { schema: refreshSchema } },
    },
  },
  responses: {
    200: {
      description: "Tokens refreshed",
      content: { "application/json": { schema: tokenResponseSchema } },
    },
    400: {
      description: "Validation failed",
      content: { "application/json": { schema: validationErrorSchema } },
    },
    401: {
      description: "Invalid or expired refresh token",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

// ── POST /auth/logout ──
registry.registerPath({
  method: "post",
  path: "/auth/logout",
  summary: "Logout and revoke refresh token",
  description: "Revokes the refresh token so it cannot be reused.",
  tags: ["Auth"],
  request: {
    body: {
      content: { "application/json": { schema: refreshSchema } },
    },
  },
  responses: {
    204: {
      description: "Logout successful, no content",
    },
    400: {
      description: "Validation failed",
      content: { "application/json": { schema: validationErrorSchema } },
    },
  },
});

// ── GET /auth/me ──
registry.registerPath({
  method: "get",
  path: "/auth/me",
  summary: "Get current user profile",
  description: "Returns the profile of the authenticated user.",
  tags: ["Auth"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "User profile",
      content: { "application/json": { schema: singleUserResponseSchema } },
    },
    401: {
      description: "Unauthorized (missing or invalid token)",
      content: { "application/json": { schema: errorResponseSchema } },
    },
    404: {
      description: "User not found",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

// ── GET /auth/verify ──
registry.registerPath({
  method: "get",
  path: "/auth/verify",
  summary: "Verify an access token",
  description: "Validates the JWT and returns the payload. Used by gateway / other microservices.",
  tags: ["Auth"],
  security: [{ bearerAuth: [] }],
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

// ── POST /auth/admin/users ──
registry.registerPath({
  method: "post",
  path: "/auth/admin/users",
  summary: "[Admin] Create a user with custom role",
  description: "Allows an admin to create a user with any role (user, moderator, admin).",
  tags: ["Admin"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: adminCreateSchema } },
    },
  },
  responses: {
    201: {
      description: "User created",
      content: { "application/json": { schema: singleUserResponseSchema } },
    },
    400: {
      description: "Validation failed",
      content: { "application/json": { schema: validationErrorSchema } },
    },
    401: {
      description: "Unauthorized",
      content: { "application/json": { schema: errorResponseSchema } },
    },
    403: {
      description: "Forbidden (user is not admin)",
      content: { "application/json": { schema: errorResponseSchema } },
    },
    409: {
      description: "Email or username already registered",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

const generator = new OpenApiGeneratorV3(registry.definitions);

export const openApiSpec = generator.generateDocument({
  openapi: "3.0.3",
  info: {
    title: "WeTalk — Auth Service API",
    version: "0.1.0",
    description:
      "Microservice d'authentification et d'autorisation de WeTalk.\n\nGère l'inscription, la connexion, le refresh de tokens JWT, la déconnexion, et les opérations admin.",
  },
  servers: [{ url: "http://localhost:4000", description: "Direct auth-service (dev)" }],
});
