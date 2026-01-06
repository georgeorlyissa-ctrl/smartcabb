# ✅ SOLUTION FINALE - Figma Make (esm.sh)

## 🎯 Environnement détecté
**Figma Make** (navigateur + esm.sh CDN)

## ❌ Erreur
```
ERROR: [plugin: npm] Failed to fetch
npm-modules:https://esm.sh/framer-motion
```

## ✅ Cause
Les imports **SANS version** ne fonctionnent pas avec esm.sh. Il faut spécifier la version exacte: `@10.16.4`

---

## 🔧 Corrections appliquées (5 fichiers)

✅ `/pages/LandingPage.tsx`
✅ `/components/PageTransition.tsx`
✅ `/components/auth/ResetPasswordPage.tsx`
✅ `/components/auth/ForgotPasswordPage.tsx`
✅ `/components/passenger/MapScreen.tsx`

Tous utilisent maintenant:
```typescript
import { motion } from 'framer-motion@10.16.4';
import { motion, AnimatePresence } from 'framer-motion@10.16.4';
```

---

## ⚡ Correction automatique (89 fichiers restants)

### Option 1: Script Node.js (recommandé)
```bash
node fix-all-motion-to-framer.js
```

### Option 2: VS Code Find & Replace
1. Ouvrir VS Code
2. `Ctrl+Shift+H` (Find & Replace in Files)
3. **Activer Regex** (icône `.*`)
4. Chercher: `from ['"]motion/react['"]`
5. Remplacer: `from 'framer-motion@10.16.4'`
6. Cliquer "Replace All"

### Option 3: Commande manuelle (Linux/Mac)
```bash
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -exec sed -i "s|from 'motion/react'|from 'framer-motion@10.16.4'|g" {} + \
  -exec sed -i 's|from "motion/react"|from "framer-motion@10.16.4"|g' {} +
```

---

## ✅ Vérification

Après correction, vérifier qu'il ne reste aucun import `motion/react`:

```bash
# Doit retourner 0
grep -r "motion/react" --include="*.tsx" --include="*.ts" . | grep -v node_modules | wc -l

# Doit retourner ~94
grep -r "framer-motion@10.16.4" --include="*.tsx" . | grep -v node_modules | wc -l
```

---

## 📊 Format des imports

### ✅ CORRECT (Figma Make)
```typescript
import { motion } from 'framer-motion@10.16.4';
import { motion, AnimatePresence } from 'framer-motion@10.16.4';
```

### ❌ INCORRECT (causera l'erreur esm.sh)
```typescript
import { motion } from 'motion/react';        // ❌ Ancien package
import { motion } from 'framer-motion';       // ❌ Sans version
```

---

## 💡 Important

### Figma Make (navigateur)
- Utilise **esm.sh** (CDN)
- Nécessite la **version spécifiée** : `@10.16.4`
- Build dans le navigateur

### Vite/Vercel (Node.js)
- Utilise **npm/node_modules**
- Nécessite **SANS version** : `framer-motion`
- Build sur serveur

**Vous êtes dans Figma Make** → Utilisez `@10.16.4` !

---

## 📋 Statistiques

- **Total de fichiers**: 94
- **Déjà corrigés**: 5
- **Restants à corriger**: 89
- **Temps estimé**: 1-2 minutes

---

**Version**: v517.113  
**Date**: 2025-01-03  
**Status**: ✅ Solution pour Figma Make (esm.sh)
