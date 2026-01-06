# 🔄 Workflow SmartCabb : Figma Make ↔ GitHub/Vercel

Ce document explique comment travailler efficacement entre **Figma Make** et **GitHub/Vercel**.

---

## 🎯 Problématique

SmartCabb utilise **deux environnements** avec des systèmes d'imports incompatibles :

| Environnement | Imports requis | Pourquoi ? |
|---------------|----------------|------------|
| **Figma Make** | `from './framer-motion'` | esm.sh CDN nécessite des wrappers |
| **GitHub/Vercel** | `from 'motion/react'` | node_modules standard |

---

## ✅ Solution : Scripts de transformation automatiques

Deux scripts permettent de basculer automatiquement entre les environnements :

### 1️⃣ `prepare-for-vercel.mjs` 
Transforme les imports Figma Make → Vercel

```bash
node scripts/prepare-for-vercel.mjs
```

**Ce qu'il fait :**
- ✅ `from '../../framer-motion'` → `from 'motion/react'`
- ✅ `from '../../lucide-react'` → `from 'lucide-react'`
- ✅ Transforme TOUS les fichiers automatiquement

### 2️⃣ `prepare-for-figma.mjs`
Transforme les imports Vercel → Figma Make

```bash
node scripts/prepare-for-figma.mjs
```

**Ce qu'il fait :**
- ✅ `from 'motion/react'` → `from './framer-motion'`
- ✅ `from 'lucide-react'` → `from './lucide-react'`
- ✅ Calcule automatiquement les chemins relatifs corrects

---

## 📋 Workflow recommandé

### 🎨 Travailler dans Figma Make

1. **Développez normalement** dans Figma Make
2. Les imports utilisent les wrappers locaux (déjà configuré)
3. Testez votre application

### 🚀 Déployer sur GitHub/Vercel

Avant de commit :

```bash
# 1. Transformer les imports pour Vercel
node scripts/prepare-for-vercel.mjs

# 2. Vérifier les changements
git status

# 3. Commit et push
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin main

# 4. Vercel déploie automatiquement ✅
```

### 🔙 Revenir à Figma Make après un déploiement

Si vous voulez continuer à travailler dans Figma Make :

```bash
# Retransformer les imports pour Figma Make
node scripts/prepare-for-figma.mjs
```

---

## 🤖 Automatisation (Optionnel)

### Option A : Git Hook (Pre-commit)

Créez `.git/hooks/pre-commit` :

```bash
#!/bin/sh
echo "🔄 Transformation des imports pour GitHub/Vercel..."
node scripts/prepare-for-vercel.mjs
git add .
```

Rendez-le exécutable :
```bash
chmod +x .git/hooks/pre-commit
```

### Option B : package.json Scripts

Ajoutez dans `package.json` :

```json
{
  "scripts": {
    "deploy": "node scripts/prepare-for-vercel.mjs && git add . && git commit --amend --no-edit",
    "figma": "node scripts/prepare-for-figma.mjs",
    "vercel": "node scripts/prepare-for-vercel.mjs"
  }
}
```

Usage :
```bash
npm run vercel  # Préparer pour Vercel
npm run figma   # Revenir à Figma Make
```

---

## 🔐 Fichiers protégés

Le `.gitignore` exclut les wrappers Figma Make de GitHub :

```
/framer-motion.tsx    # ❌ Ne sera PAS commité
/lucide-react.tsx     # ❌ Ne sera PAS commité
```

**Résultat :** GitHub/Vercel n'aura JAMAIS les wrappers, seulement les imports directs ✅

---

## 📊 Rapport de transformation

Chaque script affiche un rapport détaillé :

```
🚀 Transformation des imports pour Vercel/GitHub...

📁 148 fichiers TypeScript trouvés

✅ components/driver/DriverDashboard.tsx (2 imports)
✅ components/passenger/EstimateScreen.tsx (3 imports)
...

============================================================
📊 RAPPORT DE TRANSFORMATION
============================================================
📄 Fichiers analysés    : 148
✏️  Fichiers modifiés    : 43
🔄 Imports transformés  : 87
============================================================

✅ Transformation réussie !
💡 Vous pouvez maintenant commit et push sur GitHub.
🌐 Le déploiement Vercel utilisera les imports corrects.
```

---

## ⚠️ Important

### ✅ À FAIRE :
- Toujours exécuter `prepare-for-vercel.mjs` avant de commit
- Vérifier le rapport de transformation
- Tester localement après transformation si possible

### ❌ À NE PAS FAIRE :
- Ne jamais commit les wrappers (`framer-motion.tsx`, `lucide-react.tsx`)
- Ne jamais mixer les deux types d'imports dans le même fichier
- Ne jamais modifier manuellement les imports (utiliser les scripts)

---

## 🆘 Dépannage

### Problème : "Module not found: Can't resolve 'motion/react'"

**Cause :** Vous êtes sur Vercel avec des imports Figma Make

**Solution :**
```bash
node scripts/prepare-for-vercel.mjs
git add .
git commit -m "fix: imports for Vercel"
git push
```

### Problème : "63 erreurs de build dans Figma Make"

**Cause :** Vous avez des imports directs au lieu des wrappers

**Solution :**
```bash
node scripts/prepare-for-figma.mjs
```

### Problème : Le script ne trouve aucun fichier

**Vérifiez :**
- Vous êtes à la racine du projet
- Le dossier `scripts/` existe
- Vous avez les permissions d'exécution

---

## 📝 Résumé en 3 étapes

### 🎨 Figma Make → 🌐 Vercel

```bash
node scripts/prepare-for-vercel.mjs
git add . && git commit -m "deploy" && git push
```

### 🌐 Vercel → 🎨 Figma Make

```bash
node scripts/prepare-for-figma.mjs
```

### 🔄 One-liner de déploiement

```bash
node scripts/prepare-for-vercel.mjs && git add . && git commit -m "deploy: $(date '+%Y-%m-%d %H:%M')" && git push
```

---

## 🎉 Terminé !

Vous pouvez maintenant travailler sereinement dans les deux environnements sans conflits d'imports ! 🚀

**Questions ?** Consultez ce guide ou exécutez les scripts avec `--help` (à venir).
