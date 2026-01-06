# 📋 LISTE DES 5 FICHIERS À COPIER DANS GITHUB

## ✅ FICHIERS CORRIGÉS - À COPIER OBLIGATOIREMENT :

### 1️⃣ **`pages/PassengerApp.tsx`**
- **Chemin dans Figma Make** : `pages` → `PassengerApp.tsx`
- **Action** : Remplacer tout le contenu
- **Correction** : Route `ride-tracking` corrigée

---

### 2️⃣ **`pages/DriverApp.tsx`**
- **Chemin dans Figma Make** : `pages` → `DriverApp.tsx`
- **Action** : Remplacer tout le contenu
- **Correction** : Ajout des routes `active-ride` et `payment-confirmation`

---

### 3️⃣ **`components/passenger/RideTrackingScreen.tsx`**
- **Chemin dans Figma Make** : `components` → `passenger` → `RideTrackingScreen.tsx`
- **Action** : Remplacer tout le contenu
- **Correction** : ✅ **AJOUT de l'interface `Location`** (ligne 15-19)

---

### 4️⃣ **`components/passenger/DriverFoundScreen.tsx`**
- **Chemin dans Figma Make** : `components` → `passenger` → `DriverFoundScreen.tsx`
- **Action** : Remplacer tout le contenu
- **Correction** : Navigation vers `ride-tracking` au lieu de `live-tracking`

---

### 5️⃣ **`components/driver/ClientInfoScreen.tsx`**
- **Chemin dans Figma Make** : `components` → `driver` → `ClientInfoScreen.tsx`
- **Action** : Remplacer tout le contenu
- **Correction** : Affichage du point de départ et destination

---

## 🚫 FICHIERS DÉJÀ CRÉÉS - NE PAS RECOPIER :

Ces fichiers existent déjà et fonctionnent correctement :

- ✅ `components/driver/ActiveRideScreen.tsx`
- ✅ `components/driver/PaymentConfirmationScreen.tsx`
- ✅ `components/passenger/PaymentScreen.tsx`
- ✅ `components/passenger/RatingScreen.tsx`

---

## 📝 PROCÉDURE EXACTE :

### **DANS FIGMA MAKE :**

1. Cliquez sur **`pages`** dans le panneau de gauche
2. Cliquez sur **`PassengerApp.tsx`**
3. Sélectionnez **TOUT LE CODE** (Ctrl+A ou Cmd+A)
4. Copiez (Ctrl+C ou Cmd+C)

### **DANS GITHUB :**

1. Allez dans votre dépôt `smartcabb`
2. Naviguez vers `pages/PassengerApp.tsx`
3. Cliquez sur **"Edit"** (icône crayon)
4. **Supprimez TOUT** (Ctrl+A puis Suppr)
5. **Collez le nouveau code** (Ctrl+V)
6. Cliquez **"Commit changes"**
7. Message : `fix: route ride-tracking corrigée`

### **RÉPÉTEZ POUR LES 5 FICHIERS**

---

## 🎯 ORDRE RECOMMANDÉ :

1. ✅ `components/passenger/RideTrackingScreen.tsx` (FIX CRITIQUE - Type manquant)
2. ✅ `pages/PassengerApp.tsx` (FIX CRITIQUE - Route incorrecte)
3. ✅ `components/passenger/DriverFoundScreen.tsx` (Navigation)
4. ✅ `pages/DriverApp.tsx` (Routes driver)
5. ✅ `components/driver/ClientInfoScreen.tsx` (Affichage infos)

---

## 🔥 POURQUOI LE BUILD ÉCHOUAIT :

### **Erreur TypeScript** :
```
Property 'lat' does not exist on type 'Location'
```

**Cause** : L'interface `Location` n'était pas définie dans `RideTrackingScreen.tsx`

**Solution** : Ajout de :
```typescript
interface Location {
  lat: number;
  lng: number;
  address: string;
}
```

---

## ✅ APRÈS COPIE DES 5 FICHIERS :

1. **Commit** avec message : `"fix: erreur TypeScript + routes tracking corrigées"`
2. **Push** vers `main`
3. **Vercel redéploie automatiquement**
4. **Vérifier** que le build passe (statut "Ready")

---

## 🧪 TEST FINAL :

### **Côté Passager :**
1. Réserver une course
2. Voir "Chauffeur trouvé" avec code 1977
3. ✅ **L'écran doit passer automatiquement au tracking** (plus de blocage !)

### **Côté Conducteur :**
1. Accepter course
2. Confirmer code
3. ✅ **Voir le point de départ et la destination**
4. ✅ **Bouton WhatsApp fonctionne**

---

**TOUT EST PRÊT DANS FIGMA MAKE ! COPIEZ LES 5 FICHIERS ! 🚀**
