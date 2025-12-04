import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  server: {
    port: 5173,
    host: true,
    headers: {
      // 🧭 Autoriser la géolocalisation
      'Permissions-Policy': 'geolocation=(self)',
    },
  },
  build: {
    // Output directory
    outDir: 'dist',
    // Augmenter la limite de warning pour les gros chunks
    chunkSizeWarningLimit: 1000,
    // Minification optimisée
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Supprimer les console.log en production
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-ui': ['sonner', 'lucide-react'],
        },
      },
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['sonner', 'motion/react'],
    force: true, // Force la ré-optimisation des dépendances
  },
})