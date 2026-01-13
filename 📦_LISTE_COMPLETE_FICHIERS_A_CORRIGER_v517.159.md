# 🎯 LISTE COMPLÈTE DES 64 FICHIERS À CORRIGER

## ❌ PROBLÈME ACTUEL
82 occurrences d'imports CDN externes dans 64 fichiers :
- `from 'motion/react'` → doit devenir `from '../lib/motion'` ou `from '../../lib/motion'`
- `from 'framer-motion'` → doit devenir `from '../lib/motion'` ou `from '../../lib/motion'`
- `from 'sonner'` → doit devenir `from '../lib/toast'` ou `from '../../lib/toast'`

## ✅ CORRECTIONS À APPLIQUER

### Fichiers à la racine (utilisent `./lib`)
1. `/1_NavigationScreen.tsx` - Corrigé ✅
2. `/2_EarningsScreen.tsx` - 2 imports à corriger

### Fichiers dans `/components` (utilisent `../lib`)
3. `/components/ActiveRidesList.tsx`
4. `/components/AddressSearchInput.tsx`
5. `/components/AvailableDriversMap.tsx`
6. `/components/CancellationCompensation.tsx`
7. `/components/DebugPanel.tsx`
8. `/components/DiagnosticFloatingButton.tsx`
9. `/components/FreeWaitingToggle.tsx`
10. `/components/MarketingNotification.tsx`
11. `/components/OTPVerification.tsx` - 2 imports
12. `/components/PageTransition.tsx`
13. `/components/PaymentSuccessDialog.tsx`
14. `/components/PushNotifications.tsx`
15. `/components/RideCompletionSummary.tsx`
16. `/components/RideCompletionSummaryDialog.tsx`
17. `/components/RouteMapPreview.tsx`
18. `/components/UsersManagementScreen.tsx`
19. `/components/WelcomeDialog.tsx`
20. `/components/WelcomeMessage.tsx`

### Fichiers dans `/components/admin` (utilisent `../../lib`)
21. `/components/admin/AdminAnalyticsDashboard.tsx`
22. `/components/admin/AdminNotificationsCenter.tsx`
23. `/components/admin/AdminRegisterScreen.tsx`
24. `/components/admin/AdminToolsScreen.tsx` - 2 imports
25. `/components/admin/AdvancedAnalyticsDashboard.tsx` - 2 imports
26. `/components/admin/AuditLogsScreen.tsx` - 2 imports
27. `/components/admin/BackupAndRecoveryScreen.tsx`
28. `/components/admin/ChatMessagesScreen.tsx`
29. `/components/admin/ClientsListScreen.tsx` - 2 imports
30. `/components/admin/CustomerSupportScreen.tsx`
31. `/components/admin/DataCleanupPanel.tsx` - 2 imports
32. `/components/admin/DriverDetailModal.tsx`
33. `/components/admin/DriversListScreen.tsx`
34. `/components/admin/EmailHistoryScreen.tsx`
35. `/components/admin/EmailSettingsScreen.tsx` - 2 imports
36. `/components/admin/FinancialReportsScreen.tsx` - 2 imports
37. `/components/admin/GlobalSettingsScreen.tsx` - 2 imports
38. `/components/admin/PendingRechargesScreenNew.tsx`
39. `/components/admin/PostpaidRequestsScreen.tsx` - 2 imports
40. `/components/admin/QuickSMSActivation.tsx`
41. `/components/admin/RefundManagementScreen.tsx` - 2 imports
42. `/components/admin/SMSSettingsScreen.tsx`
43. `/components/admin/SettingsScreen.tsx`

### Fichiers dans `/components/driver` (utilisent `../../lib`)
44. `/components/driver/DriverBalanceManager.tsx`
45. `/components/driver/DriverLoginScreenNew.tsx` - 2 imports
46. `/components/driver/NewRideNotification.tsx`
47. `/components/driver/TimerControl.tsx`

