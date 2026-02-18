import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    postcss: path.resolve(__dirname, './postcss.config.js'),
  },
  server: {
    port: 5174,
    host: true,
  },
});
