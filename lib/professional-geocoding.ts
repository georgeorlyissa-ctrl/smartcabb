/**
 * 🌍 SERVICE DE GÉOCODAGE PROFESSIONNEL
 * 
 * EXACTEMENT COMME UBER, YANGO, BOLT
 * 
 * Utilise les VRAIES API professionnelles :
 * 1. Mapbox Geocoding API (comme Uber)
 * 2. Google Places API (comme Yango)
 * 3. Fallback intelligent vers Nominatim + base locale
 * 
 * SÉCURITÉ : Toutes les requêtes passent par le backend proxy
 */

import { projectId, publicAnonKey } from '../utils/supabase/info';

export interface ProfessionalPlace {
  id: string;
  name: string;
  description: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  fullAddress?: string;
  distance?: number;
  rating?: number;
  userRatingsTotal?: number;
  source: 'mapbox' | 'google_places' | 'nominatim' | 'local';
  placeId?: string; // 🆕 Pour Google Places (obtenir coordonnées plus tard)
}

export interface RouteInfo {
  distance: number; // en mètres
  duration: number; // en secondes
  geometry: any; // GeoJSON LineString
  steps: any[];
}

// URL du backend
const BACKEND_URL = `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52`;

/**
 * 🔍 RECHERCHE D'ADRESSES PROFESSIONNELLE
 * 
 * Utilise Mapbox ou Google Places (selon disponibilité)
 * avec fallback automatique vers Nominatim et base locale
 */
export async function searchProfessionalPlaces(
  query: string,
  currentLocation?: { lat: number; lng: number }
): Promise<ProfessionalPlace[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  console.log('🌍 Recherche professionnelle:', query);

  try {
    // 1️⃣ ESSAYER MAPBOX EN PRIORITÉ (comme Uber)
    const mapboxResults = await searchWithMapbox(query, currentLocation);
    if (mapboxResults.length > 0) {
      console.log(`✅ Mapbox: ${mapboxResults.length} résultats`);
      return mapboxResults;
    }

    console.log('⚠️ Mapbox indisponible ou aucun résultat, essai Google Places...');

    // 2️⃣ FALLBACK VERS GOOGLE PLACES (comme Yango)
    const googleResults = await searchWithGooglePlaces(query, currentLocation);
    if (googleResults.length > 0) {
      console.log(`✅ Google Places: ${googleResults.length} résultats`);
      return googleResults;
    }

    console.log('⚠️ Google Places indisponible ou aucun résultat, essai Nominatim...');

    // 3️⃣ FALLBACK VERS NOMINATIM (OpenStreetMap)
    const nominatimResults = await searchWithNominatim(query, currentLocation);
    if (nominatimResults.length > 0) {
      console.log(`✅ Nominatim: ${nominatimResults.length} résultats`);
      return nominatimResults;
    }

    console.log('⚠️ Nominatim indisponible ou aucun résultat, utilisation base locale...');

    // 4️⃣ DERNIER FALLBACK : BASE LOCALE
    const localResults = await searchWithLocalDatabase(query, currentLocation);
    console.log(`✅ Base locale: ${localResults.length} résultats`);
    return localResults;

  } catch (error) {
    console.error('❌ Erreur recherche professionnelle:', error);
    
    // En cas d'erreur complète, utiliser la base locale
    console.log('🔄 Fallback final vers base locale...');
    return searchWithLocalDatabase(query, currentLocation);
  }
}

/**
 * 🗺️ RECHERCHE AVEC MAPBOX (comme Uber)
 */
async function searchWithMapbox(
  query: string,
  currentLocation?: { lat: number; lng: number }
): Promise<ProfessionalPlace[]> {
  try {
    const url = new URL(`${BACKEND_URL}/geocoding/search`);
    url.searchParams.set('q', query);
    
    if (currentLocation) {
      url.searchParams.set('proximity', `${currentLocation.lat},${currentLocation.lng}`);
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      if (error.fallback) {
        return []; // Fallback vers la prochaine API
      }
      throw new Error(`Mapbox error: ${response.status}`);
    }

    const data = await response.json();
    
    // Calculer les distances si position actuelle fournie
    return data.results.map((place: ProfessionalPlace) => {
      if (currentLocation) {
        place.distance = calculateDistance(
          currentLocation.lat,
          currentLocation.lng,
          place.coordinates.lat,
          place.coordinates.lng
        );
      }
      return place;
    });

  } catch (error) {
    console.warn('⚠️ Mapbox indisponible:', error);
    return [];
  }
}

/**
 * 🔍 RECHERCHE AVEC GOOGLE PLACES (comme Yango)
 */
async function searchWithGooglePlaces(
  query: string,
  currentLocation?: { lat: number; lng: number }
): Promise<ProfessionalPlace[]> {
  try {
    const url = new URL(`${BACKEND_URL}/geocoding/autocomplete`);
    url.searchParams.set('q', query);
    
    if (currentLocation) {
      url.searchParams.set('lat', currentLocation.lat.toString());
      url.searchParams.set('lng', currentLocation.lng.toString());
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      if (error.fallback) {
        return []; // Fallback vers la prochaine API
      }
      throw new Error(`Google Places error: ${response.status}`);
    }

    const data = await response.json();
    
    // Calculer les distances si position actuelle fournie
    return data.results.map((place: ProfessionalPlace) => {
      if (currentLocation && place.coordinates && place.coordinates.lat) {
        place.distance = calculateDistance(
          currentLocation.lat,
          currentLocation.lng,
          place.coordinates.lat,
          place.coordinates.lng
        );
      }
      return place;
    });

  } catch (error) {
    console.warn('⚠️ Google Places indisponible:', error);
    return [];
  }
}

