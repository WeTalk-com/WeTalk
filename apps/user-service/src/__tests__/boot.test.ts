import { describe, it, expect } from "vitest";
import { createApp } from "../app.js";

// Smoke test de démarrage : createApp() doit s'initialiser sans throw
// (inclut la génération du doc OpenAPI, qui crashait avant le fix zod-to-openapi).
describe("boot", () => {
  it("crée l'app sans erreur", () => {
    expect(() => createApp()).not.toThrow();
  });
});
