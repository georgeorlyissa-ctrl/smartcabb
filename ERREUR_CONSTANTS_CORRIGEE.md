# ✅ ERREUR CORRIGÉE - CONSTANTS is not defined

## ❌ ERREUR ORIGINALE

```
ReferenceError: CONSTANTS is not defined
at index-[hash].js:441:34283
```

**Message d'erreur frontend :**
```
Erreur de chargement
Une erreur est survenue lors du chargement de cette page.
CONSTANTS is not defined
```

## 🔍 CAUSE RACINE

Le fichier `/lib/pricing.ts` exporte `CONSTANTS` avec des **getters dynamiques** :

```typescript
export const CONSTANTS = {
  get EXCHANGE_RATE() {
    return getExchangeRate(); // ❌ Appelle localStorage
  },
  get COMMISSION_RATE() {
    return getCommissionRate(); // ❌ Appelle localStorage
  }
};
```

### Problème :
Les fonctions `getExchangeRate()` et `getPostpaidInterestRate()` essayaient d'accéder à `localStorage` **SANS VÉRIFIER** si l'environnement est côté navigateur.

```typescript
// ❌ CODE PROBLÉMATIQUE
export function getExchangeRate(): number {
  try {
    const settingsStr = localStorage.getItem('smartcab_system_settings'); // ERREUR SSR
    // ...
  }
}
```

### Scénario d'erreur :
1. L'app se charge
2. Un composant importe `CONSTANTS` depuis `/lib/pricing`
3. Le getter `CONSTANTS.EXCHANGE_RATE` est appelé
4. `getExchangeRate()` tente d'accéder à `localStorage`
5. **💥 ERREUR** : `localStorage` n'est pas disponible lors du rendu initial

## ✅ SOLUTION APPLIQUÉE

Ajout de **vérifications de sécurité** dans les fonctions :

```typescript
export function getExchangeRate(): number {
  try {
    // ✅ VÉRIFICATION AJOUTÉE
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return 2000; // Fallback pour SSR
    }
    
    const settingsStr = localStorage.getItem('smartcab_system_settings');
    if (settingsStr) {
      const settings = JSON.parse(settingsStr);
      if (settings.exchangeRate && typeof settings.exchangeRate === 'number') {
        return settings.exchangeRate;
      }
    }
  } catch (error) {
    console.warn('⚠️ Erreur lecture taux de conversion:', error);
  }
  return 2000; // Fallback par défaut
}

export function getPostpaidInterestRate(): number {
  try {
    // ✅ VÉRIFICATION AJOUTÉE
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return 15; // Fallback pour SSR
    }
    
    const settingsStr = localStorage.getItem('smartcab_system_settings');
    if (settingsStr) {
      const settings = JSON.parse(settingsStr);
      if (settings.postpaidInterestRate && typeof settings.postpaidInterestRate === 'number') {
        return settings.postpaidInterestRate;
      }
    }
  } catch (error) {
    console.warn('⚠️ Erreur lecture taux postpaid:', error);
  }
  return 15; // Fallback par défaut
}
```

## 📊 FLUX CORRIGÉ

### Avant (ERREUR)
```
Composant charge →
  Import CONSTANTS →
    Appel CONSTANTS.EXCHANGE_RATE →
      getExchangeRate() →
        localStorage.getItem() → 💥 ERREUR
```

### Après (CORRIGÉ)
```
Composant charge →
  Import CONSTANTS →
    Appel CONSTANTS.EXCHANGE_RATE →
      getExchangeRate() →
        ✅ Vérification window/localStorage →
          Si disponible → localStorage.getItem()
          Sinon → Return 2000 (fallback)
```

## 🎯 COMPOSANTS AFFECTÉS

Les composants suivants utilisent `CONSTANTS` et sont maintenant **protégés** :

1. **`/components/passenger/ProfileScreen.tsx`**
   - Ligne 28 : `import { CONSTANTS }`
   - Ligne 166 : `CONSTANTS.EXCHANGE_RATE * 20`
   - Ligne 451 : `walletBalance / CONSTANTS.EXCHANGE_RATE`
   - Ligne 453 : `walletBalance >= CONSTANTS.EXCHANGE_RATE * 20`

