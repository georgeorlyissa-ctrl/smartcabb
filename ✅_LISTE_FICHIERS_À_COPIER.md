# ✅ LISTE DES FICHIERS À COPIER DANS GITHUB

**Pour implémenter le scénario complet SmartCabb**

---

## 📁 **FICHIERS MODIFIÉS (6 fichiers)**

### **1. `/pages/PassengerApp.tsx`**
- ✅ Ajout import `DriverFoundScreen` et `LiveTrackingScreen`
- ✅ Ajout cases `driver-found` et `live-tracking` dans le switch
- **Action** : Copier tout le fichier

---

### **2. `/components/passenger/RideScreen.tsx`**
- ✅ Navigation vers `driver-found` quand conducteur accepte
- ✅ Navigation vers `live-tracking` quand course démarre
- **Action** : Copier tout le fichier

---

### **3. `/components/passenger/DriverFoundScreen.tsx`**
- ✅ Ajout polling pour détecter confirmation code
- ✅ Navigation automatique vers `live-tracking`
- **Action** : Copier tout le fichier

---

### **4. `/components/passenger/LiveTrackingMap.tsx`**
- ✅ Ajout imports `useAppState` et `toast`
- **Action** : Copier tout le fichier

---

### **5. `/components/passenger/LiveTrackingScreen.tsx`** ⭐ **NOUVEAU**
- ✅ Wrapper avec polling pour détecter clôture course
- ✅ Navigation automatique vers `payment`
- **Action** : **CRÉER ce nouveau fichier**

---

### **6. `/components/passenger/MapScreen.tsx`**
- ✅ Suppression toasts GPS pour interface propre
- **Action** : Copier tout le fichier

---

## 🔄 **ORDRE DE MODIFICATION DANS GITHUB**

### **Étape 1 : Créer le nouveau fichier**
1. Créez `/components/passenger/LiveTrackingScreen.tsx`
2. Copiez le code complet (voir document principal)

### **Étape 2 : Modifier les fichiers existants**
1. `/components/passenger/DriverFoundScreen.tsx`
2. `/components/passenger/LiveTrackingMap.tsx`
3. `/components/passenger/RideScreen.tsx`
4. `/components/passenger/MapScreen.tsx`
5. `/pages/PassengerApp.tsx` (en dernier car il importe les autres)

---

## 📝 **MESSAGE DE COMMIT**

```
feat: flux complet passager avec écrans fixes et tracking temps réel

- DriverFoundScreen : page fixe avec infos chauffeur + WhatsApp
- LiveTrackingScreen : carte OpenStreetMap temps réel
- Polling automatique pour transitions
- Suppression toasts GPS
- Navigation linéaire complète
```

---

## ✅ **CHECKLIST AVANT PUSH**

- [ ] Les 6 fichiers sont modifiés/créés
- [ ] Tous les imports sont corrects
- [ ] Le code compile sans erreur
- [ ] Les noms de fichiers sont exacts
- [ ] Le message de commit est clair

---

## 🚀 **APRÈS DÉPLOIEMENT**

### **Test du flux complet**

1. Commander une course → écran `DriverFoundScreen` s'affiche
2. Code de confirmation visible (4 chiffres)
3. Bouton WhatsApp fonctionnel
4. (Conducteur confirme) → écran `LiveTrackingScreen` s'affiche
5. Carte OpenStreetMap visible avec position chauffeur
6. (Conducteur clôture) → écran `PaymentScreen` s'affiche
7. Payer → écran `RatingScreen` s'affiche
8. Évaluer → retour à la carte

---

**Tous les fichiers sont dans Figma Make et prêts à être copiés !** 📋
