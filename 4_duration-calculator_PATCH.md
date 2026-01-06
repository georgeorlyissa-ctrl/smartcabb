# PATCH duration-calculator.ts - Vitesses plus réalistes

## Emplacement: `/lib/duration-calculator.ts`

## Lignes à modifier: 26-39

### PROBLÈME :
Vitesses actuelles trop basses :
- Morning rush: 15 km/h → 10.9 km en 43 min
- Midday: 20 km/h → 10.9 km en 32 min
- Night: 25 km/h → 10.9 km en 26 min

**Résultat actuel pour 10.9 km : ~27-43 minutes selon l'heure**

### SOLUTION : Augmenter les vitesses moyennes

```typescript
const SPEED_PROFILES = {
  // Heures de pointe (7h-9h et 17h-19h) : trafic dense
  morning_rush: 25,      // ✅ Augmenté de 15 à 25 km/h
  evening_rush: 25,      // ✅ Augmenté de 15 à 25 km/h
  
  // Milieu de journée (9h-17h) : trafic modéré
  midday: 35,            // ✅ Augmenté de 20 à 35 km/h
  
  // Nuit (19h-7h) : trafic fluide
  night: 45,             // ✅ Augmenté de 25 à 45 km/h
  
  // Weekend : trafic léger
  weekend: 40            // ✅ Augmenté de 22 à 40 km/h
};
```

### RÉSULTAT ATTENDU avec 10.9 km :

| Période | Vitesse | Durée | Avant |
|---------|---------|-------|-------|
| Morning rush | 25 km/h | **26 min** | 43 min ❌ |
| Midday | 35 km/h | **18 min** | 32 min ❌ |
| Night | 45 km/h | **14 min** | 26 min ❌ |
| Weekend | 40 km/h | **16 min** | 29 min ❌ |

**Moyenne : ~18-20 minutes pour 10.9 km** ✅ RÉALISTE !

---

## BONUS : Réduire facteurs de congestion (lignes 95, 103, 111)

### AVANT :
```typescript
// Morning rush
congestionFactor: 1.1   // Multiplie durée par 1.1x

// Evening rush
congestionFactor: 1.2   // Multiplie durée par 1.2x

// Midday
congestionFactor: 1.0   // Pas de surcharge
```

### APRÈS (plus optimiste) :
```typescript
// Morning rush
congestionFactor: 1.0   // ✅ Réd uit de 1.1 à 1.0

// Evening rush
congestionFactor: 1.05  // ✅ Réduit de 1.2 à 1.05

// Midday
congestionFactor: 0.95  // ✅ Léger bonus (trafic fluide)
```

---

## TEST :

Exemple concret avec 10.9 km à 14h (midday) :

**AVANT :**
- Vitesse de base: 20 km/h
- Congestion: 1.0x
- Vitesse ajustée: 20 km/h
- Durée: (10.9 / 20) * 60 = **32 minutes** ❌

**APRÈS :**
- Vitesse de base: 35 km/h
- Congestion: 0.95x
- Vitesse ajustée: 35 / 0.95 = 36.8 km/h
- Durée: (10.9 / 36.8) * 60 = **17.8 minutes → 18 min** ✅

---

## VÉRIFICATION :

Après correction, tester avec différentes distances :

| Distance | Période | Durée estimée | Acceptable ? |
|----------|---------|---------------|--------------|
| 5 km | Midday | ~8-10 min | ✅ Oui |
| 10.9 km | Midday | ~17-20 min | ✅ Oui |
| 20 km | Midday | ~33-36 min | ✅ Oui |
| 5 km | Rush hour | ~12-14 min | ✅ Oui |
| 10.9 km | Rush hour | ~25-27 min | ✅ Oui |

---

## COMMIT MESSAGE :
```
fix(duration): vitesses plus réalistes pour estimations

- Morning/evening rush: 15→25 km/h
- Midday: 20→35 km/h
- Night: 25→45 km/h
- Congestion factors optimisés
- 10.9km : 32min→18min ✅
```
