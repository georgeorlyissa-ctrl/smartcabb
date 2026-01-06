# 🐛 DEBUG - CARTE TRACKING PAS VISIBLE

## 🎯 PROBLÈME RAPPORTÉ :
"Passager : Écran carte temps réel montrant le conducteur se déplacer - Je ne vois pas ça"

## ✅ CODE VÉRIFIÉ - TOUT EST OK :

### 1. **`DriverFoundScreen.tsx`** ✅
- Vérifie le statut toutes les 2 secondes
- Quand `status === 'in_progress'` → Navigation vers `ride-tracking`
- **Ligne 138** : `setCurrentScreen('ride-tracking')`

### 2. **`PassengerApp.tsx`** ✅
- **Ligne 191-196** : Route `ride-tracking` affiche `<RideTrackingScreen />`
- Import correct : **Ligne 22**

### 3. **`RideTrackingScreen.tsx`** ✅
- **Ligne 126-146** : Affiche `<InteractiveMapView>` avec :
  - Position du conducteur en temps réel
  - Route du trajet
  - Markers de départ et destination
- **Polling toutes les 5 secondes** pour mettre à jour la position du conducteur

---

## 🔍 TESTS À EFFECTUER :

### **Test 1 : Vérifier la navigation**

1. Ouvrir **Console navigateur** (F12)
2. Côté **Passager** :
   - Réserver une course
   - Voir "Chauffeur trouvé"
   - **CHERCHER DANS LA CONSOLE** :
     ```
     🚗 Conducteur a confirmé le code ! Course démarrée
     ✅ Course démarrée, redirection vers paiement
     ```

3. Si vous voyez ces logs, vérifiez **quel écran s'affiche** :
   - Regardez le **currentScreen** dans la console
   - Est-ce bien `ride-tracking` ?

---

### **Test 2 : Vérifier que le code conducteur est confirmé**

**Côté Conducteur :**
1. Accepter la course
2. Voir l'écran avec le **code de confirmation** (ex: 1977)
3. **CLIQUER SUR "CONFIRMER LE CODE"**
4. Vérifier dans la console :
   ```
   ✅ Course démarrée avec succès
   ```

**Côté Passager :**
1. Attendre 2 secondes maximum
2. L'écran devrait passer automatiquement à la carte

---

### **Test 3 : Vérifier manuellement le statut de la course**

Ouvrir la **Console navigateur** et exécuter :

```javascript
// Récupérer l'ID de la course
const rideId = localStorage.getItem('currentRideId'); // Si stocké en local
console.log('Current Ride ID:', rideId);

// Vérifier le statut dans le backend
fetch(`https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-2eb02e52/rides/${rideId}`, {
  headers: {
    'Authorization': 'Bearer YOUR_PUBLIC_ANON_KEY'
  }
})
.then(r => r.json())
.then(data => console.log('Statut course:', data.ride?.status));
```

**Statuts possibles :**
- `pending` → En attente d'un conducteur
- `accepted` → Conducteur a accepté, en attente de confirmation du code
- `in_progress` → Code confirmé, course démarrée
- `completed` → Course terminée

---

## 🔥 SCÉNARIOS POSSIBLES :

### **Scénario A : Le conducteur n'a pas confirmé le code**
- **Symptôme** : L'écran reste sur "Chauffeur trouvé"
- **Cause** : Le conducteur n'a pas cliqué sur "Confirmer le code"
- **Solution** : Côté conducteur, aller sur l'écran de confirmation et confirmer

### **Scénario B : La navigation ne se fait pas**
- **Symptôme** : Le statut passe à `in_progress` mais l'écran ne change pas
- **Cause** : Problème de routing
- **Solution** : Vérifier les logs console pour voir si `setCurrentScreen('ride-tracking')` est appelé

### **Scénario C : RideTrackingScreen s'affiche mais la carte ne se charge pas**
- **Symptôme** : Écran blanc ou erreur dans InteractiveMapView
- **Cause** : Données manquantes (pickup, destination, driverLocation)
- **Solution** : Vérifier que `currentRide` contient bien `pickup` et `destination`

### **Scénario D : Pas de position conducteur**
- **Symptôme** : La carte s'affiche mais le marker du conducteur n'apparaît pas
- **Cause** : Le backend ne retourne pas la position du conducteur
- **Solution** : Vérifier la route `/drivers/${driverId}/location` dans le backend

---

## 🚀 CHECKLIST DE DÉBOGAGE :

### **Côté Frontend :**
- [ ] Fichier `DriverApp.tsx` copié dans GitHub ✅
- [ ] Fichier `PassengerApp.tsx` copié dans GitHub ✅
- [ ] Fichier `RideTrackingScreen.tsx` copié dans GitHub ✅
- [ ] Fichier `DriverFoundScreen.tsx` copié dans GitHub ✅
- [ ] Build Vercel réussi ✅
- [ ] App déployée sur smartcabb.com ✅

### **Côté Backend :**
- [ ] Route `/rides/:id` retourne bien le statut
- [ ] Route `/rides/start` met le statut à `in_progress`
- [ ] Route `/drivers/:id/location` retourne la position

### **Côté Test :**
- [ ] Conducteur confirme bien le code
- [ ] Logs console montrent "Course démarrée"
- [ ] currentScreen passe à `ride-tracking`
- [ ] RideTrackingScreen s'affiche
- [ ] Carte InteractiveMapView se charge
- [ ] Position du conducteur s'affiche

---

## 🔧 FIX RAPIDE SI LE PROBLÈME PERSISTE :

### **Option 1 : Forcer la navigation manuellement**

Dans la **Console navigateur**, exécutez :

```javascript
// Forcer la navigation vers l'écran de tracking
window.dispatchEvent(new CustomEvent('set-screen', { detail: 'ride-tracking' }));
```

### **Option 2 : Vérifier le state global**

```javascript
// Afficher le state complet
const state = JSON.parse(localStorage.getItem('app-state') || '{}');
console.log('State global:', state);
console.log('Current Screen:', state.currentScreen);
console.log('Current Ride:', state.currentRide);
```

### **Option 3 : Simuler un changement de statut**

```javascript
// Mettre à jour manuellement le statut de la course
const currentRide = { ...state.currentRide, status: 'in_progress' };
localStorage.setItem('app-state', JSON.stringify({ ...state, currentRide, currentScreen: 'ride-tracking' }));
location.reload();
```

---

## 📊 LOGS ATTENDUS :

### **Côté Passager (Console) :**
```
🚀 PassengerApp monté - currentScreen: driver-found
🔍 Vérification statut course...
🚗 Conducteur a confirmé le code ! Course démarrée
✅ Course démarrée, redirection vers paiement
🗺️ RideTrackingScreen monté
🔄 Récupération position conducteur...
✅ Position conducteur: { lat: -4.3276, lng: 15.3136 }
```

### **Côté Conducteur (Console) :**
```
🚗 DriverApp - Démarrage
✅ Code confirmé : 1977
🚀 Démarrage de course...
✅ Course démarrée avec succès
🗺️ ActiveRideScreen affiché
```

---

## 🎯 PROCHAINE ÉTAPE :

1. **Effectuer les tests ci-dessus**
2. **Copier les logs de la console** (passager ET conducteur)
3. **Me les envoyer** pour que je puisse identifier exactement où ça bloque

---

**QUESTION RAPIDE :**
Quand le conducteur confirme le code :
- Voyez-vous un **toast** (notification) "Course démarrée !" côté passager ?
- L'écran change-t-il ou reste-t-il bloqué sur "Chauffeur trouvé" ?
