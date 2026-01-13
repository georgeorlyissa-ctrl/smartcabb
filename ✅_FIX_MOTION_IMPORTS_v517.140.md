# ✅ FIX MOTION IMPORTS - v517.140

## 🎯 Problème
Les imports `from 'motion/react'` ne fonctionnent PAS dans Figma Make car cet environnement n'utilise pas Vite mais esbuild directement avec esm.sh.

## 🔧 Solution
Remplacer TOUS les imports `motion/react` par des imports relatifs vers `/lib/motion.tsx` ou `/lib/motion`.

## 📝 Règles de remplacement

### Pour les fichiers à la RACINE (/)
```typescript
// ❌ AVANT
import { motion } from 'motion/react';

// ✅ APRÈS
import { motion } from './lib/motion';
```

### Pour les fichiers dans /components
```typescript
// ❌ AVANT
import { motion } from 'motion/react';

// ✅ APRÈS
import { motion } from '../lib/motion';
```

### Pour les fichiers dans /components/admin, /components/auth, /components/driver, /components/passenger
```typescript
// ❌ AVANT
import { motion } from 'motion/react';

// ✅ APRÈS
import { motion } from '../../lib/motion';
```

### Pour les fichiers dans /pages
```typescript
// ❌ AVANT
import { motion } from 'motion/react';

// ✅ APRÈS
import { motion } from '../lib/motion';
```

## 📋 Liste complète des 60 fichiers à corriger

### Racine (3 fichiers) - Utiliser `'./lib/motion'`
- [ ] /1_NavigationScreen.tsx
- [ ] /2_EarningsScreen.tsx
- [ ] /GITHUB_EstimateScreen.tsx

### /components (17 fichiers) - Utiliser `'../lib/motion'`
- [ ] /components/ActiveRidesList.tsx
- [ ] /components/AddressSearchInput.tsx (aussi AnimatePresence)
- [ ] /components/AvailableDriversMap.tsx
- [ ] /components/CurrencySelector.tsx
- [ ] /components/DebugPanel.tsx
- [ ] /components/DiagnosticFloatingButton.tsx (aussi AnimatePresence)
- [ ] /components/LiveStatsPanel.tsx
- [ ] /components/MarketingNotification.tsx (aussi AnimatePresence)
- [ ] /components/MixedPaymentSelector.tsx (aussi AnimatePresence)
- [ ] /components/OTPVerification.tsx (aussi AnimatePresence)
- [ ] /components/PageTransition.tsx (aussi AnimatePresence)
- [ ] /components/RideCompletionSummary.tsx
- [ ] /components/RideCompletionSummaryDialog.tsx
- [ ] /components/RouteMapPreview.tsx (aussi AnimatePresence)
- [ ] /components/TestimonialsCarousel.tsx (aussi AnimatePresence)
- [ ] /components/WelcomeBackScreen.tsx
- [ ] /components/WelcomeDialog.tsx
- [ ] /components/WelcomeMessage.tsx (aussi AnimatePresence)

### /components/admin (14 fichiers) - Utiliser `'../../lib/motion'`
- [ ] /components/admin/AdminRegisterScreen.tsx
- [ ] /components/admin/AdminToolsScreen.tsx
- [ ] /components/admin/AdvancedAnalyticsDashboard.tsx
- [ ] /components/admin/AuditLogsScreen.tsx
- [ ] /components/admin/ClientsListScreen.tsx
- [ ] /components/admin/DataCleanupPanel.tsx (aussi AnimatePresence)
- [ ] /components/admin/DriversListScreen.tsx
- [ ] /components/admin/EmailHistoryScreen.tsx
- [ ] /components/admin/EmailSettingsScreen.tsx
- [ ] /components/admin/FinancialReportsScreen.tsx
- [ ] /components/admin/GlobalSettingsScreen.tsx
- [ ] /components/admin/PostpaidRequestsScreen.tsx
- [ ] /components/admin/RefundManagementScreen.tsx
- [ ] /components/admin/SettingsScreen.tsx

