import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  // DÉSACTIVER LE CACHE COMPLÈTEMENT
  cacheDir: false,
  
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Désactiver la minification pour debug
    minify: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
        // Pas de hash dans les noms de fichiers
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    }
  },
  
  // Forcer la réoptimisation sans cache
  optimizeDeps: {
    force: true
  },
  
  // Désactiver le versioning des imports
  server: {
    hmr: {
      overlay: false
    }
  }
});
