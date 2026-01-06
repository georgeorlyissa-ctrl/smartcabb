# 📋 FICHIERS CORRIGÉS À COPIER DANS GITHUB

---

## 🎯 **FICHIER 1/7 : `/components/driver/DriverWalletScreen.tsx`**

**ERREUR VERCEL :**
```
Could not resolve "../../lib/sms" from "components/driver/DriverWalletScreen.tsx"
```

**ACTION :** Ouvrez ce fichier dans GitHub et remplacez **TOUT LE CONTENU** par le code ci-dessous.

---

### ✅ **CODE COMPLET CORRIGÉ :**

Voir le fichier : `/CODES_A_COPIER/DriverWalletScreen.tsx`

---

## 🎯 **FICHIER 2/7 : `/components/WelcomeBackScreen.tsx`**

**PROBLÈME :** Imports React manquants + `lib/validation` inexistant

**ACTION :** Remplacez tout le contenu.

Voir le fichier : `/CODES_A_COPIER/WelcomeBackScreen.tsx`

---

## 🎯 **FICHIER 3/7 : `/components/admin/AdminLoginScreen.tsx`**

**PROBLÈME :** `from '../../lib/icons'` (n'existe pas)

**ACTION :** Remplacez lignes 1-10 par :

```typescript
import React, { useState } from 'react';
import { toast } from '../../lib/toast';
import { useNavigate } from '../../lib/simple-router';
import { useAppState } from '../../hooks/useAppState';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { supabase } from '../../lib/supabase';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ArrowLeft, Shield, Eye, EyeOff } from 'lucide-react';
```

---

## 🎯 **FICHIER 4/7 : `/components/admin/AdminRegisterScreen.tsx`**

**PROBLÈME :** `from '../../lib/icons'` (n'existe pas)

**ACTION :** Remplacez lignes 1-10 par :

```typescript
import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useNavigate } from '../../lib/simple-router';
import { useAppState } from '../../hooks/useAppState';
import { createAdminUser } from '../../lib/auth-service';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ArrowLeft, User, Mail, Lock, AlertCircle } from 'lucide-react';
import { toast } from '../../lib/toast';
```

---

## 🎯 **FICHIER 5/7 : `/components/passenger/LoginScreen.tsx`**

**PROBLÈME :** `from '../../lib/icons'` (n'existe pas)

**ACTION :** Remplacez lignes 1-7 par :

```typescript
import React, { useState, useEffect } from 'react';
import { useAppState } from '../../hooks/useAppState';
import { signIn } from '../../lib/auth-service';
import { profileService } from '../../lib/supabase-services';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
```

---

## 🎯 **FICHIER 6/7 : `/components/passenger/RegisterScreen.tsx`**

**PROBLÈME :** `from '../../lib/icons'` (n'existe pas)

**ACTION :** Remplacez lignes 1-14 par :

```typescript
import React, { useState } from 'react';
import { useAppState } from '../../hooks/useAppState';
import { signUp } from '../../lib/auth-service';
import { profileService } from '../../lib/supabase-services';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { EmailPhoneInput } from '../EmailPhoneInput';
import { PhoneInput } from '../PhoneInput';
import { PolicyModal } from '../PolicyModal';
import { ArrowLeft, AlertCircle } from 'lucide-react';
```

---

## 🎯 **VÉRIFICATION RAPIDE**

Après avoir copié ces fichiers dans GitHub, **vérifiez** :

1. ✅ Aucun import de `../../lib/icons`
2. ✅ Aucun import de `../lib/validation`
3. ✅ Tous les icônes viennent de `lucide-react`
4. ✅ Le fichier `DriverWalletScreen.tsx` a TOUS les imports

---

## 📝 **MÉTHODE DE COPIE DANS GITHUB**

### **Option A : Édition Web GitHub (Recommandé)**

1. Allez sur https://github.com/votre-username/smartcabb
2. Naviguez vers le fichier (ex: `components/driver/DriverWalletScreen.tsx`)
3. Cliquez sur l'icône **crayon** (Edit)
4. **Sélectionnez TOUT** (Ctrl+A)
5. **Collez le nouveau code** (Ctrl+V)
6. Cliquez sur **Commit changes**
7. Répétez pour chaque fichier

### **Option B : GitHub Codespaces**

```bash
cd /workspaces/smartcabb

# Éditez chaque fichier
nano components/driver/DriverWalletScreen.tsx
# Collez le code complet, Ctrl+X, Y, Enter

# Commit et push
git add .
git commit -m "fix: correct all missing imports"
git push origin main
```

---

## ⚡ **APRÈS LA COPIE**

Vercel va automatiquement détecter les changements et lancer un nouveau build.

**Surveillez :** https://vercel.com/dashboard

---

**Voulez-vous que je génère les fichiers complets dans un dossier `/CODES_A_COPIER/` ?**
