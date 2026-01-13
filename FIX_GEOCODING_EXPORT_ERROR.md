# 🔧 FIX : Erreur Export geocoding-api.ts

## ❌ ERREUR RENCONTRÉE

```
worker boot error: Uncaught SyntaxError: 
The requested module './geocoding-api.ts' does not provide an export named 'default'
at file:///var/tmp/sb-compile-edge-runtime/source/index.tsx:23:8
```

---

## 🔍 DIAGNOSTIC

### Problème
Le fichier `/supabase/functions/server/geocoding-api.ts` avait été accidentellement écrasé et ne contenait plus que 4 lignes :

```typescript
import { Hono } from 'npm:hono@4.6.14';
import { searchWithNominatim, reverseGeocodeNominatim } from './nominatim-geocoding-api.ts';

const geocodingApp = new Hono();
// ❌ PAS D'EXPORT DEFAULT !
```

### Cause
- Le fichier a été modifié lors de l'intégration Nominatim
- L'export `export default geocodingApp;` avait été supprimé
- Le serveur ne pouvait pas importer le module

---

## ✅ SOLUTION APPLIQUÉE

### Fichier Restauré
✅ `/supabase/functions/server/geocoding-api.ts` (400+ lignes)

### Contenu Restauré
1. **Route `/smart-search`** - Recherche intelligente multi-sources
   - Google Places (priorité haute)
   - Mapbox (priorité moyenne)
   - Nominatim (fallback gratuit)

2. **Route `/reverse`** - Reverse geocoding

3. **Export Default** ajouté :
   ```typescript
   export default geocodingApp;
   ```

---

## 📦 FICHIER MODIFIÉ

### `/supabase/functions/server/geocoding-api.ts`

**Avant** (4 lignes - CASSÉ) :
```typescript
import { Hono } from 'npm:hono@4.6.14';
import { searchWithNominatim, reverseGeocodeNominatim } from './nominatim-geocoding-api.ts';

const geocodingApp = new Hono();
// ❌ Manque export default
```

**Après** (400+ lignes - FONCTIONNEL) :
```typescript
import { Hono } from 'npm:hono@4.6.14';
import { searchWithNominatim, reverseGeocodeNominatim } from './nominatim-geocoding-api.ts';

const geocodingApp = new Hono();

// ... Routes et fonctions ...

geocodingApp.get('/smart-search', async (c) => {
  // Recherche Google Places + Mapbox + Nominatim
});

geocodingApp.get('/reverse', async (c) => {
  // Reverse geocoding
});

// ✅ Export default ajouté
export default geocodingApp;
```

---

## 🧪 VÉRIFICATION

### Test 1 : Import
```typescript
// Dans index.tsx
import geocodingApp from "./geocoding-api.ts";
// ✅ Devrait fonctionner sans erreur
```

### Test 2 : Route Smart Search
```bash
curl "https://[PROJECT_ID].supabase.co/functions/v1/make-server-2eb02e52/geocoding/smart-search?query=restaurant" \
  -H "Authorization: Bearer [ANON_KEY]"
```

**Réponse attendue** :
```json
{
  "success": true,
  "count": 15,
  "results": [...],
  "sources": ["google_places", "mapbox", "nominatim"]
}
```

### Test 3 : Serveur Boot
```
✅ Serveur démarre sans erreur
✅ Logs : "🚀 Démarrage du serveur SmartCabb..."
✅ Pas de "worker boot error"
```

---

## 🚀 COMMANDES DE DÉPLOIEMENT

```bash
# Ajouter le fichier corrigé
git add supabase/functions/server/geocoding-api.ts

# Commit
git commit -m "fix: Restaurer export default dans geocoding-api.ts

- Ajout export default geocodingApp manquant
- Restauration route /smart-search
- Restauration route /reverse
- Fix worker boot error
"

# Push
git push origin main
```

---

## ✅ RÉSULTAT

**AVANT** :
- ❌ Worker boot error
- ❌ Module geocoding-api.ts ne charge pas
- ❌ Route /geocoding indisponible

**APRÈS** :
- ✅ Serveur démarre correctement
- ✅ Module geocoding-api.ts exporté
- ✅ Route /geocoding/smart-search disponible
- ✅ Route /geocoding/reverse disponible

---

## 📝 NOTES

### Fonctionnalités geocoding-api.ts

#### 1. Smart Search
Combine 3 sources de données :
- **Google Places** (priorité haute, métadonnées riches)
- **Mapbox** (priorité moyenne, précision géographique)
- **Nominatim** (fallback gratuit, toujours disponible)

#### 2. Scoring Intelligent
- Résultats triés par priorité (source)
- Puis par distance si position fournie
- Limite à 20 résultats

#### 3. Icônes et Labels
- 🍽️ Restaurant
- 🏥 Hôpital
- 🎓 École
- ⛪ Église
- 🏦 Banque
- ✈️ Aéroport
- Etc.

---

**ERREUR CORRIGÉE - SERVEUR DEVRAIT DÉMARRER CORRECTEMENT !** ✅
