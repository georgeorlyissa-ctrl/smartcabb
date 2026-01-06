# 🚨 DÉBOGAGE ERREUR INIT_ERROR - GUIDE COMPLET

## 🔍 ANALYSE DE L'ERREUR

### **Message d'erreur** :
```
❌ INIT_ERROR
```

### **Causes possibles** :

1. **Erreur serveur** (status !== 200)
   - Configuration manquante (FLUTTERWAVE_SECRET_KEY)
   - Backend Supabase indisponible
   - Route invalide

2. **Réponse invalide** (structure incorrecte)
   - `result.data` manquant
   - `result.data.link` manquant
   - Format JSON incorrect

3. **Erreur réseau** (catch)
   - Timeout
   - Failed to fetch
   - CORS

---

## 🔧 CORRECTIFS APPLIQUÉS

### **1. Logs détaillés** :

```typescript
// AVANT (logs insuffisants)
catch (error: any) {
  console.error('❌ Erreur init Flutterwave:', error);
  return {
    success: false,
    status: 'failed',
    message: error.message || 'Erreur initialisation',
    error: 'INIT_ERROR',  // ❌ Trop générique
  };
}

// APRÈS (logs détaillés)
catch (error: any) {
  console.error('❌ Erreur init Flutterwave (CATCH):', {
    name: error.name,          // TypeError, NetworkError, etc.
    message: error.message,    // Message d'erreur détaillé
    stack: error.stack,        // Stack trace complète
    data: data                 // Données envoyées
  });
  return {
    success: false,
    status: 'failed',
    message: `Erreur technique: ${error.message || 'Erreur inconnue'}`,
    error: 'INIT_ERROR',
  };
}
```

### **2. Validation de la réponse** :

```typescript
const result = await response.json();
console.log('✅ Paiement Flutterwave initialisé:', result);

// 🆕 VALIDATION AJOUTÉE
if (!result.data || !result.data.link) {
  console.error('❌ Réponse invalide de Flutterwave:', result);
  return {
    success: false,
    status: 'failed',
    message: 'Réponse invalide du serveur de paiement',
    error: 'INVALID_RESPONSE',
  };
}
```

### **3. Gestion erreurs serveur** :

```typescript
if (!response.ok) {
  // 🆕 Gestion robuste du JSON
  const errorData = await response.json().catch(() => ({ 
    error: 'Erreur serveur inconnue' 
  }));
  
  // 🆕 Logs détaillés
  console.error('❌ Erreur serveur Flutterwave:', {
    status: response.status,
    statusText: response.statusText,
    errorData
  });
  
  return {
    success: false,
    status: 'failed',
    message: errorData.error || `Erreur serveur (${response.status})`,
    error: 'SERVER_ERROR',
  };
}
```

---

## 📊 TYPES D'ERREURS ET SOLUTIONS

### **Type 1 : Configuration manquante** ❌

**Logs** :
```javascript
❌ Erreur serveur Flutterwave: {
  status: 500,
  statusText: "Internal Server Error",
  errorData: { 
    error: "Configuration Flutterwave manquante. Veuillez configurer FLUTTERWAVE_SECRET_KEY."
  }
}
```

**Cause** : Variable d'environnement `FLUTTERWAVE_SECRET_KEY` non configurée sur Supabase

**Solution** :
1. Aller sur Supabase Dashboard
2. Project Settings → Edge Functions → Secrets
3. Ajouter `FLUTTERWAVE_SECRET_KEY` avec la clé secrète Flutterwave
4. Redémarrer les Edge Functions

---

### **Type 2 : Réponse invalide** ❌

**Logs** :
```javascript
✅ Paiement Flutterwave initialisé: {
  status: "error",
  message: "Invalid payment data"
}
❌ Réponse invalide de Flutterwave: { ... }
```

**Cause** : Données envoyées incorrectes ou incomplètes

