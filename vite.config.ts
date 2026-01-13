import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Configuration pour FIGMA MAKE (utilise esm.sh CDN)
export default defineConfig({
  plugins: [
    react({
      exclude: /supabase\/functions\/server/,
    })
  ],
  
  resolve: {
    alias: {
      // ✅ CRITIQUE: Rediriger lucide-react vers nos icônes locales
      'lucide-react': path.resolve(__dirname, './lib/icons.tsx'),
      
      // ✅ CRITIQUE: Rediriger sonner vers notre système de toast
      'sonner': path.resolve(__dirname, './sonner.ts'),
      
      // ✅ CRITIQUE: Rediriger motion/react et framer-motion vers notre implémentation
      'motion/react': path.resolve(__dirname, './lib/motion.tsx'),
      'framer-motion': path.resolve(__dirname, './lib/motion.tsx'),
      
      // ✅ CRITIQUE: Rediriger TOUS les @radix-ui vers nos stubs
      '@radix-ui/react-accordion': path.resolve(__dirname, './lib/radix-stubs.tsx'),
      '@radix-ui/react-aspect-ratio': path.resolve(__dirname, './lib/radix-stubs.tsx'),
      '@radix-ui/react-avatar': path.resolve(__dirname, './lib/radix-stubs.tsx'),
      '@radix-ui/react-checkbox': path.resolve(__dirname, './lib/radix-stubs.tsx'),
      '@radix-ui/react-collapsible': path.resolve(__dirname, './lib/radix-stubs.tsx'),
      '@radix-ui/react-label': path.resolve(__dirname, './lib/radix-stubs.tsx'),
      '@radix-ui/react-progress': path.resolve(__dirname, './lib/radix-stubs.tsx'),
      '@radix-ui/react-radio-group': path.resolve(__dirname, './lib/radix-stubs.tsx'),
      '@radix-ui/react-scroll-area': path.resolve(__dirname, './lib/radix-stubs.tsx'),
      '@radix-ui/react-separator': path.resolve(__dirname, './lib/radix-stubs.tsx'),
      '@radix-ui/react-slider': path.resolve(__dirname, './lib/radix-stubs.tsx'),
      '@radix-ui/react-switch': path.resolve(__dirname, './lib/radix-stubs.tsx'),
      '@radix-ui/react-tabs': path.resolve(__dirname, './lib/radix-stubs.tsx'),
      '@radix-ui/react-toggle': path.resolve(__dirname, './lib/radix-stubs.tsx'),
      '@radix-ui/react-toggle-group': path.resolve(__dirname, './lib/radix-stubs.tsx'),
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
      'leaflet',
      'react-leaflet',
      'date-fns',
    ],
  },
  
  server: {
    fs: {
      strict: false
    }
  }
});