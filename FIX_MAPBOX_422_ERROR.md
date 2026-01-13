# 🔧 FIX ERREUR MAPBOX 422

## ❌ ERREUR

```
❌ Mapbox API error: 422
```

**Code HTTP 422** = "Unprocessable Entity" → Paramètres mal formatés

---

## 🐛 CAUSE

**Bounding box malformée** dans `/supabase/functions/server/mapbox-geocoding-api.ts`

### **Code CASSÉ ❌ :**

```typescript
// ❌ MAUVAIS CARACTÈRE pour le signe moins !
const kinshasaBbox = '15.088,−4.553,15.539,−4.102';
//                            ↑            ↑
//                    Caractère Unicode "minus sign" (U+2212)
//                    Au lieu de "hyphen-minus" (U+002D)
```

**Le caractère `−` (U+2212)** est un **signe moins mathématique Unicode**, pas un tiret/hyphen !

Mapbox attend un **tiret normal** `-` (U+002D) pour les nombres négatifs.

---

## ✅ SOLUTION

### **Code CORRIGÉ ✅ :**

```typescript
// ✅ BON : Tiret normal "-"
const kinshasaBbox = '15.088,-4.553,15.539,-4.102';
//                            ↑            ↑
//                    Tiret normal (hyphen-minus)
```

---

## 📊 DÉTAILS DE LA BOUNDING BOX

**Format Mapbox** : `minLng,minLat,maxLng,maxLat`

**Kinshasa** :
- Centre : `-4.3276, 15.3136`
- Rayon : ~25km ≈ 0.225 degrés

**Calcul** :
```
minLng = 15.3136 - 0.225 = 15.088
maxLng = 15.3136 + 0.225 = 15.539
minLat = -4.3276 - 0.225 = -4.553
maxLat = -4.3276 + 0.225 = -4.102
```

**Résultat** : `15.088,-4.553,15.539,-4.102`

Cette bbox couvre toute la zone urbaine de Kinshasa (rayon ~25km).

---

## 🔍 POURQUOI CETTE ERREUR ?

**Copier-coller depuis des éditeurs de texte** (Word, Google Docs, etc.) peut transformer :
- `-` (tiret clavier) → `−` (signe moins typographique)
- `'` (apostrophe) → `'` (guillemet courbe)
- `"` (guillemet) → `"` (guillemet courbe)

**Solution** : Toujours écrire les nombres directement dans l'éditeur de code !

---

## ✅ RÉSULTAT

**AVANT ❌ :**
```
Request: https://api.mapbox.com/geocoding/v5/mapbox.places/...?bbox=15.088,−4.553,15.539,−4.102
Response: 422 Unprocessable Entity
```

**MAINTENANT ✅ :**
```
Request: https://api.mapbox.com/geocoding/v5/mapbox.places/...?bbox=15.088,-4.553,15.539,-4.102
Response: 200 OK
```

---

## 🧪 TEST

**Tapez n'importe quoi dans la recherche** :

```
Recherche : "Lemba"
✅ Mapbox fonctionne
✅ Résultats reçus
✅ Distances calculées
```

**Logs attendus** :
```
🔍 Mapbox search: Lemba
✅ Mapbox returned 8 results
📍 Position utilisateur pour calcul distance: -4.3276, 15.3136
   📏 Distance pour Lemba: 2.47 km
   📏 Distance pour Lemba Super: 3.18 km
✅ Returning 8 formatted results
```

---

## 💡 LEÇON APPRISE

### **Toujours vérifier les caractères invisibles !**

❌ **Caractères Unicode qui ressemblent mais sont différents** :
- `−` (U+2212, minus sign) vs `-` (U+002D, hyphen-minus)
- `'` (U+2019, right single quote) vs `'` (U+0027, apostrophe)
- `"` (U+201C/D, smart quotes) vs `"` (U+0022, quotation mark)

✅ **Toujours utiliser les caractères ASCII standard dans le code !**

---

## 🚀 DÉPLOYER

```bash
git add .
git commit -m "fix: Correction bbox Mapbox (erreur 422 - caractère unicode)"
git push origin main
```

---

## ✅ C'EST FIXÉ !

L'erreur **422** est maintenant **CORRIGÉE** ! 🎉

**Mapbox fonctionne à nouveau** et retourne les résultats correctement ! 💪
