import { describe, it, expect } from "vitest";
import { createApp } from "../app.js";

// Smoke test de démarrage : createApp() doit s'initialiser sans throw.
// On ferme les serveurs créés pour ne pas laisser de handle ouvert.
describe("boot", () => {
  it("crée l'app sans erreur", () => {
    const { app, httpServer, io } = createApp();
    expect(app).toBeDefined();
    io.close();
    httpServer.close();
  });
});
