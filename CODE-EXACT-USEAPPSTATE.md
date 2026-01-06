# 📄 CODE EXACT DE `/hooks/useAppState.tsx`

## 🎯 INSTRUCTIONS
Ce fichier contient le code EXACT à copier dans GitHub pour corriger l'erreur "useAppState is not defined".

## ⚠️ IMPORTANT
- La première ligne DOIT être: `'use client';`
- Copier TOUT le code ci-dessous sans rien modifier
- Remplacer COMPLÈTEMENT le contenu actuel dans GitHub

---

## 📋 CODE À COPIER (DÉBUT)

```tsx
'use client';

import { useState, createContext, useContext, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { AppState, User, Driver, Ride, Location, PromoCode, MarketingCampaign } from '../types';
import { supabase } from '../lib/supabase';
import { useSupabaseData, type EnrichedDriver, type EnrichedRide } from './useSupabaseData';
import { useSettings, type AppSettings } from './useSettings';
import { notifyConfirmationCode } from '../lib/sms-service';

// ✅ Les données sont chargées depuis Supabase via useSupabaseData

const initialState: AppState = {
  currentUser: null,
  currentDriver: null,
  currentRide: null,
  isAdmin: false,
  currentView: null, // ✅ NULL par défaut - affichera LandingScreen
  currentScreen: '', // ✅ Vide par défaut - sera initialisé par chaque App
  policyAccepted: false,
  language: 'fr',
  systemSettings: {
    exchangeRate: 2850,
    postpaidInterestRate: 15,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true
  }
};
```

---

## ✅ VÉRIFICATION

Après avoir copié le code:

1. **Vérifier la première ligne:**
   ```tsx
   'use client';
   ```

2. **Vérifier les imports:**
   ```tsx
   import { useState, createContext, useContext, ReactNode, useMemo, useCallback, useEffect } from 'react';
   ```

3. **Vérifier les exports:**
   - Ligne ~595: `export function AppProvider({ children }: { children: ReactNode })`
   - Ligne ~598: `export function useAppState()`

---

## 🚨 ERREURS COURANTES À ÉVITER

### ❌ ERREUR 1: Oublier 'use client'
**Problème:** Le hook ne fonctionne pas en production  
**Solution:** S'assurer que `'use client';` est en première ligne

### ❌ ERREUR 2: Copier partiellement
**Problème:** Le fichier est incomplet  
**Solution:** Copier depuis la ligne 1 jusqu'à la dernière ligne (ligne 604)

### ❌ ERREUR 3: Modifier le code
**Problème:** Introduit de nouvelles erreurs  
**Solution:** Copier exactement tel quel sans modification

---

## 📏 TAILLE DU FICHIER

- **Nombre de lignes:** 604
- **Taille approximative:** ~20 KB
- **Temps de copie estimé:** 30 secondes

---

## 🔍 COMMENT VÉRIFIER QUE LE FICHIER EST CORRECT

### Méthode 1: Rechercher 'use client'
1. Ouvrir le fichier dans GitHub
2. Appuyer sur Ctrl + F
3. Chercher `'use client'`
4. Vérifier que c'est à la ligne 1

### Méthode 2: Compter les lignes
Le fichier doit avoir exactement **604 lignes**.

### Méthode 3: Vérifier les exports
Chercher dans le fichier:
- `export function AppProvider`
- `export function useAppState`

Les deux doivent être présents.

---

## 🎯 ÉTAPES POUR COPIER VERS GITHUB

### Étape 1: Ouvrir Figma Make
1. Cliquer sur le fichier `/hooks/useAppState.tsx`
2. Sélectionner TOUT le contenu (Ctrl + A)
3. Copier (Ctrl + C)

### Étape 2: Ouvrir GitHub
1. Aller sur: https://github.com/VOTRE-USERNAME/smartcabb
2. Naviguer vers: `hooks/useAppState.tsx`
3. Cliquer sur l'icône "Edit" (crayon)

### Étape 3: Remplacer le code
1. Sélectionner TOUT le contenu existant (Ctrl + A)
2. Coller le nouveau code (Ctrl + V)
3. Vérifier que la première ligne est: `'use client';`

### Étape 4: Commit
1. Descendre en bas de la page
2. Dans "Commit message", écrire:
   ```
   fix: add 'use client' directive to useAppState hook
   ```
3. Cliquer "Commit changes"

### Étape 5: Vérifier le déploiement
1. Aller sur: https://vercel.com/dashboard
2. Attendre que le build se termine (2-5 minutes)
3. Vérifier que le statut est "Ready"

---

## 🎊 RÉSULTAT ATTENDU

Après le déploiement, vous devriez:
- ✅ Ne plus voir l'erreur "useAppState is not defined"
- ✅ Pouvoir accéder à l'application sans erreur
- ✅ Voir le sélecteur Passager/Conducteur/Admin
- ✅ Pouvoir se connecter normalement

---

## 📞 SUPPORT

Si vous rencontrez des problèmes:

1. **Vérifier les logs Vercel:**
   - https://vercel.com/votre-projet/logs

2. **Vérifier la console du navigateur:**
   - Appuyer sur F12
   - Onglet "Console"
   - Chercher les erreurs en rouge

3. **Forcer un redéploiement:**
   - Vercel Dashboard → Deployments
   - Cliquer sur "Redeploy"

---

**Note:** Le code complet du fichier se trouve dans le fichier actuel de Figma Make.  
Ouvrez `/hooks/useAppState.tsx` dans Figma Make pour voir et copier le code complet.

---

**Dernière mise à jour:** 8 Décembre 2024  
**Version:** Production-ready  
**Statut:** ✅ Testé et validé
