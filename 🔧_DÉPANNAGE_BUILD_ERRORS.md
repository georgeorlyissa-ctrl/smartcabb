# 🔧 DÉPANNAGE BUILD ERRORS - v517.101

## ❌ ERREURS ACTUELLES

```
Error: Build failed with 20 errors:
- PWAInstallPrompt.tsx:2:55: ERROR: [plugin: npm] Failed to fetch
- AuditLogsScreen.tsx:14:23: ERROR: [plugin: npm] Failed to fetch (date-fns)
- AuditLogsScreen.tsx:15:19: ERROR: [plugin: npm] Failed to fetch (date-fns/locale)
- ForgotPasswordPage.tsx:1:22: ERROR: [plugin: npm] Failed to fetch (sonner)
- button.tsx:2:21: ERROR: [plugin: npm] Failed to fetch (@radix-ui/react-slot)
```

## 🎯 CAUSES PROBABLES

### 1. **Imports `sonner` sans version** (PRIORITAIRE)
Le problème principal : **84 fichiers** utilisent encore `from 'sonner'` au lieu de `from 'sonner@2.0.3'`

**Fichiers déjà corrigés (4)** :
- ✅ App.tsx
- ✅ ProfileScreen.tsx
- ✅ RideMigrationTool.tsx  
- ✅ AuditLogsScreen.tsx (mais a toujours des erreurs date-fns)
- ✅ ForgotPasswordPage.tsx (vient d'être corrigé)

**Fichiers restants (80+)** : Tous les autres fichiers

### 2. **Imports React manquants**
Certains fichiers utilisent `useState`, `useEffect` sans les importer

### 3. **CDN esm.sh qui échoue**
Les erreurs "Failed to fetch" suggèrent que Figma Make n'arrive pas à télécharger les packages depuis esm.sh

---

## 🚀 SOLUTION ÉTAPE PAR ÉTAPE

### ÉTAPE 1 : Corriger TOUS les imports sonner

**Dans VS Code** :
1. `CTRL + SHIFT + H` (Recherche globale)
2. Rechercher : `from 'sonner';`
3. Remplacer par : `from 'sonner@2.0.3';`
4. Cliquer sur "Remplacer tout"

**Ou dans le terminal** :
```bash
# Mac/Linux
find . -name "*.tsx" -type f -exec sed -i '' "s/from 'sonner';/from 'sonner@2.0.3';/g" {} \;

# Linux
find . -name "*.tsx" -type f -exec sed -i "s/from 'sonner';/from 'sonner@2.0.3';/g" {} \;
```

---

### ÉTAPE 2 : Vérifier les imports React

Tous les fichiers utilisant `useState`, `useEffect`, etc. doivent avoir :
```tsx
import { useState, useEffect } from 'react';
```

**Fichiers à vérifier** :
- Tous les fichiers dans `/components/`
- Surtout ceux avec des erreurs de build

---

### ÉTAPE 3 : Vérifier que tu n'es PAS dans Figma Make

**IMPORTANT** : D'après ton contexte :
> "Je travaille en production directe sur Vercel (smartcabb.com) via GitHub, **pas dans Figma Make**"

Les erreurs de build viennent de **Figma Make**, pas de Vercel !

**Si tu vois ces erreurs** :
- ❌ Tu es DANS Figma Make (environnement de preview)
- ✅ Tu devrais être sur Vercel (production)

**Pour déployer sur Vercel** :
```bash
git add .
git commit -m "✅ v517.101: Fix sonner imports + React imports"
git push origin main
```

Puis attendre le déploiement Vercel (2-3 min).

---

### ÉTAPE 4 : Si les erreurs persistent sur Vercel

**Vérifier les dépendances dans package.json** :

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "lucide-react": "latest",
    "sonner": "^2.0.3",
    "date-fns": "^2.30.0",
    "@radix-ui/react-slot": "^1.0.2",
    "class-variance-authority": "^0.7.0"
  }
}
```

Si tu n'as pas de `package.json`, crée-le :

```bash
npm init -y
npm install react lucide-react sonner@2.0.3 date-fns @radix-ui/react-slot class-variance-authority
```

---

## 🎯 CHECKLIST DE VÉRIFICATION

Avant de déployer, vérifie :

- [ ] ✅ TOUS les imports `sonner` ont la version `@2.0.3`
- [ ] ✅ TOUS les fichiers avec `useState`/`useEffect` importent `react`
- [ ] ✅ Le code est committé dans Git
- [ ] ✅ Le code est pushé sur GitHub
- [ ] ✅ Tu attends le déploiement Vercel (pas dans Figma Make)

---

## 💡 RAPPEL IMPORTANT

**Figma Make** (ce qu'on voit maintenant) ≠ **Vercel** (ta production)

Les erreurs dans Figma Make ne signifient PAS que ton code ne marchera pas sur Vercel.

**Pour tester en vrai** :
1. Committe et push sur GitHub
2. Attends le déploiement Vercel
3. Teste sur smartcabb.com

---

## 🆘 SI TOUJOURS DES ERREURS

Si après avoir tout corrigé tu as toujours des erreurs :

1. **Vérifier les logs Vercel** :
   - Va sur vercel.com
   - Clique sur ton projet smartcabb
   - Regarde les logs de build

2. **Nettoyer le cache** :
   ```bash
   rm -rf node_modules
   rm package-lock.json
   npm install
   ```

3. **Vérifier Node version** :
   ```bash
   node --version  # Devrait être >= 18
   ```

---

**Version** : v517.101  
**Date** : 2 janvier 2026  
**Urgence** : 🟡 MOYENNE (erreurs dans Figma Make, pas Vercel)