/**
 * 🌐 RECHERCHE AVEC NOMINATIM (fallback)
 */
async function searchWithNominatim(
  query: string,
  currentLocation?: { lat: number; lng: number }
): Promise<ProfessionalPlace[]> {
  try {
    // Importer le service Nominatim existant
    const { searchAddress } = await import('./geocoding-service');
    const results = await searchAddress(query);
    
    return results.map((result, index) => ({
      id: result.id,
      name: result.name,
      description: result.description,
      coordinates: result.coordinates,
      fullAddress: result.description,
      distance: currentLocation ? calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        result.coordinates.lat,
        result.coordinates.lng
      ) : undefined,
      source: 'nominatim' as const
    }));

  } catch (error) {
    console.warn('⚠️ Nominatim indisponible:', error);
    return [];
  }
}

/**
 * 🗄️ RECHERCHE AVEC BASE LOCALE (dernier fallback)
 */
async function searchWithLocalDatabase(
  query: string,
  currentLocation?: { lat: number; lng: number }
): Promise<ProfessionalPlace[]> {
  try {
    // Importer la base de données locale
    const { searchLocationsByCommune, getLocationTypeLabel } = await import('./kinshasa-locations-database');
    const results = searchLocationsByCommune(query);
    
    return results.slice(0, 10).map((location, index) => ({
      id: `local-${index}`,
      name: location.nom,
      description: `${getLocationTypeLabel(location.type)} • ${location.quartier || location.commune}, Kinshasa`,
      coordinates: {
        lat: location.lat,
        lng: location.lng
      },
      distance: currentLocation ? calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        location.lat,
        location.lng
      ) : undefined,
      source: 'local' as const
    }));

  } catch (error) {
    console.error('❌ Erreur base locale:', error);
    return [];
  }
}

/**
 * 🚗 CALCUL D'ITINÉRAIRE PROFESSIONNEL
 * 
 * Utilise Mapbox Directions API (comme Uber)
 */
export async function calculateRoute(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number }
): Promise<RouteInfo | null> {
  try {
    const url = new URL(`${BACKEND_URL}/geocoding/directions`);
    url.searchParams.set('start', `${start.lat},${start.lng}`);
    url.searchParams.set('end', `${end.lat},${end.lng}`);

    console.log('🚗 Calcul d\'itinéraire Mapbox:', start, '→', end);

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });

    if (!response.ok) {
      console.error('❌ Erreur calcul itinéraire:', response.status);
      return null;
    }

    const data = await response.json();
    
    console.log(`✅ Itinéraire calculé: ${(data.distance / 1000).toFixed(1)} km, ${Math.round(data.duration / 60)} min`);
    
    return data;

  } catch (error) {
    console.error('❌ Erreur calcul d\'itinéraire:', error);
    return null;
  }
}

/**
 * 📍 OBTENIR LES COORDONNÉES D'UN LIEU GOOGLE PLACES
 * 
 * Appelé quand l'utilisateur sélectionne un lieu depuis Autocomplete
 */
export async function getPlaceCoordinates(placeId: string): Promise<{
  coordinates: { lat: number; lng: number };
  name: string;
  fullAddress: string;
} | null> {
  try {
    const url = new URL(`${BACKEND_URL}/geocoding/place-details`);
    url.searchParams.set('place_id', placeId);

    console.log('📍 Récupération coordonnées pour place_id:', placeId);

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });

    if (!response.ok) {
      console.error('❌ Erreur récupération coordonnées:', response.status);
      return null;
    }

    const data = await response.json();
    
    console.log(`✅ Coordonnées récupérées: ${data.coordinates.lat}, ${data.coordinates.lng}`);
    
    return data;

  } catch (error) {
    console.error('❌ Erreur getPlaceCoordinates:', error);
    return null;
  }
}

/**
 * 📍 CALCULER LA DISTANCE ENTRE DEUX POINTS (Haversine)
 */
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Arrondir à 0.1 km
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * 🎨 OBTENIR UNE DESCRIPTION ENRICHIE
 */
export function getEnrichedDescription(place: ProfessionalPlace): string {
  let description = place.description;
  
  if (place.rating && place.userRatingsTotal) {
    description += ` • ⭐ ${place.rating.toFixed(1)} (${place.userRatingsTotal})`;
  }
  
  if (place.distance !== undefined) {
    description += ` • ${place.distance.toFixed(1)} km`;
  }
  
  return description;
}

/**
 * 🧪 TESTER LA DISPONIBILITÉ DES API
 */
export async function testAPIsAvailability(): Promise<{
  mapbox: boolean;
  googlePlaces: boolean;
  nominatim: boolean;
  local: boolean;
}> {
  const testQuery = 'lemba';
  
  const mapboxResults = await searchWithMapbox(testQuery);
  const googleResults = await searchWithGooglePlaces(testQuery);
  const nominatimResults = await searchWithNominatim(testQuery);
  const localResults = await searchWithLocalDatabase(testQuery);
  
  return {
    mapbox: mapboxResults.length > 0,
    googlePlaces: googleResults.length > 0,
    nominatim: nominatimResults.length > 0,
    local: localResults.length > 0
  };
}
