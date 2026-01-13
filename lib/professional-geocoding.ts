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

  console.log('🔍 ===== RECHERCHE INTELLIGENTE MULTI-SOURCES =====');
  console.log(`📝 Query: "${query}"`);
  console.log(`📍 Position:`, currentLocation);

  try {
    // ✅ NOUVELLE ROUTE SMART-SEARCH : Combine Google Places + Mapbox + Base locale
    const url = new URL(`${BACKEND_URL}/geocoding/smart-search`);
    url.searchParams.set('query', query);
    
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
      console.error('❌ Erreur smart-search:', response.status);
      return [];
    }

    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      console.log(`✅ ${data.results.length} résultats combinés`);
      console.log(`📊 Sources utilisées: ${data.sources?.join(', ') || 'inconnues'}`);
      
      // 🎯 FILTRE INTELLIGENT PAR DISTANCE (comme Uber)
      const MAX_DISTANCE_NORMAL = 10; // km
      const MAX_DISTANCE_IMPORTANT = 20; // km
      
      const filtered = data.results.filter((result: any) => {
        // Pas de distance = on garde (ex: résultats Google Places)
        if (!result.distance) return true;
        
        // Moins de 10 km = on garde toujours
        if (result.distance <= MAX_DISTANCE_NORMAL) return true;
        
        // 10-20 km = seulement si c'est un lieu important
        if (result.distance <= MAX_DISTANCE_IMPORTANT) {
          const isImportant = 
            result.name.toLowerCase().includes('aéroport') ||
            result.name.toLowerCase().includes('terminus') ||
            result.name.toLowerCase().includes('gare') ||
            result.description.toLowerCase().includes('terminal') ||
            result.description.toLowerCase().includes('✈️');
          
          console.log(`⚖️ ${result.name} (${result.distance.toFixed(1)}km) - Important: ${isImportant}`);
          return isImportant;
        }
        
        // Plus de 20 km = on ignore
        console.log(`❌ ${result.name} ignoré (${result.distance.toFixed(1)}km - trop loin)`);
        return false;
      });
      
      console.log(`🎯 ${filtered.length} résultats après filtre distance`);
      console.log('🔍 ===== RECHERCHE TERMINÉE =====');
      
      return filtered;
    }
    
    console.log('⚠️ Aucun résultat trouvé');
    console.log('🔍 ===== RECHERCHE TERMINÉE =====');
    return [];

  } catch (error) {
    console.error('❌ Erreur recherche intelligente:', error);
    console.log('🔍 ===== RECHERCHE TERMINÉE (ERREUR) =====');
    return [];
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
 * ⚠️ DÉSACTIVÉ : Retourne immédiatement un tableau vide
 */
async function searchWithGooglePlaces(
  query: string,
  currentLocation?: { lat: number; lng: number }
): Promise<ProfessionalPlace[]> {
  // ⚠️ DÉSACTIVÉ : Ne plus appeler Google Places API
  console.log('⏭️  searchWithGooglePlaces DÉSACTIVÉ (utilisation base locale uniquement)');
  return [];
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
 * 🗄️ RECHERCHE INTELLIGENTE AVEC BASE LOCALE (améliorée)
 * 
 * Recherche dans plusieurs champs et retourne les meilleurs résultats
 */
async function searchWithLocalDatabaseIntelligent(
  query: string,
  currentLocation?: { lat: number; lng: number }
): Promise<ProfessionalPlace[]> {
  try {
    console.log('🧠 Recherche intelligente dans base locale...');
    
    // Importer la base de données locale
    const { searchLocationsByCommune, getLocationTypeLabel } = await import('./kinshasa-locations-database');
    
    // Rechercher avec le query original
    let results = searchLocationsByCommune(query);
    
    console.log(`📊 Résultats bruts: ${results.length}`);
    
    // Si peu de résultats, essayer des variations
    if (results.length < 5) {
      console.log('🔍 Peu de résultats, essai de variations...');
      
      // Essayer sans accents
      const queryNormalized = query.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const resultsNormalized = searchLocationsByCommune(queryNormalized);
      results = [...results, ...resultsNormalized];
      
      // Essayer des mots-clés individuels si le query contient plusieurs mots
      if (query.includes(' ')) {
        const keywords = query.split(' ').filter(k => k.length >= 3);
        for (const keyword of keywords) {
          const keywordResults = searchLocationsByCommune(keyword);
          results = [...results, ...keywordResults];
        }
      }
      
      console.log(`📊 Après variations: ${results.length} résultats`);
    }
    
    // Dédupliquer par nom et coordonnées
    const uniqueResults = Array.from(
      new Map(results.map(item => [`${item.nom}-${item.lat}-${item.lng}`, item])).values()
    );
    
    console.log(`📊 Après déduplication: ${uniqueResults.length} résultats`);
    
    // Convertir et calculer distances
    const placesWithDistance = uniqueResults.map((location, index) => ({
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
    
    // Trier par distance si position fournie, sinon trier par pertinence (ordre de recherche)
    if (currentLocation) {
      placesWithDistance.sort((a, b) => (a.distance || 999) - (b.distance || 999));
      console.log('✅ Résultats triés par distance');
    }
    
    // Limiter à 20 résultats (comme Yango)
    const finalResults = placesWithDistance.slice(0, 20);
    
    console.log(`🎯 Retour de ${finalResults.length} résultats finaux`);
    
    return finalResults;

  } catch (error) {
    console.error('❌ Erreur base locale:', error);
    return [];
  }
}

/**
 * 🔄 DÉDUPLIQUER LES RÉSULTATS PAR NOM ET PROXIMITÉ
 */
function deduplicateResults(results: ProfessionalPlace[]): ProfessionalPlace[] {
  const seen = new Map<string, ProfessionalPlace>();
  
  for (const result of results) {
    // Normaliser le nom pour comparer
    const normalizedName = result.name.toLowerCase().trim();
    
    // Si on n'a pas encore vu ce nom, l'ajouter
    if (!seen.has(normalizedName)) {
      seen.set(normalizedName, result);
    } else {
      // Si on l'a déjà vu, garder celui avec la meilleure source (mapbox > google > nominatim > local)
      const existing = seen.get(normalizedName)!;
      const sourceRank: Record<string, number> = {
        mapbox: 4,
        google_places: 3,
        nominatim: 2,
        local: 1
      };
      
      if (sourceRank[result.source] > sourceRank[existing.source]) {
        seen.set(normalizedName, result);
      }
    }
  }
  
  return Array.from(seen.values()).slice(0, 20); // Limiter à 20
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
  const localResults = await searchWithLocalDatabaseIntelligent(testQuery);
  
  return {
    mapbox: mapboxResults.length > 0,
    googlePlaces: googleResults.length > 0,
    nominatim: nominatimResults.length > 0,
    local: localResults.length > 0
  };
}