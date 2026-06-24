import { describe, expect, it } from "vitest";
import { idParamSchema, updateMeSchema, suspendBodySchema, listUsersQuerySchema, followListQuerySchema } from "../user.schemas.js";

describe("idParamSchema", () => {
  it("accepts a valid UUID", () => {
    expect(idParamSchema.safeParse({ id: "550e8400-e29b-41d4-a716-446655440000" }).success).toBe(true);
  });
  it("rejects non-UUID", () => {
    expect(idParamSchema.safeParse({ id: "not-a-uuid" }).success).toBe(false);
  });
});

describe("updateMeSchema", () => {
  it("accepts empty object", () => {
    expect(updateMeSchema.safeParse({}).success).toBe(true);
  });
  it("accepts valid fields", () => {
    expect(updateMeSchema.safeParse({ displayName: "John", profileImage: "https://example.com/av.jpg" }).success).toBe(true);
  });
  it("rejects short displayName", () => {
    expect(updateMeSchema.safeParse({ displayName: "ab" }).success).toBe(false);
  });
});

describe("suspendBodySchema", () => {
  it("accepts valid suspension", () => {
    expect(suspendBodySchema.safeParse({ amount: 7, unit: "days" }).success).toBe(true);
  });
  it("rejects invalid unit", () => {
    expect(suspendBodySchema.safeParse({ amount: 1, unit: "centuries" }).success).toBe(false);
  });
});

describe("listUsersQuerySchema", () => {
  it("uses default limit", () => {
    const result = listUsersQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.limit).toBe(10);
  });
});

describe("followListQuerySchema", () => {
  it("uses default limit", () => {
    const result = followListQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.limit).toBe(10);
  });
});
