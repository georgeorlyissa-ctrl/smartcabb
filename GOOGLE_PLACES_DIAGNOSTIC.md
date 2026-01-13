# 🔍 DIAGNOSTIC GOOGLE PLACES API - REQUEST_DENIED

## ❌ ERREUR ACTUELLE

```
❌ Google Places API status: REQUEST_DENIED
```

## 🎯 CAUSES POSSIBLES

### **1️⃣ Places API pas activée dans Google Cloud Console**

**Symptôme :** `REQUEST_DENIED`

**Solution :**
1. Va sur https://console.cloud.google.com
2. Sélectionne ton projet
3. Va dans **"APIs & Services"** → **"Library"**
4. Recherche **"Places API"**
5. Clique sur **"Places API (New)"** ou **"Places API"**
6. Clique sur **"ENABLE"** (Activer)

---

### **2️⃣ Restrictions de clé API mal configurées**

**Symptôme :** `REQUEST_DENIED`

**Solution :**

#### **Option A : Retirer temporairement TOUTES les restrictions (pour tester)**

1. Va sur https://console.cloud.google.com/apis/credentials
2. Clique sur ta clé API Google Places
3. Dans **"Application restrictions"** :
   - Sélectionne **"None"** (Aucune)
4. Dans **"API restrictions"** :
   - Sélectionne **"Don't restrict key"** (Ne pas restreindre la clé)
5. Clique sur **"Save"**
6. **Attends 5 minutes** (propagation de la configuration)
7. **Teste dans SmartCabb**

✅ Si ça fonctionne → Le problème venait des restrictions
❌ Si ça ne fonctionne toujours pas → Passe à la cause 3

#### **Option B : Configurer les bonnes restrictions (après test)**

Une fois que tu as confirmé que l'API fonctionne sans restrictions :

1. **Application restrictions :**
   - Sélectionne **"HTTP referrers (web sites)"**
   - Ajoute :
     ```
     https://smartcabb.com/*
     https://*.vercel.app/*
     https://*.supabase.co/*
     http://localhost:*
     ```

2. **API restrictions :**
   - Sélectionne **"Restrict key"**
   - Coche UNIQUEMENT :
     - ✅ **Places API (New)**
     - ✅ **Places API**
     - ✅ **Geocoding API** (optionnel, pour plus de fonctionnalités)
     - ✅ **Maps JavaScript API** (si tu utilises une carte interactive)

3. Clique sur **"Save"**

---

### **3️⃣ API activée mais quota dépassé**

**Symptôme :** `OVER_QUERY_LIMIT`

**Solution :**
1. Va sur https://console.cloud.google.com/apis/api/places-backend.googleapis.com/quotas
2. Vérifie les quotas :
   - **Requests per day :** 2,500 gratuits par jour
   - **Requests per minute :** 100
3. Si dépassé, attends 24h ou augmente le quota (facturation)

---

### **4️⃣ Mauvaise clé API copiée**

**Symptôme :** `REQUEST_DENIED`

**Solution :**

#### **Vérifie que tu as copié la BONNE clé :**

1. Va sur https://console.cloud.google.com/apis/credentials
2. Trouve ta clé API (devrait commencer par `AIzaSy...`)
3. Clique sur **"Show key"** (Afficher la clé)
4. Copie-la complètement (environ 39 caractères)
5. **Dans Figma Make :**
   - Recrée le secret `GOOGLE_PLACES_API_KEY` avec la nouvelle clé
6. **Dans Vercel :**
   - Remplace la valeur de `GOOGLE_PLACES_API_KEY`
   - Redéploie l'application

---

### **5️⃣ Facturation non activée sur Google Cloud**

**Symptôme :** `REQUEST_DENIED` ou `BILLING_NOT_ENABLED`

**Solution :**

Google Places API **NÉCESSITE** que la facturation soit activée, même si tu restes dans les limites gratuites.

1. Va sur https://console.cloud.google.com/billing
2. Si aucune facturation n'est configurée :
   - Clique sur **"Add billing account"**
   - Suis les étapes (carte bancaire requise)
   - ⚠️ **Rassure-toi :** Les 2,500 requêtes/jour sont GRATUITES
3. Associe le compte de facturation à ton projet
4. Attends 5-10 minutes
5. Teste dans SmartCabb

---

## 🧪 TESTS DE DIAGNOSTIC

### **Test 1 : Vérifier si la clé fonctionne directement**

Ouvre un nouvel onglet et colle cette URL (remplace `YOUR_API_KEY` par ta vraie clé) :

```
https://maps.googleapis.com/maps/api/place/autocomplete/json?input=lemba&key=YOUR_API_KEY&language=fr&components=country:cd
```

**Résultats attendus :**

✅ **Si ça fonctionne :**
```json
{
  "predictions": [...],
  "status": "OK"
}
```
→ La clé fonctionne, le problème vient de la configuration Figma Make/Vercel

