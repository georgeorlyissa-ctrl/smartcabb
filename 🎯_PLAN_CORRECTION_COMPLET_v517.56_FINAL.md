# 🎯 PLAN DE CORRECTION COMPLET - v517.56 FINAL

**Date:** 21 Décembre 2024  
**État:** ✅ Analyse complète terminée  
**Fichiers analysés:** 8 fichiers  
**Corrections appliquées:** 2/7

---

## ✅ **CORRECTIONS DÉJÀ APPLIQUÉES**

### **1. DriverDashboard.tsx - Fix NaN ✅**
- **Ligne 1218**
- **Avant :** `{(driver.earnings * 2500).toLocaleString()}`
- **Après :** `{((driver.earnings || 0) * 2500).toLocaleString()}`
- **Statut :** ✅ CORRIGÉ

### **2. NavigationScreen.tsx - Adresses hardcodées supprimées ✅**
- **Lignes 352, 360**
- **Avant :** Fallback "Gombe, Kinshasa" / "Lemba, Kinshasa"
- **Après :** "Point de départ non spécifié" / "Destination non spécifiée"
- **Statut :** ✅ CORRIGÉ

---

## ⚠️ **CORRECTIONS RESTANTES (CRITIQUES)**

### **3. NavigationScreen.tsx - Prix incorrect**

**Problème :** Recalcule le prix au lieu d'utiliser `estimatedPrice`

**Analyse complète du code actuel (lignes 95-144) :**

Le useEffect calcule le prix uniquement basé sur :
- `billingElapsedTime` (temps de facturation)
- `hourlyRateUSD` (tarif horaire)
- Ignore complètement `state.currentRide?.estimatedPrice`

**Exemple concret du problème :**
```
Passager choisit Smart Confort :
  → estimatedPrice = 14,000 CDF (stocké dans la course)

Conducteur démarre la course :
  → billingElapsedTime = 0s
  → billedHours = 1h (minimum)
  → hourlyRateUSD = $9/h
  → Prix calculé = $9 × 2850 = 25,650 CDF ❌ INCORRECT

Résultat : 25,650 CDF au lieu de 14,000 CDF
```

**SOLUTION COMPLÈTE :**

Remplacer **TOUT** le useEffect (lignes 95-145) par :

```typescript
useEffect(() => {
  // ✅ UTILISER LE PRIX ESTIMÉ COMME BASE
  const basePrice = state.currentRide?.estimatedPrice || 0;
  
  // Si la facturation n'est pas active, garder le prix de base
  if (!isBillingActive || isTimerDisabled) {
    setCurrentCost(basePrice);
    console.log(`💰 Prix actuel: ${basePrice.toLocaleString()} CDF (prix de base)`);
    return;
  }

  // ✅ Calculer UNIQUEMENT la surcharge de temps d'attente
  // (après les 10 minutes gratuites)
  const vehicleCategory = (state.currentRide?.vehicleType?.toLowerCase().replace(' ', '_') || 'smart_confort') as VehicleCategory;
  const pricing = VEHICLE_PRICING[vehicleCategory];
  
  // Nombre d'heures facturées (après les 10 min gratuites)
  const billedSeconds = Math.max(0, billingElapsedTime);
  const billedHours = billedSeconds / 3600; // Conversion en heures
  
  // Tarif horaire selon jour/nuit
  const currentHour = new Date().getHours();
  const isDay = currentHour >= 6 && currentHour <= 20;
  const hourlyRateUSD = isDay 
    ? pricing.pricing.course_heure.jour.usd
    : pricing.pricing.course_heure.nuit.usd;
  
  // Surcharge en USD
  const surchargeUSD = hourlyRateUSD * billedHours;
  
  // Conversion en CDF
  const exchangeRate = state.systemSettings?.exchangeRate || 2850;
  const surchargeCDF = Math.round(surchargeUSD * exchangeRate);
  
  // ✅ PRIX FINAL = Prix de base + Surcharge
  const totalCost = basePrice + surchargeCDF;
  
  setCurrentCost(totalCost);
  
  console.log(`💰 TARIFICATION DÉTAILLÉE:
    📦 Prix de base (passager): ${basePrice.toLocaleString()} CDF
    ⏱️  Facturation: ${Math.floor(billedSeconds / 60)}min ${billedSeconds % 60}s
    💸 Surcharge: ${surchargeCDF.toLocaleString()} CDF
    💵 TOTAL: ${totalCost.toLocaleString()} CDF
  `);
  
  // Vérification erreurs
  if (totalCost === 0 || isNaN(totalCost)) {
    console.error('❌ ERREUR : Montant invalide !');
    console.error({  basePrice, billedHours, surchargeUSD, surchargeCDF, totalCost });
  }
}, [isBillingActive, isTimerDisabled, billingElapsedTime, state.currentRide?.estimatedPrice, state.systemSettings?.exchangeRate]);
```

