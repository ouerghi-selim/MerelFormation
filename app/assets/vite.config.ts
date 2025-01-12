import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';


export default defineConfig({
  root: './', // Définit le dossier racine pour Vite
  base: '/',
  build: {
    //outDir: './public/build',
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: true,
    manifest: true,
    rollupOptions: {
      // input: './src/main.tsx',
      // output: {
      //   entryFileNames: 'assets/[name]-[hash].js',
      //   chunkFileNames: 'assets/[name]-[hash].js',
      //   assetFileNames: 'assets/[name]-[hash][extname]',
      input: path.resolve(__dirname, './index.html'),
      // },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Permet d'utiliser des imports absolus
      '@assets': path.resolve(__dirname, './src/assets')
    },
  },
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Permet au serveur d’écouter sur toutes les interfaces réseau
    port: 5173, // Définit le port
    strictPort: true, // Fait échouer le démarrage si le port est occupé
    hmr: {
      host: 'localhost', // Utilisé pour le Hot Module Replacement
    },
  },
  preview: {
    port: 4173,
    strictPort: true,
    host: true
  }
});
