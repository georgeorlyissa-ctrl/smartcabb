# 🔧 GUIDE DE CORRECTION - Import sonner@2.0.3

## 🎯 PROBLÈME
Les erreurs de build viennent de l'import de `sonner` sans version spécifique. 

Selon les instructions de Figma Make, pour utiliser `toast` de sonner, il FAUT importer la version `2.0.3` explicitement.

## ✅ FICHIERS DÉJÀ CORRIGÉS (7)

1. ✅ `/App.tsx` - `import { Toaster } from 'sonner@2.0.3'`
2. ✅ `/lib/toast.ts` - `import { toast as sonnerToast } from 'sonner@2.0.3'`
3. ✅ `/hooks/usePayment.ts` - `import { toast } from 'sonner@2.0.3'`
4. ✅ `/hooks/useRealtimeRides.ts` - `import { toast } from 'sonner@2.0.3'`
5. ✅ `/components/CancellationCompensation.tsx` - `import { toast } from 'sonner@2.0.3'`
6. ✅ `/components/CommissionSettings.tsx` - `import { toast } from 'sonner@2.0.3'`
7. ✅ `/components/passenger/ProfileScreen.tsx` - `import { toast } from 'sonner@2.0.3'`

## ❌ FICHIERS RESTANTS À CORRIGER (42)

### Composants généraux (8)
- `/components/EmergencyAlert.tsx`
- `/components/FreeWaitingToggle.tsx`
- `/components/OTPVerification.tsx`
- `/components/PushNotifications.tsx`
- `/components/RLSBlockingScreen.tsx`
- `/components/RLSFixModal.tsx`
- `/components/TestSMSDirect.tsx`
- `/components/PWAInstallPrompt.tsx` (si existe)

### Composants admin (26)
- `/components/admin/AdminAnalyticsDashboard.tsx`
- `/components/admin/AdminDashboard.tsx`
- `/components/admin/AdminNotificationsCenter.tsx`
- `/components/admin/AdminToolsScreen.tsx`
- `/components/admin/AdvancedAnalyticsDashboard.tsx`
- `/components/admin/AuditLogsScreen.tsx`
- `/components/admin/AutoCleanupBanner.tsx`
- `/components/admin/BackupAndRecoveryScreen.tsx`
- `/components/admin/ChatMessagesScreen.tsx`
- `/components/admin/ClientsListScreen.tsx`
- `/components/admin/ContactMessagesScreen.tsx`
- `/components/admin/CustomerSupportScreen.tsx`
- `/components/admin/DataCleanupPanel.tsx`
- `/components/admin/DriverDetailModal.tsx`
- `/components/admin/DriversListScreen.tsx`
- `/components/admin/EmailSettingsScreen.tsx`
- `/components/admin/FinancialReportsScreen.tsx`
- `/components/admin/GlobalSettingsScreen.tsx`
- `/components/admin/PendingRechargesScreen.tsx`
- `/components/admin/PendingRechargesScreenNew.tsx`
- `/components/admin/PostpaidRequestsScreen.tsx`
- `/components/admin/QuickSMSActivation.tsx`
- `/components/admin/RefundManagementScreen.tsx`
- `/components/admin/SMSSettingsScreen.tsx`
- `/components/admin/SettingsScreen.tsx`
- `/components/admin/SMSBalanceCard.tsx`
- `/components/admin/RideMigrationTool.tsx`

### Composants auth (4)
- `/components/auth/CreateAuthFromProfilePage.tsx`
- `/components/auth/ForgotPasswordPage.tsx`
- `/components/auth/ResetPasswordByPhonePage.tsx`
- `/components/auth/ResetPasswordPage.tsx`

### Composants driver (4)
- `/components/driver/DriverDashboard.tsx`
- `/components/driver/DriverLoginScreen.tsx`
- `/components/driver/DriverLoginScreenNew.tsx`
- `/components/driver/DriverProfileScreen.tsx`
- `/components/driver/DriverRegistrationScreen.tsx`

##  🔄 REMPLACEMENT À EFFECTUER

### CHERCHER :
```typescript
import { toast } from 'sonner';
```
OU
```typescript
import { Toaster } from 'sonner';
```

### REMPLACER PAR :
```typescript
import { toast } from 'sonner@2.0.3';
```
OU
```typescript
import { Toaster } from 'sonner@2.0.3';
```

## 🚀 MÉTHODE RAPIDE

### Option 1 : Utiliser l'éditeur VSCode
1. Ouvre VSCode
2. Appuie sur `CTRL+SHIFT+H` (ou `CMD+SHIFT+H` sur Mac)
3. Dans "Chercher" : `from 'sonner'`
4. Dans "Remplacer" : `from 'sonner@2.0.3'`
5. Clique sur "Remplacer tout"

### Option 2 : Script bash
```bash
# Remplacer dans tous les fichiers .tsx
find . -name "*.tsx" -type f -exec sed -i "s/from 'sonner'/from 'sonner@2.0.3'/g" {} +
find . -name "*.tsx" -type f -exec sed -i 's/from "sonner"/from "sonner@2.0.3"/g' {} +
```

### Option 3 : Manuellement (si les 2 autres ne fonctionnent pas)
Ouvre chaque fichier listé ci-dessus et remplace `from 'sonner'` par `from 'sonner@2.0.3'`

## ✅ VÉRIFICATION

Après correction, vérifie que :
1. ✅ Tous les imports `sonner` ont la version `@2.0.3`
2. ✅ Le build passe sans erreur
3. ✅ L'application se charge correctement

## 🎉 RÉSULTAT ATTENDU

Après correction, le build devrait passer et tu devrais voir :
```
✅ Build successful!
```

Au lieu de :
```
❌ ERROR: [plugin: npm] Failed to fetch
```

---

**Note importante** : Cette correction est nécessaire car Figma Make utilise un système de build spécifique qui nécessite des versions explicites pour certains packages comme `sonner`. C'est documenté dans les instructions système.
