/**
 * Module de calcul avancé de la durée estimée pour les trajets à Kinshasa
 * 
 * Prend en compte :
 * - La distance réelle (formule de Haversine)
 * - Le trafic selon l'heure de la journée
 * - Les zones de Kinshasa (centre vs périphérie)
 * - Les conditions routières
 */

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface TrafficConditions {
  timeOfDay: 'morning_rush' | 'midday' | 'evening_rush' | 'night' | 'weekend';
  congestionFactor: number; // Multiplicateur de durée (1 = normal, 2 = double)
}

/**
 * Vitesses moyennes à Kinshasa selon les conditions (km/h)
 * 🔥 AJUSTÉES POUR DURÉES PLUS RÉALISTES
 */
const SPEED_PROFILES = {
  // Heures de pointe (7h-9h et 17h-19h) : trafic dense
  morning_rush: 25,      // ✅ Augmenté de 15 à 25 km/h
  evening_rush: 25,      // ✅ Augmenté de 15 à 25 km/h
  
  // Milieu de journée (9h-17h) : trafic modéré
  midday: 35,            // ✅ Augmenté de 20 à 35 km/h
  
  // Nuit (19h-7h) : trafic fluide
  night: 45,             // ✅ Augmenté de 25 à 45 km/h
  
  // Weekend : trafic léger
  weekend: 40            // ✅ Augmenté de 22 à 40 km/h
};

/**
 * Zones de Kinshasa et leur facteur de congestion
 * 🔥 FACTEURS RÉDUITS POUR CORRESPONDRE AUX VALEURS FIGMA
 */
const KINSHASA_ZONES = {
  // Centre-ville (Gombe, Kalamu) : très dense
  center: {
    latMin: -4.35,
    latMax: -4.30,
    lngMin: 15.28,
    lngMax: 15.35,
    congestionFactor: 1.05     // Réduit de 1.3 à 1.05
  },
  
  // Zone intermédiaire (Lemba, Ngaliema, Bandalungwa)
  intermediate: {
    latMin: -4.42,
    latMax: -4.28,
    lngMin: 15.25,
    lngMax: 15.38,
    congestionFactor: 1.0      // Réduit de 1.1 à 1.0
  },
  
  // Périphérie (Kimbanseke, Masina, N'djili) : moins dense
  peripheral: {
    latMin: -4.50,
    latMax: -4.20,
    lngMin: 15.20,
    lngMax: 15.50,
    congestionFactor: 0.95     // Réduit de 0.9 à 0.95
  }
};

/**
 * Détermine les conditions de trafic actuelles
 * 🔥 FACTEURS RÉDUITS POUR CORRESPONDRE AUX VALEURS FIGMA
 */
export function getCurrentTrafficConditions(): TrafficConditions {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay(); // 0 = dimanche, 6 = samedi
  
  // Weekend
  if (day === 0 || day === 6) {
    return {
      timeOfDay: 'weekend',
      congestionFactor: 0.9      // Inchangé
    };
  }
  
  // Heures de pointe du matin (7h-9h)
  if (hour >= 7 && hour < 9) {
    return {
      timeOfDay: 'morning_rush',
      congestionFactor: 1.1      // Réduit de 1.6 à 1.1
    };
  }
  
  // Heures de pointe du soir (17h-19h)
  if (hour >= 17 && hour < 19) {
    return {
      timeOfDay: 'evening_rush',
      congestionFactor: 1.2      // Réduit de 1.8 à 1.2
    };
  }
  
  // Milieu de journée (9h-17h)
  if (hour >= 9 && hour < 17) {
    return {
      timeOfDay: 'midday',
      congestionFactor: 1.0      // Réduit de 1.2 à 1.0
    };
  }
  
  // Nuit (19h-7h)
  return {
    timeOfDay: 'night',
    congestionFactor: 0.8        // Inchangé
  };
}

/**
 * Détermine la zone de Kinshasa pour une coordonnée
 */
function getZone(lat: number, lng: number): keyof typeof KINSHASA_ZONES {
  // Vérifier centre-ville
  const center = KINSHASA_ZONES.center;
  if (lat >= center.latMin && lat <= center.latMax && 
      lng >= center.lngMin && lng <= center.lngMax) {
    return 'center';
  }
  
  // Vérifier zone intermédiaire
  const intermediate = KINSHASA_ZONES.intermediate;
  if (lat >= intermediate.latMin && lat <= intermediate.latMax && 
      lng >= intermediate.lngMin && lng <= intermediate.lngMax) {
    return 'intermediate';
  }
  
  // Par défaut : périphérie
  return 'peripheral';
}

/**
 * Calcule le facteur de congestion moyen entre deux points
 */
