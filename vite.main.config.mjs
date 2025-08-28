import { defineConfig } from "vite";
import path from "path";

// https://vitejs.dev/config
export default defineConfig({
  css: {
    postcss: "./postcss.config.js",
  },
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    rollupOptions: {
      external: ["electron", "electron-store", "sqlite3", "knex", "bcrypt"],
    },
  },
});
