import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';
import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';

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
  plugins: [
    react(),
    {
      name: 'copy-tinymce',
      writeBundle() {
        // Fonction récursive pour copier un répertoire
        const copyDir = (src: string, dest: string) => {
          if (!existsSync(dest)) {
            mkdirSync(dest, { recursive: true });
          }
          
          const entries = readdirSync(src);
          for (const entry of entries) {
            const srcPath = path.join(src, entry);
            const destPath = path.join(dest, entry);
            
            if (statSync(srcPath).isDirectory()) {
              copyDir(srcPath, destPath);
            } else {
              copyFileSync(srcPath, destPath);
            }
          }
        };
        
        // Copier tinymce vers le répertoire de build
        const tinymceSrc = path.resolve(__dirname, 'public/tinymce');
        const tinymceDest = path.resolve(__dirname, 'dist/tinymce');
        
        if (existsSync(tinymceSrc)) {
          console.log('📄 Copie des fichiers TinyMCE vers le build...');
          copyDir(tinymceSrc, tinymceDest);
          console.log('✅ TinyMCE copié avec succès');
        } else {
          console.warn('⚠️ Répertoire TinyMCE introuvable:', tinymceSrc);
        }
      }
    }
  ]
});