**Résultat attendu :**
```
Passager choisit Smart Confort = 14,000 CDF
  ↓
Conducteur démarre :
  → Prix affiché = 14,000 CDF ✅

Passager fait attendre 20 minutes (10 min gratuites + 10 min facturées) :
  → billedSeconds = 600s (10 min)
  → billedHours = 0.167h
  → Surcharge = $9 × 0.167 × 2850 = ~4,280 CDF
  → Prix total = 14,000 + 4,280 = 18,280 CDF ✅

Conducteur clôture :
  → Prix final = 18,280 CDF (juste et transparent)
```

---

### **4. EarningsScreen.tsx - Auto-refresh**

**Problème :** Gains pas à jour après clôture de course

**Solution :**

Dans le useEffect ligne 54, ajouter polling :

```typescript
useEffect(() => {
  const fetchEarnings = async () => {
    setLoading(true);
    
    try {
      // ... (code existant de récupération)
    } catch (error) {
      // ... (gestion erreur)
    } finally {
      setLoading(false);
    }
  };

  // Premier chargement
  fetchEarnings();
  
  // ✅ NOUVEAU : Rafraîchir toutes les 10 secondes
  const intervalId = setInterval(fetchEarnings, 10000);
  
  return () => clearInterval(intervalId);
}, [driver.id, selectedPeriod]);
```

---

### **5. CommissionSettings.tsx - Auto-refresh**

**Solution similaire :**

```typescript
useEffect(() => {
  loadSettings();
  
  if (userType === 'driver' && driverId) {
    loadDriverCommissions();
    
    // ✅ NOUVEAU : Rafraîchir toutes les 10 secondes
    const intervalId = setInterval(loadDriverCommissions, 10000);
    
    return () => clearInterval(intervalId);
  }
}, [userType, driverId]);
```

---

### **6. pricing.ts - Estimation durée**

**Problème :** 10.9 km → 27 min (trop lent)

**Trouver la fonction d'estimation de durée :**

```typescript
// Rechercher dans /lib/pricing.ts
function estimateDuration(distance: number): number {
  // ✅ ANCIEN : Vitesse 24 km/h
  // const durationMin = distance / 0.4; // 0.4 km/min = 24 km/h
  
  // ✅ NOUVEAU : Vitesse 40 km/h (plus réaliste en ville)
  const averageSpeedKmh = 40;
  const durationMin = (distance / averageSpeedKmh) * 60;
  
  // Arrondir aux 5 min supérieures
  return Math.ceil(durationMin / 5) * 5;
}

// Exemple :
// 10.9 km → (10.9 / 40) * 60 = 16.35 min → arrondi à 20 min ✅
```

---

### **7. RideCompletedScreen.tsx - Paiement passager**

**Problèmes :**
1. "Paiement mixte" pas visible
2. Boutons ne déclenchent pas de paiement

**À vérifier dans le fichier :**

