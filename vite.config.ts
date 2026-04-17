import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
  ],
  server: {
    port: 3000,
    middlewareMode: false,
  },
  build: {
    outDir: 'dist',
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
});
