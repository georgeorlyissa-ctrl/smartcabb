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
 */
export function useDriverLocation(isActive: boolean = true) {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [hasLoggedPermissionDenied, setHasLoggedPermissionDenied] = useState(false);

  useEffect(() => {
    if (!isActive) return;
    
    // Si la permission a déjà été refusée, ne pas réessayer
    if (permissionDenied) {
      if (!hasLoggedPermissionDenied) {
        console.log('ℹ️ GPS non autorisé. Position par défaut Kinshasa utilisée.');
        setHasLoggedPermissionDenied(true);
      }
      setLocation({ lat: -4.4419, lng: 15.2663 });
      return;
    }

    if (!navigator.geolocation) {
      const errorMsg = 'La géolocalisation n\'est pas supportée par votre navigateur';
      setError(errorMsg);
      
      // Utiliser une position par défaut à Kinshasa
      setLocation({ lat: -4.4419, lng: 15.2663 });
      console.log('📍 Position par défaut Kinshasa: -4.4419, 15.2663');
      return;
    }

    // Obtenir la position initiale
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setLocation(newLocation);
        setError(null);
        console.log(`✅ Position GPS obtenue: ${newLocation.lat.toFixed(6)}, ${newLocation.lng.toFixed(6)}`);
      },
      (err) => {
        // Si permission refusée, arrêter les tentatives
        if (err.code === err.PERMISSION_DENIED) {
          if (!hasLoggedPermissionDenied) {
            console.log('ℹ️ GPS non autorisé. Position par défaut utilisée.');
            setHasLoggedPermissionDenied(true);
          }
          setPermissionDenied(true);
          setError('GPS non autorisé');
        } else {
          if (!hasLoggedPermissionDenied) {
            console.log(`ℹ️ GPS temporairement indisponible`);
          }
          setError('GPS temporairement indisponible');
        }
        
        // Utiliser position par défaut Kinshasa
        setLocation({ lat: -4.4419, lng: 15.2663 });
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
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
        console.log(`📍 Position GPS mise à jour: ${newLocation.lat.toFixed(6)}, ${newLocation.lng.toFixed(6)}`);
      },
      (err) => {
        // Si permission refusée, arrêter complètement le tracking
        if (err.code === err.PERMISSION_DENIED) {
          if (!hasLoggedPermissionDenied) {
            console.log('ℹ️ GPS non autorisé - Arrêt du suivi');
            setHasLoggedPermissionDenied(true);
          }
          setPermissionDenied(true);
          setError('GPS non autorisé');
          navigator.geolocation.clearWatch(watchId);
          return;
        }
        
        // Pour les autres erreurs, pas de message (silencieux)
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
  }, [isActive, permissionDenied, hasLoggedPermissionDenied]);

  return { location, error, permissionDenied };
}