```typescript
// 1. S'assurer que "Paiement mixte" est dans la liste
const paymentMethods = [
  { id: 'flutterwave', ... },
  { id: 'cash', ... },
  { id: 'mixed', ... }, // ✅ Doit être présent
  { id: 'wallet', ... }
];

// 2. Ajouter handlers de paiement
const handlePayWithFlutterwave = async () => {
  toast.info('Redirection vers Flutterwave...');
  
  // Appeler API Flutterwave
  const response = await fetch('/api/flutterwave/initiate', {
    method: 'POST',
    body: JSON.stringify({
      amount: finalCost,
      rideId: state.currentRide?.id,
      passengerId: state.currentUser?.id
    })
  });
  
  if (response.ok) {
    const { paymentUrl } = await response.json();
    window.location.href = paymentUrl; // Redirection
  }
};

const handlePayWithCash = async () => {
  toast.success('Paiement en espèces confirmé');
  
  // Marquer la course comme payée
  if (updateRide && state.currentRide?.id) {
    updateRide(state.currentRide.id, {
      paymentStatus: 'paid',
      paymentMethod: 'cash',
      paidAt: new Date().toISOString()
    });
  }
  
  setCurrentScreen('rating'); // Passer à l'évaluation
};

const handlePayWithMixed = async () => {
  const { cashAmount, mobileMoneyAmount } = paymentDetails;
  
  toast.info(`Paiement mixte: ${cashAmount} CDF cash + ${mobileMoneyAmount} CDF Flutterwave`);
  
  // 1. Confirmer paiement cash
  toast.success(`${cashAmount} CDF en espèces confirmé`);
  
  // 2. Traiter paiement Flutterwave
  const response = await fetch('/api/flutterwave/initiate', {
    method: 'POST',
    body: JSON.stringify({
      amount: mobileMoneyAmount,
      rideId: state.currentRide?.id
    })
  });
  
  if (response.ok) {
    const { paymentUrl } = await response.json();
    window.location.href = paymentUrl;
  }
};

const handlePayWithWallet = async () => {
  const userBalance = state.currentUser?.balance || 0;
  
  if (userBalance < finalCost) {
    toast.error(`Solde insuffisant: ${userBalance.toLocaleString()} CDF (manque ${(finalCost - userBalance).toLocaleString()} CDF)`);
    return;
  }
  
  toast.info('Déduction du solde...');
  
  // Appeler API pour déduire du solde
  const response = await fetch(`/api/passengers/${state.currentUser?.id}/balance/deduct`, {
    method: 'POST',
    body: JSON.stringify({ amount: finalCost, rideId: state.currentRide?.id })
  });
  
  if (response.ok) {
    toast.success('✅ Paiement réussi !');
    
    // Mettre à jour le solde local
    if (updateUser && state.currentUser) {
      updateUser({ ...state.currentUser, balance: userBalance - finalCost });
    }
    
    setCurrentScreen('rating');
  } else {
    toast.error('Erreur lors du paiement');
  }
};

// 3. Associer les handlers aux boutons
<Button onClick={handlePayWithFlutterwave}>Payer avec Flutterwave</Button>
<Button onClick={handlePayWithCash}>Payer en espèces</Button>
<Button onClick={handlePayWithMixed}>Paiement mixte</Button>
<Button onClick={handlePayWithWallet}>Payer avec portefeuille</Button>
```

---

## 📦 **FICHIERS À RÉCUPÉRER**

### **✅ DÉJÀ MODIFIÉS (2 fichiers)**
```
1. /components/driver/DriverDashboard.tsx (ligne 1218)
2. /components/driver/NavigationScreen.tsx (lignes 352, 360)
```

### **⚠️ À MODIFIER (5 fichiers restants)**
```
3. /components/driver/NavigationScreen.tsx (lignes 95-145) - useEffect tarification
4. /components/driver/EarningsScreen.tsx (ligne ~54) - Ajout polling
5. /components/driver/CommissionSettings.tsx (ligne ~42) - Ajout polling
6. /lib/pricing.ts - Fonction estimation durée
7. /components/passenger/RideCompletedScreen.tsx - Handlers paiement
```

---

