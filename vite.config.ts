import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
    dedupe: ["react", "react-dom", "lovable-tagger"],
  },
  server: {
    port: 8080,
    host: "::",
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
}));
