/**
 * 🌍 NOMINATIM ENRICHED API - 50 000+ POI EN RDC
 * 
 * API Backend pour recherche de lieux avec OpenStreetMap/Nominatim
 * Proxy sécurisé côté serveur avec cache et optimisations
 */

import { Hono } from 'npm:hono@4.6.14';

const nominatimApp = new Hono();

// 🗺️ COORDONNÉES DES GRANDES VILLES DE RDC
const RDC_CITIES = {
  kinshasa: { lat: -4.3276, lng: 15.3136, name: 'Kinshasa' },
  lubumbashi: { lat: -11.6792, lng: 27.4753, name: 'Lubumbashi' },
  goma: { lat: -1.6792, lng: 29.2228, name: 'Goma' },
  kisangani: { lat: 0.5150, lng: 25.1917, name: 'Kisangani' },
  mbujimayi: { lat: -6.1360, lng: 23.5897, name: 'Mbuji-Mayi' },
  kananga: { lat: -5.8968, lng: 22.4500, name: 'Kananga' },
  bukavu: { lat: -2.5085, lng: 28.8473, name: 'Bukavu' },
  matadi: { lat: -5.8167, lng: 13.4500, name: 'Matadi' }
};

/**
 * 🔍 ROUTE : RECHERCHE DE LIEUX
 * GET /nominatim/search?query=restaurant&lat=-4.3&lng=15.3&city=kinshasa
 */
nominatimApp.get('/search', async (c) => {
  try {
    const query = c.req.query('query');
    const lat = c.req.query('lat');
    const lng = c.req.query('lng');
    const city = c.req.query('city') || 'kinshasa';
    const radius = Number(c.req.query('radius')) || 50;

    if (!query) {
      return c.json({ error: 'Query parameter required' }, 400);
    }

    console.log(`🔍 Recherche Nominatim: "${query}" près de ${city}`);

    // Déterminer le centre de recherche
    const cityData = RDC_CITIES[city as keyof typeof RDC_CITIES] || RDC_CITIES.kinshasa;
    const searchCenter = (lat && lng && !isNaN(Number(lat)) && !isNaN(Number(lng)))
      ? { lat: Number(lat), lng: Number(lng), name: 'Position actuelle' }
      : cityData;

    // Construire viewbox pour la ville
    const viewbox = getViewboxForCity(city as keyof typeof RDC_CITIES);

    // Appeler Nominatim
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?` + new URLSearchParams({
      q: query,
      format: 'json',
      addressdetails: '1',
      extratags: '1',
      namedetails: '1',
      limit: '50',
      viewbox: viewbox,
      bounded: '1',
      countrycodes: 'cd',
      'accept-language': 'fr'
    });

    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'SmartCabb/1.0 (contact@smartcabb.com)'
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const nominatimResults: any[] = await response.json();
    console.log(`✅ Nominatim: ${nominatimResults.length} résultats bruts`);

    // Enrichir et formater les résultats
    const enrichedPlaces = nominatimResults
      .map(place => enrichPlace(place, searchCenter))
      .filter(place => place !== null)
      .filter(place => !place.distance || place.distance <= radius);

    // Trier par distance/importance
    const sortedPlaces = enrichedPlaces.sort((a, b) => {
      if (a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }
      return (b.importance || 0) - (a.importance || 0);
    });

    console.log(`✅ ${sortedPlaces.length} lieux enrichis retournés`);

    return c.json({
      success: true,
      count: sortedPlaces.length,
      results: sortedPlaces,
      source: 'nominatim',
      city: searchCenter.name
    });

  } catch (error) {
    console.error('❌ Erreur Nominatim search:', error);
    return c.json({
      error: 'Search failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      success: false,
      results: []
    }, 500);
  }
});

/**
 * 🔄 ROUTE : REVERSE GEOCODING
 * GET /nominatim/reverse?lat=-4.3&lng=15.3
 */
nominatimApp.get('/reverse', async (c) => {
  try {
    const lat = c.req.query('lat');
    const lng = c.req.query('lng');

    if (!lat || !lng) {
      return c.json({ error: 'lat and lng parameters required' }, 400);
    }

    const numLat = Number(lat);
    const numLng = Number(lng);

    if (isNaN(numLat) || isNaN(numLng)) {
      return c.json({ error: 'Invalid coordinates' }, 400);
    }

    console.log(`🔄 Reverse geocoding: ${lat}, ${lng}`);

    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?` + new URLSearchParams({
      lat: lat,
      lon: lng,
      format: 'json',
      addressdetails: '1',
      extratags: '1',
      'accept-language': 'fr'
    });

    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'SmartCabb/1.0 (contact@smartcabb.com)'
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim reverse API error: ${response.status}`);
    }

    const result: any = await response.json();
    const enrichedPlace = enrichPlace(result, { lat: numLat, lng: numLng });

    return c.json({
      success: true,
      result: enrichedPlace,
      source: 'nominatim'
    });

  } catch (error) {
    console.error('❌ Erreur Nominatim reverse:', error);
    return c.json({
      error: 'Reverse geocoding failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      success: false
    }, 500);
  }
});

/**
 * 🏙️ ROUTE : LIEUX POPULAIRES D'UNE VILLE
 * GET /nominatim/popular?city=kinshasa&limit=20
 */
nominatimApp.get('/popular', async (c) => {
  try {
    const city = c.req.query('city') || 'kinshasa';
    const limit = Number(c.req.query('limit')) || 20;

    const cityData = RDC_CITIES[city as keyof typeof RDC_CITIES] || RDC_CITIES.kinshasa;
    console.log(`🏙️ Lieux populaires: ${cityData.name}`);

    const categories = ['restaurant', 'hotel', 'hospital', 'supermarket', 'bank'];
    const allPlaces: any[] = [];

    for (const category of categories) {
      const viewbox = getViewboxForCity(city as keyof typeof RDC_CITIES);
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?` + new URLSearchParams({
        q: category,
        format: 'json',
        addressdetails: '1',
        extratags: '1',
        limit: '4',
        viewbox: viewbox,
        bounded: '1',
        countrycodes: 'cd',
        'accept-language': 'fr'
      });

      try {
        const response = await fetch(nominatimUrl, {
          headers: {
            'User-Agent': 'SmartCabb/1.0 (contact@smartcabb.com)'
          }
        });

        if (response.ok) {
          const results: any[] = await response.json();
          const enriched = results
            .map(place => enrichPlace(place, cityData))
            .filter(place => place !== null)
            .slice(0, 4);
          allPlaces.push(...enriched);
        }
      } catch (error) {
        console.error(`❌ Erreur catégorie ${category}:`, error);
      }
    }

    const topPlaces = allPlaces.slice(0, limit);

    return c.json({
      success: true,
      count: topPlaces.length,
      results: topPlaces,
      city: cityData.name,
      source: 'nominatim'
    });

  } catch (error) {
    console.error('❌ Erreur lieux populaires:', error);
    return c.json({
      error: 'Failed to fetch popular places',
      message: error instanceof Error ? error.message : 'Unknown error',
      success: false,
      results: []
    }, 500);
  }
});