## 🧪 **TESTS DE VALIDATION**

### **Test 1 : Prix correct (14,000 CDF)**
```
1. Passager choisit Smart Confort
2. Vérifier dans la base : estimatedPrice = 14000
3. Conducteur accepte et démarre
4. NavigationScreen affiche : "Coût actuel: 14 000 CDF" ✅
5. Conducteur clôture immédiatement
6. Prix final = 14,000 CDF ✅
```

### **Test 2 : Adresses réelles**
```
1. Passager saisit : "Avenue Kiminzita" → "Kitambo magazin"
2. Vérifier dans base : pickup.address et destination.address
3. Conducteur accepte
4. NavigationScreen affiche les VRAIES adresses ✅
```

### **Test 3 : NaN corrigé**
```
1. Nouveau conducteur (earnings = undefined)
2. Dashboard affiche : "Aujourd'hui: 0 CDF" ✅
3. PAS de "NaN CDF"
```

### **Test 4 : Gains à jour**
```
1. Conducteur termine une course
2. Attendre 10 secondes
3. Cliquer "Voir mes gains"
4. Nouvelle course apparaît ✅
```

### **Test 5 : Paiement fonctionnel**
```
1. Passager termine course
2. Écran paiement
3. Cliquer "Flutterwave" → Redirection ✅
4. Cliquer "Espèces" → Confirmation + Passage à rating ✅
5. Cliquer "Portefeuille" → Déduction solde ✅
```

---

## 🚀 **DÉPLOIEMENT RECOMMANDÉ**

### **Étape 1 : Corrections déjà faites ✅**
```bash
git add components/driver/DriverDashboard.tsx
git add components/driver/NavigationScreen.tsx
git commit -m "fix: NaN + adresses hardcodées supprimées"
git push
```

### **Étape 2 : Correction prix (URGENT)**
```bash
# Modifier NavigationScreen.tsx lignes 95-145
git add components/driver/NavigationScreen.tsx
git commit -m "fix: utiliser estimatedPrice au lieu de recalculer"
git push
```

### **Étape 3 : Auto-refresh**
```bash
# Modifier EarningsScreen.tsx et CommissionSettings.tsx
git add components/driver/EarningsScreen.tsx
git add components/driver/CommissionSettings.tsx
git commit -m "feat: auto-refresh gains et commissions (10s)"
git push
```

### **Étape 4 : Améliorations**
```bash
# Modifier pricing.ts et RideCompletedScreen.tsx
git add lib/pricing.ts
git add components/passenger/RideCompletedScreen.tsx
git commit -m "feat: durée réaliste + paiements fonctionnels"
git push
```

---

## ✅ **RÉSUMÉ FINAL**

| Statut | Problème | Fichier | Ligne(s) |
|--------|----------|---------|----------|
| ✅ FAIT | NaN dans Dashboard | DriverDashboard.tsx | 1218 |
| ✅ FAIT | Adresses hardcodées | NavigationScreen.tsx | 352, 360 |
| ⚠️ À FAIRE | Prix incorrect (25,650 au lieu de 14,000) | NavigationScreen.tsx | 95-145 |
| ⚠️ À FAIRE | Gains pas à jour | EarningsScreen.tsx | ~54 |
| ⚠️ À FAIRE | Commissions pas à jour | CommissionSettings.tsx | ~42 |
| ⚠️ À FAIRE | Durée estimée (27min → 20min) | pricing.ts | ? |
| ⚠️ À FAIRE | Paiements non fonctionnels | RideCompletedScreen.tsx | ? |

---

**📋 PROCHAINES ÉTAPES :**

1. **URGENT** : Corriger le prix dans NavigationScreen.tsx (lignes 95-145)
2. Ajouter auto-refresh dans EarningsScreen et CommissionSettings
3. Améliorer estimation durée dans pricing.ts
4. Implémenter handlers de paiement dans RideCompletedScreen.tsx

**🎯 OBJECTIF : Déployer corrections 3, 4 et 5 dans les prochaines heures**
