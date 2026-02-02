import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig(async ({ mode }) => {
  // Only load lovable-tagger in development and when available
  let componentTagger: (() => any) | undefined;
  if (mode === 'development') {
    try {
      const tagger = await import('lovable-tagger');
      componentTagger = tagger.componentTagger;
    } catch {
      // lovable-tagger not available, skip
    }
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
      mode === 'development' && componentTagger?.(),
    ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
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