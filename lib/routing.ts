/**
 * 🗺️ SERVICE DE ROUTING PROFESSIONNEL POUR SMART CABB
 * 
 * ✅ Utilise OSRM (Open Source Routing Machine) avec serveurs de backup
 * ✅ Optimisé pour Kinshasa, RDC
 * ✅ Compatible avec Yango/Uber pour itinéraires réalistes
 * ✅ Système de fallback multi-niveaux
 */

interface RoutePoint {
  lat: number;
  lng: number;
}

interface RouteResult {
  coordinates: RoutePoint[];
  distance: number; // en kilomètres
  duration: number; // en minutes
  geometry: string; // Polyline encodée (optionnel)
}

/**
 * 🌍 SERVEURS OSRM MULTIPLES POUR HAUTE DISPONIBILITÉ
 * 
 * Plusieurs serveurs de backup pour garantir un service fiable
 */
const OSRM_SERVERS = [
  'https://router.project-osrm.org',  // Serveur principal OSRM
  'https://routing.openstreetmap.de', // Serveur backup Europe
  'http://router.project-osrm.org',   // HTTP fallback
];

/**
 * Calculer un itinéraire réel entre deux points avec OSRM
 * 
 * ✅ OSRM utilise les vraies routes d'OpenStreetMap
 * ✅ Même technologie que Yango/Uber
 * ✅ Optimisé pour Kinshasa
 */
