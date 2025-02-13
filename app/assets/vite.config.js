import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig({
    root: './',
    base: '/',
    build: {
        outDir: '../public/build',
        assetsDir: 'assets',
        emptyOutDir: true,
        manifest: true,
        sourcemap: true,
        rollupOptions: {
            input: './index.html',
            output: {
                entryFileNames: 'assets/[name]-[hash].js',
                chunkFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash][extname]'
            }
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@assets': path.resolve(__dirname, './src/assets')
        }
    },
    plugins: [react()],
    server: {
        host: true,
        port: 5173,
        strictPort: true,
        cors: true, // Ajout pour permettre le CORS
        hmr: {
            clientPort: 5173, // Ajout pour la gestion du HMR
            host: 'localhost'
        }
    },
    preview: {
        port: 4173,
        strictPort: true,
        host: true
    }
});
