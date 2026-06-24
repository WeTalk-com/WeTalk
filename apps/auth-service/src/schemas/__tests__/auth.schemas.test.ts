import { describe, expect, it } from "vitest";
import { z } from "zod";

const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const userRoleEnum = z.enum(["user", "moderator", "admin"]);

describe("register schema", () => {
  it("accepts valid input", () => {
    const result = registerSchema.safeParse({ username: "john", email: "john@test.com", password: "secret123" });
    expect(result.success).toBe(true);
  });
  it("rejects short username", () => {
    expect(registerSchema.safeParse({ username: "jo", email: "john@test.com", password: "secret123" }).success).toBe(false);
  });
  it("rejects invalid email", () => {
    expect(registerSchema.safeParse({ username: "john", email: "bad", password: "secret123" }).success).toBe(false);
  });
  it("rejects short password", () => {
    expect(registerSchema.safeParse({ username: "john", email: "john@test.com", password: "1234567" }).success).toBe(false);
  });
});

describe("login schema", () => {
  it("accepts valid input", () => {
    expect(loginSchema.safeParse({ email: "john@test.com", password: "x" }).success).toBe(true);
  });
  it("rejects empty password", () => {
    expect(loginSchema.safeParse({ email: "john@test.com", password: "" }).success).toBe(false);
  });
});

describe("user role enum", () => {
  it("accepts valid roles", () => {
    expect(userRoleEnum.safeParse("user").success).toBe(true);
    expect(userRoleEnum.safeParse("moderator").success).toBe(true);
    expect(userRoleEnum.safeParse("admin").success).toBe(true);
  });
  it("rejects invalid role", () => {
    expect(userRoleEnum.safeParse("superadmin").success).toBe(false);
  });
});
