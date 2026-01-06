# 🧪 TESTS DE VÉRIFICATION - CALCUL SOLDE v517.91

## 📐 FORMULE CORRECTE

```
Nouveau Solde = Solde Actuel + (Prix Course - Commission)

Avec Commission = Prix Course × (Taux Commission / 100)
```

## ✅ SCÉNARIOS DE TEST

### Test 1 : Votre cas exact
```
Solde avant     : 103,400 CDF
Prix course     : 22,000 CDF
Taux commission : 15%
Commission      : 22,000 × 0.15 = 3,300 CDF
Gain net        : 22,000 - 3,300 = 18,700 CDF
──────────────────────────────────────────────
Nouveau solde   : 103,400 + 18,700 = 122,100 CDF ✅
```

**Résultat BUGGÉ avant v517.91 :** 144,100 CDF ❌  
**Différence :** 144,100 - 122,100 = 22,000 CDF (le montant brut!)

### Test 2 : Course à 10,000 CDF
```
Solde avant     : 50,000 CDF
Prix course     : 10,000 CDF
Taux commission : 15%
Commission      : 10,000 × 0.15 = 1,500 CDF
Gain net        : 10,000 - 1,500 = 8,500 CDF
──────────────────────────────────────────────
Nouveau solde   : 50,000 + 8,500 = 58,500 CDF ✅
```

### Test 3 : Commission 20% (paramètre admin modifié)
```
Solde avant     : 75,000 CDF
Prix course     : 15,000 CDF
Taux commission : 20%
Commission      : 15,000 × 0.20 = 3,000 CDF
Gain net        : 15,000 - 3,000 = 12,000 CDF
──────────────────────────────────────────────
Nouveau solde   : 75,000 + 12,000 = 87,000 CDF ✅
```

### Test 4 : Commission 10% (taux réduit)
```
Solde avant     : 100,000 CDF
Prix course     : 30,000 CDF
Taux commission : 10%
Commission      : 30,000 × 0.10 = 3,000 CDF
Gain net        : 30,000 - 3,000 = 27,000 CDF
──────────────────────────────────────────────
Nouveau solde   : 100,000 + 27,000 = 127,000 CDF ✅
```

### Test 5 : Multiple courses consécutives
```
Solde initial   : 100,000 CDF

Course 1        : 22,000 CDF
  Commission 15%: 3,300 CDF
  Gain net      : 18,700 CDF
  Solde après   : 118,700 CDF

Course 2        : 15,000 CDF
  Commission 15%: 2,250 CDF
  Gain net      : 12,750 CDF
  Solde après   : 131,450 CDF

Course 3        : 8,000 CDF
  Commission 15%: 1,200 CDF
  Gain net      : 6,800 CDF
──────────────────────────────────────────────
Solde final     : 138,250 CDF ✅
```

## 🔍 COMMENT VÉRIFIER DANS L'APP

### 1. Dashboard Conducteur - Carte "Solde actuel"
```
┌─────────────────────────────────┐
│  💰 Solde actuel                │
│                                 │
│  122,100 CDF            ✅      │
│  (non 144,100 CDF)      ❌      │
└─────────────────────────────────┘
```

### 2. Dashboard Conducteur - Carte "Aujourd'hui"
```
┌─────────────────────────────────┐
│  📊 Aujourd'hui                 │
│                                 │
│  1 course                       │
│  18,700 CDF            ✅       │
│  (non 0 CDF)           ❌       │
└─────────────────────────────────┘
```

### 3. Console Browser (F12)
Chercher ces logs après une course terminée :
```javascript
✅ v517.91 - Calcul paiement conducteur (VALIDÉ):
   coutTotal: 22,000 CDF (ce que le passager paie)
   commission: 15% = 3,300 CDF
   gainConducteur: 18,700 CDF (crédité au solde)
   
✅ Solde mis à jour: Backend + localStorage = 122,100 CDF
```

