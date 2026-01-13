# ✅ ERREUR CORRIGÉE - Export manquant

## ❌ ERREUR ORIGINALE

```
worker boot error: Uncaught SyntaxError: The requested module './geocoding-api.ts' does not provide an export named 'default'
    at file:///var/tmp/sb-compile-edge-runtime/source/index.tsx:23:8
```

## 🔍 CAUSE

Le fichier `/supabase/functions/server/geocoding-api.ts` avait été partiellement modifié par `fast_apply_tool`, ce qui a :
1. Supprimé les imports initiaux (Hono, interfaces)
2. Supprimé la déclaration `const geocodingApp = new Hono()`
3. Supprimé l'export `export default geocodingApp`

Le fichier contenait seulement les routes smart-search et les fonctions helpers, mais sans structure complète.

## ✅ SOLUTION

Fichier `/supabase/functions/server/geocoding-api.ts` **COMPLÈTEMENT RECRÉÉ** avec :

### 1. Structure complète
```typescript
import { Hono } from 'npm:hono@4.6.14';
import { searchWithNominatim, reverseGeocodeNominatim } from './nominatim-geocoding-api.ts';

const geocodingApp = new Hono();

// ... Routes ...

export default geocodingApp; // ✅ EXPORT AJOUTÉ
```

### 2. Interfaces TypeScript
- `MapboxFeature`
- `MapboxGeocodingResponse`
- `GooglePlacePrediction`
- `GooglePlacesAutocompleteResponse`

### 3. Fonctions helpers
- `getPlaceIcon(category: string)`
- `getPlaceTypeLabel(category: string)`
- `calculateDistance(lat1, lng1, lat2, lng2)`
- `deduplicateResults(results)`
- `getTypeLabel(type: string)`
- `searchLocalDatabase(query, lat?, lng?)`

### 4. Routes implémentées

#### Route principale (nouvelle)
- ✅ `GET /geocoding/smart-search` - Recherche multi-sources (Google + Mapbox + Local)

#### Routes existantes (conservées)
- ✅ `GET /geocoding/mapbox/search` - Recherche Mapbox
- ✅ `GET /geocoding/nominatim/search` - Recherche Nominatim
- ✅ `GET /geocoding/nominatim/reverse` - Reverse geocoding Nominatim

### 5. Base locale enrichie
- 17 lieux populaires de Kinshasa
- Marchés, centres commerciaux, hôpitaux, universités, terminaux, etc.

## 📊 LOGIQUE SMART-SEARCH

```
Recherche "ngaba" →
  1️⃣ Google Places (priorité 100+)
  2️⃣ Mapbox (priorité 50+)
  3️⃣ Base locale (priorité 10+)
         ↓
  Déduplication (normalisation noms)
         ↓
  Tri par distance + priorité
         ↓
  Filtre distance (max 10-20 km)
         ↓
  Limite à 15 résultats
```

## 🧪 TEST

Le serveur devrait maintenant démarrer sans erreur et les routes suivantes doivent fonctionner :

```bash
# Recherche intelligente multi-sources
GET https://PROJECT_ID.supabase.co/functions/v1/make-server-2eb02e52/geocoding/smart-search?query=lemba&lat=-4.3276&lng=15.3136

# Recherche Mapbox
GET https://PROJECT_ID.supabase.co/functions/v1/make-server-2eb02e52/geocoding/mapbox/search?query=lemba

# Recherche Nominatim
GET https://PROJECT_ID.supabase.co/functions/v1/make-server-2eb02e52/geocoding/nominatim/search?query=lemba
```

## 📁 FICHIER MODIFIÉ

**Fichier unique modifié :**
- `/supabase/functions/server/geocoding-api.ts` (RECRÉÉ COMPLÈTEMENT)

**Autres fichiers (inchangés) :**
- `/supabase/functions/server/index.tsx` (import OK)
- `/lib/professional-geocoding.ts` (utilise smart-search)
- `/components/passenger/YangoStyleSearch.tsx` (utilise smart-search)

## 🚀 DÉPLOIEMENT

```bash
git add supabase/functions/server/geocoding-api.ts
git add ERREUR_CORRIGEE.md

git commit -m "fix: Recréation complète geocoding-api.ts avec export default"

git push origin main
```

## ✅ VÉRIFICATION

Après déploiement, vérifier que :
1. ✅ Le serveur Edge Function démarre sans erreur
2. ✅ La route `/geocoding/smart-search` fonctionne
3. ✅ Les résultats combinent Google Places + Mapbox + Base locale
4. ✅ Pas de doublons dans les résultats
5. ✅ Tri par distance fonctionne

**ERREUR CORRIGÉE !** 🎉
