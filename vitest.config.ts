import { defineConfig } from "vitest/config";
import path from "path";

const rootDir = path.resolve(import.meta.dirname);

export default defineConfig({
  root: rootDir,
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "src"),
      "@shared": path.resolve(rootDir, "src", "shared"),
      "@assets": path.resolve(rootDir, "attached_assets"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: [
      "src/**/*.test.{ts,tsx}",
      "src/**/*.spec.{ts,tsx}",
      "server/**/*.test.ts",
      "server/**/*.spec.ts",
    ],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
    ],
    css: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/test/**",
        "src/**/*.test.{ts,tsx}",
        "src/**/*.spec.{ts,tsx}",
        "src/components/ui/**",
        "src/integrations/supabase/types.ts",
      ],
    },
  },
});
