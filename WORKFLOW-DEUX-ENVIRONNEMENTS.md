# 🔄 Workflow SmartCabb : Deux Environnements

## 📋 Vue d'ensemble

SmartCabb utilise **deux environnements de développement distincts** avec des exigences d'imports différentes :

### 1️⃣ **Figma Make** (Développement rapide)
- **URL**: Environnement Figma Make
- **CDN**: esm.sh
- **Imports requis**: Wrappers locaux (`./framer-motion`, `./lucide-react`)
- **Usage**: Prototypage rapide, tests visuels, démo

### 2️⃣ **GitHub → Vercel** (Production)
- **URL**: smartcabb.com
- **Packages**: npm standard
- **Imports requis**: Packages directs (`framer-motion`, `lucide-react`)
- **Usage**: Production, déploiement final

---

## 🚀 Scripts de correction automatique

### Pour Figma Make :
```bash
node fix-imports-figma-make.mjs
```
**Effet**: Convertit tous les imports vers les wrappers locaux
- `from 'framer-motion'` → `from './framer-motion'`
- `from 'lucide-react'` → `from './lucide-react'`

### Pour Vercel/GitHub :
```bash
node fix-for-vercel.mjs
```
**Effet**: Convertit tous les imports vers les packages npm
- `from './framer-motion'` → `from 'framer-motion'`
- `from './lucide-react'` → `from 'lucide-react'`

---

## 📝 Workflow recommandé

### Scénario A : Développer dans Figma Make, puis déployer sur Vercel

1. **Développer dans Figma Make**
   ```bash
   # Les imports utilisent les wrappers locaux
   node fix-imports-figma-make.mjs
   ```

2. **Copier le code vers GitHub**
   ```bash
   # Depuis GitHub Codespaces ou local
   git pull  # Récupérer les derniers changements
   ```

3. **Corriger pour Vercel**
   ```bash
   # Dans /workspaces/smartcabb
   node fix-for-vercel.mjs
   ```

4. **Déployer**
   ```bash
   git add .
   git commit -m "fix: Imports corrigés pour Vercel"
   git push origin main
   # Vercel déploie automatiquement
   ```

### Scénario B : Développer sur GitHub, puis tester dans Figma Make

1. **Développer sur GitHub**
   ```bash
   # Les imports utilisent les packages npm directs
   # Coder normalement
   ```

2. **Copier vers Figma Make**
   ```bash
   # Dans Figma Make
   # Copier-coller le code
   ```

3. **Corriger pour Figma Make**
   ```bash
   node fix-imports-figma-make.mjs
   ```

---

## ⚠️ Points d'attention

### ❌ À NE PAS FAIRE :
- Mélanger les deux types d'imports dans le même environnement
- Oublier de corriger les imports avant de pousser sur GitHub
- Committer les wrappers locaux dans GitHub (ils sont pour Figma Make uniquement)

### ✅ À FAIRE :
- Toujours exécuter le script de correction approprié avant de déployer
- Tester dans les deux environnements avant la mise en production
- Garder les wrappers `/framer-motion.tsx` et `/lucide-react.ts` dans Figma Make

---

## 🔧 Détection des erreurs

### Erreurs dans Figma Make :
```
ERROR: [plugin: npm] Failed to fetch
npm-modules:https://esm.sh/framer-motion
```
**Solution**: Exécuter `node fix-imports-figma-make.mjs`

### Erreurs dans Vercel :
```
Module not found: Can't resolve './framer-motion'
```
**Solution**: Exécuter `node fix-for-vercel.mjs`

---

## 📦 Fichiers importants

### Wrappers Figma Make (à garder dans Figma Make uniquement) :
- `/framer-motion.tsx` - Wrapper pour framer-motion
- `/lucide-react.ts` - Wrapper pour lucide-react

### Scripts de correction :
- `/fix-imports-figma-make.mjs` - Pour Figma Make
- `/fix-for-vercel.mjs` - Pour Vercel/GitHub

### Configuration GitHub :
- `package.json` - Doit contenir `framer-motion` et `lucide-react`

---

## 🎯 Priorités

D'après vos instructions :
1. **Production Vercel** (smartcabb.com) - PRIORITÉ 1
2. **Figma Make** - PRIORITÉ 2 (pour tests et prototypage)

⚡ En cas de conflit, **privilégier toujours la version Vercel**.

---

## 📞 Support

Si vous rencontrez des erreurs après avoir exécuté les scripts :
1. Vérifier quel environnement génère l'erreur
2. Exécuter le script approprié
3. Recompiler l'application
4. Tester à nouveau
