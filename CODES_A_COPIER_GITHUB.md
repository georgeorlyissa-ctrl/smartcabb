# 🚀 CODES EXACTS À COPIER DANS GITHUB - PRODUCTION SMARTCABB.COM

## 📋 RÉSUMÉ DES MODIFICATIONS

**Problème**: `useAppState is not defined` en production (smartcabb.com)  
**Solution**: Correction des exports et optimisation de la configuration de build  
**Date**: 8 Décembre 2024  

---

## 📁 FICHIER 1: `/hooks/index.ts`

**Action**: REMPLACER TOUT LE CONTENU du fichier par ce code

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

// ✅ Ré-export pour compatibilité maximale en production
export * from './useAppState';
```

---

## 📁 FICHIER 2: `/vite.config.ts`

**Action**: REMPLACER TOUT LE CONTENU du fichier par ce code

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
        drop_console: false, // ✅ Garder les console.log pour le débogage en production
        drop_debugger: true,
      },
      // ✅ PRODUCTION FIX: Préserver les noms de fonctions et classes
      keep_classnames: true,
      keep_fnames: true,
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
    // ✅ PRODUCTION FIX: Générer sourcemaps pour diagnostic
    sourcemap: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['sonner', 'motion/react', 'react', 'react-dom', 'react-router-dom'],
    force: true, // Force la ré-optimisation des dépendances
  },
  // ✅ SSR FIX: Configuration SSR
  ssr: {
    noExternal: ['sonner', 'motion'], // Forcer le bundling côté serveur
  },
  define: {
    // ✅ SSR FIX: Garantir que les variables d'environnement sont disponibles
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
})
```

---

## 📁 FICHIER 3: `/vercel.json`

**Action**: VÉRIFIER que le fichier contient exactement ce code (normalement déjà correct)

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
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "geolocation=*, camera=*, microphone=*, payment=*"
        }
      ]
    },
    {
      "source": "/",
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
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "Permissions-Policy",
          "value": "geolocation=*, camera=*, microphone=*, payment=*"
        }
      ]
    },
    {
      "source": "/admin/(.*)",
      "headers": [
        {
          "key": "X-Robots-Tag",
          "value": "noindex, nofollow"
        },
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate, private"
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
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

---

## 📁 FICHIER 4: `/tsconfig.json`

**Action**: VÉRIFIER que le fichier contient exactement ce code (normalement déjà correct)

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

---

## 🎯 RÉCAPITULATIF DES FICHIERS MODIFIÉS

| Fichier | Action | Raison |
|---------|--------|--------|
| `/hooks/index.ts` | ✅ **MODIFIER** | Ajout exports explicites + ré-export |
| `/vite.config.ts` | ✅ **MODIFIER** | Optimisation build + préservation noms |
| `/vercel.json` | ℹ️ Vérifier | Configuration déjà correcte |
| `/tsconfig.json` | ℹ️ Vérifier | Configuration déjà correcte |

---

## 🚀 ÉTAPES POUR COPIER DANS GITHUB

### Étape 1: Modifier les fichiers sur GitHub

1. **Aller sur GitHub** → Votre repository SmartCabb
2. **Naviguer vers** `/hooks/index.ts`
3. **Cliquer sur** l'icône du crayon ✏️ (Edit this file)
4. **Supprimer** tout le contenu existant
5. **Copier-coller** le code du FICHIER 1 ci-dessus
6. **Cliquer** "Commit changes" avec le message:
   ```
   fix: Export explicite useAppState pour production
   ```

7. **Répéter** pour `/vite.config.ts` avec le FICHIER 2
8. **Message de commit**:
   ```
   fix: Optimisation config Vite pour production (keep_fnames)
   ```

### Étape 2: Vérifier le déploiement Vercel

1. **Aller sur** [vercel.com/dashboard](https://vercel.com/dashboard)
2. **Sélectionner** votre projet SmartCabb
3. **Attendre** que le déploiement se termine (2-3 minutes)
4. **Vérifier** le statut: "Ready" ✅

### Étape 3: Tester sur smartcabb.com

1. **Ouvrir** [https://www.smartcabb.com/app](https://www.smartcabb.com/app)
2. **Ouvrir** la Console (F12 → Console)
3. **Vérifier** qu'il n'y a pas d'erreur "useAppState is not defined"
4. **Tester** la navigation (Passager, Conducteur, Admin)

---

## 🔍 SI L'ERREUR PERSISTE

### Option 1: Forcer un rebuild complet sur Vercel

1. **Aller sur** Vercel Dashboard → Votre projet
2. **Cliquer** sur le dernier déploiement
3. **Cliquer** sur les 3 points "..." → "Redeploy"
4. **Décocher** "Use existing Build Cache"
5. **Cliquer** "Redeploy"

### Option 2: Vérifier les logs de build

1. **Aller sur** Vercel Dashboard → Deployments
2. **Cliquer** sur le déploiement actif
3. **Onglet** "Building" → Lire les logs
4. **Chercher** des erreurs TypeScript ou de build

### Option 3: Vérifier les variables d'environnement

1. **Aller sur** Vercel Dashboard → Settings → Environment Variables
2. **Vérifier** que ces variables existent:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. **Si manquantes**, les ajouter depuis votre fichier `.env` local

---

## ✅ CHECKLIST FINALE

- [ ] Code `/hooks/index.ts` copié dans GitHub
- [ ] Code `/vite.config.ts` copié dans GitHub
- [ ] Commits poussés vers GitHub
- [ ] Déploiement Vercel terminé (statut "Ready")
- [ ] Testé sur smartcabb.com/app
- [ ] Pas d'erreur dans la console
- [ ] Navigation fonctionne

---

## 📞 DIAGNOSTIC AVANCÉ

Si après toutes ces étapes l'erreur persiste, exécuter ce diagnostic:

### Dans la console du navigateur (F12):

```javascript
// Vérifier que React est chargé
console.log('React:', typeof React);

// Vérifier que le contexte existe
console.log('AppContext:', typeof AppContext);

// Vérifier l'import du hook
import('./assets/index-*.js').then(m => console.log('Module:', m));
```

### Vérifier les fichiers buildés:

1. **Télécharger** le build depuis Vercel
2. **Ouvrir** le dossier `dist/assets/`
3. **Chercher** le fichier contenant "useAppState"
4. **Vérifier** que la fonction est bien exportée

---

## 📝 NOTES IMPORTANTES

1. **NE PAS** modifier d'autres fichiers pour l'instant
2. **TOUJOURS** faire un commit par fichier modifié
3. **ATTENDRE** que chaque déploiement se termine avant de tester
4. **VIDER** le cache du navigateur (Ctrl+Shift+Delete) avant de tester
5. **TESTER** en navigation privée pour éviter les problèmes de cache

---

**Date de création**: 8 Décembre 2024  
**Version**: Production Fix v2.0  
**Environnement cible**: smartcabb.com (Vercel)  
**Statut**: ✅ Prêt pour déploiement
