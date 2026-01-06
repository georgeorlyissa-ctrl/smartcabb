# 🔧 CORRECTIONS URGENTES - v517.55

**Date:** 21 Décembre 2024  
**Problèmes identifiés:** 7 BUGS CRITIQUES  
**Fichiers à corriger:** 6 fichiers minimum  
**Statut:** ⚠️ **CORRECTIONS EN COURS**

---

## 🐛 **PROBLÈMES IDENTIFIÉS PAR CAPTURES**

### **📷 CAPTURE 1 : Prix et adresses incorrects**

**Problème 1 : Prix incorrect**
- **Affiché :** 25,650 CDF
- **Attendu :** 14,000 CDF
- **Cause :** NavigationScreen calcule prix depuis tarif horaire au lieu d'utiliser `estimatedPrice`
- **Fichier :** `/components/driver/NavigationScreen.tsx` ligne 120

**Problème 2 : Adresses incorrectes**
- **Affiché :** "Gombe, Kinshasa" → "Lemba, Kinshasa"
- **Attendu :** Adresses saisies par le passager
- **Cause :** Fallback hardcodés lignes 352 et 360
- **Fichier :** `/components/driver/NavigationScreen.tsx` lignes 352, 360

---

### **📷 CAPTURE 2 : Adresses incorrectes dans résumé**

**Problème :** "Point de départ : Gombe, Kinshasa"
- **Cause :** `state.currentRide` n'a pas les bonnes adresses
- **Solution :** S'assurer que `pickup` et `destination` sont enregistrés correctement dans la course

---

### **📷 CAPTURE 3 : NaN dans Dashboard + Gains pas à jour**

**Problème 1 : NaN dans "Aujourd'hui"**
- **Affiché :** "NaN CDF"
- **Cause :** `driver.earnings` est `undefined`, donc `undefined * 2500 = NaN`
- **Fichier :** `/components/driver/DriverDashboard.tsx` ligne 1218
- **Code actuel :**
  ```typescript
  <p>{(driver.earnings * 2500).toLocaleString()} CDF</p>
  ```
- **Correction :**
  ```typescript
  <p>{((driver.earnings || 0) * 2500).toLocaleString()} CDF</p>
  ```

**Problème 2 : "Voir mes gains" pas à jour**
- **Cause :** Pas de rafraîchissement automatique après clôture course
- **Solution :** Forcer refresh dans EarningsScreen

**Problème 3 : "Mes commissions" pas à jour**
- **Cause :** Pas de rafraîchissement automatique
- **Solution :** Forcer refresh dans CommissionSettings

---

## 📋 **AUTRES PROBLÈMES**

### **4. Estimation de durée incorrecte**
- **Problème :** 10.9 km → 27 min (trop lent)
- **Réaliste :** 10.9 km → ~15-20 min en ville
- **Fichier :** `/lib/pricing.ts`
- **Calcul actuel :** Vitesse moyenne ~24 km/h
- **Correction :** Vitesse moyenne ~40 km/h en ville

### **5. Paiement mixte pas visible**
- **Problème :** Option "Paiement mixte" manquante côté passager
- **Fichier :** Probablement `/components/passenger/PaymentMethodScreen.tsx`

### **6. Boutons paiement non fonctionnels**
- **Problème :** Aucun bouton ne déclenche le paiement
- **Fichier :** `/components/passenger/RideCompletedScreen.tsx`

---

## ✅ **CORRECTIONS PRIORITAIRES**

### **CORRECTION 1 : NavigationScreen.tsx - Prix correct**

**Problème :** Prix calculé depuis tarif horaire au lieu d'utiliser `estimatedPrice`