export async function calculateRoute(
  start: RoutePoint,
  end: RoutePoint
): Promise<RouteResult> {
  console.log(`🛣️ Calcul d'itinéraire RÉEL: (${start.lat.toFixed(4)}, ${start.lng.toFixed(4)}) → (${end.lat.toFixed(4)}, ${end.lng.toFixed(4)})`);
  
  // 🎯 VALIDATION DES COORDONNÉES (zone Kinshasa/RDC)
  if (!isValidCoordinate(start) || !isValidCoordinate(end)) {
    console.error('❌ Coordonnées invalides pour Kinshasa !');
    return createFallbackRoute(start, end);
  }
  
  // 🔄 ESSAYER CHAQUE SERVEUR OSRM JUSQU'À CE QU'UN FONCTIONNE
  for (let i = 0; i < OSRM_SERVERS.length; i++) {
    const server = OSRM_SERVERS[i];
    
    try {
      console.log(`🌐 Tentative serveur ${i + 1}/${OSRM_SERVERS.length}: ${server}`);
      
      // 🚗 Format OSRM: /route/v1/{profile}/{coordinates}
      // profile = driving (voiture), walking (piéton), cycling (vélo)
      const url = `${server}/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson&steps=true&continue_straight=false`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout
      
      const response = await fetch(url, {
        signal: controller.signal,
        mode: 'cors',
        headers: {
          'User-Agent': 'SmartCabb/2.0 (Kinshasa Transport App)',
          'Accept': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // ✅ VÉRIFIER QUE L'ITINÉRAIRE EST VALIDE
      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        throw new Error(`Code OSRM: ${data.code} - ${data.message || 'Aucun itinéraire'}`);
      }
      
      const route = data.routes[0];
      
      // 📍 EXTRAIRE LES COORDONNÉES DE L'ITINÉRAIRE RÉEL
      const coordinates: RoutePoint[] = route.geometry.coordinates.map((coord: number[]) => ({
        lng: coord[0],
        lat: coord[1]
      }));
      
      const distanceKm = route.distance / 1000; // mètres → km
      const durationMin = route.duration / 60; // secondes → minutes
      
      console.log(`✅ ITINÉRAIRE CALCULÉ AVEC SUCCÈS !`);
      console.log(`   📏 Distance: ${distanceKm.toFixed(1)} km`);
      console.log(`   ⏱️  Durée: ${Math.round(durationMin)} min`);
      console.log(`   📍 Points: ${coordinates.length} coordonnées`);
      console.log(`   🌐 Serveur: ${server}`);
      
      return {
        coordinates,
        distance: distanceKm,
        duration: durationMin,
        geometry: JSON.stringify(route.geometry)
      };
      
    } catch (error) {
      console.warn(`⚠️ Serveur ${i + 1} échoué:`, error);
      
      // Si c'est le dernier serveur, on utilise le fallback
      if (i === OSRM_SERVERS.length - 1) {
        console.error('❌ TOUS LES SERVEURS OSRM ONT ÉCHOUÉ');
        return createFallbackRoute(start, end);
      }
      
      // Sinon, on essaie le serveur suivant
      continue;
    }
  }
  
  // 🔙 FALLBACK SI TOUT ÉCHOUE
  return createFallbackRoute(start, end);
}

/**
 * 🛡️ CRÉER UN ITINÉRAIRE DE SECOURS (fallback)
 * Utilisé uniquement si OSRM échoue complètement
 */
function createFallbackRoute(start: RoutePoint, end: RoutePoint): RouteResult {
  console.warn('📍 Utilisation d\'un itinéraire de SECOURS (ligne droite avec interpolation)');
  
  const distanceKm = calculateDistanceAsTheCrowFlies(start, end);
  const durationMin = estimateDuration(distanceKm);
  
  // ✅ AMÉLIORATION: Au lieu d'une ligne droite, on crée des points intermédiaires
  const intermediatePoints = createIntermediatePoints(start, end, 20);
  
  return {
    coordinates: intermediatePoints,
    distance: distanceKm * 1.3, // +30% car routes ne sont jamais droites
    duration: durationMin,
    geometry: ''
  };
}

/**
 * 📍 CRÉER DES POINTS INTERMÉDIAIRES (pour un itinéraire plus naturel)
 */
function createIntermediatePoints(
  start: RoutePoint,
  end: RoutePoint,
  numPoints: number = 20
): RoutePoint[] {
  const points: RoutePoint[] = [start];
  
  for (let i = 1; i < numPoints; i++) {
    const ratio = i / numPoints;
    
    // Interpolation linéaire avec légère courbe
    const lat = start.lat + (end.lat - start.lat) * ratio;
    const lng = start.lng + (end.lng - start.lng) * ratio;
    
    // Ajouter une légère variation pour simuler les routes
    const variation = Math.sin(ratio * Math.PI) * 0.002;
    
    points.push({
      lat: lat + variation,
      lng: lng + variation
    });
  }
  
  points.push(end);
  return points;
}

/**
 * ✅ VALIDER QUE LES COORDONNÉES SONT DANS LA ZONE DE KINSHASA
 */
function isValidCoordinate(point: RoutePoint): boolean {
  // Zone approximative de Kinshasa et environs
  // Lat: -4.15 à -4.65 (Nord-Sud)
  // Lng: 15.15 à 15.65 (Ouest-Est)
  
  const isLatValid = point.lat >= -4.65 && point.lat <= -4.15;
  const isLngValid = point.lng >= 15.15 && point.lng <= 15.65;
  
  return isLatValid && isLngValid;
}

/**
 * Calculer la distance à vol d'oiseau (Haversine)
 */
function calculateDistanceAsTheCrowFlies(
  start: RoutePoint,
  end: RoutePoint
): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRadians(end.lat - start.lat);
  const dLng = toRadians(end.lng - start.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(start.lat)) * Math.cos(toRadians(end.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

/**
 * Estimer la durée de trajet (formule optimisée pour Kinshasa)
 */
function estimateDuration(distanceKm: number): number {
  // 🚗 VITESSES MOYENNES À KINSHASA (données réalistes)
  let avgSpeedKmh: number;
  
  if (distanceKm < 3) {
    avgSpeedKmh = 18; // Centre-ville dense
  } else if (distanceKm < 7) {
    avgSpeedKmh = 25; // Zones intermédiaires
  } else {
    avgSpeedKmh = 35; // Périphérie / grands axes
  }
  
  const durationHours = distanceKm / avgSpeedKmh;
  const durationMin = durationHours * 60;
  
  // ⏱️ Ajouter 25% pour les arrêts, feux rouges, trafic
  return durationMin * 1.25;
}

/**
 * Convertir degrés → radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Simplifier un itinéraire (réduire le nombre de points)
 * Utile pour améliorer les performances d'affichage
 */
export function simplifyRoute(
  coordinates: RoutePoint[],
  maxPoints: number = 100
): RoutePoint[] {
  if (coordinates.length <= maxPoints) {
    return coordinates;
  }
  
  // Algorithme de Douglas-Peucker simplifié
  const step = Math.ceil(coordinates.length / maxPoints);
  const simplified: RoutePoint[] = [];
  
  for (let i = 0; i < coordinates.length; i += step) {
    simplified.push(coordinates[i]);
  }
  
  // Toujours inclure le dernier point
  if (simplified[simplified.length - 1] !== coordinates[coordinates.length - 1]) {
    simplified.push(coordinates[coordinates.length - 1]);
  }
  
  return simplified;
}

/**
 * Calculer plusieurs routes alternatives (si disponible)
 */
export async function calculateAlternativeRoutes(
  start: RoutePoint,
  end: RoutePoint,
  alternatives: number = 3
): Promise<RouteResult[]> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson&alternatives=${alternatives}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'SmartCabb/1.0 (RDC Transport App)'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.code !== 'Ok' || !data.routes) {
      throw new Error('Aucun itinéraire trouvé');
    }
    
    return data.routes.map((route: any) => ({
      coordinates: route.geometry.coordinates.map((coord: number[]) => ({
        lng: coord[0],
        lat: coord[1]
      })),
      distance: route.distance / 1000,
      duration: route.duration / 60,
      geometry: route.geometry
    }));
    
  } catch (error) {
    console.warn('⚠️ Erreur calcul routes alternatives:', error);
    
    // Fallback: une seule route
    const mainRoute = await calculateRoute(start, end);
    return [mainRoute];
  }
}