function getAverageCongestionFactor(pickup: Location, destination: Location): number {
  const pickupZone = getZone(pickup.lat, pickup.lng);
  const destZone = getZone(destination.lat, destination.lng);
  
  const pickupFactor = KINSHASA_ZONES[pickupZone].congestionFactor;
  const destFactor = KINSHASA_ZONES[destZone].congestionFactor;
  
  // Moyenne des deux zones
  return (pickupFactor + destFactor) / 2;
}

/**
 * Calcule la distance en km entre deux points (formule de Haversine)
 */
export function calculateDistance(pickup: Location, destination: Location): number {
  const R = 6371; // Rayon de la Terre en km
  
  const dLat = (destination.lat - pickup.lat) * Math.PI / 180;
  const dLng = (destination.lng - pickup.lng) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(pickup.lat * Math.PI / 180) * 
    Math.cos(destination.lat * Math.PI / 180) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Arrondir à 2 décimales
}

/**
 * Calcule la durée estimée en minutes avec précision avancée
 * 🔥 SIMPLIFIÉ POUR CORRESPONDRE AUX VALEURS FIGMA
 * 
 * @param pickup Point de départ
 * @param destination Point d'arrivée
 * @returns Durée estimée en minutes
 */
export function calculateEstimatedDuration(pickup: Location, destination: Location): number {
  // 1. Calculer la distance réelle
  const distance = calculateDistance(pickup, destination);
  
  // 2. Obtenir les conditions de trafic actuelles
  const traffic = getCurrentTrafficConditions();
  const baseSpeed = SPEED_PROFILES[traffic.timeOfDay];
  
  // 3. Obtenir le facteur de congestion de la zone
  const zoneFactor = getAverageCongestionFactor(pickup, destination);
  
  // 4. Calculer la vitesse ajustée
  const adjustedSpeed = baseSpeed / (traffic.congestionFactor * zoneFactor);
  
  // 5. Calculer la durée en minutes
  const totalDuration = (distance / adjustedSpeed) * 60;
  
  // 6. Arrondir à l'entier supérieur
  return Math.ceil(totalDuration);
}

/**
 * Calcule une estimation détaillée avec breakdown
 */
export interface DurationBreakdown {
  distance: number;
  baseSpeed: number;
  adjustedSpeed: number;
  trafficCondition: string;
  zoneCongestion: number;
  baseDuration: number;
  stopsTime: number;
  totalDuration: number;
  confidence: 'high' | 'medium' | 'low';
}

export function calculateDetailedDuration(pickup: Location, destination: Location): DurationBreakdown {
  const distance = calculateDistance(pickup, destination);
  const traffic = getCurrentTrafficConditions();
  const baseSpeed = SPEED_PROFILES[traffic.timeOfDay];
  const zoneFactor = getAverageCongestionFactor(pickup, destination);
  const adjustedSpeed = baseSpeed / (traffic.congestionFactor * zoneFactor);
  const baseDuration = (distance / adjustedSpeed) * 60;
  const stopsTime = distance * (zoneFactor > 1 ? 1 : 0.5);
  const totalDuration = Math.ceil(baseDuration + stopsTime);
  
  // Niveau de confiance
  let confidence: 'high' | 'medium' | 'low' = 'high';
  if (traffic.timeOfDay === 'morning_rush' || traffic.timeOfDay === 'evening_rush') {
    confidence = 'medium'; // Moins prévisible aux heures de pointe
  }
  if (distance > 30) {
    confidence = 'low'; // Longue distance = plus d'incertitude
  }
  
  return {
    distance,
    baseSpeed,
    adjustedSpeed: Math.round(adjustedSpeed * 10) / 10,
    trafficCondition: traffic.timeOfDay,
    zoneCongestion: Math.round(zoneFactor * 100) / 100,
    baseDuration: Math.round(baseDuration),
    stopsTime: Math.round(stopsTime),
    totalDuration,
    confidence
  };
}

/**
 * Formate la durée pour l'affichage
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (mins === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h${mins.toString().padStart(2, '0')}`;
}

/**
 * Calcule une fourchette de durée (min-max)
 */
export function calculateDurationRange(pickup: Location, destination: Location): {
  min: number;
  estimated: number;
  max: number;
} {
  const estimated = calculateEstimatedDuration(pickup, destination);
  
  // Fourchette de ±20% (trafic imprévisible à Kinshasa)
  const variance = 0.2;
  const min = Math.ceil(estimated * (1 - variance));
  const max = Math.ceil(estimated * (1 + variance));
  
  return { min, estimated, max };
}

/**
 * Exemples d'utilisation :
 * 
 * // Calcul simple
 * const duration = calculateEstimatedDuration(pickup, destination);
 * console.log(`Durée estimée : ${duration} minutes`);
 * 
 * // Calcul détaillé avec breakdown
 * const breakdown = calculateDetailedDuration(pickup, destination);
 * console.log('Détails:', breakdown);
 * 
 * // Fourchette
 * const range = calculateDurationRange(pickup, destination);
 * console.log(`Entre ${range.min} et ${range.max} minutes`);
 */