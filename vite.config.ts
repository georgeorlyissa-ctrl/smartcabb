import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuration pour FIGMA MAKE (utilise esm.sh CDN)
export default defineConfig({
  plugins: [
    react({
      exclude: /supabase\/functions\/server/,
    })
  ],
  
  resolve: {
    alias: {
      // Alias pour Motion (Framer Motion) - Version stable
      'motion/react': 'framer-motion',
      
      // PAS d'alias pour sonner - laisser la résolution naturelle
      // PAS d'alias pour @radix-ui - laisser la résolution naturelle
    },
  },
  
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  
  esbuild: {
    loader: 'tsx',
    include: /\.(tsx?|jsx?)$/,
  },
  
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'lucide-react',
      'sonner',
      'leaflet',
      'react-leaflet',
      'date-fns',
      'framer-motion',
    ],
  },
  
  server: {
    fs: {
      strict: false
    }
  }
});
