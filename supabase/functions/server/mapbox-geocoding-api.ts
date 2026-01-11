/**
 * 🗺️ MAPBOX GEOCODING API - RECHERCHE DE LIEUX
 * 
 * Service backend pour la recherche de lieux avec Mapbox
 * - Gratuit jusqu'à 100,000 requêtes/mois
 * - Pas besoin de compte de facturation
 * - Résultats riches avec icônes, catégories, etc.
 */

import { Context } from 'npm:hono@4.6.14';

/**
 * 🔍 RECHERCHE DE LIEUX AVEC MAPBOX
 */
export async function searchPlaces(c: Context) {
  try {
    const query = c.req.query('query');
    const lat = c.req.query('lat');
    const lng = c.req.query('lng');

    if (!query || query.trim().length < 2) {
      return c.json({ 
        error: 'Query must be at least 2 characters',
        results: [] 
      }, 400);
    }

    const mapboxApiKey = Deno.env.get('MAPBOX_API_KEY');
    if (!mapboxApiKey) {
      console.error('❌ MAPBOX_API_KEY not configured');
      return c.json({ 
        error: 'Mapbox API key not configured',
        results: [] 
      }, 500);
    }

    console.log('🔍 Mapbox search:', query);

    // Construire l'URL Mapbox Geocoding API
    const url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`);
    
    // Paramètres de recherche
    url.searchParams.set('access_token', mapboxApiKey);
    url.searchParams.set('limit', '20'); // Comme Yango
    url.searchParams.set('language', 'fr'); // Français
    url.searchParams.set('country', 'CD'); // République Démocratique du Congo
    
    // Si position actuelle fournie, prioriser les résultats proches
    if (lat && lng) {
      url.searchParams.set('proximity', `${lng},${lat}`); // Mapbox utilise lng,lat
    }
    
    // Types de lieux à rechercher (tous les types pertinents)
    url.searchParams.set('types', 'poi,address,place,locality,neighborhood');
    
    // 🎯 NOUVEAU : LIMITER LA RECHERCHE À KINSHASA (rayon 25km)
    // Bbox format: minLng,minLat,maxLng,maxLat
    // Kinshasa centre: -4.3276, 15.3136
    // Rayon ~25km = ~0.225 degrés
    const kinshasaBbox = '15.088,−4.553,15.539,−4.102'; // Zone Kinshasa élargie
    url.searchParams.set('bbox', kinshasaBbox);

    // Faire la requête à Mapbox
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      console.error('❌ Mapbox API error:', response.status);
      return c.json({ 
        error: 'Mapbox API error',
        results: [] 
      }, response.status);
    }

    const data = await response.json();
    
    console.log(`✅ Mapbox returned ${data.features?.length || 0} results`);

    // 🎯 RÉCUPÉRER LA POSITION DE L'UTILISATEUR AVANT LA BOUCLE
    const userLat = lat ? parseFloat(lat) : null;
    const userLng = lng ? parseFloat(lng) : null;

    console.log('📍 Position utilisateur pour calcul distance:', 
      userLat && userLng ? `${userLat}, ${userLng}` : 'Non fournie'
    );

    // Transformer les résultats Mapbox au format SmartCabb
    const results = (data.features || []).map((feature: any) => {
      const [placeLng, placeLat] = feature.center; // 🎯 RENOMMÉ : coordinates du LIEU trouvé
      
      // Déterminer le type de lieu pour l'icône
      const placeType = getPlaceType(feature);
      
      // Construire la description
      const description = buildDescription(feature);
      
      // 🎯 CALCULER LA DISTANCE CORRECTEMENT
      let distance: number | undefined;
      if (userLat !== null && userLng !== null) {
        distance = calculateDistance(userLat, userLng, placeLat, placeLng);
        console.log(`   📏 Distance pour ${feature.text}: ${distance.toFixed(2)} km`);
      } else {
        console.log('   ⚠️ Position utilisateur non fournie, distance non calculée');
      }

      return {
        id: feature.id || `mapbox-${Date.now()}-${Math.random()}`,
        name: feature.text || feature.place_name,
        description,
        coordinates: { lat: placeLat, lng: placeLng }, // 🎯 Coordonnées du LIEU
        placeId: feature.id,
        type: 'place',
        placeType,
        distance,
        source: 'mapbox'
      };
    });

    console.log(`✅ Returning ${results.length} formatted results`);
    
    return c.json({ 
      results,
      source: 'mapbox',
      count: results.length 
    });

  } catch (error) {
    console.error('❌ Mapbox search error:', error);
    return c.json({ 
      error: 'Search failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      results: [] 
    }, 500);
  }
}

/**
 * 📍 DÉTAILS D'UN LIEU SPÉCIFIQUE (reverse geocoding)
 */
export async function getPlaceDetails(c: Context) {
  try {
    const lat = c.req.query('lat');
    const lng = c.req.query('lng');

    if (!lat || !lng) {
      return c.json({ error: 'Latitude and longitude required' }, 400);
    }

    const mapboxApiKey = Deno.env.get('MAPBOX_API_KEY');
    if (!mapboxApiKey) {
      console.error('❌ MAPBOX_API_KEY not configured');
      return c.json({ error: 'Mapbox API key not configured' }, 500);
    }

    console.log(`🔍 Mapbox reverse geocoding: ${lat}, ${lng}`);

    // Reverse geocoding avec Mapbox
    const url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json`);
    url.searchParams.set('access_token', mapboxApiKey);
    url.searchParams.set('language', 'fr');
    url.searchParams.set('types', 'poi,address,place,locality,neighborhood');

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      console.error('❌ Mapbox API error:', response.status);
      return c.json({ error: 'Mapbox API error' }, response.status);
    }

    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      return c.json({ error: 'No place found at these coordinates' }, 404);
    }

    const feature = data.features[0];
    const [lng2, lat2] = feature.center;

    const result = {
      id: feature.id,
      name: feature.text || feature.place_name,
      description: buildDescription(feature),
      coordinates: { lat: lat2, lng: lng2 },
      placeId: feature.id,
      placeType: getPlaceType(feature),
      address: feature.place_name,
      source: 'mapbox'
    };

    console.log('✅ Place details retrieved');
    
    return c.json(result);

  } catch (error) {
    console.error('❌ Mapbox place details error:', error);
    return c.json({ 
      error: 'Failed to get place details',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
}

/**
 * 🏷️ DÉTERMINER LE TYPE DE LIEU POUR L'ICÔNE
 */
function getPlaceType(feature: any): string {
  // Catégories Mapbox POI
  const category = feature.properties?.category;
  
  if (category) {
    // Mapper les catégories Mapbox aux types SmartCabb
    const categoryMap: Record<string, string> = {
      'airport': 'station',
      'bus station': 'terminal',
      'train station': 'station',
      'shopping mall': 'mall',
      'shopping': 'mall',
      'supermarket': 'market',
      'market': 'market',
      'restaurant': 'restaurant',
      'cafe': 'restaurant',
      'hotel': 'hotel',
      'lodging': 'hotel',
      'hospital': 'hospital',
      'clinic': 'hospital',
      'pharmacy': 'hospital',
      'school': 'school',
      'university': 'school',
      'college': 'school',
      'bank': 'bank',
      'church': 'church',
      'mosque': 'church',
      'park': 'park',
      'office': 'office',
      'government': 'office',
      'entertainment': 'mall'
    };

    for (const [key, value] of Object.entries(categoryMap)) {
      if (category.toLowerCase().includes(key)) {
        return value;
      }
    }
  }

  // Par type de feature
  const placeType = feature.place_type?.[0];
  if (placeType === 'poi') return 'place';
  if (placeType === 'address') return 'address';
  if (placeType === 'neighborhood') return 'neighborhood';
  if (placeType === 'locality') return 'city';
  
  return 'place';
}

/**
 * 📝 CONSTRUIRE LA DESCRIPTION D'UN LIEU
 */
function buildDescription(feature: any): string {
  const parts: string[] = [];
  
  // Catégorie
  if (feature.properties?.category) {
    parts.push(feature.properties.category);
  }
  
  // Contexte (quartier, ville, etc.)
  if (feature.context) {
    for (const ctx of feature.context) {
      if (ctx.id.startsWith('neighborhood') || ctx.id.startsWith('locality')) {
        parts.push(ctx.text);
      }
    }
  }
  
  // Si pas de contexte, utiliser place_name sans le nom principal
  if (parts.length === 0 && feature.place_name) {
    const placeName = feature.place_name;
    const text = feature.text;
    const description = placeName.replace(text, '').replace(/^,\s*/, '').trim();
    if (description) {
      parts.push(description);
    }
  }
  
  return parts.join(' • ') || 'Kinshasa, RDC';
}

/**
 * 📍 CALCULER LA DISTANCE (Haversine)
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
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
