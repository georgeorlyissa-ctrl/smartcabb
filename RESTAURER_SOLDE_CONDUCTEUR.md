# 🔧 GUIDE: RESTAURER LE SOLDE DU CONDUCTEUR

## 📅 Date : 22 décembre 2024 - 21:15

---

## ❓ POURQUOI LE SOLDE EST À 0 CDF ?

### Causes possibles :

1. **localStorage vidé** ✅ PROBABLE
   - Le cache du navigateur a été nettoyé
   - La clé `driver_balance_${driverId}` a été supprimée
   - Hard reload (Ctrl+Shift+R) a effacé les données

2. **Backend KV store réinitialisé**
   - La clé `driver:${driverId}:balance` n'existe plus dans le KV
   - Le backend retourne `0` par défaut si aucune valeur trouvée

3. **Première connexion du conducteur**
   - Nouveau conducteur = solde initial à 0

---

## ✅ SOLUTIONS IMMÉDIATES

### Solution 1️⃣ : Via la Console Navigateur (RAPIDE)

1. **Ouvrir la console** : F12 → Console

2. **Copier-coller ce code** :
   ```javascript
   // 💰 RESTAURER LE SOLDE MANUELLEMENT
   
   // Exemple: Définir le solde à 50 000 CDF
   const montant = 50000; // ✏️ MODIFIE CE MONTANT
   
   // Récupérer l'ID du conducteur
   const driver = JSON.parse(localStorage.getItem('smartcab_current_driver'));
   const driverId = driver.id;
   
   // Sauvegarder dans localStorage
   localStorage.setItem(`driver_balance_${driverId}`, montant.toString());
   
   console.log(`✅ Solde restauré à ${montant.toLocaleString()} CDF`);
   console.log(`🔄 Actualise la page (F5) pour voir le changement`);
   ```

3. **Actualiser la page** : F5

4. **Vérifier** : Le solde devrait s'afficher !

---

### Solution 2️⃣ : Via le Backend (PERMANENT)

1. **Ouvrir la console** : F12 → Console

2. **Copier-coller ce code** :
   ```javascript
   // 💰 METTRE À JOUR LE SOLDE DANS LE BACKEND
   
   const montant = 50000; // ✏️ MODIFIE CE MONTANT
   
   const driver = JSON.parse(localStorage.getItem('smartcab_current_driver'));
   const driverId = driver.id;
   const projectId = 'xyfxtsvzmegcgwxayhnn';
   const publicAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5Znh0c3Z6bWVnY2d3eGF5aG5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE3MDIzNjksImV4cCI6MjA0NzI3ODM2OX0.v5PZP6m1Wiq_9ZsvwAZ5mjPMlPJE94Q0fmS_I8_M-W0';
   
   fetch(`https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/drivers/${driverId}/balance`, {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${publicAnonKey}`,
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       balance: montant
     })
   })
   .then(response => response.json())
   .then(data => {
     if (data.success) {
       console.log(`✅ Solde mis à jour dans le backend: ${montant.toLocaleString()} CDF`);
       
       // Mettre à jour aussi le localStorage
       localStorage.setItem(`driver_balance_${driverId}`, montant.toString());
       
       console.log('🔄 Actualise la page (F5) pour voir le changement');
     } else {
       console.error('❌ Erreur:', data);
     }
   })
   .catch(error => {
     console.error('❌ Erreur réseau:', error);
   });
   ```

3. **Actualiser la page** : F5

4. **Vérifier** : Le solde devrait s'afficher ET être persistant !

---

### Solution 3️⃣ : Recharge via le Modal (NORMAL)

1. Dans l'app conducteur, cliquer sur **"Recharger"**
2. Choisir un montant (ex: 50 000 CDF)
3. Sélectionner l'opérateur (M-Pesa, Airtel Money, Orange Money)
4. Entrer le numéro de téléphone
5. Cliquer sur **"Payer"**
6. Le solde sera mis à jour automatiquement

---

## 🔍 DIAGNOSTIC

### Vérifier si le problème vient du localStorage :

```javascript
// Console
const driver = JSON.parse(localStorage.getItem('smartcab_current_driver'));
const savedBalance = localStorage.getItem(`driver_balance_${driver.id}`);
console.log('💾 Solde localStorage:', savedBalance);
```

**Résultat attendu :**
- `null` → Le localStorage a été vidé ❌
- `"50000"` → Le localStorage contient un solde ✅

---

### Vérifier si le problème vient du backend :

```javascript
// Console
const driver = JSON.parse(localStorage.getItem('smartcab_current_driver'));
const projectId = 'xyfxtsvzmegcgwxayhnn';
const publicAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5Znh0c3Z6bWVnY2d3eGF5aG5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE3MDIzNjksImV4cCI6MjA0NzI3ODM2OX0.v5PZP6m1Wiq_9ZsvwAZ5mjPMlPJE94Q0fmS_I8_M-W0';