### /components/auth (3 fichiers) - Utiliser `'../../lib/motion'`
- [x] /components/auth/ForgotPasswordPage.tsx ✅ DÉJÀ CORRIGÉ
- [ ] /components/auth/CreateAuthFromProfilePage.tsx
- [ ] /components/auth/ResetPasswordByPhonePage.tsx
- [ ] /components/auth/ResetPasswordPage.tsx

### /components/driver (6 fichiers) - Utiliser `'../../lib/motion'`
- [ ] /components/driver/DriverDashboard.tsx
- [ ] /components/driver/DriverLoginScreenNew.tsx
- [ ] /components/driver/DriverProfileScreen.tsx
- [ ] /components/driver/DriverWelcomeScreen.tsx
- [ ] /components/driver/EarningsScreen.tsx
- [ ] /components/driver/NewRideNotification.tsx

### /components/passenger (12 fichiers) - Utiliser `'../../lib/motion'`
- [ ] /components/passenger/BookForSomeoneElse.tsx (aussi AnimatePresence)
- [ ] /components/passenger/EstimateScreen.tsx
- [ ] /components/passenger/MapScreen.tsx
- [ ] /components/passenger/PaymentReceiptScreen.tsx
- [ ] /components/passenger/PrivacySettingsScreen.tsx
- [ ] /components/passenger/RechargeModal.tsx (aussi AnimatePresence)
- [ ] /components/passenger/RideCompletedScreen.tsx
- [ ] /components/passenger/RideInProgressScreen.tsx (aussi AnimatePresence)
- [ ] /components/passenger/RideScreen.tsx (aussi AnimatePresence)
- [ ] /components/passenger/SettingsScreen.tsx
- [ ] /components/passenger/LiveTrackingMap.tsx
- [ ] /components/passenger/YangoStyleSearch.tsx (aussi AnimatePresence)

### /pages (4 fichiers) - Utiliser `'../lib/motion'`
- [ ] /pages/AboutPage.tsx
- [ ] /pages/LandingPage.tsx
- [x] /pages/TermsPage.tsx ✅ DÉJÀ CORRIGÉ
- [ ] /pages/LegalPage.tsx
- [ ] /pages/PrivacyPage.tsx

## 🚀 Commande de remplacement (pour référence)

```bash
# Cette commande doit être exécutée FICHIER PAR FICHIER
# car chaque fichier a un chemin relatif différent

# Exemple pour un fichier dans /components
sed -i "s|from 'motion/react'|from '../lib/motion'|g" /components/AddressSearchInput.tsx

# Exemple pour un fichier dans /components/passenger
sed -i "s|from 'motion/react'|from '../../lib/motion'|g" /components/passenger/EstimateScreen.tsx

# Exemple pour un fichier dans /pages
sed -i "s|from 'motion/react'|from '../lib/motion'|g" /pages/AboutPage.tsx
```

## ⚠️ IMPORTANT

**Figma Make n'utilise PAS les alias Vite** définis dans `vite.config.ts` et `tsconfig.json`.  
Il utilise esbuild directement avec esm.sh comme CDN.

Donc les imports DOIVENT être des chemins relatifs:
- ✅ `import { motion } from '../lib/motion'`
- ❌ `import { motion } from 'motion/react'` (ne fonctionne pas)

## 📊 État actuel

- ✅ 2 fichiers corrigés:
  - `/components/auth/ForgotPasswordPage.tsx`
  - `/pages/TermsPage.tsx`

- ❌ 58 fichiers restants à corriger

## 🎯 Action requise

Je vais corriger les fichiers les plus critiques en premier:
1. Fichiers de pages (LandingPage, AboutPage, etc.)
2. Fichiers de composants passagers (EstimateScreen, MapScreen, etc.)
3. Fichiers de composants conducteurs
4. Fichiers d'admin

---

**Version:** v517.140  
**Date:** 14 janvier 2025  
**Statut:** 🔧 EN COURS - 2/60 fichiers corrigés