### 4. Logs Backend (Supabase)
```
💰 Détails financiers:
   prixTotal: 22000
   commission: 15% = 3300 CDF
   gainConducteur: 18700 CDF

💰 v517.91 - Le solde conducteur sera mis à jour par le frontend uniquement
   Gain net conducteur: 18700 CDF (Commission: 3300 CDF)
```

## 🚨 SIGNAUX D'ALERTE

### ❌ Bug toujours présent si :
- Solde augmente de 22,000 CDF au lieu de 18,700 CDF
- Solde augmente de 40,700 CDF (double addition : 22,000 + 18,700)
- Carte "Aujourd'hui" affiche 0 CDF

### ❌ Nouveau bug si :
- Solde ne change pas du tout après une course
- Solde diminue au lieu d'augmenter
- Erreur 500 dans les logs backend

### ✅ Tout fonctionne si :
- Solde augmente EXACTEMENT du montant NET calculé
- Carte "Aujourd'hui" affiche le bon gain
- Logs frontend et backend sont cohérents
- Pas d'erreur dans la console

## 📊 TABLEAU DE VÉRIFICATION RAPIDE

| Prix Course | Commission 15% | Gain Net  | Solde Avant | Solde Après CORRECT | Solde BUGGÉ |
|-------------|----------------|-----------|-------------|---------------------|-------------|
| 10,000 CDF  | 1,500 CDF      | 8,500 CDF | 50,000 CDF  | 58,500 CDF ✅       | 68,500 CDF ❌ |
| 15,000 CDF  | 2,250 CDF      | 12,750 CDF| 75,000 CDF  | 87,750 CDF ✅       | 102,750 CDF ❌|
| 20,000 CDF  | 3,000 CDF      | 17,000 CDF| 100,000 CDF | 117,000 CDF ✅      | 137,000 CDF ❌|
| 22,000 CDF  | 3,300 CDF      | 18,700 CDF| 103,400 CDF | 122,100 CDF ✅      | 144,100 CDF ❌|
| 30,000 CDF  | 4,500 CDF      | 25,500 CDF| 150,000 CDF | 175,500 CDF ✅      | 205,500 CDF ❌|

**Différence systématique (bug) :** Le montant brut de la course est ajouté en trop

## 🎯 CHECKLIST DE VALIDATION

Après déploiement, cocher les éléments suivants :

**Tests basiques :**
- [ ] Le solde augmente après une course
- [ ] Le montant ajouté correspond au gain NET (prix - commission)
- [ ] La carte "Aujourd'hui" affiche le bon montant
- [ ] Pas d'erreur dans Console Browser
- [ ] Pas d'erreur dans logs Supabase

**Tests avancés :**
- [ ] Faire 2 courses consécutives → solde correct après chaque course
- [ ] Modifier le taux de commission admin → calcul s'adapte
- [ ] Comparer solde affiché vs localStorage vs backend KV store → tous identiques
- [ ] Recharger la page → solde persiste correctement

**Vérifications financières :**
- [ ] Utiliser calculatrice pour vérifier : Prix - (Prix × 0.15) = Montant ajouté
- [ ] Vérifier que la commission est bien déduite
- [ ] S'assurer qu'aucun montant n'est ajouté 2 fois

## 🔢 CALCULATRICE RAPIDE

Pour vérifier rapidement si le calcul est correct :

```javascript
// Console Browser (F12)
const prixCourse = 22000;
const tauxCommission = 15; // %
const commission = Math.round(prixCourse * (tauxCommission / 100));
const gainNet = prixCourse - commission;

console.log('Prix course:', prixCourse, 'CDF');
console.log('Commission:', commission, 'CDF');
console.log('Gain net:', gainNet, 'CDF');

// Exemple avec votre cas :
// Prix course: 22000 CDF
// Commission: 3300 CDF
// Gain net: 18700 CDF ✅
```

---

**Version :** v517.91  
**Date :** 23 décembre 2024  
**Type :** Tests de validation  
**Durée estimée :** 10-15 minutes