fetch(`https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/drivers/${driver.id}/balance`, {
  headers: { 'Authorization': `Bearer ${publicAnonKey}` }
})
.then(r => r.json())
.then(data => console.log('🗄️ Solde backend:', data.balance));
```

**Résultat attendu :**
- `0` → Le backend ne contient pas de solde ❌
- `50000` → Le backend contient un solde ✅

---

## 🛠️ COMPOSANT DEBUG (v517.78)

J'ai créé un composant `DriverBalanceManager.tsx` qui permet de :
- ✅ Synchroniser avec le backend
- ✅ Vérifier le localStorage
- ✅ Mettre à jour manuellement le solde

### Pour l'activer :

Le composant s'affiche **automatiquement** quand le solde est à `0 CDF`.

Il propose 3 actions :
1. **Synchroniser avec Backend** → Récupère le solde du KV store
2. **Vérifier localStorage** → Affiche le solde sauvegardé
3. **Mettre à jour manuellement** → Permet de définir un nouveau solde

---

## 📊 DONNÉES TECHNIQUES

### localStorage :
```
Clé: driver_balance_${driverId}
Valeur: "50000" (string)
```

### Backend KV :
```
Clé: driver:${driverId}:balance
Valeur: 50000 (number) ou { balance: 50000 } (object)
```

### État React :
```typescript
const [accountBalance, setAccountBalance] = useState(0);
```

---

## 🔄 FLUX DE CHARGEMENT DU SOLDE

```
1. Page charge
   ↓
2. useEffect se déclenche
   ↓
3. Essaie de charger depuis le backend
   ↓
4. Si backend retourne 0, essaie localStorage
   ↓
5. Si localStorage existe, utilise cette valeur
   ↓
6. Affiche le solde
```

**Problème actuel :** Les deux sources (backend + localStorage) retournent `0` ou `null`.

---

## ✅ RECOMMANDATIONS

### Pour éviter ce problème à l'avenir :

1. **Toujours sauvegarder dans les 2 endroits** :
   - Backend KV (source de vérité)
   - localStorage (cache rapide)

2. **Synchroniser régulièrement** :
   - Toutes les 30 secondes
   - À chaque changement de solde
   - Au chargement de la page

3. **Ajouter un fallback** :
   - Si backend échoue → localStorage
   - Si localStorage vide → 0 CDF (mais afficher warning)

---

## 🚨 ACTIONS IMMÉDIATES

### Pour restaurer TON solde MAINTENANT :

1. **Copie-colle la Solution 2** dans la console
2. **Change le montant** à la valeur souhaitée
3. **Actualise** la page
4. **Vérifie** que le solde s'affiche

**C'est tout ! Simple et rapide !** ✅

---

## 📝 FICHIERS CRÉÉS (v517.78)

1. **`components/driver/DriverBalanceManager.tsx`**
   - Composant de gestion du solde
   - S'affiche quand solde = 0
   - Permet de restaurer/synchroniser

2. **`RESTAURER_SOLDE_CONDUCTEUR.md`** (ce fichier)
   - Guide de restauration
   - Solutions pas à pas

---

**UTILISE LA SOLUTION 2 (BACKEND) POUR UN FIX PERMANENT ! 💪**