**AVANT (ligne 94-120) :**
```typescript
useEffect(() => {
  if (!isBillingActive || isTimerDisabled) {
    return;
  }

  // Récupérer la catégorie du véhicule
  const vehicleCategory = (state.currentRide?.vehicleType?.toLowerCase().replace(' ', '_') || 'smart_confort') as VehicleCategory;
  const pricing = VEHICLE_PRICING[vehicleCategory];
  
  // Calculer le nombre d'heures facturées (par tranche de 30min)
  const billedHours = Math.ceil(billingElapsedTime / 1800) * 0.5;
  
  // Déterminer jour/nuit
  const isDay = isDayTime();
  const hourlyRateUSD = isDay
    ? pricing.pricing.course_heure.jour.usd
    : pricing.pricing.course_heure.nuit.usd;
  
  // Calcul du prix en USD
  const priceUSD = hourlyRateUSD * billedHours;
  const exchangeRate = state.systemSettings?.exchangeRate || 2850;
  const totalCost = Math.round(priceUSD * exchangeRate);
  
  setCurrentCost(totalCost); // ❌ INCORRECT : Recalcule au lieu d'utiliser estimatedPrice
}, [isBillingActive, isTimerDisabled, billingElapsedTime]);
```

**APRÈS (✅ CORRIGÉ) :**
```typescript
useEffect(() => {
  // ✅ UTILISER LE PRIX ESTIMÉ DU PASSAGER COMME BASE
  const basePrice = state.currentRide?.estimatedPrice || 0;
  
  if (!isBillingActive || isTimerDisabled) {
    setCurrentCost(basePrice); // Prix de base
    return;
  }

  // ✅ Ajouter surcharge uniquement si facturation active
  const vehicleCategory = (state.currentRide?.vehicleType?.toLowerCase().replace(' ', '_') || 'smart_confort') as VehicleCategory;
  const pricing = VEHICLE_PRICING[vehicleCategory];
  
  // Calculer le surcoût lié au temps de facturation (après 10 min gratuites)
  const billedSeconds = Math.max(0, billingElapsedTime);
  const billedHours = billedSeconds / 3600;
  
  const isDay = isDayTime();
  const hourlyRateUSD = isDay
    ? pricing.pricing.course_heure.jour.usd
    : pricing.pricing.course_heure.nuit.usd;
  
  const surchargeUSD = hourlyRateUSD * billedHours;
  const exchangeRate = state.systemSettings?.exchangeRate || 2850;
  const surchargeCDF = Math.round(surchargeUSD * exchangeRate);
  
  // ✅ Prix final = Prix de base + Surcharge
  const totalCost = basePrice + surchargeCDF;
  
  setCurrentCost(totalCost);
  
  console.log(`💰 TARIFICATION:
    Prix de base (passager): ${basePrice.toLocaleString()} CDF
    Facturation: ${Math.floor(billedSeconds / 60)}min ${billedSeconds % 60}s
    Surcharge: ${surchargeCDF.toLocaleString()} CDF
    TOTAL: ${totalCost.toLocaleString()} CDF
  `);
}, [isBillingActive, isTimerDisabled, billingElapsedTime, state.currentRide?.estimatedPrice]);
```

**Résultat :**
- ✅ Prix de base : 14,000 CDF (choisi par le passager)
- ✅ Surcharge : Seulement si attente prolongée
- ✅ Plus de recalcul arbitraire

---

### **CORRECTION 2 : NavigationScreen.tsx - Adresses correctes**

**AVANT (lignes 352, 360) :**
```typescript
<p className="font-medium">
  {state.currentRide?.pickup?.address || 'Gombe, Kinshasa'} {/* ❌ HARDCODÉ */}
</p>

<p className="font-medium">
  {state.currentRide?.destination?.address || 'Lemba, Kinshasa'} {/* ❌ HARDCODÉ */}
</p>
```

**APRÈS (✅ CORRIGÉ) :**
```typescript
<p className="font-medium">
  {state.currentRide?.pickup?.address || 'Point de départ non spécifié'}
</p>

<p className="font-medium">
  {state.currentRide?.destination?.address || 'Destination non spécifiée'}
</p>
```

**IMPORTANT :** S'assurer que `state.currentRide` contient les bonnes adresses depuis le début. Vérifier dans `/hooks/useAppState.tsx` ou lors de la création de la course.

---