**Solution** :
Vérifier que toutes les données sont présentes :
```typescript
const paymentData: PaymentInitData = {
  amount: ridePrice,                           // ✅ REQUIS
  currency: 'CDF',                             // ✅ REQUIS
  method: 'mobile_money',                      // ✅ REQUIS
  customerEmail: currentUser?.email,           // ✅ REQUIS
  customerName: currentUser?.name,             // ✅ REQUIS
  customerPhone: phoneNumber,                  // ✅ REQUIS
  reference: `RIDE_${currentRide.id}_${Date.now()}`,  // ✅ REQUIS
  description: `Paiement course #${currentRide.id}`,  // ✅ REQUIS
  rideId: currentRide.id,                      // ✅ IMPORTANT
  passengerId: currentUser?.id,                // ✅ IMPORTANT
  driverId: currentRide.driverId,              // ✅ IMPORTANT
  metadata: {
    type: 'ride_payment',
    network: selectedNetwork.id,
    networkName: selectedNetwork.name
  }
};
```

---

### **Type 3 : Erreur réseau** ❌

**Logs** :
```javascript
❌ Erreur init Flutterwave (CATCH): {
  name: "TypeError",
  message: "Failed to fetch",
  stack: "...",
  data: { amount: 12500, ... }
}
```

**Causes possibles** :
- Timeout réseau
- Backend Supabase indisponible
- Problème CORS
- Connexion internet coupée

**Solution** :
1. Vérifier la connexion internet
2. Vérifier que Supabase est opérationnel (https://status.supabase.com)
3. Vérifier les logs Supabase Edge Functions
4. Réessayer le paiement

---

### **Type 4 : Timeout** ⏱️

**Logs** :
```javascript
❌ Erreur init Flutterwave (CATCH): {
  name: "AbortError",
  message: "The operation was aborted",
  ...
}
```

**Cause** : Requête trop longue (timeout)

**Solution** :
Ajouter un timeout explicite :
```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 secondes

const response = await fetch(`${SERVER_URL}/payments/flutterwave/init`, {
  method: 'POST',
  headers: { ... },
  body: JSON.stringify({ ... }),
  signal: controller.signal
});

clearTimeout(timeoutId);
```

---

## 🔍 CHECKLIST DE DÉBOGAGE

### **Étape 1 : Vérifier les logs console** :

```javascript
// Chercher ces messages dans la console navigateur
🦋 Initialisation paiement Flutterwave via serveur: { ... }
```

**Si absent** → Le code n'est pas exécuté. Vérifier :
- Le bouton "Confirmer le paiement" est cliqué
- `handleMobileMoneyPayment()` est appelé
- Pas d'erreur avant l'appel

**Si présent** → Continuer à l'étape 2

---

### **Étape 2 : Vérifier la requête** :

```javascript
// Logs attendus
🦋 Initialisation paiement Flutterwave via serveur: {
  amount: 12500,
  currency: "CDF",
  rideId: "ride_123",
  passengerId: "user_789",
  driverId: "driver_456",
  customerEmail: "passager@smartcabb.com",
  customerPhone: "+243999999999",
  ...
}
```

**Vérifier** :
- ✅ Tous les champs requis sont présents
- ✅ `amount` > 0
- ✅ `customerEmail` valide
- ✅ `customerPhone` formaté correctement
- ✅ `rideId`, `passengerId`, `driverId` présents

---

### **Étape 3 : Vérifier la réponse serveur** :

**Cas A : Erreur serveur**
```javascript
❌ Erreur serveur Flutterwave: {
  status: 500,
  errorData: { error: "Configuration manquante" }
}
```
→ **Solution** : Configurer `FLUTTERWAVE_SECRET_KEY` sur Supabase

**Cas B : Réponse invalide**
```javascript
❌ Réponse invalide de Flutterwave: { status: "error" }
```
→ **Solution** : Vérifier les données envoyées

**Cas C : Erreur réseau**
```javascript
❌ Erreur init Flutterwave (CATCH): { 
  message: "Failed to fetch" 
}
```
→ **Solution** : Vérifier connexion / Supabase

---

### **Étape 4 : Vérifier les Edge Functions Supabase** :

1. Aller sur Supabase Dashboard
2. Edge Functions → Logs
3. Chercher les requêtes à `/payments/flutterwave/init`
4. Vérifier les logs backend :

```javascript
// Logs attendus côté serveur
🦋 Initialisation paiement Flutterwave: {
  rideId: "ride_123",
  reference: "RIDE_ride_123_1735574400000",
  amount: 12500,
  currency: "CDF"
}
📤 Envoi à Flutterwave API (PRODUCTION)...
📋 Données envoyées: { ... }
📥 Réponse Flutterwave COMPLÈTE: { ... }
📥 Status HTTP: 200
✅ Transaction créée avec succès
```

**Si erreur backend** :
```javascript
❌ FLUTTERWAVE_SECRET_KEY non configurée
```
→ Configurer la variable d'environnement

---

## 🛠️ SOLUTIONS RAPIDES

### **Solution 1 : Vérifier la configuration**

```bash
# Sur Supabase Dashboard
1. Project Settings
2. Edge Functions → Secrets
3. Vérifier que ces secrets existent :
   - FLUTTERWAVE_SECRET_KEY ✅
   - SUPABASE_URL ✅
   - SUPABASE_SERVICE_ROLE_KEY ✅