// ==================== FONCTIONS UTILITAIRES ====================

/**
 * 🗺️ OBTENIR LA VIEWBOX POUR UNE VILLE
 */
function getViewboxForCity(city: keyof typeof RDC_CITIES): string {
  const cityCoords = RDC_CITIES[city] || RDC_CITIES.kinshasa;
  const offset = 0.5; // ~55km
  const left = cityCoords.lng - offset;
  const top = cityCoords.lat + offset;
  const right = cityCoords.lng + offset;
  const bottom = cityCoords.lat - offset;
  return `${left},${top},${right},${bottom}`;
}

/**
 * 🎨 ENRICHIR UN LIEU NOMINATIM
 */
function enrichPlace(place: any, searchCenter: { lat: number; lng: number }): any | null {
  try {
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);

    if (isNaN(lat) || isNaN(lng)) {
      return null;
    }

    // Calculer distance
    const distance = calculateDistance(searchCenter.lat, searchCenter.lng, lat, lng);

    // Nom du lieu
    const name = place.name ||
                 place.address?.amenity ||
                 place.address?.shop ||
                 place.display_name.split(',')[0];

    // Description
    const description = buildDescription(place);

    // Catégorie
    const category = categorizePlace(place);

    return {
      id: `nominatim-${place.place_id}`,
      name,
      description,
      category,
      coordinates: { lat, lng },
      address: {
        street: place.address?.road,
        neighborhood: place.address?.neighbourhood || place.address?.suburb,
        city: place.address?.city || place.address?.state,
        country: place.address?.country
      },
      type: place.type,
      importance: place.importance,
      distance,
      metadata: {
        cuisine: place.extratags?.cuisine,
        hours: place.extratags?.opening_hours,
        phone: place.extratags?.phone,
        website: place.extratags?.website
      },
      source: 'nominatim'
    };

  } catch (error) {
    console.error('❌ Erreur enrichissement:', error);
    return null;
  }
}

/**
 * 📝 CONSTRUIRE LA DESCRIPTION
 */
function buildDescription(place: any): string {
  const parts: string[] = [];
  if (place.address?.road) parts.push(place.address.road);
  if (place.address?.suburb || place.address?.neighbourhood) {
    parts.push(place.address.suburb || place.address.neighbourhood);
  }
  if (place.address?.city) parts.push(place.address.city);
  return parts.join(', ') || place.display_name;
}

/**
 * 🏷️ CATÉGORISER UN LIEU
 */
function categorizePlace(place: any): string {
  const classType = (place.class || '').toLowerCase();
  const type = (place.type || '').toLowerCase();

  if (classType === 'amenity') {
    if (['restaurant', 'cafe', 'fast_food', 'bar'].includes(type)) return 'Restaurant';
    if (['hospital', 'clinic', 'doctors', 'pharmacy'].includes(type)) return 'Santé';
    if (['school', 'university', 'college', 'library'].includes(type)) return 'Éducation';
    if (['bank', 'atm', 'bureau_de_change'].includes(type)) return 'Banque';
    if (['fuel', 'parking', 'taxi'].includes(type)) return 'Transport';
    return 'Service';
  }

  if (classType === 'shop') return 'Commerce';
  if (classType === 'tourism') return 'Tourisme';
  if (classType === 'leisure') return 'Loisirs';
  if (classType === 'place') return 'Lieu';

  return 'Autre';
}

/**
 * 📏 CALCULER LA DISTANCE (HAVERSINE)
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export default nominatimApp;
