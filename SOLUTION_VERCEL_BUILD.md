# ✅ SOLUTION - Build Vercel v517.112

## Problème
```
Error: [vite]: Rollup failed to resolve import "framer-motion@10.16.4"
```

## Cause
Vous déployez sur **Vercel avec Vite/Rollup**. Les imports avec version (`@10.16.4`) ne fonctionnent **que** dans le navigateur avec esm.sh (Figma Make), **PAS** avec Vite/Rollup.

## ✅ Solution

### 1. Package.json (déjà correct)
```json
{
  "dependencies": {
    "framer-motion": "^10.16.4"
  }
}
```

### 2. Tous les imports doivent être SANS version
```typescript
// ✅ CORRECT pour Vite/Vercel
import { motion } from 'framer-motion';
import { motion, AnimatePresence } from 'framer-motion';

// ❌ INCORRECT (causera l'erreur Rollup)
import { motion } from 'motion/react';
import { motion } from 'framer-motion@10.16.4';
```

---

## 🚀 CORRECTION AUTOMATIQUE

### Option A: Script Node.js (recommandé - fonctionne partout)
```bash
node fix-motion-imports.js
```

### Option B: Script Bash (Linux/Mac)
```bash
chmod +x fix_all_motion_imports.sh
./fix_all_motion_imports.sh
```

### Option C: VS Code Find & Replace
1. Ouvrir VS Code
2. `Ctrl+Shift+H` (Find & Replace in Files)
3. Activer **Regex** (icône `.*`)

**Remplacement 1:**
- Chercher: `from ['"]motion/react['"]`
- Remplacer: `from 'framer-motion'`
- Cliquer "Replace All"

**Remplacement 2:**
- Chercher: `from ['"]framer-motion@[^'"]+['"]`
- Remplacer: `from 'framer-motion'`
- Cliquer "Replace All"

---

## 📦 Après correction

```bash
# 1. Installer les dépendances
npm install

# 2. Tester le build localement
npm run build

# 3. Si le build réussit, commit et push
git add .
git commit -m "fix: Remove version specifiers from framer-motion imports for Vite/Vercel compatibility"
git push origin main
```

---

## 📊 Statistiques

- **Total de fichiers**: 94
- **Fichiers déjà corrigés**: 5
  - `/pages/LandingPage.tsx`
  - `/components/PageTransition.tsx`
  - `/components/auth/ResetPasswordPage.tsx`
  - `/components/auth/ForgotPasswordPage.tsx`
  - `/components/passenger/MapScreen.tsx`
- **Fichiers restants à corriger**: 89

---

## 💡 Différence: Figma Make vs Vercel

| Environnement | Import requis | Bundler |
|---------------|---------------|---------|
| **Figma Make** | `from 'framer-motion@10.16.4'` | esm.sh (CDN navigateur) |
| **Vercel/Vite** | `from 'framer-motion'` | Vite/Rollup (Node.js) |

Vous travaillez sur **Vercel**, donc utilisez **SANS version**!

---

## ✅ Vérification finale

Aucun import avec version ne doit rester:

```bash
# Doit retourner 0
grep -r "motion/react" --include="*.tsx" --include="*.ts" . | grep -v node_modules | wc -l

# Doit retourner 0
grep -r "framer-motion@" --include="*.tsx" --include="*.ts" . | grep -v node_modules | wc -l

# Doit retourner ~94
grep -r "from 'framer-motion'" --include="*.tsx" --include="*.ts" . | grep -v node_modules | wc -l
```

---

**Version**: v517.112  
**Date**: 2025-01-03  
**Status**: ✅ Solution pour build Vercel/Vite