```

### **Solution 2 : Vérifier les données**

```typescript
// Avant d'appeler initPayment(), logger les données
console.log('📋 Données de paiement:', paymentData);

// Vérifier que :
console.assert(paymentData.amount > 0, 'Amount doit être > 0');
console.assert(paymentData.customerEmail, 'Email requis');
console.assert(paymentData.customerPhone, 'Téléphone requis');
console.assert(paymentData.rideId, 'RideId requis');
```

### **Solution 3 : Tester l'endpoint directement**

```bash
# Tester avec curl (remplacer les valeurs)
curl -X POST \
  https://YOUR_PROJECT.supabase.co/functions/v1/make-server-2eb02e52/payments/flutterwave/init \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 12500,
    "currency": "CDF",
    "customerEmail": "test@smartcabb.com",
    "customerPhone": "+243999999999",
    "customerName": "Test User",
    "reference": "TEST_123",
    "rideId": "ride_test",
    "passengerId": "user_test",
    "driverId": "driver_test"
  }'
```

**Réponse attendue** :
```json
{
  "success": true,
  "data": {
    "id": "123456",
    "link": "https://checkout.flutterwave.com/...",
    "tx_ref": "SMARTCABB_RIDE_...",
    "flw_ref": "FLW..."
  }
}
```

---

## 📝 TEMPLATE DE RAPPORT D'ERREUR

Si l'erreur persiste, fournir ces informations :

```
## INIT_ERROR - Rapport d'erreur

### Logs console navigateur :
```
[Coller les logs ici]
```

### Logs Supabase Edge Functions :
```
[Coller les logs backend ici]
```

### Données envoyées :
```json
{
  "amount": 12500,
  "currency": "CDF",
  ...
}
```

### Configuration vérifiée :
- [ ] FLUTTERWAVE_SECRET_KEY configurée
- [ ] Backend Supabase opérationnel
- [ ] Connexion internet OK
- [ ] Toutes les données requises présentes

### Étapes de reproduction :
1. Mode passager
2. Fin de course
3. Choisir "Mobile Money"
4. Sélectionner réseau
5. Saisir numéro
6. Clic "Continuer vers le paiement"
7. ❌ Erreur "INIT_ERROR"
```

---

## ✅ CHECKLIST DE VÉRIFICATION

Avant de tester un paiement :

- [ ] `FLUTTERWAVE_SECRET_KEY` configurée sur Supabase
- [ ] Backend Supabase opérationnel (status.supabase.com)
- [ ] Connexion internet stable
- [ ] Logs activés dans la console
- [ ] Toutes les propriétés requises présentes dans `paymentData`
- [ ] Numéro de téléphone formaté correctement
- [ ] Réseau Mobile Money sélectionné
- [ ] `rideId`, `passengerId`, `driverId` présents

---

## 🎯 RÉSULTAT ATTENDU

Après ces correctifs, les logs devraient être :

### **Succès** ✅ :
```javascript
🦋 Initialisation paiement Flutterwave via serveur: { ... }
✅ Paiement Flutterwave initialisé: {
  success: true,
  data: {
    id: "123456",
    link: "https://checkout.flutterwave.com/...",
    tx_ref: "SMARTCABB_RIDE_...",
    flw_ref: "FLW..."
  }
}
✅ Redirection vers Flutterwave: https://checkout.flutterwave.com/...
```

### **Erreur identifiée** ❌ :
```javascript
❌ Erreur serveur Flutterwave: {
  status: 500,
  statusText: "Internal Server Error",
  errorData: { 
    error: "FLUTTERWAVE_SECRET_KEY non configurée"  // ← CAUSE PRÉCISE
  }
}
```

**Plus de message générique "INIT_ERROR" sans explication !** 🎉

---

**AVEC CES CORRECTIFS, VOUS POUVEZ MAINTENANT IDENTIFIER PRÉCISÉMENT LA CAUSE DE L'ERREUR ! 🚀**
