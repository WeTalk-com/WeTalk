import { describe, it, expect } from "vitest";
import { createApp } from "../app.js";

// Smoke test de démarrage : createApp() doit s'initialiser sans throw.
describe("boot", () => {
  it("crée l'app sans erreur", () => {
    expect(() => createApp()).not.toThrow();
  });
});
