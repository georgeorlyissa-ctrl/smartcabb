import { useState, useEffect } from 'react';

interface Location {
  lat: number;
  lng: number;
}

interface UseDriverLocationOptions {
  enabled?: boolean;
  highAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

/**
 * Hook pour tracker la position GPS du conducteur en temps réel
 * Utilise navigator.geolocation.watchPosition pour suivre les déplacements
 */
export function useDriverLocation(options: UseDriverLocationOptions = {}) {
  const {
    enabled = true,
    highAccuracy = true,
    timeout = 5000,
    maximumAge = 0
  } = options;

  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    if (!('geolocation' in navigator)) {
      setError('La géolocalisation n\'est pas supportée par votre navigateur');
      setIsLoading(false);
      return;
    }

    let watchId: number;

    console.log('🌍 Démarrage du tracking GPS driver...');

    const startTracking = () => {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          setLocation(newLocation);
          setError(null);
          setIsLoading(false);
          
          console.log('📍 Position driver mise à jour:', {
            lat: newLocation.lat.toFixed(6),
            lng: newLocation.lng.toFixed(6),
            accuracy: position.coords.accuracy.toFixed(1) + 'm'
          });
        },
        (err) => {
          let errorMessage = 'Erreur de géolocalisation';
          
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage = 'Permission de géolocalisation refusée';
              break;
            case err.POSITION_UNAVAILABLE:
              errorMessage = 'Position GPS non disponible';
              break;
            case err.TIMEOUT:
              errorMessage = 'Délai de géolocalisation dépassé';
              break;
          }
          
          console.error('❌ Erreur GPS driver:', errorMessage);
          setError(errorMessage);
          setIsLoading(false);
        },
        {
          enableHighAccuracy: highAccuracy,
          timeout: timeout,
          maximumAge: maximumAge
        }
      );
    };

    startTracking();

    // Nettoyage : arrêter le tracking quand le composant est démonté
    return () => {
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
        console.log('🛑 Tracking GPS driver arrêté');
      }
    };
  }, [enabled, highAccuracy, timeout, maximumAge]);

  return { location, error, isLoading };
}
