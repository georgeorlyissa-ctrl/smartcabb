# 📚 LUCIDE-REACT@0.263.1 - ICÔNES DISPONIBLES

⚠️ **VERSION VERROUILLÉE** : `lucide-react@0.263.1`

## ❌ Icônes NON disponibles (n'existent pas dans 0.263.1)

- `Route` → Utiliser `Navigation` à la place

## ✅ Icônes couramment utilisées dans SmartCabb

### Navigation
- `ArrowLeft`, `ArrowRight`, `ArrowUp`, `ArrowDown`
- `ChevronLeft`, `ChevronRight`, `ChevronUp`, `ChevronDown`
- `Navigation` (pour les trajets)
- `MapPin` (pour les positions)

### Actions
- `X`, `Check`, `CheckCircle`, `XCircle`
- `Plus`, `Minus`
- `Trash2`, `Edit`, `Save`
- `Search`, `Filter`
- `RefreshCw`, `Loader2`

### Utilisateur & Conducteur
- `User`, `Users`
- `Car`
- `Shield`
- `Star` (notation)

### Paiement
- `CreditCard`
- `Smartphone` (Mobile Money)
- `Banknote`, `DollarSign`
- `Receipt`

### Communication
- `Phone`, `Mail`
- `MessageCircle`
- `Bell`

### Temps & Calendrier
- `Clock`, `Calendar`
- `Timer`

### UI
- `Settings` (ou `SettingsIcon`)
- `Info`, `AlertCircle`, `AlertTriangle`
- `Eye`, `EyeOff`
- `HelpCircle`
- `Home`
- `Menu`, `MoreVertical`, `MoreHorizontal`

### Statistiques
- `TrendingUp`, `TrendingDown`
- `BarChart`, `PieChart`

## 🔍 Vérifier si une icône existe

Avant d'utiliser une nouvelle icône, vérifier qu'elle existe dans `0.263.1` :

```tsx
// ✅ BON
import { Navigation } from 'lucide-react';

// ❌ MAUVAIS (n'existe pas)
import { Route } from 'lucide-react';
```

## 📝 Alternative si icône manquante

Si une icône spécifique n'existe pas, utiliser une alternative :
- `Route` → `Navigation`
- Autres à documenter au fur et à mesure

## ⚠️ NE PAS mettre à jour lucide-react

La version `0.263.1` est **verrouillée** pour éviter les erreurs de build.
Ne pas mettre à jour sans tests exhaustifs de tous les composants.