### **CORRECTION 3 : DriverDashboard.tsx - Fix NaN**

**AVANT (ligne 1218) :**
```typescript
<p className="text-lg font-semibold truncate">
  {(driver.earnings * 2500).toLocaleString()} CDF
</p>
```

**APRÈS (✅ CORRIGÉ) :**
```typescript
<p className="text-lg font-semibold truncate">
  {((driver.earnings || 0) * 2500).toLocaleString()} CDF
</p>
```

---

### **CORRECTION 4 : EarningsScreen.tsx - Auto-refresh**

**Ajouter polling ou forcer refresh après course :**

```typescript
useEffect(() => {
  const fetchEarnings = async () => {
    // ... (code existant)
  };

  fetchEarnings();
  
  // ✅ NOUVEAU : Rafraîchir toutes les 10 secondes
  const intervalId = setInterval(fetchEarnings, 10000);
  
  return () => clearInterval(intervalId);
}, [driver.id, selectedPeriod]);
```

---

### **CORRECTION 5 : CommissionSettings.tsx - Auto-refresh**

**Similaire à EarningsScreen :**

```typescript
const loadDriverCommissions = async () => {
  // ... (code existant)
};

useEffect(() => {
  if (userType === 'driver' && driverId) {
    loadDriverCommissions();
    
    // ✅ NOUVEAU : Rafraîchir toutes les 10 secondes
    const intervalId = setInterval(loadDriverCommissions, 10000);
    
    return () => clearInterval(intervalId);
  }
}, [userType, driverId]);
```

---

### **CORRECTION 6 : pricing.ts - Estimation durée**

**Améliorer le calcul de durée :**

**AVANT :**
```typescript
// Vitesse moyenne ~24 km/h
duration = distance / 0.4; // 0.4 km/min = 24 km/h
```

**APRÈS :**
```typescript
// ✅ Vitesse moyenne réaliste en ville : 40 km/h
const averageSpeedKmh = 40;
const durationMinutes = (distance / averageSpeedKmh) * 60;

// Arrondir aux 5 min supérieures
duration = Math.ceil(durationMinutes / 5) * 5;

// Exemple : 10.9 km → (10.9 / 40) * 60 = 16.35 min → 20 min
```

---

### **CORRECTION 7 : RideCompletedScreen.tsx - Boutons paiement**

**Problème :** Boutons ne déclenchent aucun paiement

**Solution : Ajouter handlers de paiement :**

```typescript
const handlePayWithFlutterwave = async () => {
  // Appeler API Flutterwave
  toast.info('Redirection vers Flutterwave...');
  // ... logique de paiement
};

const handlePayWithCash = () => {
  // Marquer comme payé en espèces
  toast.success('Paiement en espèces confirmé');
  // ... logique de paiement
};

const handlePayWithMixed = async () => {
  // Paiement mixte : partie cash, partie Flutterwave
  toast.info('Traitement du paiement mixte...');
  // ... logique de paiement
};

const handlePayWithWallet = async () => {
  // Déduire du solde du passager
  toast.info('Paiement par portefeuille...');
  // ... logique de paiement
};
```

---

## 📦 **FICHIERS À MODIFIER**

### **✅ TOTAL : 6 FICHIERS MINIMUM**

```bash
1. /components/driver/NavigationScreen.tsx
   → Utiliser estimatedPrice au lieu de recalculer
   → Supprimer fallback "Gombe/Lemba"

2. /components/driver/DriverDashboard.tsx
   → Fix NaN : (driver.earnings || 0)

3. /components/driver/EarningsScreen.tsx
   → Auto-refresh toutes les 10s

4. /components/driver/CommissionSettings.tsx
   → Auto-refresh toutes les 10s

5. /lib/pricing.ts
   → Améliorer estimation durée (40 km/h au lieu de 24)

6. /components/passenger/RideCompletedScreen.tsx
   → Ajouter handlers de paiement fonctionnels
   → S'assurer que "Paiement mixte" est visible
```

---

## 🧪 **TESTS À EFFECTUER APRÈS CORRECTIONS**

