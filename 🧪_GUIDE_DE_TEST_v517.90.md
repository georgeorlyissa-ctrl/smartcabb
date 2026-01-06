# 🧪 GUIDE DE TEST - v517.90

## 📋 Checklist de test complète

### Phase 1 : Vérification du build
- [ ] Le build Vercel se termine sans erreur
- [ ] Aucun warning TypeScript
- [ ] L'application démarre correctement

### Phase 2 : Test du dashboard conducteur
- [ ] La page de connexion conducteur fonctionne
- [ ] Le dashboard s'affiche correctement
- [ ] La carte "Solde actuel" affiche le bon montant
- [ ] La carte "Aujourd'hui" affiche les gains nets (≠ 0 CDF si courses terminées)
- [ ] La carte "En ligne" affiche le temps
- [ ] La carte "Note" affiche la note du conducteur
- [ ] La carte "Courses" affiche le nombre de courses d'aujourd'hui

### Phase 3 : Test de la page "Mes gains"
- [ ] Le bouton "Mes gains" fonctionne
- [ ] La page "Mes gains" s'affiche correctement
- [ ] L'onglet "Aujourd'hui" est sélectionné par défaut
- [ ] Le "Total brut" affiche le montant correct
- [ ] Le "Net (après commission)" correspond à "Aujourd'hui" du dashboard
- [ ] La "Commission" est correcte (15% du total brut)
- [ ] Le "Courses" affiche le bon nombre

### Phase 4 : Test des détails de courses
- [ ] Les détails affichent toutes les courses du jour
- [ ] Chaque course affiche l'heure correcte
- [ ] L'adresse de départ est complète (pas "undefined" ou "N/A")
- [ ] L'adresse de destination est complète
- [ ] La distance est affichée en km
- [ ] La durée est affichée en minutes
- [ ] Le montant brut est correct
- [ ] Le montant net est correct
- [ ] La commission est affichée
- [ ] La note du passager est affichée si disponible

### Phase 5 : Test de synchronisation
- [ ] Rafraîchir la page (F5)
- [ ] Les montants restent corrects après le refresh
- [ ] Le solde est toujours synchronisé
- [ ] Les gains d'aujourd'hui sont toujours corrects

### Phase 6 : Test d'une nouvelle course
- [ ] Accepter une nouvelle course
- [ ] Démarrer la course
- [ ] Terminer la course
- [ ] Vérifier que le solde augmente
- [ ] Vérifier que "Aujourd'hui" augmente
- [ ] Vérifier que "Courses" s'incrémente
- [ ] Ouvrir "Mes gains" et vérifier que la nouvelle course apparaît

### Phase 7 : Test des logs console
- [ ] Ouvrir la console (F12)
- [ ] Vérifier la présence du log : `📊 v517.90 - Stats aujourd'hui depuis KV store`
- [ ] Vérifier que les montants dans le log correspondent à l'affichage
- [ ] Aucune erreur dans la console

---

## 🎯 Scénarios de test détaillés

### Scénario 1 : Conducteur avec 0 course aujourd'hui

**Étapes** :
1. Se connecter avec un conducteur qui n'a fait aucune course aujourd'hui
2. Vérifier le dashboard

