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

import { Hono } from 'npm:hono@4.6.14';
import { searchPlaces, getPlaceDetails } from './mapbox-geocoding-api.ts';
import { searchWithNominatim, reverseGeocodeNominatim } from './nominatim-geocoding-api.ts';

const geocodingApp = new Hono();

// ==================== MAPBOX PLACES API (NOUVEAU - PRIORITAIRE) ====================
// Routes dédiées Mapbox pour la recherche de lieux riches

/**
 * 🔍 RECHERCHE DE LIEUX AVEC MAPBOX (Alternative à Google Places)
 * 
 * GET /geocoding/mapbox/search?query=lemba&lat=-4.3276&lng=15.3136
 * 
 * AVANTAGES:
 * - Gratuit jusqu'à 100,000 requêtes/mois
 * - Pas besoin de compte de facturation
 * - Résultats riches avec catégories et icônes
 */
geocodingApp.get('/mapbox/search', searchPlaces);

/**
 * 📍 DÉTAILS D'UN LIEU MAPBOX (Reverse geocoding)
 * 
 * GET /geocoding/mapbox/place-details?lat=-4.3276&lng=15.3136
 */
geocodingApp.get('/mapbox/place-details', getPlaceDetails);

// ==================== NOMINATIM (OPENSTREETMAP) - FALLBACK UNIVERSEL ====================
// Base de données mondiale COMPLÈTE - AUCUNE adresse ne peut échapper !

/**
 * 🌍 RECHERCHE AVEC NOMINATIM (OpenStreetMap)
 * 
 * GET /geocoding/nominatim/search?query=rue+du+port&lat=-4.3276&lng=15.3136
 * 
 * AVANTAGES:
 * - 100% GRATUIT
 * - Base de données MONDIALE COMPLÈTE
 * - Toutes les rues, même les plus petites
 * - Numéros de maison inclus
 * - Utilisé quand Mapbox ne trouve rien
 */
geocodingApp.get('/nominatim/search', searchWithNominatim);

/**
 * 📍 REVERSE GEOCODING AVEC NOMINATIM
 * 
 * GET /geocoding/nominatim/reverse?lat=-4.3276&lng=15.3136
 */
geocodingApp.get('/nominatim/reverse', reverseGeocodeNominatim);

