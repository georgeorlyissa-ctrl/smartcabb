# 🎯 VÉRIFICATION VISUELLE RAPIDE - v517.91

## 🔍 TEST EN 3 ÉTAPES (30 SECONDES)

### ÉTAPE 1 : Noter le solde actuel
```
┌─────────────────────────────────┐
│  💰 Solde actuel                │
│                                 │
│  103,400 CDF       ← NOTER CE MONTANT
└─────────────────────────────────┘
```
**Action :** Écrire le montant sur un papier ou mémoriser

---

### ÉTAPE 2 : Effectuer une course
```
Exemple de course test :
- Prix affiché au passager : 22,000 CDF
- Vous savez que la commission est 15%
- Donc vous DEVEZ recevoir : 22,000 - (22,000 × 0.15) = 18,700 CDF
```

**Calculatrice rapide pour votre cas :**
| Prix Course | Commission 15% | Vous recevez |
|-------------|----------------|--------------|
| 10,000 CDF  | 1,500 CDF      | **8,500 CDF** |
| 15,000 CDF  | 2,250 CDF      | **12,750 CDF** |
| 20,000 CDF  | 3,000 CDF      | **17,000 CDF** |
| 22,000 CDF  | 3,300 CDF      | **18,700 CDF** ← Votre cas |
| 25,000 CDF  | 3,750 CDF      | **21,250 CDF** |
| 30,000 CDF  | 4,500 CDF      | **25,500 CDF** |

---

### ÉTAPE 3 : Vérifier le nouveau solde

#### ✅ CAS CORRECT (bug corrigé)
```
┌─────────────────────────────────┐
│  💰 Solde actuel                │
│                                 │
│  122,100 CDF       ← 103,400 + 18,700
└─────────────────────────────────┘

Calcul : 103,400 + 18,700 = 122,100 ✅
```

#### ❌ CAS BUGGÉ (bug toujours présent)
```
┌─────────────────────────────────┐
│  💰 Solde actuel                │
│                                 │
│  144,100 CDF       ← 103,400 + 40,700 ???
└─────────────────────────────────┘

Calcul : 103,400 + 22,000 (brut) + 18,700 (net) = 144,100 ❌
Ou      : 103,400 + 22,000 (brut) = 125,400 ❌
```

---

## 📊 VÉRIFICATION CARTE "AUJOURD'HUI"

### ✅ Affichage CORRECT
```
┌─────────────────────────────────┐
│  📊 Aujourd'hui                 │
│                                 │
│  1 course                       │
│  18,700 CDF        ← Gain NET
└─────────────────────────────────┘
```

### ❌ Affichage BUGGÉ
```
┌─────────────────────────────────┐
│  📊 Aujourd'hui                 │
│                                 │
│  1 course                       │
│  0 CDF             ← BUG !
└─────────────────────────────────┘
```

---

## 🧮 FORMULE À RETENIR

```
┌──────────────────────────────────────────────────┐
│  GAIN NET = Prix Course - (Prix Course × 0.15)  │
│                                                  │
│  Nouveau Solde = Ancien Solde + GAIN NET        │
└──────────────────────────────────────────────────┘
```

**Exemples concrets :**
- Course 10,000 CDF → Gain : 8,500 CDF
- Course 15,000 CDF → Gain : 12,750 CDF
- Course 20,000 CDF → Gain : 17,000 CDF
- Course 22,000 CDF → Gain : 18,700 CDF ← Votre cas
- Course 30,000 CDF → Gain : 25,500 CDF

---

## 🎯 CHECKLIST RAPIDE

Après avoir fait UNE course :

- [ ] Le solde a augmenté (pas diminué)
- [ ] L'augmentation = Prix Course - Commission 15%
- [ ] La carte "Aujourd'hui" affiche un montant (pas 0 CDF)
- [ ] Le montant "Aujourd'hui" = L'augmentation du solde
- [ ] Pas de message d'erreur dans l'app

**Si les 5 cases sont cochées → ✅ Bug corrigé !**

---

## 🚨 SIGNAUX D'ALERTE

### Solde augmente TROP
```
Exemple : Course 22,000 CDF
Solde avant : 100,000 CDF
Solde après : 140,700 CDF  ← BUG ! (+40,700 au lieu de +18,700)
```
**Cause probable :** Double addition toujours présente

### Solde augmente du montant BRUT
```
Exemple : Course 22,000 CDF
Solde avant : 100,000 CDF
Solde après : 122,000 CDF  ← BUG ! (+22,000 au lieu de +18,700)
```
**Cause probable :** Commission non déduite

### Solde n'augmente PAS
```
Exemple : Course 22,000 CDF
Solde avant : 100,000 CDF
Solde après : 100,000 CDF  ← BUG ! (aucun changement)
```
**Cause probable :** Code backend ET frontend tous deux désactivés

### Carte "Aujourd'hui" affiche 0 CDF
```
┌─────────────────────────────────┐
│  📊 Aujourd'hui                 │
│  1 course                       │
│  0 CDF             ← BUG !      │
└─────────────────────────────────┘
```
**Cause probable :** Calcul des statistiques du jour cassé

---

## 💡 ASTUCE ULTRA-RAPIDE

**Sans calculatrice :**

Pour commission 15%, voici le montant que vous recevez :
- **85% du prix de la course**

Exemple :
- Course 10,000 CDF → Vous : 8,500 CDF (85%)
- Course 20,000 CDF → Vous : 17,000 CDF (85%)
- Course 22,000 CDF → Vous : 18,700 CDF (85%)

**Formule mentale rapide :**
```
Gain ≈ Prix × 0.85
     ≈ Prix - (Prix ÷ 7)  [approximation]
```

---

## 📱 VÉRIFICATION CONSOLE (OPTIONNEL)

Appuyez sur **F12** dans le navigateur, puis cherchez :

### ✅ Logs CORRECTS
```javascript
✅ v517.91 - Calcul paiement conducteur (VALIDÉ):
   coutTotal: 22,000 CDF
   commission: 15% = 3,300 CDF
   gainConducteur: 18,700 CDF (crédité au solde)

✅ Solde mis à jour: 122,100 CDF
```

### ❌ Logs SUSPECTS
```javascript
❌ NaN dans les calculs
❌ Montant invalide
❌ Erreur 500
❌ Solde Backend != Solde Frontend
```

---

## 🎬 SCÉNARIO COMPLET

**Situation de départ :**
- Vous êtes conducteur
- Solde actuel : 103,400 CDF
- Vous acceptez une course à 22,000 CDF

**Après la course (v517.91 CORRIGÉ) :**
```
✅ Solde affiché : 122,100 CDF
✅ Augmentation  : +18,700 CDF
✅ Carte "Auj."  : 18,700 CDF
✅ Commission    : 3,300 CDF déduite
```

**Avant la correction (BUGGÉ) :**
```
❌ Solde affiché : 144,100 CDF
❌ Augmentation  : +40,700 CDF (!!!)
❌ Carte "Auj."  : 0 CDF
❌ Commission    : Ajoutée 2 fois
```

---

**Version :** v517.91  
**Test durée :** 30 secondes  
**Difficulté :** Très facile  
**Nécessite :** Une course test + une calculatrice (optionnel)