❌ **Si ça ne fonctionne pas :**
```json
{
  "status": "REQUEST_DENIED",
  "error_message": "..."
}
```
→ Applique les solutions ci-dessus

---

### **Test 2 : Vérifier la clé dans Figma Make**

Dans la console du navigateur (F12) :

```javascript
// Appeler le backend proxy
fetch('https://zaerjqchzqmcxqblkfkg.supabase.co/functions/v1/make-server-2eb02e52/geocoding/autocomplete?q=lemba', {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphZXJqcWNoenFtY3hxYmxrZmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNDMyOTgsImV4cCI6MjA3NTcxOTI5OH0.qwFRKsi9Gw4VVYoEGBBCIj0-lAZOxtqlGQ0eT6cPhik'
  }
})
.then(r => r.json())
.then(data => {
  console.log('📊 Réponse Google Places:', data);
  if (data.error) {
    console.error('❌ Erreur:', data.error);
    console.error('💡 Status:', data.status);
  }
});
```

**Lis les logs du serveur backend dans Supabase :**

1. Va sur https://supabase.com/dashboard
2. Sélectionne ton projet `zaerjqchzqmcxqblkfkg`
3. Va dans **"Edge Functions"** → **"Logs"**
4. Cherche les logs commençant par :
   ```
   🔑 Google Places API Key présente: true/false
   🔑 Google Places API Key length: XX
   📊 Google Places API status: REQUEST_DENIED
   ```

---

## 🎯 SOLUTION RAPIDE (30 SECONDES)

**Si tu veux juste tester rapidement :**

### **Désactive temporairement Google Places**

Le système de fallback intelligent utilisera automatiquement Mapbox ou Nominatim.

Pas besoin de faire quoi que ce soit ! Le code gère déjà le fallback automatiquement.

**Tu auras quand même :**
- ✅ Mapbox (comme Uber)
- ✅ Nominatim (OpenStreetMap)
- ✅ Base locale Kinshasa (800+ lieux)

---

## 📋 CHECKLIST COMPLÈTE

Coche au fur et à mesure :

- [ ] **Places API activée** dans Google Cloud Console
- [ ] **Facturation activée** sur Google Cloud
- [ ] **Clé API copiée correctement** (commence par `AIzaSy`, ~39 caractères)
- [ ] **Restrictions retirées** (pour test) ou **bien configurées** (pour production)
- [ ] **Clé ajoutée dans Figma Make** (`GOOGLE_PLACES_API_KEY`)
- [ ] **Clé ajoutée dans Vercel** (`GOOGLE_PLACES_API_KEY`)
- [ ] **Vercel redéployé** après ajout de la clé
- [ ] **Attendu 5-10 minutes** pour la propagation
- [ ] **Testé l'URL directe** (Test 1 ci-dessus)
- [ ] **Testé via le backend** (Test 2 ci-dessus)

---

## 💡 ALTERNATIVES SI GOOGLE PLACES NE FONCTIONNE PAS

### **Option 1 : Utiliser uniquement Mapbox**

Mapbox fonctionne très bien et est suffisant pour SmartCabb !

**Avantages :**
- ✅ Déjà configuré et fonctionnel
- ✅ Précision professionnelle (comme Uber)
- ✅ Pas de facturation obligatoire
- ✅ 100,000 requêtes gratuites par mois

**Tu n'as RIEN à faire**, le fallback est déjà en place.

---

### **Option 2 : Activer Google Places plus tard**

Tu peux continuer avec Mapbox + Nominatim + Base locale maintenant, et activer Google Places quand tu veux.

---

## 🚀 APRÈS LA CORRECTION

Une fois que Google Places fonctionne, tu verras dans les logs :

```
🌍 Google Places Autocomplete - Query: lemba
🔑 Google Places API Key présente: true
🔑 Google Places API Key length: 39
📊 Google Places API status: OK
✅ Google Places returned 5 results
```

---

## 🆘 BESOIN D'AIDE ?

Si après tout ça, Google Places ne fonctionne toujours pas :

1. **Partage-moi le message d'erreur complet** depuis les logs Supabase
2. **Vérifie que tu as bien :**
   - Activé Places API
   - Activé la facturation
   - Configuré la clé correctement
3. **Utilise Mapbox en attendant** (déjà fonctionnel !)

---

## ✅ RÉSUMÉ EN 3 ÉTAPES

### **Étape 1 : Active Places API**
```
Google Cloud Console → APIs & Services → Library → "Places API" → ENABLE
```

### **Étape 2 : Active la facturation**
```
Google Cloud Console → Billing → Add billing account
```

### **Étape 3 : Retire les restrictions (temporaire)**
```
Google Cloud Console → Credentials → Ta clé API → 
Application restrictions: None
API restrictions: Don't restrict key
→ SAVE
```

**Attends 5 minutes et teste !** 🚀
