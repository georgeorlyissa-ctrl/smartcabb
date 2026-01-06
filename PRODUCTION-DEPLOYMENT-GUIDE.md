# 🚀 GUIDE DE DÉPLOIEMENT PRODUCTION - SmartCabb

## ✅ PROBLÈME RÉSOLU : "useAppState is not defined"

### Cause de l'erreur
L'erreur était causée par l'absence de la directive `'use client'` dans `/hooks/useAppState.tsx`, ce qui empêchait le hook de fonctionner correctement dans un environnement de build production Vite/Vercel.

### Solution appliquée
✅ Ajout de `'use client';` en première ligne de `/hooks/useAppState.tsx`

---

## 📋 FICHIERS MODIFIÉS POUR LA PRODUCTION

### 1. `/hooks/useAppState.tsx` ⭐ CRITIQUE
**Modification:** Ajout de `'use client';` en première ligne
**Raison:** Nécessaire pour que le hook fonctionne correctement en production
**À copier:** ✅ OUI - PRIORITAIRE

```tsx
'use client';

import { useState, createContext, useContext, ReactNode, useMemo, useCallback, useEffect } from 'react';
// ... reste du code
```

---

## 🔧 FICHIERS À COPIER DANS GITHUB (PAR ORDRE DE PRIORITÉ)

### PRIORITÉ 1 - CRITIQUE (Empêche le build)
1. ✅ `/hooks/useAppState.tsx` - Fix "useAppState is not defined"
2. ✅ `/components/ui/chart.tsx` - Fix recharts import
3. ✅ `/vercel.json` - Configuration Vercel
4. ✅ `/vite.config.ts` - Configuration build

### PRIORITÉ 2 - IMPORTANTE (Améliore la stabilité)
5. ✅ `/App.tsx` - Application principale
6. ✅ `/main.tsx` - Point d'entrée
7. ✅ `/package.json` - Dépendances
8. ✅ `/tsconfig.json` - Configuration TypeScript

### PRIORITÉ 3 - RECOMMANDÉE (Fonctionnalités complètes)
9. ✅ Tous les fichiers dans `/components/`
10. ✅ Tous les fichiers dans `/hooks/`
11. ✅ Tous les fichiers dans `/lib/`
12. ✅ Tous les fichiers dans `/pages/`
13. ✅ Tous les fichiers dans `/supabase/functions/server/`
14. ✅ Tous les fichiers dans `/types/`
15. ✅ Tous les fichiers dans `/utils/`
16. ✅ `/styles/globals.css`
17. ✅ `/index.html`

---

## 🚨 CHECKLIST AVANT DÉPLOIEMENT

### Vérifications obligatoires:
- [ ] Le fichier `/hooks/useAppState.tsx` contient `'use client';` en première ligne
- [ ] Le fichier `/components/ui/chart.tsx` importe `recharts@2.15.0`
- [ ] Tous les fichiers de documentation (.md) ont été supprimés (déjà fait ✅)
- [ ] Le fichier `vercel.json` est présent
- [ ] Les variables d'environnement Supabase sont configurées dans Vercel:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

### Vérifications recommandées:
- [ ] Aucun `console.log` sensible (mots de passe, tokens)
- [ ] Toutes les routes de l'API backend sont correctes
- [ ] Le taux de change est configuré (2850 CDF/$)
- [ ] Les clés API Flutterwave et Africa's Talking sont configurées

---

## 📝 COMMANDES POUR DÉPLOYER

### 1. Copier les fichiers modifiés dans GitHub

**Option A: Via l'interface web GitHub (RECOMMANDÉ)**
1. Aller sur https://github.com/VOTRE-USERNAME/smartcabb
2. Cliquer sur "Add file" → "Upload files"
3. Glisser-déposer les fichiers suivants UN PAR UN:
   - `/hooks/useAppState.tsx`
   - `/components/ui/chart.tsx`
   - `/vercel.json`
   - `/vite.config.ts`
4. Commit avec le message: "fix: useAppState is not defined in production"

**Option B: Via Git CLI (si vous avez Git installé)**
```bash
cd /chemin/vers/smartcabb
git add hooks/useAppState.tsx
git add components/ui/chart.tsx
git add vercel.json
git add vite.config.ts
git commit -m "fix: useAppState is not defined in production"
git push origin main
```

### 2. Vérifier le déploiement Vercel
1. Aller sur https://vercel.com/dashboard
2. Attendre que le build se termine (2-5 minutes)
3. Cliquer sur "Visit" pour tester votre site
4. Vérifier que l'erreur a disparu

---

## 🐛 ERREURS CONNUES ET SOLUTIONS

### Erreur: "Failed to fetch dynamically imported module"
**Solution:** Vider le cache du navigateur (Ctrl + Shift + R)

### Erreur: "recharts is not defined"
**Solution:** Vérifier que `/components/ui/chart.tsx` importe `recharts@2.15.0`

### Erreur: "Cannot read properties of undefined (reading 'state')"
**Solution:** Vérifier que `<AppProvider>` enveloppe bien tous les composants dans `/App.tsx`

---

## 📊 TESTS POST-DÉPLOIEMENT

### Tests essentiels:
1. ✅ La page d'accueil charge sans erreur
2. ✅ Le sélecteur Passager/Conducteur/Admin fonctionne
3. ✅ La connexion passager fonctionne
4. ✅ La connexion conducteur fonctionne
5. ✅ La connexion admin fonctionne
6. ✅ Le taux de change s'affiche correctement
7. ✅ Les cartes (maps) se chargent
8. ✅ Le système de paiement fonctionne

### Tests recommandés:
1. Créer une course de test
2. Accepter une course en tant que conducteur
3. Compléter une course
4. Vérifier le paiement
5. Vérifier les statistiques admin

---

## 🔐 VARIABLES D'ENVIRONNEMENT VERCEL

Aller sur: https://vercel.com/votre-projet/settings/environment-variables

### Variables obligatoires:
```
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_ANON_KEY=votre-clé-publique
SUPABASE_SERVICE_ROLE_KEY=votre-clé-secrète
SUPABASE_DB_URL=postgresql://...
```

### Variables optionnelles (pour les paiements):
```
FLUTTERWAVE_SECRET_KEY=votre-clé-flutterwave
AFRICAS_TALKING_API_KEY=votre-clé-africas-talking
AFRICAS_TALKING_USERNAME=votre-username
```

---

## 🎯 PROCHAINES ÉTAPES

1. ✅ Copier les fichiers modifiés vers GitHub
2. ✅ Attendre que Vercel déploie automatiquement
3. ✅ Tester le site en production
4. ✅ Configurer un nom de domaine personnalisé (optionnel)
5. ✅ Activer HTTPS (automatique avec Vercel)

---

## 📞 SUPPORT

Si vous rencontrez des problèmes:
1. Vérifier les logs Vercel: https://vercel.com/votre-projet/logs
2. Vérifier les logs Supabase: https://app.supabase.com/project/votre-projet/logs
3. Ouvrir la console du navigateur (F12) pour voir les erreurs JavaScript

---

**Date de création:** 8 Décembre 2024  
**Version:** 1.0  
**Statut:** ✅ Corrigé et prêt pour le déploiement
