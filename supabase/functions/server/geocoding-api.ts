/**
 * 🌍 GEOCODING API PROXY - EXACTEMENT COMME UBER/YANGO
 * 
 * Ce module sécurise les appels aux API professionnelles de géocodage :
 * 
 * 1. **Mapbox Geocoding API** (comme Uber)
 *    - Recherche d'adresses professionnelle
 *    - Autocomplete en temps réel
 *    - Données précises pour Kinshasa
 * 
 * 2. **Google Places API** (comme Yango)
 *    - Recherche de lieux avec détails (téléphone, horaires, etc.)
 *    - Photos des lieux
 *    - Notes et avis
 * 
 * 3. **Mapbox Directions API** (calcul d'itinéraire)
 *    - Calcul de route optimisée
 *    - Estimation de durée
 *    - Trafic en temps réel
 * 
 * SÉCURITÉ : Les clés API sont stockées côté serveur, jamais exposées au frontend
 */

import { Hono } from 'npm:hono';

const geocodingApp = new Hono();

// ==================== MAPBOX GEOCODING API ====================
// Docs: https://docs.mapbox.com/api/search/geocoding/

interface MapboxFeature {
  id: string;
  type: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
  properties: {
    category?: string;
    maki?: string;
  };
  context?: Array<{
    id: string;
    text: string;
  }>;
}

interface MapboxGeocodingResponse {
  type: string;
  query: string[];
  features: MapboxFeature[];
}

/**
 * 🔍 RECHERCHE D'ADRESSES AVEC MAPBOX (comme Uber)
 * 
 * GET /geocoding/search?q=lemba&proximity=-4.3276,15.3136
 */
