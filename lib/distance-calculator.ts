/**
 * 🧮 CALCULATEUR DE DISTANCE ET DURÉE PRÉCIS POUR KINSHASA
 * 
 * Utilise la formule de Haversine pour calculer la distance entre deux points GPS
 * Estime la durée basée sur les conditions de trafic réelles à Kinshasa
 */

export interface RouteCalculation {
  distance: number; // Distance en kilomètres
  duration: number; // Durée en minutes
  durationText: string; // Durée formatée (ex: "15 min")
  distanceText: string; // Distance formatée (ex: "5.2 km")
}

/**
 * 🌍 CALCUL DE DISTANCE HAVERSINE (ULTRA-PRÉCIS)
 * Formule mathématique pour calculer la distance entre deux points GPS sur une sphère
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Rayon de la Terre en kilomètres
  
  // Convertir les degrés en radians
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  const distance = R * c; // Distance en km
  
  return distance;
}

/**
 * ⏱️ CALCUL DE DURÉE BASÉ SUR LES CONDITIONS RÉELLES DE KINSHASA
 * 
 * Vitesses moyennes à Kinshasa selon les conditions :
 * - Trafic fluide (5h-7h, 22h-5h) : 35-40 km/h
 * - Trafic modéré (7h-9h, 15h-17h) : 20-25 km/h
 * - Trafic dense (9h-15h, 17h-22h) : 15-20 km/h
 * - Embouteillages : 8-12 km/h
 */
export function calculateDuration(distanceKm: number): number {
  const now = new Date();
  const hour = now.getHours();
  
  let averageSpeed: number;
  
  // Déterminer la vitesse moyenne selon l'heure
  if ((hour >= 5 && hour < 7) || (hour >= 22 || hour < 5)) {
    // Trafic fluide (nuit/tôt le matin)
    averageSpeed = 37.5; // km/h
  } else if ((hour >= 7 && hour < 9) || (hour >= 15 && hour < 17)) {
    // Trafic modéré (heures de pointe légères)
    averageSpeed = 22.5; // km/h
  } else if ((hour >= 9 && hour < 15) || (hour >= 17 && hour < 22)) {
    // Trafic dense (journée/soirée)
    averageSpeed = 17.5; // km/h
  } else {
    // Par défaut
    averageSpeed = 20; // km/h
  }
  
  // Ajustements selon la distance
  if (distanceKm < 2) {
    // Courtes distances : plus de temps aux arrêts/démarrages
    averageSpeed *= 0.7;
  } else if (distanceKm > 10) {
    // Longues distances : possibilité d'utiliser des axes rapides
    averageSpeed *= 1.15;
  }
  
  // Calcul de la durée en minutes
  const durationMinutes = (distanceKm / averageSpeed) * 60;
  
  // Ajouter un buffer de sécurité (5-10%)
  const buffer = durationMinutes * 0.075;
  
  return Math.round(durationMinutes + buffer);
}

/**
 * 🚗 CALCUL COMPLET DE L'ITINÉRAIRE
 * Retourne distance et durée formatées
 */
export function calculateRoute(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): RouteCalculation {
  // Calculer la distance en km
  const distance = calculateDistance(fromLat, fromLng, toLat, toLng);
  
  // Calculer la durée en minutes
  const duration = calculateDuration(distance);
  
  // Formater la distance
  let distanceText: string;
  if (distance < 1) {
    // Moins de 1 km : afficher en mètres
    distanceText = `${Math.round(distance * 1000)} m`;
  } else if (distance < 10) {
    // Entre 1 et 10 km : 1 décimale
    distanceText = `${distance.toFixed(1)} km`;
  } else {
    // Plus de 10 km : nombre entier
    distanceText = `${Math.round(distance)} km`;
  }
  
  // Formater la durée
  let durationText: string;
  if (duration < 60) {
    durationText = `${duration} min`;
  } else {
    const hours = Math.floor(duration / 60);
    const mins = duration % 60;
    if (mins === 0) {
      durationText = `${hours}h`;
    } else {
      durationText = `${hours}h${mins.toString().padStart(2, '0')}`;
    }
  }
  
  return {
    distance,
    duration,
    distanceText,
    durationText
  };
}

/**
 * 📊 OBTENIR LA CONDITION DE TRAFIC ACTUELLE
 */
export function getCurrentTrafficCondition(): {
  level: 'fluide' | 'modéré' | 'dense' | 'embouteillage';
  color: string;
  emoji: string;
  description: string;
} {
  const now = new Date();
  const hour = now.getHours();
  
  if ((hour >= 5 && hour < 7) || (hour >= 22 || hour < 5)) {
    return {
      level: 'fluide',
      color: 'text-green-600',
      emoji: '🟢',
      description: 'Trafic fluide'
    };
  } else if ((hour >= 7 && hour < 9) || (hour >= 15 && hour < 17)) {
    return {
      level: 'modéré',
      color: 'text-yellow-600',
      emoji: '🟡',
      description: 'Trafic modéré'
    };
  } else if ((hour >= 9 && hour < 15) || (hour >= 17 && hour < 22)) {
    return {
      level: 'dense',
      color: 'text-orange-600',
      emoji: '🟠',
      description: 'Trafic dense'
    };
  } else {
    return {
      level: 'modéré',
      color: 'text-yellow-600',
      emoji: '🟡',
      description: 'Trafic modéré'
    };
  }
}
