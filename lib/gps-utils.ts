import { useState, useEffect } from 'react';

/**
 * Calcule la distance entre deux points GPS en mètres
 * Utilise la formule de Haversine
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Rayon de la Terre en mètres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance en mètres
  return distance;
}

/**
 * Vérifie si le conducteur est proche du point de pickup (moins de 10 mètres)
 */
export function isNearPickupLocation(
  driverLat: number,
  driverLng: number,
  pickupLat: number,
  pickupLng: number,
  thresholdMeters: number = 10
): boolean {
  const distance = calculateDistance(driverLat, driverLng, pickupLat, pickupLng);
  const safeDistance = distance || 0; // Protection contre undefined
  console.log(`📍 Distance au point de départ: ${safeDistance.toFixed(2)}m`);
  return safeDistance <= thresholdMeters;
}

/**
 * Hook pour obtenir la position GPS du conducteur
 * ⚠️ POSITION RÉELLE UNIQUEMENT - Pas de position par défaut
 */
export function useDriverLocation(isActive: boolean = true) {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setLocation(null);
      return;
    }
    
    // Si la permission a été refusée, arrêter complètement
    if (permissionDenied) {
      setError('GPS non autorisé - Veuillez autoriser la géolocalisation dans les paramètres de votre navigateur');
      setLocation(null);
      return;
    }

    if (!navigator.geolocation) {
      const errorMsg = 'La géolocalisation n\'est pas supportée par votre navigateur';
      setError(errorMsg);
      setLocation(null);
      console.error('❌ Géolocalisation non supportée');
      return;
    }

    console.log('🔍 Demande d\'autorisation GPS...');

    // Obtenir la position initiale
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setLocation(newLocation);
        setError(null);
        console.log(`✅ Position GPS RÉELLE obtenue: ${newLocation.lat.toFixed(6)}, ${newLocation.lng.toFixed(6)}`);
      },
      (err) => {
        // Si permission refusée, arrêter les tentatives
        if (err.code === err.PERMISSION_DENIED) {
          console.error('❌ GPS refusé par l\'utilisateur');
          setPermissionDenied(true);
          setError('GPS non autorisé - Veuillez autoriser la géolocalisation');
          setLocation(null);
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          console.error('❌ Position GPS indisponible');
          setError('Position GPS indisponible - Vérifiez votre connexion GPS');
          setLocation(null);
        } else if (err.code === err.TIMEOUT) {
          console.error('❌ Timeout GPS');
          setError('Délai de géolocalisation dépassé - Réessayez');
          setLocation(null);
        } else {
          console.error('❌ Erreur GPS:', err.message);
          setError('Erreur GPS: ' + err.message);
          setLocation(null);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    // Ne démarrer le suivi que si la permission n'est pas refusée
    if (permissionDenied) return;

    // Suivre la position en temps réel
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setLocation(newLocation);
        setError(null);
        console.log(`📍 Position GPS RÉELLE mise à jour: ${newLocation.lat.toFixed(6)}, ${newLocation.lng.toFixed(6)}`);
      },
      (err) => {
        // Si permission refusée, arrêter complètement le tracking
        if (err.code === err.PERMISSION_DENIED) {
          console.error('❌ GPS refusé - Arrêt du suivi');
          setPermissionDenied(true);
          setError('GPS non autorisé');
          setLocation(null);
          navigator.geolocation.clearWatch(watchId);
          return;
        }
        
        // Pour les autres erreurs, juste logger (ne pas effacer la dernière position connue)
        // Pour les autres erreurs, juste logger (ne pas effacer la dernière position connue)
        // Pour les autres erreurs, juste logger (ne pas effacer la dernière position connue)
        console.warn('⚠️ Erreur temporaire GPS:', err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      console.log('🔴 Arrêt du suivi GPS');
    };
  }, [isActive, permissionDenied]);

  return { location, error, permissionDenied };
}
