import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["apps/*/src/**/*.test.ts"],
    ...(process.env.CI
      ? {
          reporters: ["default", "junit"],
          outputFile: { junit: "junit.xml" },
        }
      : {}),
    coverage: {
      provider: "v8",
      include: ["apps/*/src/**"],
    },
  },
});