### Fichiers dans `/components/passenger` (utilisent `../../lib`)
48. `/components/passenger/BookForSomeoneElse.tsx` - 2 imports
49. `/components/passenger/CancelRideReasonModal.tsx`
50. `/components/passenger/CustomerAssistant.tsx` - 2 imports
51. `/components/passenger/LoginScreen.tsx` - 2 imports
52. `/components/passenger/PaymentMethodScreen.tsx`
53. `/components/passenger/PaymentReceiptScreen.tsx` - 2 imports
54. `/components/passenger/ProfileScreen.tsx`
55. `/components/passenger/RatingDialog.tsx`
56. `/components/passenger/RechargeModal.tsx`
57. `/components/passenger/RideCompletedScreen.tsx`
58. `/components/passenger/RideHistoryScreen.tsx`
59. `/components/passenger/RideTrackingScreen.tsx`
60. `/components/passenger/ShareRide.tsx`
61. `/components/passenger/WalletScreen.tsx`
62. `/components/passenger/YangoStyleSearch.tsx`

### Fichiers dans `/components/ui` (utilisent `../../lib` sauf cas spéciaux)
63. `/components/ui/sonner.tsx` - **FICHIER SPÉCIAL - NE PAS MODIFIER** (fichier de compatibilité)

### Autres fichiers
64. `/GITHUB_EstimateScreen.tsx` - 2 imports

## 🔧 COMMANDE DE RECHERCHE POUR VÉRIFIER

```bash
# Compter les fichiers avec imports CDN
find . -name "*.tsx" -not -path "./node_modules/*" -exec grep -l "from ['\"]motion/react\|from ['\"]framer-motion\|from ['\"]sonner" {} \; | wc -l

# Lister les fichiers avec imports CDN
find . -name "*.tsx" -not -path "./node_modules/*" -exec grep -l "from ['\"]motion/react\|from ['\"]framer-motion\|from ['\"]sonner" {} \;
```

## 📝 EXEMPLES DE CORRECTIONS

### Exemple 1: Fichier dans `/components`
```tsx
// ❌ AVANT
import { motion } from 'motion/react';
import { toast } from 'sonner';

// ✅ APRÈS
import { motion } from '../lib/motion';
import { toast } from '../lib/toast';
```

### Exemple 2: Fichier dans `/components/admin` ou `/components/driver` ou `/components/passenger`
```tsx
// ❌ AVANT
import { motion } from 'motion/react';
import { toast } from 'sonner';

// ✅ APRÈS
import { motion } from '../../lib/motion';
import { toast } from '../../lib/toast';
```

### Exemple 3: Fichier à la racine `/`
```tsx
// ❌ AVANT
import { motion } from 'motion/react';
import { toast } from 'sonner';

// ✅ APRÈS
import { motion } from './lib/motion';
import { toast } from './lib/toast';
```

## 🚨 NOTES IMPORTANTES

1. **NE PAS MODIFIER** `/components/ui/sonner.tsx` - c'est un fichier de compatibilité qui doit garder l'import de "sonner"

2. **Vérifier le chemin relatif** selon la profondeur du fichier:
   - Racine `/` → `./lib/...`
   - `/components` → `../lib/...`
   - `/components/admin`, `/components/driver`, `/components/passenger` → `../../lib/...`

3. **Les deux fichiers d'implémentation sont**:
   - `/lib/motion.tsx` - Remplacement standalone de framer-motion et motion/react
   - `/lib/toast.ts` - Wrapper vers `/sonner.tsx`

## ✅ RÉSULTAT ATTENDU

Après corrections, ces commandes devraient retourner 0 :

```bash
# Doit retourner 0 (sauf /components/ui/sonner.tsx et /sonner.tsx qui sont OK)
find . -name "*.tsx" -not -path "./node_modules/*" -not -path "./components/ui/sonner.tsx" -not -path "./sonner.tsx" -exec grep -l "from ['\"]motion/react\|from ['\"]framer-motion\|from ['\"]sonner" {} \; | wc -l
```

## 📦 PROCHAINE ÉTAPE

Utiliser l'outil de recherche et remplacement pour corriger tous ces fichiers automatiquement.
