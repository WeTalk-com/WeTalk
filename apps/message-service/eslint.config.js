import js from "@eslint/js";
import tseslint from "typescript-eslint";

/** @type {import("eslint").Linter.Config[]} */
export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
  {
    ignores: ["dist/**", "node_modules/**"],
  },
];
