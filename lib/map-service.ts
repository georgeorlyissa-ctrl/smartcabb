/**
 * Service de géolocalisation et calcul de distances pour SmartCabb
 * Coordonnées géographiques centrées sur Kinshasa, RDC
 * VERSION PRODUCTION - Données réelles uniquement
 */

// Coordonnées par défaut : Kinshasa, RDC
export const DEFAULT_LOCATION = {
  lat: -4.3276,
  lng: 15.3136,
};

// Rayon de la Terre en kilomètres
const EARTH_RADIUS_KM = 6371;

/**
 * Calcule la distance entre deux points GPS en utilisant la formule Haversine
 * @param lat1 Latitude du point 1
 * @param lng1 Longitude du point 1
 * @param lat2 Latitude du point 2
 * @param lng2 Longitude du point 2
 * @returns Distance en kilomètres
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;

  return parseFloat(distance.toFixed(2));
}

/**
 * Convertit des degrés en radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calcule un itinéraire simple entre deux points
 * @param pickup Point de départ
 * @param dropoff Point d'arrivée
 * @returns Objet contenant distance et durée estimée
 */
export function calculateRoute(
  pickup: { lat: number; lng: number },
  dropoff: { lat: number; lng: number }
) {
  const distance = calculateDistance(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng);
  
  // Estimation de durée : vitesse moyenne de 30 km/h à Kinshasa (trafic urbain)
  const durationMinutes = Math.round((distance / 30) * 60);

  return {
    distance,
    duration: durationMinutes,
    unit: 'km' as const,
  };
}

/**
 * Calcule le prix estimé d'une course selon la catégorie de véhicule
 * @param distance Distance en km
 * @param category Catégorie de véhicule
 * @returns Prix en CDF (Franc Congolais)
 */
export function calculatePrice(distance: number, category: string): number {
  // Prix de base par catégorie (en CDF)
  const basePrices: Record<string, number> = {
    eco: 2000,
    standard: 3000,
    comfort: 5000,
    premium: 8000,
    xl: 6000,
    van: 10000,
  };

  // Prix par kilomètre (en CDF)
  const pricePerKm: Record<string, number> = {
    eco: 800,
    standard: 1200,
    comfort: 2000,
    premium: 3500,
    xl: 2500,
    van: 4000,
  };

  const categoryLower = category.toLowerCase();
  const base = basePrices[categoryLower] || basePrices.standard;
  const perKm = pricePerKm[categoryLower] || pricePerKm.standard;

  const totalPrice = base + (distance * perKm);

  // Arrondir au multiple de 100 CDF le plus proche
  return Math.round(totalPrice / 100) * 100;
}

/**
 * Vérifie si des coordonnées sont dans la zone de service (Kinshasa)
 */
export function isInServiceArea(lat: number, lng: number): boolean {
  const distance = calculateDistance(
    DEFAULT_LOCATION.lat,
    DEFAULT_LOCATION.lng,
    lat,
    lng
  );

  // Zone de service : 50km autour de Kinshasa
  return distance <= 50;
}

/**
 * Génère un chemin simple entre deux points (pour affichage sur carte)
 * Interpolation linéaire entre départ et arrivée
 */
export function generateSimplePath(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
  points: number = 20
): Array<{ lat: number; lng: number }> {
  const path: Array<{ lat: number; lng: number }> = [];

  for (let i = 0; i <= points; i++) {
    const ratio = i / points;
    path.push({
      lat: start.lat + (end.lat - start.lat) * ratio,
      lng: start.lng + (end.lng - start.lng) * ratio,
    });
  }

  return path;
}