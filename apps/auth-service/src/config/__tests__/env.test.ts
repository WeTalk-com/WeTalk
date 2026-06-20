import { describe, expect, it, beforeEach, vi } from "vitest";

beforeEach(() => {
  vi.resetModules();
  delete process.env.NODE_ENV;
  delete process.env.PORT;
  delete process.env.DB_HOST;
  delete process.env.DB_NAME;
  delete process.env.DB_USER;
  delete process.env.DB_PASSWORD;
  delete process.env.JWT_ACCESS_SECRET;
  delete process.env.JWT_REFRESH_SECRET;
  delete process.env.REDIS_URL;
  delete process.env.CORS_ORIGIN;
});

describe("env config", () => {
  it("uses development defaults when no env vars are set", async () => {
    process.env.DB_HOST = "localhost";
    process.env.DB_NAME = "auth_db";
    process.env.DB_USER = "auth";
    process.env.DB_PASSWORD = "auth";
    process.env.JWT_ACCESS_SECRET = "dev-access-secret-change-me";
    process.env.JWT_REFRESH_SECRET = "dev-refresh-secret-change-me";
    process.env.REDIS_URL = "redis://localhost:6379";

    const { env } = await import("../env.js");
    expect(env.nodeEnv).toBe("development");
    expect(env.port).toBe(4000);
  });

  it("reads PORT from env", async () => {
    process.env.PORT = "5000";
    process.env.DB_HOST = "localhost";
    process.env.DB_NAME = "auth_db";
    process.env.DB_USER = "auth";
    process.env.DB_PASSWORD = "auth";
    process.env.JWT_ACCESS_SECRET = "dev-access-secret-change-me";
    process.env.JWT_REFRESH_SECRET = "dev-refresh-secret-change-me";
    process.env.REDIS_URL = "redis://localhost:6379";

    const { env } = await import("../env.js");
    expect(env.port).toBe(5000);
  });

  it("uses production nodeEnv when set", async () => {
    process.env.NODE_ENV = "production";
    process.env.DB_HOST = "localhost";
    process.env.DB_NAME = "auth_db";
    process.env.DB_USER = "auth";
    process.env.DB_PASSWORD = "auth";
    process.env.JWT_ACCESS_SECRET = "real-secret";
    process.env.JWT_REFRESH_SECRET = "real-secret";
    process.env.REDIS_URL = "redis://localhost:6379";

    const { env } = await import("../env.js");
    expect(env.nodeEnv).toBe("production");
  });

  it("parses CORS origins from comma-separated string", async () => {
    process.env.CORS_ORIGIN = "http://localhost:3000,https://app.wetalk.com";
    process.env.DB_HOST = "localhost";
    process.env.DB_NAME = "auth_db";
    process.env.DB_USER = "auth";
    process.env.DB_PASSWORD = "auth";
    process.env.JWT_ACCESS_SECRET = "dev-access-secret-change-me";
    process.env.JWT_REFRESH_SECRET = "dev-refresh-secret-change-me";
    process.env.REDIS_URL = "redis://localhost:6379";

    const { env } = await import("../env.js");
    expect(env.corsOrigins).toEqual(["http://localhost:3000", "https://app.wetalk.com"]);
  });

  it("has empty corsOrigins when CORS_ORIGIN is not set", async () => {
    process.env.DB_HOST = "localhost";
    process.env.DB_NAME = "auth_db";
    process.env.DB_USER = "auth";
    process.env.DB_PASSWORD = "auth";
    process.env.JWT_ACCESS_SECRET = "dev-access-secret-change-me";
    process.env.JWT_REFRESH_SECRET = "dev-refresh-secret-change-me";
    process.env.REDIS_URL = "redis://localhost:6379";

    const { env } = await import("../env.js");
    expect(env.corsOrigins).toEqual([]);
  });
});