### **Test 1 : Prix correct**
```
1. Passager choisit Smart Confort → 14,000 CDF
2. Conducteur accepte
3. Conducteur clôture la course
4. ✅ VÉRIFIER :
   - Prix affiché côté conducteur = 14,000 CDF (pas 25,650)
   - Prix reçu = 14,000 CDF
```

### **Test 2 : Adresses correctes**
```
1. Passager saisit :
   - Départ : "Avenue Kiminzita, Selembao"
   - Arrivée : "Kitambo magazin"
2. Conducteur accepte
3. ✅ VÉRIFIER :
   - NavigationScreen affiche "Avenue Kiminzita" (pas "Gombe")
   - RideCompletionDialog affiche "Kitambo magazin" (pas "Lemba")
```

### **Test 3 : NaN corrigé**
```
1. Dashboard conducteur
2. ✅ VÉRIFIER :
   - "Aujourd'hui" affiche "0 CDF" ou montant réel (PAS "NaN CDF")
```

### **Test 4 : Gains à jour**
```
1. Conducteur termine une course
2. Attendre 10 secondes
3. Cliquer sur "Voir mes gains"
4. ✅ VÉRIFIER :
   - Nouvelle course apparaît dans la liste
   - Totaux mis à jour
```

### **Test 5 : Commissions à jour**
```
1. Conducteur termine une course
2. Attendre 10 secondes
3. Cliquer sur "Commissions"
4. ✅ VÉRIFIER :
   - Commission de la nouvelle course apparaît
   - "Aujourd'hui" mis à jour
```

### **Test 6 : Durée réaliste**
```
1. Distance : 10.9 km
2. ✅ VÉRIFIER :
   - Durée estimée : ~15-20 min (PAS 27 min)
```

### **Test 7 : Paiement fonctionnel**
```
1. Passager termine course
2. Écran "Paiement"
3. ✅ VÉRIFIER :
   - Option "Paiement mixte" visible
   - Clic sur "Flutterwave" → Redirection ou modal
   - Clic sur "Espèces" → Confirmation
   - Clic sur "Portefeuille" → Déduction solde
```

---

## 🚀 **ORDRE DE DÉPLOIEMENT RECOMMANDÉ**

### **Phase 1 : Corrections critiques (URGENT)**
```bash
1. DriverDashboard.tsx (Fix NaN)
2. NavigationScreen.tsx (Prix + Adresses)
```

### **Phase 2 : Rafraîchissements**
```bash
3. EarningsScreen.tsx (Auto-refresh)
4. CommissionSettings.tsx (Auto-refresh)
```

### **Phase 3 : Améliorations**
```bash
5. pricing.ts (Durée estimée)
6. RideCompletedScreen.tsx (Paiements)
```

---

## ✅ **RÉSUMÉ FINAL**

| # | Problème | Cause | Solution | Fichier |
|---|----------|-------|----------|---------|
| 1 | Prix 25,650 au lieu de 14,000 | Recalcul arbitraire | Utiliser `estimatedPrice` | NavigationScreen.tsx |
| 2 | Adresses "Gombe/Lemba" | Fallback hardcodés | Supprimer fallback | NavigationScreen.tsx |
| 3 | NaN dans Dashboard | `driver.earnings` undefined | `|| 0` | DriverDashboard.tsx |
| 4 | Gains pas à jour | Pas de refresh | Polling 10s | EarningsScreen.tsx |
| 5 | Commissions pas à jour | Pas de refresh | Polling 10s | CommissionSettings.tsx |
| 6 | Durée 27min pour 10.9km | Vitesse 24 km/h | Vitesse 40 km/h | pricing.ts |
| 7 | Paiements non fonctionnels | Pas de handlers | Ajouter logique | RideCompletedScreen.tsx |

---

**⚠️ PRIORITÉ ABSOLUE : Corrections 1, 2 et 3 (Prix, Adresses, NaN)**

**📋 DOCUMENT COMPLET CRÉÉ POUR RÉFÉRENCE**