**Résultat attendu** :
- Carte "Aujourd'hui" : 0 CDF ✅
- Carte "Courses" : 0 ✅
- Page "Mes gains" (Aujourd'hui) : Total brut = 0, Net = 0, Courses = 0 ✅

**Log console attendu** :
```
ℹ️ Aucune course aujourd'hui
```

---

### Scénario 2 : Conducteur avec 1 course aujourd'hui

**Étapes** :
1. Se connecter avec un conducteur qui a fait 1 course aujourd'hui
2. Vérifier le dashboard
3. Ouvrir "Mes gains"

**Résultat attendu** :
- Carte "Aujourd'hui" : 18 700 CDF (net après commission) ✅
- Carte "Courses" : 1 ✅
- Page "Mes gains" :
  - Total brut : 22 000 CDF ✅
  - Net : 18 700 CDF ✅ (correspond à "Aujourd'hui")
  - Commission : 3 300 CDF ✅
  - Courses : 1 ✅

**Log console attendu** :
```
📊 v517.90 - Stats aujourd'hui depuis KV store: {
  courses: 1,
  revenuTotal: "22 000 CDF",
  gainsNets: "18 700 CDF (après commission)",
  commission: "3 300 CDF"
}
```

---

### Scénario 3 : Conducteur avec plusieurs courses aujourd'hui

**Étapes** :
1. Se connecter avec un conducteur qui a fait 3 courses aujourd'hui
2. Vérifier le dashboard
3. Ouvrir "Mes gains"
4. Vérifier les détails

**Résultat attendu** :
- Carte "Aujourd'hui" : Somme des gains nets de toutes les courses ✅
- Carte "Courses" : 3 ✅
- Page "Mes gains" :
  - Total brut : Somme des prix de toutes les courses ✅
  - Net : Somme des gains nets ✅ (correspond à "Aujourd'hui")
  - Commission : 15% du total brut ✅
  - Courses : 3 ✅
  - Détails : 3 cartes de courses triées par heure décroissante ✅

**Exemple de calcul** :
- Course 1 : 22 000 CDF (brut) → 18 700 CDF (net) → 3 300 CDF (commission)
- Course 2 : 15 000 CDF (brut) → 12 750 CDF (net) → 2 250 CDF (commission)
- Course 3 : 18 000 CDF (brut) → 15 300 CDF (net) → 2 700 CDF (commission)

**Total** :
- Total brut : 55 000 CDF ✅
- Net : 46 750 CDF ✅
- Commission : 8 250 CDF ✅
- Courses : 3 ✅

---

### Scénario 4 : Test après refresh

**Étapes** :
1. Se connecter en tant que conducteur
2. Noter les montants affichés
3. Rafraîchir la page (F5)
4. Vérifier que les montants sont identiques

**Résultat attendu** :
- Les montants restent identiques après refresh ✅
- Aucune perte de données ✅
- Les logs montrent que les données sont récupérées depuis le backend ✅

---

### Scénario 5 : Test de terminaison de course

**Étapes** :
1. Noter le solde initial et les gains "Aujourd'hui"
2. Accepter une course
3. Démarrer la course
4. Terminer la course
5. Vérifier les mises à jour

**Résultat attendu avant la course** :
- Solde : 40 700 CDF
- Aujourd'hui : 18 700 CDF
- Courses : 1

**Résultat attendu après la course (prix 22 000 CDF)** :
- Solde : 59 400 CDF ✅ (+18 700 CDF net)
- Aujourd'hui : 37 400 CDF ✅ (18 700 + 18 700)
- Courses : 2 ✅

---

## 🐛 Tests d'erreur

### Test 1 : Backend indisponible
**Étapes** :
1. Désactiver temporairement le backend
2. Rafraîchir le dashboard

**Résultat attendu** :
- Les données sont chargées depuis localStorage (fallback) ✅
- Un log d'avertissement apparaît dans la console ✅
- L'application continue de fonctionner ✅

---

### Test 2 : Données corrompues dans localStorage
**Étapes** :
1. Ouvrir la console du navigateur
2. Exécuter : `localStorage.setItem('driver_balance_DRIVER_ID', 'NaN')`
3. Rafraîchir la page

**Résultat attendu** :
- Le solde est réinitialisé à 0 CDF ✅
- Un log d'erreur apparaît : `❌ v517.88 - Solde localStorage invalide (NaN)` ✅
- L'application continue de fonctionner ✅

---

## 📊 Logs à vérifier

### Log 1 : Au chargement du dashboard
```
💱 Taux de change actuel: 1 USD = 2850 CDF
💰 Chargement du solde depuis le backend...
✅ Solde chargé: Backend 40700 CDF → localStorage
🔄 v517.83 - Rafraîchissement des données du conducteur depuis KV store...
📊 v517.90 - Stats aujourd'hui depuis KV store: {
  courses: 1,
  revenuTotal: "22 000 CDF",
  gainsNets: "18 700 CDF (après commission)",
  commission: "3 300 CDF"
}
```

### Log 2 : À la terminaison d'une course
```
💰 v517.86 - Envoi au backend: add 18700 CDF
✅ Solde mis à jour: Backend + localStorage = 59400 CDF
💰 Solde mis à jour dans le backend: 59 400 CDF
🎉 Paiement reçu! +18 700 CDF (Commission: 3 300 CDF)
Nouveau solde: 59 400 CDF
```

### Log 3 : Synchronisation automatique (toutes les 5 secondes)
```
🔄 Solde synchronisé: 59 400 CDF
```

---

## ✅ Critères de réussite

Le test est réussi si :

1. **Aucune erreur** dans la console
2. **Carte "Aujourd'hui"** affiche les gains nets (≠ 0 CDF si courses terminées)
3. **Carte "Courses"** affiche le bon nombre de courses
4. **Page "Mes gains"** affiche les bons montants
5. **Les détails** affichent les adresses complètes
6. **Les montants correspondent** entre dashboard et "Mes gains"
7. **La synchronisation fonctionne** après refresh
8. **Les logs sont corrects** dans la console

---

## 🚨 Cas d'échec

### Si "Aujourd'hui" affiche toujours 0 CDF

**Vérifications** :
1. Vérifier que le fichier `DriverDashboard.tsx` a bien été mis à jour
2. Vérifier les logs console pour voir si l'API backend répond
3. Vérifier que le conducteur a bien des courses terminées aujourd'hui
4. Vider le cache du navigateur (Ctrl+Shift+R)

**Commandes de debug** :
```javascript
// Dans la console du navigateur
console.log('todayNetEarningsCDF:', todayNetEarningsCDF);
```

---

### Si les montants ne correspondent pas

**Vérifications** :
1. Vérifier que la ligne 1385 utilise bien `todayNetEarningsCDF`
2. Vérifier que la ligne 1421 utilise bien `todayRidesCount`
3. Vérifier les logs de l'API backend

---

### Si le build échoue

**Vérifications** :
1. Vérifier que tous les imports sont présents
2. Vérifier qu'il n'y a pas d'erreur de syntaxe
3. Vérifier que toutes les accolades correspondent
4. Vérifier que les 5 modifications ont bien été appliquées

---

**Version** : v517.90  
**Tests** : 7 scénarios + 3 tests d'erreur  
**Status** : Prêt pour validation
