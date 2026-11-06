import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  base: "/",

  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    tailwindcss(),
  ],

  build: {
    rollupOptions: {
      output: {
        // Stable vendor chunks → better browser caching between deploys.
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          state: ["@reduxjs/toolkit", "react-redux", "@tanstack/react-query"],
          i18n: ["i18next", "react-i18next"],
        },
      },
    },
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@styles": path.resolve(__dirname, "./src/styles"),
      "@project/shared": path.resolve(
        __dirname,
        "../../packages/shared/index.ts",
      ),
    },
  },
});
