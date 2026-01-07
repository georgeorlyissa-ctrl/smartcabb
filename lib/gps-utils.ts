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
 * ⚡ Hook ULTRA-RAPIDE pour obtenir la position GPS
 * ✅ AMÉLIORATIONS:
 * 1. Détection plus rapide (timeout réduit à 5s)
 * 2. Précision maximale (enableHighAccuracy: true)
 * 3. Aucune position par défaut - Position réelle uniquement
 * 4. Tentatives multiples avec fallback
 * 5. Cache intelligent pour éviter les requêtes répétées
 */
export function useDriverLocation(isActive: boolean = true) {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);

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

    console.log('🔍 Demande d\'autorisation GPS ULTRA-PRÉCIS...');

    // ⚡ TENTATIVE 1: Position haute précision avec timeout court
     // ⚡ TENTATIVE 1: Position haute précision avec timeout court
     // ⚡ TENTATIVE 1: Position haute précision avec timeout court
    const attemptHighAccuracy = () => {
      console.log('⚡ Tentative haute précision (GPS/réseau)...');
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(newLocation);
          setAccuracy(position.coords.accuracy);
          setError(null);
          console.log(`✅ Position GPS HAUTE PRÉCISION obtenue: ${newLocation.lat.toFixed(6)}, ${newLocation.lng.toFixed(6)} (±${position.coords.accuracy.toFixed(0)}m)`);
        },
        (err) => {
          console.warn('⚠️ Haute précision échouée, tentative fallback...');
          attemptLowAccuracy(); // Fallback vers basse précision
        },
        {
          enableHighAccuracy: true, // ✅ GPS + réseau
          timeout: 5000, // ⚡ 5 secondes max
          maximumAge: 0 // ✅ Jamais de cache
        }
      );
    };

    // ⚡ TENTATIVE 2: Fallback avec basse précision (plus rapide)
    const attemptLowAccuracy = () => {
      console.log('🔄 Tentative basse précision (réseau uniquement)...');
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(newLocation);
          setAccuracy(position.coords.accuracy);
          setError(null);
          console.log(`✅ Position GPS BASSE PRÉCISION obtenue: ${newLocation.lat.toFixed(6)}, ${newLocation.lng.toFixed(6)} (±${position.coords.accuracy.toFixed(0)}m)`);
        },
        (err) => {
          // Toutes les tentatives ont échoué
          handleGPSError(err);
        },
        {
          enableHighAccuracy: false, // ✅ Réseau uniquement
          timeout: 3000, // ⚡ 3 secondes max
          maximumAge: 10000 // Accepter un cache de 10 secondes
        }
      );
    };

    // Gestion des erreurs GPS
    const handleGPSError = (err: GeolocationPositionError) => {
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
    };

    // ⚡ DÉMARRER LA DÉTECTION
    attemptHighAccuracy();

    // Ne démarrer le suivi que si la permission n'est pas refusée
    if (permissionDenied) return;

    // ⚡ SUIVI EN TEMPS RÉEL avec stratégie adaptative
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        // ✅ FILTRAGE INTELLIGENT: Ignorer les positions trop imprécises
        if (position.coords.accuracy > 100) {
          console.warn(`⚠️ Position ignorée (précision: ${position.coords.accuracy.toFixed(0)}m > 100m)`);
          return;
        }
        
        setLocation(newLocation);
        setAccuracy(position.coords.accuracy);
        setError(null);
        console.log(`📍 Position GPS mise à jour: ${newLocation.lat.toFixed(6)}, ${newLocation.lng.toFixed(6)} (±${position.coords.accuracy.toFixed(0)}m)`);
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
        console.warn('⚠️ Erreur temporaire GPS:', err.message);
      },
      {
        enableHighAccuracy: true, // ✅ Toujours haute précision pour le suivi
        timeout: 10000, // 10 secondes pour les mises à jour
        maximumAge: 0 // Jamais de cache
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      console.log('🔴 Arrêt du suivi GPS');
    };
  }, [isActive, permissionDenied]);

  return { location, error, permissionDenied, accuracy };
}

/**
 * ⚡ Hook pour PASSAGERS - Détection rapide de la position
 */
export function usePassengerLocation(isActive: boolean = true) {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isActive) {
      setLocation(null);
      setLoading(false);
      return;
    }

    if (!navigator.geolocation) {
      setError('La géolocalisation n\'est pas supportée');
      setLoading(false);
      return;
    }

    console.log('🔍 Détection position passager...');
    setLoading(true);

    // ⚡ TENTATIVE RAPIDE pour les passagers (3 secondes max)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setLocation(newLocation);
        setError(null);
        setLoading(false);
        console.log(`✅ Position passager détectée: ${newLocation.lat.toFixed(6)}, ${newLocation.lng.toFixed(6)}`);
      },
      (err) => {
        console.error('❌ Erreur détection passager:', err.message);
        setError('Impossible de détecter votre position');
        setLoading(false);
        setLocation(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 3000,
        maximumAge: 5000
      }
    );
  }, [isActive]);

  return { location, error, loading };
}
