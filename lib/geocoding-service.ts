/**
 * 🌍 SERVICE DE GÉOCODAGE PROFESSIONNEL
 * 
 * Utilise Nominatim (OpenStreetMap) pour chercher des adresses précises
 * Exactement comme Yango, Uber, Bolt, etc.
 * 
 * Fonctionnalités :
 * - Recherche d'adresse en temps réel
 * - Reverse geocoding (coordonnées → adresse)
 * - Support complet de Kinshasa, RDC
 * - Cache pour optimiser les performances
 */

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address: {
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    country?: string;
    neighbourhood?: string;
    postcode?: string;
  };
  type: string;
  importance: number;
}

export interface GeocodedAddress {
  id: string;
  name: string;
  description: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  type: string;
  importance: number;
}

// Cache simple pour éviter trop de requêtes
const searchCache = new Map<string, GeocodedAddress[]>();
const reverseCache = new Map<string, GeocodedAddress>();

/**
 * 🔍 RECHERCHE D'ADRESSE (Forward Geocoding)
 * Comme quand tu tapes dans Yango : "Avenue Kasa-Vubu"
 */
export async function searchAddress(query: string): Promise<GeocodedAddress[]> {
  if (!query || query.trim().length < 3) {
    return [];
  }

  // Vérifier le cache
  const cacheKey = query.toLowerCase().trim();
  if (searchCache.has(cacheKey)) {
    console.log('🎯 Cache hit pour:', query);
    return searchCache.get(cacheKey)!;
  }

  try {
    // 🌍 NOMINATIM API (OpenStreetMap)
    // Similaire à ce qu'utilise Yango en arrière-plan
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('q', `${query}, Kinshasa, RDC`);
    url.searchParams.set('format', 'json');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('limit', '10');
    url.searchParams.set('countrycodes', 'cd'); // RDC uniquement
    url.searchParams.set('accept-language', 'fr'); // Français

    console.log('🌍 Nominatim search:', url.toString());

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'SmartCabb/1.0' // Requis par Nominatim
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim error: ${response.status}`);
    }

    const results: NominatimResult[] = await response.json();

    console.log(`📍 Nominatim a trouvé ${results.length} résultats pour "${query}"`);

    // Transformer en format SmartCabb
    const addresses: GeocodedAddress[] = results.map((result) => {
      const address = result.address;
      
      // Construire le nom principal (comme Yango)
      const mainName = address.road || 
                       address.neighbourhood || 
                       address.suburb || 
                       result.display_name.split(',')[0];

      // Construire la description (comme Yango)
      const parts = [
        address.suburb,
        address.city || 'Kinshasa',
        address.state
      ].filter(Boolean);

      return {
        id: `nominatim-${result.place_id}`,
        name: mainName,
        description: parts.join(', '),
        coordinates: {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        },
        type: result.type,
        importance: result.importance
      };
    });

    // Mettre en cache
    searchCache.set(cacheKey, addresses);

    return addresses;
  } catch (error) {
    console.error('❌ Erreur géocodage:', error);
    return [];
  }
}

/**
 * 📍 REVERSE GEOCODING (Coordonnées → Adresse)
 * Quand tu cliques sur la carte dans Yango
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodedAddress | null> {
  // Vérifier le cache
  const cacheKey = `${lat.toFixed(5)},${lng.toFixed(5)}`;
  if (reverseCache.has(cacheKey)) {
    console.log('🎯 Cache hit pour reverse geocoding');
    return reverseCache.get(cacheKey)!;
  }

  try {
    // 🌍 NOMINATIM REVERSE API
    const url = new URL('https://nominatim.openstreetmap.org/reverse');
    url.searchParams.set('lat', lat.toString());
    url.searchParams.set('lon', lng.toString());
    url.searchParams.set('format', 'json');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('accept-language', 'fr');
    url.searchParams.set('zoom', '18'); // Précision maximale

    console.log('🌍 Nominatim reverse:', url.toString());

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'SmartCabb/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim reverse error: ${response.status}`);
    }

    const result: NominatimResult = await response.json();

    console.log('📍 Nominatim reverse geocoding réussi');

    const address = result.address;

    // Construire le nom (comme Yango)
    const mainName = address.road || 
                     address.neighbourhood || 
                     address.suburb || 
                     result.display_name.split(',')[0];

    // Construire la description
    const parts = [
      address.suburb,
      address.city || 'Kinshasa',
      address.state
    ].filter(Boolean);

    const geocodedAddress: GeocodedAddress = {
      id: `nominatim-reverse-${result.place_id}`,
      name: mainName,
      description: parts.join(', '),
      coordinates: {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon)
      },
      type: result.type,
      importance: result.importance
    };

    // Mettre en cache
    reverseCache.set(cacheKey, geocodedAddress);

    return geocodedAddress;
  } catch (error) {
    console.error('❌ Erreur reverse geocoding:', error);
    return null;
  }
}

/**
 * 🧹 NETTOYER LE CACHE (pour éviter qu'il grossisse trop)
 */
export function clearGeocodingCache() {
  searchCache.clear();
  reverseCache.clear();
  console.log('🧹 Cache de géocodage nettoyé');
}

/**
 * 🔄 SYSTÈME HYBRIDE : Base de données locale + Nominatim
 * Pour avoir des suggestions rapides (base locale) + recherche précise (Nominatim)
 */
export async function hybridSearch(query: string, localResults: any[]): Promise<GeocodedAddress[]> {
  // 1. Utiliser d'abord la base locale (instantané)
  const local = localResults.map((loc, idx) => ({
    id: `local-${idx}`,
    name: loc.nom || loc.name,
    description: `${loc.quartier || loc.commune}, Kinshasa`,
    coordinates: { lat: loc.lat, lng: loc.lng },
    type: 'local',
    importance: 1.0
  }));

  // 2. En parallèle, lancer la recherche Nominatim (plus précis)
  const nominatimPromise = searchAddress(query);

  // 3. Attendre max 1 seconde pour Nominatim
  const nominatimResults = await Promise.race([
    nominatimPromise,
    new Promise<GeocodedAddress[]>(resolve => setTimeout(() => resolve([]), 1000))
  ]);

  // 4. Fusionner les résultats (priorité à Nominatim)
  // 4. Fusionner les résultats (priorité à Nominatim)
  // 4. Fusionner les résultats (priorité à Nominatim)
  const combined = [...nominatimResults];
  
  // Ajouter les résultats locaux qui ne sont pas déjà dans Nominatim
  for (const localItem of local) {
    const alreadyExists = combined.some(nom => 
      Math.abs(nom.coordinates.lat - localItem.coordinates.lat) < 0.001 &&
      Math.abs(nom.coordinates.lng - localItem.coordinates.lng) < 0.001
    );
    
    if (!alreadyExists) {
      combined.push(localItem);
    }
  }

  // 5. Limiter à 10 résultats
  return combined.slice(0, 10);
}
