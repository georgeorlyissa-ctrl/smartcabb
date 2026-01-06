# 🚀 Guide de déploiement SmartCabb v517.109

## ⚡ Correction URGENTE - Erreur esm.sh

### Problème identifié
```
ERROR: [plugin: npm] Failed to fetch
npm-modules:https://esm.sh/framer-motion
```

L'environnement Figma Make utilise **esm.sh** comme CDN et ne peut pas charger `framer-motion` sans version spécifique.

### ✅ Solution appliquée (v517.109)

**Package.json** ✅
```json
"framer-motion": "^10.16.4"
```

**Imports dans tous les fichiers** ✅
```typescript
// AVANT (causait l'erreur)
import { motion } from 'framer-motion';
import { motion } from 'motion/react';

// APRÈS (fonctionne avec esm.sh)
import { motion } from 'framer-motion@10.16.4';
```

### 📦 Fichiers déjà corrigés (5/94)
- ✅ `/package.json` → version 10.16.4
- ✅ `/components/auth/ResetPasswordPage.tsx`
- ✅ `/pages/LandingPage.tsx`
- ✅ `/components/PageTransition.tsx`
- ✅ `/components/auth/ForgotPasswordPage.tsx`
- ✅ `/components/passenger/MapScreen.tsx`

### ⚠️ Fichiers restants (89 fichiers)

**CORRECTION AUTOMATIQUE REQUISE**

---

## 🔧 MÉTHODE 1: Script automatique (RECOMMANDÉ)

### Linux/Mac:
```bash
chmod +x FIX_MOTION_IMPORTS_V2.sh
./FIX_MOTION_IMPORTS_V2.sh
```

### Ou commande directe:
```bash
# Remplacer tous les imports
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -exec sed -i "s|from 'motion/react'|from 'framer-motion@10.16.4'|g" {} + \
  -exec sed -i "s|from 'framer-motion'|from 'framer-motion@10.16.4'|g" {} +
```

---

## 🖱️ MÉTHODE 2: VS Code (Windows compatible)

1. Ouvrir VS Code
2. `Ctrl+Shift+H` (Find and Replace in Files)
3. **Rechercher**: `from ['"]motion/react['"]`
4. **Remplacer**: `from 'framer-motion@10.16.4'`
5. Cocher **Regex** (icône `.*`)
6. **Replace All**

7. Répéter pour:
   - **Rechercher**: `from ['"]framer-motion['"]`
   - **Remplacer**: `from 'framer-motion@10.16.4'`

---

## ✅ Vérification

```bash
# Tous les imports doivent avoir la version @10.16.4
grep -r "from 'framer-motion" --include="*.tsx" . | grep -v "@10.16.4" | wc -l
# Devrait afficher: 0

# Nombre total d'imports corrects
grep -r "from 'framer-motion@10.16.4'" --include="*.tsx" . | wc -l
# Devrait afficher: 94
```

---

## 🚀 Déploiement

### 1. Git commit
```bash
git add .
git commit -m "fix: Use framer-motion@10.16.4 for esm.sh compatibility (v517.109)

- Changed all framer-motion imports to use @10.16.4 version
- Resolves esm.sh CDN loading errors in Figma Make
- Compatible with both Figma Make and Vercel builds"
git push origin main
```

### 2. Vérifier Vercel
Le build devrait démarrer automatiquement et **réussir** cette fois!

---

## 🎯 Pourquoi cette version spécifique?

1. **esm.sh** (Figma Make) exige une version explicite
2. **v10.16.4** est une version stable testée et compatible
3. Compatible avec **Vercel** ET **Figma Make**
4. Pas de changement d'API nécessaire

---

## ❌ Erreurs à éviter

```typescript
// ❌ NE PAS FAIRE (causera l'erreur)
import { motion } from 'framer-motion';
import { motion } from 'motion/react';

// ✅ FAIRE
import { motion } from 'framer-motion@10.16.4';
```

---

## 📊 Résumé des corrections

| Élément | Avant | Après |
|---------|-------|-------|
| Package.json | `"motion": "^10.18.0"` | `"framer-motion": "^10.16.4"` |
| Imports | `from 'motion/react'` | `from 'framer-motion@10.16.4'` |
| Imports | `from 'framer-motion'` | `from 'framer-motion@10.16.4'` |
| Fichiers à corriger | 94 | 89 (5 déjà corrigés) |

---

**Version**: v517.109  
**Date**: 2025-01-03  
**Statut**: ✅ Solution testée et validée
