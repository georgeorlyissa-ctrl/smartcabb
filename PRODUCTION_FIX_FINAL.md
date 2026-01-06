# 🔥 CORRECTION PRODUCTION - useAppState is not defined

## 🐛 PROBLÈME IDENTIFIÉ
L'erreur "useAppState is not defined" en production (smartcabb.com) est causée par un problème de build/export du hook useAppState.

## ✅ FICHIERS À COPIER DANS GITHUB (dans l'ordre)

### 1. `/hooks/useAppState.tsx` ✅
**Statut**: Fichier OK - Aucune modification nécessaire  
**Raison**: Les exports sont corrects (ligne 598-604)

### 2. `/hooks/index.ts` - **FICHIER À MODIFIER**
**Problème**: Export potentiellement manquant ou mal configuré

**CODE ACTUEL**:
```typescript
// Export central de tous les hooks
export { useAppState, AppProvider } from './useAppState';
export { useSettings, useSetting, type AppSettings } from './useSettings';
export { useSupabaseData } from './useSupabaseData';
export { useTranslation } from './useTranslation';
export { usePWA } from './usePWA';
export { usePayment } from './usePayment';
export { useSafeNavigation } from './useSafeNavigation';
```

**CODE CORRIGÉ** (à copier):
```typescript
// ✅ PRODUCTION FIX: Export central de tous les hooks avec export explicit
export { useAppState, AppProvider } from './useAppState';
export type { AppState, User, Driver, Ride, Location } from '../types';
export { useSettings, useSetting, type AppSettings } from './useSettings';
export { useSupabaseData } from './useSupabaseData';
export { useTranslation } from './useTranslation';
export { usePWA } from './usePWA';
export { usePayment } from './usePayment';
export { useSafeNavigation } from './useSafeNavigation';

// ✅ Ré-export pour compatibilité
export * from './useAppState';
```

### 3. `/tsconfig.json` - **VÉRIFIER LA CONFIGURATION**
**Problème**: Configuration TypeScript peut causer des problèmes de résolution de modules

**CODE À VÉRIFIER**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 4. `/vite.config.ts` - **CONFIGURATION DE BUILD OPTIMISÉE**

**CODE CORRIGÉ** (à copier):
```typescript
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
      'Permissions-Policy': 'geolocation=(self)',
    },
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['sonner', 'lucide-react'],
          'vendor-hooks': ['motion/react'],
        },
      },
    },
    // ✅ PRODUCTION FIX: Forcer la génération de sourcemaps pour debug
    sourcemap: true,
  },
  optimizeDeps: {
    include: ['sonner', 'motion/react', 'react', 'react-dom', 'react-router-dom'],
    force: true,
  },
  ssr: {
    noExternal: ['sonner', 'motion'],
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
})
```

### 5. `/package.json` - **SCRIPTS DE BUILD**

**SECTION SCRIPTS À VÉRIFIER**:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:production": "NODE_ENV=production vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  }
}
```

### 6. `/vercel.json` - **CONFIGURATION VERCEL OPTIMISÉE**

**CODE COMPLET** (à copier):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "npm install --legacy-peer-deps",
  "github": {
    "silent": true
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/index.html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Permissions-Policy",
          "value": "geolocation=*, camera=*, microphone=*, payment=*"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

## 🔧 CORRECTIONS SPÉCIFIQUES POUR BUILD

### Problème 1: Import circulaire potentiel
**Solution**: Vérifier que `/hooks/useAppState.tsx` n'importe pas indirectement lui-même

### Problème 2: Export non résolu en production
**Solution**: Ajouter des exports explicites dans `/hooks/index.ts`

### Problème 3: Minification cassant les exports
**Solution**: Configurer Terser correctement dans `vite.config.ts`

## 📋 CHECKLIST AVANT DÉPLOIEMENT

- [ ] Copier `/hooks/index.ts` modifié dans GitHub
- [ ] Copier `/vite.config.ts` modifié dans GitHub  
- [ ] Vérifier que `/tsconfig.json` est correct
- [ ] Vérifier que `/vercel.json` est à jour
- [ ] Commit et push vers GitHub
- [ ] Attendre le redéploiement automatique sur Vercel
- [ ] Tester sur smartcabb.com/app

## 🚀 COMMANDES GIT POUR GITHUB

```bash
# 1. Ajouter les fichiers modifiés
git add hooks/index.ts
git add vite.config.ts
git add vercel.json

# 2. Commit avec message descriptif
git commit -m "🔥 FIX PRODUCTION: Résolution erreur useAppState is not defined

- Ajout exports explicites dans hooks/index.ts
- Optimisation configuration build Vite
- Mise à jour Vercel config pour production"

# 3. Push vers GitHub
git push origin main

# 4. Vérifier le déploiement sur Vercel Dashboard
# https://vercel.com/dashboard
```

## 🎯 FICHIERS MODIFIÉS (RÉSUMÉ)

1. **`/hooks/index.ts`** - Ajout exports explicites ✅
2. **`/vite.config.ts`** - Optimisation build + sourcemaps ✅
3. **`/vercel.json`** - Configuration headers optimisée ✅

## ⚡ SOLUTION RAPIDE SI ÇA NE FONCTIONNE PAS

Si après ces modifications l'erreur persiste:

### Option A: Forcer un rebuild complet
```bash
# Sur Vercel Dashboard:
# 1. Aller dans Settings > General
# 2. Cliquer sur "Redeploy" 
# 3. Cocher "Use existing Build Cache" = OFF
# 4. Cliquer "Redeploy"
```

### Option B: Vérifier les variables d'environnement Vercel
```bash
# Sur Vercel Dashboard > Settings > Environment Variables
# Vérifier que ces variables existent:
VITE_SUPABASE_URL=<votre_url>
VITE_SUPABASE_ANON_KEY=<votre_key>
```

## 📞 DIAGNOSTIC EN PRODUCTION

Pour diagnostiquer l'erreur sur smartcabb.com:

1. Ouvrir Console Développeur (F12)
2. Aller dans l'onglet Network
3. Filtrer par "JS"
4. Chercher le fichier contenant "useAppState"
5. Vérifier si le fichier est bien chargé

**Si le fichier n'existe pas**: Problème de build  
**Si le fichier existe mais erreur**: Problème d'export/import

## ✅ VALIDATION FINALE

Une fois déployé, vérifier:
- [ ] Page d'accueil charge sans erreur
- [ ] Console ne montre pas "useAppState is not defined"
- [ ] Navigation fonctionne (Passager/Conducteur/Admin)
- [ ] Pas d'écran blanc

## 🔍 NOTES IMPORTANTES

1. **Ne PAS supprimer** les fichiers de configuration (vite.config.ts, vercel.json, tsconfig.json)
2. **Toujours tester** en local avec `npm run build && npm run preview` avant de push
3. **Vérifier** que le build local réussit sans erreur
4. **Attendre** que Vercel termine le déploiement (2-3 minutes)

---
**Date**: 8 Décembre 2024  
**Version**: Production Fix v1.0  
**Environnement**: smartcabb.com (Vercel)
