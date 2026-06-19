import { describe, expect, it } from "vitest";
import { openApiSpec } from "../openapi.js";

const spec = openApiSpec;
const paths = spec.paths!;

describe("OpenAPI spec", () => {
  it("has correct openapi version", () => {
    expect(spec.openapi).toBe("3.0.3");
  });

  it("has service info", () => {
    expect(spec.info.title).toBe("WeTalk — Auth Service API");
    expect(spec.info.version).toBe("0.1.0");
  });

  it("has at least one server", () => {
    expect(spec.servers).toBeDefined();
    expect(spec.servers![0]!.url).toBe("http://localhost:4000");
  });

  it("has bearer auth security scheme", () => {
    const schemes = spec.components?.securitySchemes;
    expect(schemes).toBeDefined();
    expect(schemes).toHaveProperty("bearerAuth");
  });

  it("registers all expected paths", () => {
    expect(paths["/auth/register"]).toBeDefined();
    expect(paths["/auth/login"]).toBeDefined();
    expect(paths["/auth/refresh"]).toBeDefined();
    expect(paths["/auth/logout"]).toBeDefined();
    expect(paths["/auth/me"]).toBeDefined();
    expect(paths["/auth/verify"]).toBeDefined();
    expect(paths["/auth/admin/users"]).toBeDefined();
  });

  it("has correct methods on each path", () => {
    expect(paths["/auth/register"]!).toHaveProperty("post");
    expect(paths["/auth/login"]!).toHaveProperty("post");
    expect(paths["/auth/refresh"]!).toHaveProperty("post");
    expect(paths["/auth/logout"]!).toHaveProperty("post");
    expect(paths["/auth/me"]!).toHaveProperty("get");
    expect(paths["/auth/verify"]!).toHaveProperty("get");
    expect(paths["/auth/admin/users"]!).toHaveProperty("post");
  });

  it("register path has request body schema", () => {
    expect(paths["/auth/register"]!.post?.requestBody).toBeDefined();
  });

  it("verify path has security requirement", () => {
    const security = paths["/auth/verify"]!.get?.security;
    expect(security).toBeDefined();
    expect(security).toContainEqual({ bearerAuth: [] });
  });

  it("logout returns 204", () => {
    expect(paths["/auth/logout"]!.post?.responses).toHaveProperty("204");
  });
});
