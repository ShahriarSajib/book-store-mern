import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
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
});
