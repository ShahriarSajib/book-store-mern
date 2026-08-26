/**
 * server/eslint.config.js — flat config for the Express API.
 */
import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["node_modules/**", "uploads/**", "coverage/**"],
  },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.node },
    },
    rules: {
      "no-console": "warn",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" }],
    },
  },
];
