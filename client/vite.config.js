import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // A production build without VITE_API_BASE_URL silently ships a client that
  // points at http://localhost:5001 — every API call then fails with
  // "Failed to fetch" and the deployed app looks broken with no obvious
  // cause. Fail the build loudly instead, naming the missing variable.
  const env = loadEnv(mode, process.cwd(), "VITE_");
  if (mode === "production" && !env.VITE_API_BASE_URL) {
    throw new Error(
      "VITE_API_BASE_URL is required for a production build.\n" +
        "Set it in the deploy environment (Vercel project settings) or in client/.env.\n" +
        "Example: VITE_API_BASE_URL=https://your-api.example.com/api"
    );
  }

  return {
    plugins: [react()],
    server: {
      host: "0.0.0.0",
      port: 5173,
      proxy: {
        "/api": "http://localhost:5001",
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom", "react-router-dom"],
            "react-query": ["@tanstack/react-query"],
            charts: ["recharts"],
            "socket-io": ["socket.io-client"],
            forms: ["react-hook-form", "zod"],
            stripe: ["@stripe/stripe-js"],
            "date-utils": ["date-fns"],
            icons: ["react-icons"],
          },
        },
      },
    },
    optimizeDeps: {
      force: true,
    },
  };
});
