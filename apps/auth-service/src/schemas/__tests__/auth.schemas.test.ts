import { describe, expect, it } from "vitest";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  adminCreateSchema,
  userRoleSchema,
  userResponseSchema,
  authResponseSchema,
  tokenResponseSchema,
  errorResponseSchema,
  validationErrorSchema,
  verifyResponseSchema,
} from "../auth.schemas.js";

describe("registerSchema", () => {
  it("accepts valid registration data", () => {
    const data = { username: "john", email: "john@example.com", password: "secret123" };
    const result = registerSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("rejects short username", () => {
    const data = { username: "jo", email: "john@example.com", password: "secret123" };
    const result = registerSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const data = { username: "john", email: "not-an-email", password: "secret123" };
    const result = registerSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const data = { username: "john", email: "john@example.com", password: "1234567" };
    const result = registerSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts valid login data", () => {
    const data = { email: "john@example.com", password: "secret123" };
    const result = loginSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("rejects empty password", () => {
    const data = { email: "john@example.com", password: "" };
    const result = loginSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe("refreshSchema", () => {
  it("accepts valid refresh token", () => {
    const data = { refreshToken: "some-token-value" };
    const result = refreshSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("rejects empty refresh token", () => {
    const data = { refreshToken: "" };
    const result = refreshSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe("adminCreateSchema", () => {
  it("accepts admin create data without role (default)", () => {
    const data = { username: "admin", email: "admin@example.com", password: "secret123" };
    const result = adminCreateSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("accepts admin create data with valid role", () => {
    const data = { username: "admin", email: "admin@example.com", password: "secret123", role: "moderator" };
    const result = adminCreateSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("rejects invalid role", () => {
    const data = { username: "admin", email: "admin@example.com", password: "secret123", role: "superadmin" };
    const result = adminCreateSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe("userRoleSchema", () => {
  it("accepts valid roles", () => {
    expect(userRoleSchema.safeParse("user").success).toBe(true);
    expect(userRoleSchema.safeParse("moderator").success).toBe(true);
    expect(userRoleSchema.safeParse("admin").success).toBe(true);
  });

  it("rejects invalid role", () => {
    expect(userRoleSchema.safeParse("superadmin").success).toBe(false);
  });
});

describe("userResponseSchema", () => {
  it("accepts valid user response", () => {
    const data = { id: "550e8400-e29b-41d4-a716-446655440000", username: "john", email: "john@example.com", role: "user" };
    const result = userResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("rejects invalid uuid", () => {
    const data = { id: "not-a-uuid", username: "john", email: "john@example.com", role: "user" };
    const result = userResponseSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe("authResponseSchema", () => {
  it("accepts valid auth response", () => {
    const data = {
      user: { id: "550e8400-e29b-41d4-a716-446655440000", username: "john", email: "john@example.com", role: "user" },
      accessToken: "access-token",
      refreshToken: "refresh-token",
    };
    const result = authResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
});

describe("tokenResponseSchema", () => {
  it("accepts valid token response", () => {
    const data = { accessToken: "access-token", refreshToken: "refresh-token" };
    const result = tokenResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
});

describe("errorResponseSchema", () => {
  it("accepts valid error response", () => {
    const data = { error: "Something went wrong" };
    const result = errorResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
});

describe("validationErrorSchema", () => {
  it("accepts validation error with details", () => {
    const data = { error: "Validation failed", details: [{ field: "email", message: "Invalid email" }] };
    const result = validationErrorSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
});

describe("verifyResponseSchema", () => {
  it("accepts valid verify response", () => {
    const data = { valid: true as const, user: { sub: "user-id", role: "user" } };
    const result = verifyResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("rejects valid: false", () => {
    const data = { valid: false, user: { sub: "user-id", role: "user" } };
    const result = verifyResponseSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