geocodingApp.get('/search', async (c) => {
  try {
    const query = c.req.query('q');
    const proximity = c.req.query('proximity'); // Format: "lat,lng"
    
    if (!query || query.trim().length < 2) {
      return c.json({ error: 'Query trop court (minimum 2 caractères)' }, 400);
    }

    const MAPBOX_API_KEY = Deno.env.get('MAPBOX_API_KEY') || '';
    
    if (!MAPBOX_API_KEY) {
      console.warn('⚠️ MAPBOX_API_KEY non défini, fallback vers Nominatim');
      return c.json({ error: 'API Mapbox non configurée', fallback: true }, 503);
    }

    // Construire l'URL Mapbox Geocoding
    // Limiter la recherche à Kinshasa, RDC
    const bbox = '15.1,4.5,15.6,-4.1'; // Bounding box de Kinshasa
    const url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`);
    url.searchParams.set('access_token', MAPBOX_API_KEY);
    url.searchParams.set('bbox', bbox);
    url.searchParams.set('country', 'CD'); // RDC
    url.searchParams.set('limit', '10');
    url.searchParams.set('language', 'fr');
    
    if (proximity) {
      url.searchParams.set('proximity', proximity);
    }

    console.log('🌍 Mapbox Geocoding request:', query);

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      console.error('❌ Mapbox API error:', response.status, response.statusText);
      return c.json({ error: 'Erreur API Mapbox', fallback: true }, response.status);
    }

    const data: MapboxGeocodingResponse = await response.json();
    
    // Transformer les résultats au format SmartCabb
    const results = data.features.map((feature) => {
      // Extraire le quartier/commune depuis context
      const commune = feature.context?.find(ctx => ctx.id.startsWith('place.'))?.text || 'Kinshasa';
      const neighborhood = feature.context?.find(ctx => ctx.id.startsWith('neighborhood.'))?.text;
      
      // Déterminer le type de lieu
      const category = feature.properties?.category || feature.properties?.maki || 'autre';
      const icon = getPlaceIcon(category);
      const typeLabel = getPlaceTypeLabel(category);
      
      return {
        id: feature.id,
        name: feature.place_name.split(',')[0], // Nom principal
        description: `${icon} ${typeLabel} • ${neighborhood || commune}, Kinshasa`,
        coordinates: {
          lat: feature.center[1],
          lng: feature.center[0]
        },
        fullAddress: feature.place_name,
        source: 'mapbox'
      };
    });

    console.log(`✅ Mapbox returned ${results.length} results`);
    
    return c.json({ 
      results,
      source: 'mapbox',
      count: results.length 
    });

  } catch (error) {
    console.error('❌ Erreur Mapbox Geocoding:', error);
    return c.json({ 
      error: 'Erreur lors de la recherche',
      message: error instanceof Error ? error.message : 'Unknown error',
      fallback: true 
    }, 500);
  }
});

// ==================== GOOGLE PLACES API ====================
// Docs: https://developers.google.com/maps/documentation/places/web-service/autocomplete

interface GooglePlacePrediction {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  types: string[];
}

interface GooglePlacesAutocompleteResponse {
  predictions: GooglePlacePrediction[];
  status: string;
}

/**
 * 🔍 AUTOCOMPLETE AVEC GOOGLE PLACES (comme Yango)
 * 
 * GET /geocoding/autocomplete?q=lemba&lat=-4.3276&lng=15.3136
 */
geocodingApp.get('/autocomplete', async (c) => {
  try {
    const query = c.req.query('q');
    const lat = c.req.query('lat');
    const lng = c.req.query('lng');
    
    if (!query || query.trim().length < 2) {
      return c.json({ error: 'Query trop court (minimum 2 caractères)' }, 400);
    }

    const GOOGLE_PLACES_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY') || '';
    
    if (!GOOGLE_PLACES_API_KEY) {
      console.warn('⚠️ GOOGLE_PLACES_API_KEY non défini, fallback vers Mapbox');
      return c.json({ error: 'API Google Places non configurée', fallback: true }, 503);
    }

    // Construire l'URL Google Places Autocomplete
    const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
    url.searchParams.set('input', query);
    url.searchParams.set('key', GOOGLE_PLACES_API_KEY);
    url.searchParams.set('language', 'fr');
    url.searchParams.set('components', 'country:cd'); // Limiter à la RDC
    
    // Centrer autour de Kinshasa
    if (lat && lng) {
      url.searchParams.set('location', `${lat},${lng}`);
      url.searchParams.set('radius', '50000'); // 50 km
    } else {
      url.searchParams.set('location', '-4.3276,15.3136'); // Centre de Kinshasa
      url.searchParams.set('radius', '50000');
    }

    console.log('🌍 Google Places Autocomplete request:', query);

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      console.error('❌ Google Places API error:', response.status, response.statusText);
      return c.json({ error: 'Erreur API Google Places', fallback: true }, response.status);
    }

    const data: GooglePlacesAutocompleteResponse = await response.json();
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('❌ Google Places API status:', data.status);
      return c.json({ error: `Google Places error: ${data.status}`, fallback: true }, 500);
    }

    // Transformer les résultats
    const results = await Promise.all(
      data.predictions.map(async (prediction) => {
        // Obtenir les détails du lieu pour avoir les coordonnées
        const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json');
        detailsUrl.searchParams.set('place_id', prediction.place_id);
        detailsUrl.searchParams.set('key', GOOGLE_PLACES_API_KEY);
        detailsUrl.searchParams.set('fields', 'geometry,name,formatted_address,types,rating,user_ratings_total');
        
        const detailsResponse = await fetch(detailsUrl.toString());
        const detailsData = await detailsResponse.json();
        
        if (detailsData.status !== 'OK') {
          return null;
        }
        
        const place = detailsData.result;
        const icon = getPlaceIcon(prediction.types[0] || 'point_of_interest');
        const typeLabel = getPlaceTypeLabel(prediction.types[0] || 'point_of_interest');
        
        return {
          id: prediction.place_id,
          name: prediction.structured_formatting.main_text,
          description: `${icon} ${typeLabel} • ${prediction.structured_formatting.secondary_text}`,
          coordinates: {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng
          },
          fullAddress: prediction.description,
          rating: place.rating,
          userRatingsTotal: place.user_ratings_total,
          source: 'google_places'
        };
      })
    );

    const validResults = results.filter(r => r !== null);
    
    console.log(`✅ Google Places returned ${validResults.length} results`);
    
    return c.json({ 
      results: validResults,
      source: 'google_places',
      count: validResults.length 
    });

  } catch (error) {
    console.error('❌ Erreur Google Places Autocomplete:', error);
    return c.json({ 
      error: 'Erreur lors de la recherche',
      message: error instanceof Error ? error.message : 'Unknown error',
      fallback: true 
    }, 500);
  }
});

// ==================== MAPBOX DIRECTIONS API ====================
// Docs: https://docs.mapbox.com/api/navigation/directions/

/**
 * 🚗 CALCUL D'ITINÉRAIRE AVEC MAPBOX (comme Uber)
 * 
 * GET /geocoding/directions?start=-4.3276,15.3136&end=-4.3847,15.3172
 */
geocodingApp.get('/directions', async (c) => {
  try {
    const start = c.req.query('start'); // Format: "lat,lng"
    const end = c.req.query('end');     // Format: "lat,lng"
    
    if (!start || !end) {
      return c.json({ error: 'Paramètres start et end requis' }, 400);
    }

    const MAPBOX_API_KEY = Deno.env.get('MAPBOX_API_KEY') || '';
    
    if (!MAPBOX_API_KEY) {
      console.warn('⚠️ MAPBOX_API_KEY non défini');
      return c.json({ error: 'API Mapbox non configurée' }, 503);
    }

    // Inverser lat,lng en lng,lat pour Mapbox
    const [startLat, startLng] = start.split(',').map(Number);
    const [endLat, endLng] = end.split(',').map(Number);
    const coordinates = `${startLng},${startLat};${endLng},${endLat}`;

    // Construire l'URL Mapbox Directions
    const url = new URL(`https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}`);
    url.searchParams.set('access_token', MAPBOX_API_KEY);
    url.searchParams.set('geometries', 'geojson');
    url.searchParams.set('overview', 'full');
    url.searchParams.set('steps', 'true');
    url.searchParams.set('language', 'fr');

    console.log('🚗 Mapbox Directions request:', start, '→', end);

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      console.error('❌ Mapbox Directions API error:', response.status, response.statusText);
      return c.json({ error: 'Erreur API Mapbox Directions' }, response.status);
    }

    const data = await response.json();
    
    if (!data.routes || data.routes.length === 0) {
      return c.json({ error: 'Aucun itinéraire trouvé' }, 404);
    }

    const route = data.routes[0];
    
    console.log(`✅ Route calculée: ${(route.distance / 1000).toFixed(1)} km, ${Math.round(route.duration / 60)} min`);
    
    return c.json({
      distance: route.distance, // en mètres
      duration: route.duration, // en secondes
      geometry: route.geometry, // GeoJSON LineString
      steps: route.legs[0].steps,
      source: 'mapbox_directions'
    });

  } catch (error) {
    console.error('❌ Erreur Mapbox Directions:', error);
    return c.json({ 
      error: 'Erreur lors du calcul d\'itinéraire',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// ==================== HELPERS ====================

function getPlaceIcon(type: string): string {
  const icons: Record<string, string> = {
    restaurant: '🍽️',
    cafe: '☕',
    bar: '🍺',
    store: '🏪',
    shop: '🏪',
    supermarket: '🛒',
    shopping_mall: '🏬',
    gas_station: '⛽',
    fuel: '⛽',
    hospital: '🏥',
    pharmacy: '💊',
    school: '🏫',
    university: '🎓',
    bank: '🏦',
    atm: '🏧',
    hotel: '🏨',
    lodging: '🏨',
    church: '⛪',
    mosque: '🕌',
    park: '🌳',
    stadium: '🏟️',
    gym: '💪',
    cinema: '🎬',
    movie_theater: '🎬',
    bus_station: '🚌',
    taxi_stand: '🚕',
    parking: '🅿️',
    airport: '✈️',
    train_station: '🚂',
    subway_station: '🚇',
    point_of_interest: '📍',
    establishment: '🏢',
    default: '📍'
  };
  return icons[type] || icons.default;
}

function getPlaceTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    restaurant: 'Restaurant',
    cafe: 'Café',
    bar: 'Bar',
    store: 'Magasin',
    shop: 'Magasin',
    supermarket: 'Supermarché',
    shopping_mall: 'Centre commercial',
    gas_station: 'Station service',
    fuel: 'Station service',
    hospital: 'Hôpital',
    pharmacy: 'Pharmacie',
    school: 'École',
    university: 'Université',
    bank: 'Banque',
    atm: 'Distributeur',
    hotel: 'Hôtel',
    lodging: 'Hôtel',
    church: 'Église',
    mosque: 'Mosquée',
    park: 'Parc',
    stadium: 'Stade',
    gym: 'Salle de sport',
    cinema: 'Cinéma',
    movie_theater: 'Cinéma',
    bus_station: 'Arrêt de bus',
    taxi_stand: 'Station de taxi',
    parking: 'Parking',
    airport: 'Aéroport',
    train_station: 'Gare',
    subway_station: 'Station de métro',
    point_of_interest: 'Point d\'intérêt',
    establishment: 'Établissement',
    default: 'Lieu'
  };
  return labels[type] || labels.default;
}

export default geocodingApp;