// ==================== MAPBOX GEOCODING API (EXISTANT) ====================
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

    console.log('🌍 Mapbox Geocoding - Query:', query);
    console.log('🌍 Mapbox Geocoding - Proximity:', proximity || 'none');

    // Construire l'URL Mapbox Geocoding
    // Limiter la recherche à Kinshasa, RDC
    const bbox = '15.1,-4.5,15.6,-4.1'; // Bounding box de Kinshasa (minLng,minLat,maxLng,maxLat)
    const url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`);
    url.searchParams.set('access_token', MAPBOX_API_KEY);
    url.searchParams.set('bbox', bbox);
    url.searchParams.set('country', 'CD'); // RDC
    url.searchParams.set('limit', '10');
    url.searchParams.set('language', 'fr');
    
    // ⚠️ IMPORTANT: Mapbox attend proximity au format "lng,lat" (pas "lat,lng")
    if (proximity) {
      const [lat, lng] = proximity.split(',').map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        url.searchParams.set('proximity', `${lng},${lat}`); // Inverser pour Mapbox
        console.log('📍 Proximity Mapbox format:', `${lng},${lat}`);
      }
    }

    console.log('🔗 Mapbox URL:', url.toString().replace(MAPBOX_API_KEY, 'HIDDEN'));

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Mapbox API error:', response.status, response.statusText);
      console.error('❌ Mapbox response:', errorText);
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
  error_message?: string;
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
      console.warn('⚠️ GOOGLE_PLACES_API_KEY non défini - Utilisez la recherche locale');
      return c.json({ 
        error: 'API Google Places non configurée',
        message: 'La clé API Google Places n\'est pas définie. Utilisation de la recherche locale.',
        fallback: true,
        results: []
      }, 200);
    }

    // 🔍 DIAGNOSTIC POUR SMARTCABB.COM
    const referer = c.req.header('referer') || c.req.header('origin') || 'unknown';
    const host = c.req.header('host') || 'unknown';
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 REQUEST INFO (smartcabb.com)');
    console.log('   Query:', query);
    console.log('   Referer:', referer);
    console.log('   Host:', host);
    console.log('   Location:', lat && lng ? `${lat},${lng}` : 'none');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Construire l'URL Google Places Autocomplete
    const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
    url.searchParams.set('input', query);
    url.searchParams.set('key', GOOGLE_PLACES_API_KEY);
    url.searchParams.set('language', 'fr');
    url.searchParams.set('components', 'country:cd');
    
    if (lat && lng && !isNaN(Number(lat)) && !isNaN(Number(lng))) {
      url.searchParams.set('location', `${lat},${lng}`);
      url.searchParams.set('radius', '50000');
      url.searchParams.set('strictbounds', 'false');
    }

    console.log('📡 Calling Google Places API...');

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Google Places HTTP error:', response.status, response.statusText);
      console.error('❌ Response:', errorText);
      return c.json({ 
        error: 'Erreur HTTP Google Places',
        message: `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
        fallback: true,
        results: []
      }, 200);
    }

    const data: GooglePlacesAutocompleteResponse = await response.json();
    
    // Vérifier le statut de la réponse
    if (data.status === 'REQUEST_DENIED') {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('❌ GOOGLE PLACES REQUEST_DENIED');
      console.error('');
      console.error('📋 ERROR MESSAGE:', data.error_message);
      console.error('');
      
      // Détecter le type d'erreur
      if (data.error_message?.includes('Billing')) {
        console.error('💡 PROBLÈME: FACTURATION GOOGLE CLOUD NON ACTIVÉE');
        console.error('');
        console.error('🔧 SOLUTION:');
        console.error('   1. Allez sur: https://console.cloud.google.com/billing');
        console.error('   2. Activez la facturation sur votre projet');
        console.error('   3. Google offre 300$ de crédits gratuits');
        console.error('   4. Places API: 40 000 requêtes/mois GRATUITES');
        console.error('');
        console.error('✅ ALTERNATIVE: La recherche locale fonctionne parfaitement');
        console.error('   L\'app a 40+ lieux de Kinshasa sans Google Places');
      } else if (data.error_message?.includes('API key')) {
        console.error('💡 PROBLÈME: CLÉ API INVALIDE OU RESTRICTIONS');
        console.error('');
        console.error('🔧 SOLUTION:');
        console.error('   1. Google Cloud Console → APIs & Services → Credentials');
        console.error('   2. Vérifiez que la clé est valide');
        console.error('   3. Application restrictions → "None" (pour backend)');
        console.error('   4. API restrictions → "Places API" activée');
      } else {
        console.error('💡 PROBLÈME: ERREUR GOOGLE PLACES');
        console.error('');
        console.error('🔧 VÉRIFICATIONS:');
        console.error('   1. La clé API est valide');
        console.error('   2. L\'API Places est activée');
        console.error('   3. La facturation est activée');
        console.error('   4. Pas de restrictions bloquantes');
      }
      
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      return c.json({ 
        error: 'REQUEST_DENIED',
        message: data.error_message || 'Google Places API: Accès refusé',
        hint: 'Vérifiez la facturation Google Cloud ou utilisez la recherche locale (déjà active)',
        errorDetails: data.error_message,
        referer: referer,
        fallback: true,
        results: []
      }, 200);
    }
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('❌ Google Places status:', data.status);
      console.error('   Error message:', data.error_message);
      return c.json({ 
        error: `Google Places error: ${data.status}`,
        message: data.error_message || 'Erreur inconnue',
        fallback: true,
        results: []
      }, 200);
    }

    if (data.status === 'ZERO_RESULTS') {
      console.log('ℹ️ Google Places: Aucun résultat pour:', query);
      return c.json({ 
        results: [],
        source: 'google_places_autocomplete',
        count: 0 
      });
    }

    // Transformer les prédictions au format SmartCabb
    const results = data.predictions.map((prediction) => ({
      id: prediction.place_id,
      name: prediction.structured_formatting.main_text,
      description: prediction.structured_formatting.secondary_text || 'Kinshasa, RDC',
      placeId: prediction.place_id,
      fullAddress: prediction.description,
      types: prediction.types,
      source: 'google_places'
    }));

    console.log(`✅ Google Places SUCCESS: ${results.length} results`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    return c.json({ 
      results,
      source: 'google_places_autocomplete',
      count: results.length 
    });

  } catch (error) {
    console.error('❌ Erreur Google Places Autocomplete:', error);
    return c.json({ 
      error: 'Erreur lors de la recherche',
      message: error instanceof Error ? error.message : 'Unknown error',
      fallback: true,
      results: []
    }, 200);
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

/**
 * 📍 OBTENIR LES COORDONNÉES D'UN LIEU PAR PLACE_ID (Google Places)
 * 
 * GET /geocoding/place-details?place_id=ChIJN1t_tDeuEmsRUsoyG83frY4
 * 
 * Appelé UNIQUEMENT quand l'utilisateur sélectionne un lieu
 */
geocodingApp.get('/place-details', async (c) => {
  try {
    const placeId = c.req.query('place_id');
    
    if (!placeId) {
      return c.json({ error: 'place_id requis' }, 400);
    }

    const GOOGLE_PLACES_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY') || '';
    
    if (!GOOGLE_PLACES_API_KEY) {
      console.warn('⚠️ GOOGLE_PLACES_API_KEY non défini');
      return c.json({ error: 'API Google Places non configurée' }, 503);
    }

    console.log('📍 Google Places Details - Place ID:', placeId);

    // Construire l'URL Google Places Details
    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
    url.searchParams.set('place_id', placeId);
    url.searchParams.set('key', GOOGLE_PLACES_API_KEY);
    // Demander UNIQUEMENT les coordonnées (moins cher)
    url.searchParams.set('fields', 'geometry,name,formatted_address');
    url.searchParams.set('language', 'fr');

    console.log('🔗 Google Places Details URL:', url.toString().replace(GOOGLE_PLACES_API_KEY, 'HIDDEN'));

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Google Places Details HTTP error:', response.status, response.statusText);
      console.error('❌ Response:', errorText);
      return c.json({ error: 'Erreur API Google Places Details' }, response.status);
    }

    const data = await response.json();
    
    if (data.status !== 'OK') {
      console.error('❌ Google Places Details status:', data.status);
      return c.json({ error: `Google Places error: ${data.status}` }, 500);
    }

    const place = data.result;
    
    console.log(`✅ Coordonnées récupérées: ${place.geometry.location.lat}, ${place.geometry.location.lng}`);
    
    return c.json({
      coordinates: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng
      },
      name: place.name,
      fullAddress: place.formatted_address,
      source: 'google_places_details'
    });

  } catch (error) {
    console.error('❌ Erreur Google Places Details:', error);
    return c.json({ 
      error: 'Erreur lors de la récupération des coordonnées',
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
