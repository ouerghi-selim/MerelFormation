import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';

export default defineConfig({
  root: './',
  base: '/',
  build: {
    outDir: './dist',
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
        input: './index.html',
        output: {
            // Utiliser des noms plus consistants
            entryFileNames: 'assets/main.[hash].js',
            chunkFileNames: 'assets/chunk.[hash].js',
            assetFileNames: 'assets/[name].[hash][extname]',
        },
    },
  },
  resolve: {
      alias: {
          '@': path.resolve(__dirname, './src'),
          '@assets': path.resolve(__dirname, './src/assets')
      },
  },
  plugins: [react()]
});