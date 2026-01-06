# 🔧 FIX SONNER IMPORTS - v517.100

## ❌ PROBLÈME

Les erreurs de build sont causées par 84 fichiers qui importent `sonner` sans version :
```tsx
import { toast } from 'sonner';  // ❌ ERREUR
import { Toaster } from 'sonner';  // ❌ ERREUR
```

## ✅ SOLUTION

Remplacer PAR TOUS par :
```tsx
import { toast } from 'sonner@2.0.3';  // ✅ CORRECT  
import { Toaster } from 'sonner@2.0.3';  // ✅ CORRECT
```

## 🚀 MÉTHODE RAPIDE (Terminal)

**Dans le terminal à la racine du projet** :

```bash
# Remplacer tous les imports en une seule commande
chmod +x fix-sonner-imports.sh
./fix-sonner-imports.sh
```

OU directement avec `sed`:

```bash
# Pour Mac/Linux
find . -name "*.tsx" -type f -exec sed -i '' "s/from 'sonner';/from 'sonner@2.0.3';/g" {} \;

# Pour Linux
find . -name "*.tsx" -type f -exec sed -i "s/from 'sonner';/from 'sonner@2.0.3';/g" {} \;
```

## 📝 MÉTHODE MANUELLE (VS Code)

1. **Ouvrir VS Code**
2. **CTRL + SHIFT + H** (Rechercher et remplacer dans tous les fichiers)
3. **Rechercher** : `from 'sonner';`
4. **Remplacer par** : `from 'sonner@2.0.3';`
5. **Cliquer sur "Remplacer tout"**

## ✅ VERIFICATION

Après le remplacement, vérifier :

```bash
# Compter les anciens imports (devrait être 0)
grep -r "from 'sonner';" --include="*.tsx" . | wc -l

# Compter les nouveaux imports (devrait être 84+)
grep -r "from 'sonner@2.0.3';" --include="*.tsx" . | wc -l
```

## 📦 FICHIERS À CORRIGER (84)

Liste complète des fichiers :
- `/App.tsx` ← **CRITIQUE** (déjà corrigé)
- `/components/passenger/ProfileScreen.tsx` ← Imports React manquants aussi !
- `/components/admin/AuditLogsScreen.tsx`
- `/components/admin/RideMigrationTool.tsx`
- + 80 autres fichiers...

## ⚠️ ATTENTION SPÉCIALE: Profile Screen

Le fichier `/components/passenger/ProfileScreen.tsx` a **DEUX PROBLÈMES** :

1. ❌ Import sonner sans version
2. ❌ Imports React manquants (useState, useEffect, useAppState, etc.)

**Correction complète nécessaire** :

```tsx
// ✅ IMPORTS COMPLETS
import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { motion } from 'motion/react';
import { useAppState } from '../../hooks/useAppState';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowLeft, 
  Edit, 
  Edit3,
  Save, 
  X, 
  Shield, 
  Wallet, 
  ChevronRight,
  Calendar,
  Smartphone,
  CreditCard,
  Banknote
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';  // ✅ VERSION SPÉCIFIQUE
import { supabase } from '../../lib/supabase';
import { formatCDF, CONSTANTS } from '../../lib/pricing';
import { syncUserProfile } from '../../lib/sync-service';
import { sendSMS } from '../../lib/sms-service';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

export function ProfileScreen() {
  // ... reste du code
}
```

## 🎯 APRÈS CORRECTION

1. **Vérifier la compilation** :
   ```bash
   npm run build
   ```

2. **Si OK, déployer** :
   ```bash
   git add .
   git commit -m "✅ v517.100: Fix sonner imports - Utiliser sonner@2.0.3"
   git push origin main
   ```

3. **Attendre le déploiement Vercel** (2-3 min)

4. **Vider le cache** et tester

---

**Version** : v517.100  
**Date** : 2 janvier 2026  
**Urgence** : 🔴 CRITIQUE - Bloque la compilation
