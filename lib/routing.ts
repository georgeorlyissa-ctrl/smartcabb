/**
 * 🗺️ SERVICE DE ROUTING POUR SMART CABB
 * 
 * Utilise OSRM (Open Source Routing Machine) pour calculer
 * les vrais itinéraires routiers avec distance et durée.
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
 * Calculer un itinéraire réel entre deux points avec OSRM
 * 
 * OSRM est un service de routing gratuit et open-source
 * qui utilise les données OpenStreetMap.
 */
export async function calculateRoute(
  start: RoutePoint,
  end: RoutePoint
): Promise<RouteResult> {
  try {
    console.log(`🛣️ Calcul d'itinéraire: (${start.lat}, ${start.lng}) → (${end.lat}, ${end.lng})`);
    
    // 🌍 API OSRM publique (gratuite)
    // Format: /route/v1/{profile}/{coordinates}
    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson&steps=true`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
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
    
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('Aucun itinéraire trouvé');
    }
    
    const route = data.routes[0];
    const coordinates: RoutePoint[] = route.geometry.coordinates.map((coord: number[]) => ({
      lng: coord[0],
      lat: coord[1]
    }));
    
    const distanceKm = route.distance / 1000; // mètres → km
    const durationMin = route.duration / 60; // secondes → minutes
    
    console.log(`✅ Itinéraire calculé: ${distanceKm.toFixed(1)}km, ${Math.round(durationMin)}min, ${coordinates.length} points`);
    
    return {
      coordinates,
      distance: distanceKm,
      duration: durationMin,
      geometry: route.geometry
    };
    
  } catch (error) {
    console.warn('⚠️ Erreur calcul itinéraire OSRM:', error);
    
    // 🔙 FALLBACK: Ligne droite si OSRM échoue
    console.log('📍 Utilisation d\'une ligne droite comme fallback');
    
    const distanceKm = calculateDistanceAsTheCrowFlies(start, end);
    const durationMin = estimateDuration(distanceKm);
    
    return {
      coordinates: [start, end],
      distance: distanceKm,
      duration: durationMin,
      geometry: ''
    };
  }
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
 * Estimer la durée de trajet (formule empirique)
 */
function estimateDuration(distanceKm: number): number {
  // Vitesse moyenne à Kinshasa:
  // - Centre-ville: 15-20 km/h (trafic dense)
  // - Périphérie: 30-40 km/h (moins de trafic)
  
  const avgSpeedKmh = 25; // vitesse moyenne
  const durationHours = distanceKm / avgSpeedKmh;
  const durationMin = durationHours * 60;
  
  // Ajouter 20% pour les arrêts, feux rouges, etc.
  return durationMin * 1.2;
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
