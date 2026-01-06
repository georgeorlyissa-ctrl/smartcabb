# 🚀 GUIDE DE DÉPLOIEMENT VERCEL - SMARTCABB

## 📋 TABLE DES MATIÈRES

1. [Vérifications préalables](#vérifications-préalables)
2. [Méthode rapide (recommandée)](#méthode-rapide-recommandée)
3. [Méthode manuelle](#méthode-manuelle)
4. [Vérification du déploiement](#vérification-du-déploiement)
5. [Dépannage](#dépannage)

---

## ✅ VÉRIFICATIONS PRÉALABLES

### 1. État du projet

- ✅ `vite.config.ts` : Alias framer-motion **DÉSACTIVÉ** (commenté)
- ✅ Imports dans le code : Doivent être transformés en `motion/react`
- ✅ Git : Projet connecté à GitHub
- ✅ Vercel : Limite de déploiement (100/jour) **NON ATTEINTE**

### 2. Fichiers critiques

Vérifiez que ces fichiers existent :

```bash
✅ /vite.config.ts           # Alias désactivé
✅ /package.json             # framer-motion en dépendance
✅ /scripts/prepare-for-vercel.mjs  # Script de transformation
✅ /DEPLOY_TO_VERCEL.sh      # Script de déploiement (Linux/Mac)
✅ /DEPLOY_TO_VERCEL.bat     # Script de déploiement (Windows)
```

---

## 🚀 MÉTHODE RAPIDE (RECOMMANDÉE)

### **Windows**

Double-cliquez sur :
```
DEPLOY_TO_VERCEL.bat
```

**OU** dans le terminal (CMD, PowerShell, Git Bash) :
```bash
.\DEPLOY_TO_VERCEL.bat
```

### **Linux / Mac / WSL**

Dans le terminal :
```bash
bash DEPLOY_TO_VERCEL.sh
```

### **Ce qui se passe automatiquement :**

```
1. 🗑️  Nettoyage des caches (dist, .vite, .vercel)
2. 🔧 Transformation des imports pour Vercel
3. 📝 Vérification des modifications
4. 💾 Commit automatique avec timestamp
5. 📤 Push sur GitHub
6. 🌐 Vercel détecte et rebuild automatiquement
```

**Durée totale : ~3-5 minutes**

---

## 🔧 MÉTHODE MANUELLE

### Étape 1 : Nettoyer les caches

```bash
# Supprimer les caches locaux
rm -rf node_modules/.vite
rm -rf dist
rm -rf .vercel
```

**Windows (PowerShell) :**
```powershell
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .vercel -ErrorAction SilentlyContinue
```

---

### Étape 2 : Transformer les imports

```bash
node scripts/prepare-for-vercel.mjs
```

**Vous devriez voir :**
```
🚀 Transformation des imports pour Vercel/GitHub...

📁 XXX fichiers TypeScript trouvés

✅ components/ui/hero.tsx (3 imports)
✅ components/ui/features.tsx (2 imports)
...

============================================================
📊 RAPPORT DE TRANSFORMATION
============================================================
📄 Fichiers analysés    : XXX
✏️  Fichiers modifiés    : XXX
🔄 Imports transformés  : XXX
============================================================

✅ Transformation réussie !
```

---

### Étape 3 : Commit et Push

```bash
# Ajouter tous les fichiers modifiés
git add .

# Commit avec message descriptif
git commit -m "deploy: production build for Vercel"

# Push vers GitHub
git push origin main
```

---

### Étape 4 : Vercel Build

**Automatique !** Vercel détecte le push et lance le build.

---

## 🔍 VÉRIFICATION DU DÉPLOIEMENT

### 1. Dashboard Vercel

Ouvrez : **https://vercel.com/dashboard**

Vous devriez voir :

```
┌─────────────────────────────────────────┐
│ smartcabb                               │
│ ⏳ Building... (2m 30s)                 │
│                                         │
│ Latest Deployment:                      │
│ • Commit: deploy: production build      │
│ • Branch: main                          │
│ • Status: Building                      │
└─────────────────────────────────────────┘
```

### 2. Build Logs

Cliquez sur le déploiement pour voir les logs en temps réel :

**✅ BUILD RÉUSSI :**
```
✓ Build completed successfully
✓ Deployment ready
✓ Live at: https://smartcabb.com
```

**❌ BUILD ÉCHOUÉ :**
```
❌ Build failed
Error: Cannot find module 'framer-motion'
```
→ Voir [Dépannage](#dépannage)

---

### 3. Test du site en production

**Après 2-3 minutes, ouvrez :**
```
https://smartcabb.com
```

**Vérifiez :**
- ✅ Page charge correctement
- ✅ Animations fonctionnent (framer-motion)
- ✅ Icônes apparaissent (lucide-react)
- ✅ Carte Google Maps s'affiche
- ✅ Connexion/inscription fonctionnent

---

## 🚨 DÉPANNAGE

### Problème 1 : "Cannot find module 'framer-motion'"

**Cause :** Les imports utilisent encore le wrapper local

**Solution :**
```bash
# Retransformer les imports
node scripts/prepare-for-vercel.mjs

# Vérifier manuellement les fichiers
grep -r "from '.*framer-motion'" components/
# Ne devrait retourner AUCUN résultat

# Si des imports relatifs persistent :
grep -r "from '\.\./.*framer-motion'" .
# Et les corriger manuellement
```

---

### Problème 2 : "Vite build failed"

**Cause :** Alias actif dans `vite.config.ts`

**Solution :**
```typescript
// Vérifiez que cette section est COMMENTÉE dans vite.config.ts :

// ❌ ALIAS DÉSACTIVÉ pour Vercel
// resolve: {
//   alias: {
//     'framer-motion': path.resolve(__dirname, './framer-motion.tsx'),
//   },
// },
```

---

### Problème 3 : "Git push rejected"

**Cause :** Conflit ou permissions

**Solution :**
```bash
# Vérifier l'état Git
git status

# Pull les derniers changements
git pull origin main

# Résoudre les conflits si nécessaire
git mergetool

# Recommiter et pusher
git add .
git commit -m "deploy: resolve conflicts"
git push origin main
```

---

### Problème 4 : "Limite Vercel atteinte (100 déploiements/jour)"

**Message :**
```
❌ Too many deployments. Try again in X hours.
```

**Solution :**
```
1. Attendez le reset (minuit UTC)
2. Ou upgradez vers Vercel Pro (illimité)
3. Ou utilisez un autre projet Vercel temporairement
```

---

### Problème 5 : Build réussit mais site cassé

**Vérifications :**

1. **Console navigateur (F12) :**
   ```
   Recherchez les erreurs JavaScript
   ```

2. **Network tab :**
   ```
   Vérifiez les requêtes API échouées
   ```

3. **Variables d'environnement Vercel :**
   ```
   Vercel Dashboard → Settings → Environment Variables
   
   Vérifiez que ces variables existent :
   ✅ SUPABASE_URL
   ✅ SUPABASE_ANON_KEY
   ✅ SUPABASE_SERVICE_ROLE_KEY
   ✅ (autres clés API)
   ```

---

## 📊 CHECKLIST COMPLÈTE DE DÉPLOIEMENT

```
[ ] 1. Nettoyer les caches locaux
[ ] 2. Exécuter prepare-for-vercel.mjs
[ ] 3. Vérifier vite.config.ts (alias désactivé)
[ ] 4. Commit les changements
[ ] 5. Push sur GitHub
[ ] 6. Ouvrir Vercel Dashboard
[ ] 7. Vérifier le build en cours
[ ] 8. Attendre 2-3 minutes
[ ] 9. Tester https://smartcabb.com
[ ] 10. Vérifier console navigateur (aucune erreur)
```

---

## 🎯 COMMANDES RAPIDES

### Déploiement complet (automatique)

```bash
# Windows
.\DEPLOY_TO_VERCEL.bat

# Linux/Mac
bash DEPLOY_TO_VERCEL.sh
```

### Transformation uniquement

```bash
npm run prepare:vercel
```

### Vérifier les imports

```bash
npm run check:imports
```

### Build local (test)

```bash
npm run build
```

---

## 📞 SUPPORT

Si le problème persiste :

1. **Vérifiez les logs Vercel** (très détaillés)
2. **Comparez avec un déploiement réussi précédent**
3. **Testez le build localement** : `npm run build`
4. **Cherchez l'erreur exacte** dans les logs

---

## 🎉 SUCCÈS !

Si vous voyez ceci sur Vercel :

```
✅ Deployment ready
🌐 https://smartcabb.com
```

**ET** le site charge sans erreur dans le navigateur :

```
🎊 FÉLICITATIONS !
🚀 SmartCabb est déployé en production !
```

---

## 📝 NOTES IMPORTANTES

### Différence Figma Make vs Vercel

| Environnement | Imports framer-motion | vite.config.ts |
|---------------|----------------------|----------------|
| **Figma Make** | `from '../../framer-motion'` | Alias ACTIVÉ |
| **Vercel** | `from 'motion/react'` | Alias DÉSACTIVÉ |

### Scripts de transformation

- **prepare-for-vercel.mjs** : Transforme les imports pour production
- **prepare-for-figma.mjs** : Restaure les imports pour Figma Make

**⚠️ NE JAMAIS commiter les fichiers après prepare-for-figma.mjs !**

---

**Dernière mise à jour : 6 janvier 2026**
