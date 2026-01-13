# 🗺️ GUIDE DE MISE À NIVEAU DU ROUTING - SMARTCABB

## 🎯 Problème identifié

Votre application SmartCabb affichait des itinéraires incorrects (ligne droite ou zigzag) au lieu de suivre les vraies routes comme Yango/Uber.

## ✅ Solution implémentée

### 1. **Service OSRM Professionnel** (`/lib/routing.ts`)

Nous avons upgradé le système de routing avec :

#### ✨ Améliorations clés :

- **🌐 Serveurs multiples de backup** : 3 serveurs OSRM différents pour garantir la disponibilité
- **🎯 Validation des coordonnées** : Vérifie que les points sont bien dans la zone de Kinshasa
- **🛡️ Système de fallback intelligent** : Crée un itinéraire interpolé si OSRM échoue
- **⏱️ Timeouts optimisés** : 8 secondes par serveur pour éviter les blocages
- **🚗 Paramètres OSRM optimisés** : `continue_straight=false` pour itinéraires réalistes

#### 🔧 Serveurs OSRM utilisés :

1. `https://router.project-osrm.org` (Principal)
2. `https://routing.openstreetmap.de` (Backup Europe)
3. `http://router.project-osrm.org` (HTTP Fallback)

#### 📊 Logs détaillés :

Le système affiche maintenant des logs complets pour le debugging :
```
🛣️ Calcul d'itinéraire RÉEL: (-4.3217, 15.3136) → (-4.3517, 15.3147)
🌐 Tentative serveur 1/3: https://router.project-osrm.org
✅ ITINÉRAIRE CALCULÉ AVEC SUCCÈS !
   📏 Distance: 3.5 km
   ⏱️  Durée: 12 min
   📍 Points: 145 coordonnées
   🌐 Serveur: https://router.project-osrm.org
```

### 2. **Validation géographique**

Zone de Kinshasa validée :
- **Latitude** : -4.15° à -4.65° (Nord-Sud)
- **Longitude** : 15.15° à 15.65° (Ouest-Est)

Si les coordonnées sont hors zone, le système utilise automatiquement le fallback.

### 3. **Estimation de durée optimisée**

Vitesses moyennes adaptées à Kinshasa :
- **< 3 km** : 18 km/h (centre-ville dense)
- **3-7 km** : 25 km/h (zones intermédiaires)
- **> 7 km** : 35 km/h (périphérie / grands axes)

Avec bonus de +25% pour arrêts, feux rouges, trafic.

## 🧪 Comment tester

### Test 1 : Vérifier les logs dans la console

1. Ouvrir la console du navigateur (F12)
2. Faire une estimation de trajet
3. Vérifier que vous voyez :
   ```
   🛣️ Calcul d'itinéraire RÉEL: ...
   🌐 Tentative serveur 1/3: ...
   ✅ ITINÉRAIRE CALCULÉ AVEC SUCCÈS !
   ```

### Test 2 : Comparer avec Yango

1. Choisir les mêmes points de départ/arrivée dans les deux apps
2. Vérifier que les itinéraires sont similaires
3. Les distances devraient être proches (±10%)

### Test 3 : Tester en cas d'échec OSRM

Si OSRM est down, vous verrez :
```
⚠️ Serveur 1 échoué: ...
⚠️ Serveur 2 échoué: ...
⚠️ Serveur 3 échoué: ...
❌ TOUS LES SERVEURS OSRM ONT ÉCHOUÉ
📍 Utilisation d'un itinéraire de SECOURS (ligne droite avec interpolation)
```

L'app continuera à fonctionner avec un itinéraire approximatif.

## 🔍 Debugging

### Si l'itinéraire reste incorrect :

#### 1. **Vérifier les coordonnées GPS**

Les coordonnées doivent être précises :
```typescript
pickup: { lat: -4.3217, lng: 15.3136 }  // ✅ BON
pickup: { lat: 4.3217, lng: 15.3136 }   // ❌ MAUVAIS (latitude positive)
```

#### 2. **Vérifier la connexion OSRM**

Tester manuellement dans le navigateur :
```
https://router.project-osrm.org/route/v1/driving/15.3136,-4.3217;15.3147,-4.3517?overview=full&geometries=geojson
```

Si ça ne marche pas → problème de réseau/CORS.

#### 3. **Vérifier les logs d'erreur**

Chercher dans la console :
- `CORS error` → Problème de sécurité navigateur
- `Network error` → Problème de connexion internet
- `Timeout` → Serveur trop lent

#### 4. **Solution alternative : Mapbox**

Si OSRM ne fonctionne pas du tout, vous pouvez utiliser Mapbox Directions API (payant mais fiable) :

```typescript
// Dans /lib/routing.ts, ajouter :
const MAPBOX_TOKEN = 'pk.xxxxx'; // Votre token Mapbox
const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start.lng},${start.lat};${end.lng},${end.lat}?geometries=geojson&access_token=${MAPBOX_TOKEN}`;
```

## 📈 Améliorations futures possibles

1. **🗺️ Intégrer GraphHopper** (alternative à OSRM)
2. **🚦 API trafic en temps réel** (Google Traffic API, TomTom)
3. **🛣️ Routes alternatives** (déjà implémenté dans `calculateAlternativeRoutes`)
4. **📍 Points intermédiaires** (waypoints)
5. **🚴 Profils de transport** (vélo, marche, moto)

## 🌍 Pourquoi OSRM ?

**OSRM (Open Source Routing Machine)** est utilisé par :
- ✅ Uber (en partie)
- ✅ Lyft
- ✅ Yango
- ✅ Des centaines d'apps de transport

**Avantages** :
- 🆓 Gratuit et open-source
- 🌍 Données mondiales (OpenStreetMap)
- ⚡ Très rapide (< 200ms)
- 🎯 Précision excellente

**Inconvénients** :
- ⚠️ Pas de données de trafic en temps réel
- ⚠️ Dépend de la qualité d'OpenStreetMap dans la région

Pour Kinshasa, les données OSM sont **bonnes mais pas parfaites**. Si vous voulez des itinéraires encore plus précis, envisagez Mapbox ou Google Maps (payant).

## 📞 Support

En cas de problème persistant, vérifier :
1. Les logs de la console navigateur
2. La qualité des coordonnées GPS
3. La connexion internet
4. Le statut des serveurs OSRM : https://router.project-osrm.org/

---

**Version** : 2.0  
**Dernière mise à jour** : Janvier 2025  
**Auteur** : SmartCabb Development Team
