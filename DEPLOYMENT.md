# 🚀 Guide de Déploiement Vercel - SmartCabb

## ✅ Prérequis

Tous les fichiers sont maintenant **optimisés pour Vercel** et prêts pour la production sur **smartcabb.com**.

## 📦 Fichiers Optimisés pour Production

### ✅ Configuration Vercel
- **`/vercel.json`** : Configuration complète (routing, headers, cache)
- **`/.vercelignore`** : Fichiers à exclure du build
- **`/.npmrc`** : Configuration npm (legacy-peer-deps uniquement)

### ✅ Configuration Vite
- **`/vite.config.ts`** : Configuration optimisée avec :
  - Code splitting intelligent (react-vendor, router-vendor, map-vendor, icons-vendor)
  - Minification Terser avec optimisation
  - Pas de `force: true` en production (builds plus rapides)
  - Source maps désactivées en production

### ✅ Versioning
- **`/BUILD_VERSION.ts`** : Version v503.0 avec timestamp statique
  - `FORCE_REBUILD = false` (désactivé en production)
  - Timestamp fixe pour cache cohérent entre builds

### ✅ Code Principal
- **`/App.tsx`** : Import `sonner` corrigé (pas de version dans import)
- **`/hooks/useAppState.tsx`** : Exports propres et optimisés

## 🎯 Commandes de Déploiement

### Option 1 : Via Vercel CLI (Recommandé)
```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer (preview)
vercel

# Déployer en production
vercel --prod
```

### Option 2 : Via Git (Push to Deploy)
```bash
# Pusher vers le repo GitHub lié à Vercel
git add .
git commit -m "Production ready - v503.0"
git push origin main
```

## 🔍 Variables d'Environnement Vercel

Assurez-vous que ces variables sont configurées dans Vercel Dashboard :

### Production
- `SUPABASE_URL` : URL de votre projet Supabase
- `SUPABASE_ANON_KEY` : Clé anonyme publique
- `SUPABASE_SERVICE_ROLE_KEY` : Clé service role (backend uniquement)
- `AFRICAS_TALKING_API_KEY` : API Key Africa's Talking
- `AFRICAS_TALKING_USERNAME` : Username Africa's Talking
- `FLUTTERWAVE_SECRET_KEY` : Clé secrète Flutterwave
- `SENDGRID_API_KEY` : Clé API SendGrid

## ✨ Optimisations Appliquées

### 1. **Code Splitting**
- Vendor chunks séparés (React, Router, Leaflet, Icons)
- Chargement lazy des pages secondaires
- Meilleur cache navigateur

### 2. **Build Performance**
- Pas de `force: true` en optimizeDeps
- Cache npm utilisé sur Vercel
- Terser minification optimale

### 3. **Runtime Performance**
- Timestamp statique (pas de `Date.now()` dans BUILD_VERSION)
- Headers de cache optimaux (31536000s pour assets)
- PWA avec Service Worker

### 4. **Sécurité**
- Headers X-Frame-Options, X-XSS-Protection, etc.
- Admin routes avec X-Robots-Tag (noindex)
- Permissions-Policy pour geolocation, camera, etc.

## 📊 Vérification Post-Déploiement

Après le déploiement, vérifiez :

1. ✅ Homepage charge correctement (`https://smartcabb.com`)
2. ✅ Routes fonctionnent (`/app`, `/driver`, `/admin`)
3. ✅ PWA installable (vérifier manifest et service worker)
4. ✅ API Supabase accessible
5. ✅ Notifications SMS fonctionnent
6. ✅ Paiements Flutterwave actifs

## 🐛 Dépannage

### Build échoue sur Vercel
```bash
# Localement, tester le build
npm run build

# Si succès local mais échec Vercel :
# - Vérifier les variables d'environnement
# - Vérifier les logs Vercel Dashboard
```

### Erreur "Failed to fetch"
- Vérifier que `.npmrc` contient `legacy-peer-deps=true`
- Vérifier `vercel.json` : `"installCommand": "npm install --legacy-peer-deps"`

### PWA ne s'installe pas
- Vérifier que `/public/manifest.json` existe
- Vérifier HTTPS (requis pour PWA)
- Vérifier Service Worker dans DevTools

## 📞 Support

En cas de problème, vérifier les logs :
- **Vercel Dashboard** → Deployments → Logs
- **Browser Console** → Erreurs runtime
- **Network Tab** → Requêtes API échouées

---

**Version actuelle : v503.0 - Production Ready**
**Optimisé pour : smartcabb.com sur Vercel**
