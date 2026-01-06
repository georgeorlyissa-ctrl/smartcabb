import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuration MINIMALE pour éviter l'erreur "107"
export default defineConfig({
  plugins: [react()],
  
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Désactiver complètement le chunking
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
});