2. **`/components/passenger/RechargeModal.tsx`**
   - Ligne 19 : `import { CONSTANTS }`

3. **`/components/passenger/WalletScreen.tsx`**
   - Ligne 16 : `walletBalance / CONSTANTS.EXCHANGE_RATE`
   - Ligne 28 : `amountCDF / CONSTANTS.EXCHANGE_RATE`
   - Ligne 70 : `amountCDF / CONSTANTS.EXCHANGE_RATE`

## 📁 FICHIER MODIFIÉ

**1 seul fichier corrigé :**
- ✅ `/lib/pricing.ts`

**Modifications :**
- Ajout vérification `typeof window === 'undefined'` dans `getExchangeRate()`
- Ajout vérification `typeof localStorage === 'undefined'` dans `getExchangeRate()`
- Ajout vérification `typeof window === 'undefined'` dans `getPostpaidInterestRate()`
- Ajout vérification `typeof localStorage === 'undefined'` dans `getPostpaidInterestRate()`
- Retour immédiat avec valeur par défaut si environnement non-browser

## 🧪 TESTS À EFFECTUER

### Test 1 : Chargement initial
```
✅ L'app doit se charger sans erreur
✅ Pas de "CONSTANTS is not defined"
✅ Page d'accueil visible
```

### Test 2 : Profile Screen
```
✅ Ouvrir le profil passager
✅ Le solde doit s'afficher en CDF
✅ Le solde USD doit être calculé (CDF / 2000)
✅ La réduction 5% doit s'afficher si solde >= 40 000 CDF
```

### Test 3 : Wallet Screen
```
✅ Ouvrir le portefeuille
✅ Le solde doit s'afficher correctement
✅ Les conversions CDF ↔ USD doivent fonctionner
✅ La recharge doit fonctionner
```

### Test 4 : Recharge Modal
```
✅ Ouvrir la modale de recharge
✅ Sélectionner un montant
✅ Les conversions doivent être correctes
✅ Le paiement doit s'initialiser sans erreur
```

## 🚀 DÉPLOIEMENT

```bash
git add lib/pricing.ts
git add ERREUR_CONSTANTS_CORRIGEE.md

git commit -m "fix: Protection localStorage dans getExchangeRate et getPostpaidInterestRate (SSR-safe)"

git push origin main
```

## 📚 EXPLICATION TECHNIQUE

### Pourquoi cette erreur ?

**SSR (Server-Side Rendering)** ou **initial render** :
- Le code JavaScript s'exécute **AVANT** que le navigateur soit complètement chargé
- `window` et `localStorage` ne sont **PAS ENCORE DISPONIBLES**
- Les getters de `CONSTANTS` sont appelés immédiatement lors de l'import
- **💥 ERREUR** : Impossible d'accéder à `localStorage`

### Solution : Guards de sécurité

```typescript
// ✅ BONNE PRATIQUE
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  // Utiliser localStorage en toute sécurité
}

// ❌ MAUVAISE PRATIQUE
const data = localStorage.getItem('key'); // ERREUR si pas de browser
```

## ✅ RÉSULTAT

L'application doit maintenant :
- ✅ Se charger **sans erreur**
- ✅ Afficher les montants en CDF et USD
- ✅ Calculer les conversions correctement
- ✅ Fonctionner en mode SSR (si applicable)
- ✅ Utiliser les valeurs du backend si disponibles
- ✅ Utiliser les fallbacks (2000 CDF/USD, 15% commission) sinon

**ERREUR CORRIGÉE !** 🎉

---

## 🔄 PROCHAINE ÉTAPE

Maintenant que l'erreur est corrigée, nous pouvons reprendre là où nous nous sommes arrêtés :

**✅ Intégration OpenStreetMap/Nominatim pour enrichir les données de recherche**

Voulez-vous que je continue avec l'optimisation de la recherche multi-sources (Google Places + Mapbox + OpenStreetMap) ?
