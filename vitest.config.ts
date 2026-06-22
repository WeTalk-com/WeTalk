import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["apps/*/src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["apps/*/src/**"],
    },
  },
});
