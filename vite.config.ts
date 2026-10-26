import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig(({ command, isPreview }) => ({
  // GitHub Pages serves this project site from /portfolio/, so built asset
  // URLs must be absolute under that path. Dev stays at the domain root, and
  // preview uses the production base so `npm run preview` mirrors Pages.
  base: command === "build" || isPreview ? "/portfolio/" : "/",
  plugins: [inspectAttr(), react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
