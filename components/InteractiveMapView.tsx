import React, { useEffect, useRef, useState, useCallback } from 'react';
import { reverseGeocode } from '../lib/precise-gps';
import { Loader2, Plus, Minus, Maximize2 } from 'lucide-react';

// ✅ IMPORT STATIQUE : Importer Leaflet au niveau du module (pas dynamiquement)
let L: any = null;
let leafletLoaded = false;

// Fonction pour charger Leaflet une seule fois
const loadLeaflet = async () => {
  if (leafletLoaded && L) return L;
  
  try {
    // Charger le CSS
    if (typeof window !== 'undefined' && !document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }
    
    // Charger Leaflet via CDN (plus stable que l'import dynamique)
    if (typeof window !== 'undefined' && !(window as any).L) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
        script.crossOrigin = '';
        script.onload = () => {
          L = (window as any).L;
          leafletLoaded = true;
          resolve();
        };
        script.onerror = reject;
        document.head.appendChild(script);
      });
    } else {
      L = (window as any).L;
      leafletLoaded = true;
    }
    
    return L;
  } catch (error) {
    console.error('❌ Erreur chargement Leaflet:', error);
    throw error;
  }
};

interface InteractiveMapViewProps {
  center?: Location;
  markers?: Location[];
  drivers?: Driver[];
  zoom?: number;
  className?: string;
  showUserLocation?: boolean;
  onLocationUpdate?: (location: Location) => void;
  enableGeolocation?: boolean;
  // 🆕 Props pour afficher un itinéraire
  showRoute?: boolean;
  routeStart?: Location;
  routeEnd?: Location;
  // 🆕 Props pour contrôler le zoom
  minZoom?: number;
  maxZoom?: number;
  enableZoomControls?: boolean;
}

/**
 * 🗺️ CARTE INTERACTIVE AVEC LEAFLET + OPENSTREETMAP
 * 
 * Fonctionnalités :
 * - Zoom/dézoom avec boutons + molette
 * - Géolocalisation GPS en temps réel
 * - Affichage des conducteurs disponibles
 * - Tracé d'itinéraire avec indicateur de trafic
 * - Carte mondiale OpenStreetMap
 */
export function InteractiveMapView({
  center,
  markers = [],
  drivers = [],
  zoom = 14,
  className = "w-full h-full",
  showUserLocation = true,
  onLocationUpdate,
  enableGeolocation = true,
  showRoute = false,
  routeStart,
  routeEnd,
  minZoom = 2,
  maxZoom = 18,
  enableZoomControls = true
}: InteractiveMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const accuracyCircleRef = useRef<any>(null);
  const driverMarkersRef = useRef<any[]>([]);
  const routeLayerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const isMountedRef = useRef(true);
  const isDestroyingRef = useRef(false);
  const [currentZoom, setCurrentZoom] = useState(zoom);
  
  // 🎯 STABILISATION GPS (comme Uber)
  const lastValidLocationRef = useRef<Location | null>(null);
  const locationBufferRef = useRef<{ lat: number; lng: number; accuracy: number }[]>([]);
  const isFirstLocationRef = useRef(true);

  // 📍 FONCTION DE LISSAGE GPS (évite les sauts)
  const smoothLocation = useCallback((newLat: number, newLng: number, accuracy: number) => {
    // Si première localisation, l'accepter directement
    if (isFirstLocationRef.current) {
      isFirstLocationRef.current = false;
      lastValidLocationRef.current = { lat: newLat, lng: newLng };
      return { lat: newLat, lng: newLng };
    }

    const lastLoc = lastValidLocationRef.current;
    if (!lastLoc) return { lat: newLat, lng: newLng };

    // Calculer la distance du mouvement (en mètres)
    const R = 6371000; // Rayon de la Terre en mètres
    const dLat = (newLat - lastLoc.lat) * Math.PI / 180;
    const dLng = (newLng - lastLoc.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lastLoc.lat * Math.PI / 180) * Math.cos(newLat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    // ✅ SEUIL INTELLIGENT : Ne bouger que si mouvement > 15m ou mauvaise précision
    if (distance < 15 && accuracy < 50) {
      // Mouvement trop petit et bonne précision → garder l'ancienne position
      return lastLoc;
    }

    // ✅ LISSAGE : Moyenne mobile sur 3 positions
    locationBufferRef.current.push({ lat: newLat, lng: newLng, accuracy });
    if (locationBufferRef.current.length > 3) {
      locationBufferRef.current.shift();
    }

    // Calculer la moyenne pondérée (meilleure précision = plus de poids)
    let totalWeight = 0;
    let weightedLat = 0;
    let weightedLng = 0;

    locationBufferRef.current.forEach(pos => {
      const weight = 1 / (pos.accuracy + 1); // Meilleure précision = plus de poids
      weightedLat += pos.lat * weight;
      weightedLng += pos.lng * weight;
      totalWeight += weight;
    });

    const smoothedLat = weightedLat / totalWeight;
    const smoothedLng = weightedLng / totalWeight;

    lastValidLocationRef.current = { lat: smoothedLat, lng: smoothedLng };
    return { lat: smoothedLat, lng: smoothedLng };
  }, []);

  // 🗺️ INITIALISER LA CARTE LEAFLET
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;
    
    isMountedRef.current = true;
    isDestroyingRef.current = false;
    
    const containerElement = mapContainerRef.current;

    const initializeMap = async () => {
      try {
        // Charger Leaflet
        L = await loadLeaflet();

        if (!isMountedRef.current || !containerElement || !document.body.contains(containerElement)) return;

        // Position par défaut : Kinshasa
        const defaultCenter: [number, number] = center 
          ? [center.lat, center.lng] 
          : [-4.3276, 15.3136];

        // 🗺️ LIMITE GÉOGRAPHIQUE : Restreindre la carte à Kinshasa et ses environs
        // Coordonnées approximatives de Kinshasa et sa périphérie
        const kinshasaBounds = (L as any).latLngBounds(
          (L as any).latLng(-4.8, 14.8), // Sud-Ouest
          (L as any).latLng(-3.8, 15.8)  // Nord-Est
        );

        // Créer la carte avec options personnalisées
        const map = (L as any).map(containerElement, {
          center: defaultCenter,
          zoom: zoom,
          minZoom: 11, // ✅ Zoom minimum augmenté pour rester sur Kinshasa
          maxZoom: maxZoom,
          zoomControl: false, // On va créer nos propres contrôles
          attributionControl: false, // ❌ DÉSACTIVÉ : Cache l'attribution Leaflet/OSM
          maxBounds: kinshasaBounds, // ✅ Limite géographique
          maxBoundsViscosity: 0.8 // ✅ Rend les limites "collantes" mais pas rigides
        });

        mapRef.current = map;

        // Ajouter la couche OpenStreetMap
        (L as any).tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '', // ❌ DÉSACTIVÉ : Cache l'attribution
          maxZoom: maxZoom,
        }).addTo(map);

        // Événement de zoom pour mettre à jour l'état
        map.on('zoomend', () => {
          setCurrentZoom(map.getZoom());
        });

        setIsLoading(false);
        console.log('✅ Carte Leaflet initialisée');

      } catch (error) {
        console.error('❌ Erreur chargement Leaflet:', error);
        setIsLoading(false);
      }
    };

    initializeMap();

    // Nettoyage
    return () => {
      isMountedRef.current = false;
      isDestroyingRef.current = true;
      
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }

      if (mapRef.current) {
        try {
          mapRef.current.remove();
          mapRef.current = null;
        } catch (e) {
          console.log('Erreur nettoyage carte:', e);
        }
      }
    };
  }, []);

  // 📍 GÉOLOCALISATION GPS
  useEffect(() => {
    if (!enableGeolocation || !mapRef.current || !L) return;

    const updateUserLocation = async (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = position.coords;

      // ✅ APPLIQUER LE LISSAGE GPS (évite les sauts)
      const smoothed = smoothLocation(latitude, longitude, accuracy);

      // ✅ CONVERTIR LES COORDONNÉES EN ADRESSE LISIBLE
      let address: string;
      try {
        address = await reverseGeocode(smoothed.lat, smoothed.lng);
        console.log('🏠 Adresse obtenue:', address);
      } catch (error) {
        console.error('❌ Erreur geocoding:', error);
        // Fallback si le geocoding échoue
        address = `${Math.abs(smoothed.lat).toFixed(4)}°${smoothed.lat >= 0 ? 'N' : 'S'}, ${Math.abs(smoothed.lng).toFixed(4)}°${smoothed.lng >= 0 ? 'E' : 'W'}`;
      }

      const newLocation = {
        lat: smoothed.lat,
        lng: smoothed.lng,
        address: address,
        accuracy
      };

      setUserLocation(newLocation);

      if (onLocationUpdate) {
        onLocationUpdate(newLocation);
      }

      // Utiliser L directement (déjà chargé)
      const map = mapRef.current;

      if (!map || !isMountedRef.current || !L) return;

      // Supprimer l'ancien marqueur
      if (userMarkerRef.current) {
        map.removeLayer(userMarkerRef.current);
      }
      if (accuracyCircleRef.current) {
        map.removeLayer(accuracyCircleRef.current);
      }

      // Créer l'icône personnalisée pour l'utilisateur
      const userIcon = (L as any).divIcon({
        html: `
          <div style="
            width: 20px;
            height: 20px;
            background: #3B82F6;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          "></div>
        `,
        iconSize: [20, 20],
        className: 'user-location-marker'
      });

      // Ajouter le marqueur utilisateur
      const marker = (L as any).marker([smoothed.lat, smoothed.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup('📍 Votre position');

      userMarkerRef.current = marker;

      // Ajouter le cercle de précision
      const circle = (L as any).circle([smoothed.lat, smoothed.lng], {
        radius: accuracy,
        color: '#3B82F6',
        fillColor: '#3B82F6',
        fillOpacity: 0.1,
        weight: 1
      }).addTo(map);

      accuracyCircleRef.current = circle;
    };

    const handleError = (error: GeolocationPositionError) => {
      console.error('❌ Erreur géolocalisation:', error.message);
    };

    // ✅ GÉOLOCALISATION STABLE : Mise à jour toutes les 3 secondes (au lieu de watchPosition continu)
    if (navigator.geolocation) {
      // Première localisation immédiate
      navigator.geolocation.getCurrentPosition(
        updateUserLocation,
        handleError,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );

      // Puis mises à jour toutes les 3 secondes
      const intervalId = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          updateUserLocation,
          handleError,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      }, 3000);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [enableGeolocation, onLocationUpdate, smoothLocation]);

  // 🚗 AFFICHER LES CONDUCTEURS
  useEffect(() => {
    if (!mapRef.current || drivers.length === 0 || !L) return;

    const updateDriverMarkers = () => {
      const map = mapRef.current;

      if (!map || !isMountedRef.current || !L) return;

      // Supprimer les anciens marqueurs
      driverMarkersRef.current.forEach(marker => {
        map.removeLayer(marker);
      });
      driverMarkersRef.current = [];

      // Ajouter les nouveaux marqueurs
      drivers.forEach(driver => {
        const driverIcon = (L as any).divIcon({
          html: `
            <div style="
              width: 32px;
              height: 32px;
              background: #10B981;
              border: 3px solid white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              font-size: 18px;
            ">🚗</div>
          `,
          iconSize: [32, 32],
          className: 'driver-marker'
        });

        const marker = (L as any).marker(
          [driver.location.lat, driver.location.lng],
          { icon: driverIcon }
        )
          .addTo(map)
          .bindPopup(`
            <div style="text-align: center;">
              <strong>${driver.name}</strong><br/>
              ${driver.vehicleInfo ? `${driver.vehicleInfo.color} ${driver.vehicleInfo.make}` : ''}<br/>
              ${driver.rating ? `⭐ ${driver.rating.toFixed(1)}` : ''}
            </div>
          `);

        driverMarkersRef.current.push(marker);
      });
    };

    updateDriverMarkers();
  }, [drivers]);

  // 🛣️ TRACER L'ITINÉRAIRE
  useEffect(() => {
    if (!showRoute || !routeStart || !routeEnd || !mapRef.current || !L) return;

    const drawRoute = async () => {
      // Importer seulement la fonction de calcul (pas Leaflet, déjà chargé)
      const { calculateRoute } = await import('../lib/routing');
      const map = mapRef.current;

      if (!map || !isMountedRef.current || !L) return;

      // Supprimer l'ancien itinéraire
      if (routeLayerRef.current) {
        map.removeLayer(routeLayerRef.current);
      }

      try {
        // 🎯 CALCULER LE VRAI ITINÉRAIRE AVEC OSRM
        console.log('🛣️ Calcul du meilleur itinéraire...');
        const routeResult = await calculateRoute(
          { lat: routeStart.lat, lng: routeStart.lng },
          { lat: routeEnd.lat, lng: routeEnd.lng }
        );

        // Créer la polyligne avec TOUTES les coordonnées de l'itinéraire réel
        const routeCoordinates = routeResult.coordinates.map(coord => [coord.lat, coord.lng] as [number, number]);
        
        // ✅ LIGNE VERTE ÉPAISSE ET VISIBLE
        const routeLine = (L as any).polyline(
          routeCoordinates,
          {
            color: '#10B981',      // ✅ Vert vif au lieu de bleu
            weight: 8,              // ✅ Plus épais (8 au lieu de 5)
            opacity: 1,             // ✅ Opacité complète (1 au lieu de 0.8)
            lineJoin: 'round',
            lineCap: 'round',
            className: 'route-line-pulse' // ✅ Pour animation CSS
          }
        ).addTo(map);

        routeLayerRef.current = routeLine;

        console.log(`✅ Itinéraire affiché: ${routeResult.distance.toFixed(1)}km, ${Math.round(routeResult.duration)}min, ${routeCoordinates.length} points`);

        // ✅ ICÔNE DÉPART : Point A avec marqueur bleu
        const startIcon = (L as any).divIcon({
          html: `<div style="
            position: relative;
            width: 40px;
            height: 50px;
          ">
            <div style="
              position: absolute;
              bottom: 0;
              left: 50%;
              transform: translateX(-50%);
              width: 36px;
              height: 45px;
              background: #3B82F6;
              border: 3px solid white;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg) translateX(-50%);
              box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5);
            "></div>
            <div style="
              position: absolute;
              bottom: 8px;
              left: 50%;
              transform: translateX(-50%);
              width: 26px;
              height: 26px;
              background: white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 10;
              font-weight: bold;
              font-size: 16px;
              color: #3B82F6;
            ">A</div>
          </div>`,
          iconSize: [40, 50],
          iconAnchor: [20, 50],
          className: 'start-marker'
        });

        // ✅ ICÔNE DESTINATION : Point B avec marqueur rouge
        const endIcon = (L as any).divIcon({
          html: `<div style="
            position: relative;
            width: 40px;
            height: 50px;
          ">
            <div style="
              position: absolute;
              bottom: 0;
              left: 50%;
              transform: translateX(-50%);
              width: 36px;
              height: 45px;
              background: #EF4444;
              border: 3px solid white;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg) translateX(-50%);
              box-shadow: 0 4px 12px rgba(239, 68, 68, 0.5);
            "></div>
            <div style="
              position: absolute;
              bottom: 8px;
              left: 50%;
              transform: translateX(-50%);
              width: 26px;
              height: 26px;
              background: white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 10;
              font-weight: bold;
              font-size: 16px;
              color: #EF4444;
            ">B</div>
          </div>`,
          iconSize: [40, 50],
          iconAnchor: [20, 50],
          className: 'end-marker'
        });

        (L as any).marker([routeStart.lat, routeStart.lng], { icon: startIcon })
          .addTo(map)
          .bindPopup(`📍 Départ: ${routeStart.address || ''}`);

        (L as any).marker([routeEnd.lat, routeEnd.lng], { icon: endIcon })
          .addTo(map)
          .bindPopup(`🎯 Arrivée: ${routeEnd.address || ''}`);

        // ✅ ZOOM UNIQUE : Ajuster la vue seulement au premier chargement
        // Ne pas réajuster si l'utilisateur zoome manuellement
        if (!map._routeInitialized) {
          map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
          map._routeInitialized = true; // Marquer comme initialisé
        }

      } catch (error) {
        console.error('❌ Erreur tracé itinéraire:', error);
        
        // ✅ FALLBACK: Ligne verte épaisse si OSRM échoue
        const routeLine = (L as any).polyline(
          [
            [routeStart.lat, routeStart.lng],
            [routeEnd.lat, routeEnd.lng]
          ],
          {
            color: '#10B981',      // ✅ Vert vif au lieu de bleu
            weight: 8,              // ✅ Plus épais (8 au lieu de 5)
            opacity: 0.9,
            dashArray: '10, 10' // Pointillés pour indiquer que c'est approximatif
          }
        ).addTo(map);

        routeLayerRef.current = routeLine;
        
        // ✅ Marqueurs de fallback avec icônes A/B
        const startIcon = (L as any).divIcon({
          html: `<div style="
            position: relative;
            width: 40px;
            height: 50px;
          ">
            <div style="
              position: absolute;
              bottom: 0;
              left: 50%;
              transform: translateX(-50%);
              width: 36px;
              height: 45px;
              background: #3B82F6;
              border: 3px solid white;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg) translateX(-50%);
              box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5);
            "></div>
            <div style="
              position: absolute;
              bottom: 8px;
              left: 50%;
              transform: translateX(-50%);
              width: 26px;
              height: 26px;
              background: white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 10;
              font-weight: bold;
              font-size: 16px;
              color: #3B82F6;
            ">A</div>
          </div>`,
          iconSize: [40, 50],
          iconAnchor: [20, 50]
        });

        const endIcon = (L as any).divIcon({
          html: `<div style="
            position: relative;
            width: 40px;
            height: 50px;
          ">
            <div style="
              position: absolute;
              bottom: 0;
              left: 50%;
              transform: translateX(-50%);
              width: 36px;
              height: 45px;
              background: #EF4444;
              border: 3px solid white;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg) translateX(-50%);
              box-shadow: 0 4px 12px rgba(239, 68, 68, 0.5);
            "></div>
            <div style="
              position: absolute;
              bottom: 8px;
              left: 50%;
              transform: translateX(-50%);
              width: 26px;
              height: 26px;
              background: white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 10;
              font-weight: bold;
              font-size: 16px;
              color: #EF4444;
            ">B</div>
          </div>`,
          iconSize: [40, 50],
          iconAnchor: [20, 50]
        });

        (L as any).marker([routeStart.lat, routeStart.lng], { icon: startIcon }).addTo(map);
        (L as any).marker([routeEnd.lat, routeEnd.lng], { icon: endIcon }).addTo(map);

        if (!map._routeInitialized) {
          map.fitBounds([
            [routeStart.lat, routeStart.lng],
            [routeEnd.lat, routeEnd.lng]
          ], { padding: [50, 50] });
          map._routeInitialized = true;
        }
      }
    };

    drawRoute();
  }, [showRoute, routeStart, routeEnd]);

  // 🔍 CONTRÔLES DE ZOOM
  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  const handleResetView = () => {
    if (mapRef.current && center) {
      mapRef.current.setView([center.lat, center.lng], zoom);
    }
  };

  return (
    <div className={className} style={{ position: 'relative' }}>
      {/* Carte Leaflet */}
      <div 
        ref={mapContainerRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          backgroundColor: '#e5e7eb',
          borderRadius: '12px',
          overflow: 'hidden'
        }}
      />

      {/* Indicateur de chargement */}
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span>Chargement de la carte...</span>
        </div>
      )}

      {/* Contrôles de zoom personnalisés */}
      {enableZoomControls && !isLoading && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          zIndex: 1000
        }}>
          <button
            onClick={handleZoomIn}
            style={{
              width: '40px',
              height: '40px',
              background: 'white',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
          >
            <Plus className="w-5 h-5 text-gray-700" />
          </button>

          <button
            onClick={handleZoomOut}
            style={{
              width: '40px',
              height: '40px',
              background: 'white',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
          >
            <Minus className="w-5 h-5 text-gray-700" />
          </button>

          <button
            onClick={handleResetView}
            style={{
              width: '40px',
              height: '40px',
              background: 'white',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
            title="Recentrer la carte"
          >
            <Maximize2 className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      )}

      {/* Indicateur de zoom */}
      {/* ❌ CACHÉ : L'indicateur de zoom n'est plus affiché */}
      {/* <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '6px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '500',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 1000
      }}>
        Zoom: {currentZoom}
      </div> */}

      {/* Compteur de conducteurs */}
      {drivers.length > 0 && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          background: 'rgba(16, 185, 129, 0.95)',
          color: 'white',
          padding: '8px 14px',
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: '600',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span>🚗</span>
          <span>{drivers.length} conducteur{drivers.length > 1 ? 's' : ''}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Carte simple de Kinshasa (version statique pour fallback)
 */
export function KinshasaMapFallback({ className = "w-full h-full" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <iframe
        width="100%"
        height="100%"
        frameBorder="0"
        scrolling="no"
        marginHeight={0}
        marginWidth={0}
        src="https://www.openstreetmap.org/export/embed.html?bbox=15.2136,-4.4276,15.4136,-4.2276&layer=mapnik"
        style={{ border: 0, minHeight: '400px' }}
        className="w-full h-full"
        title="Carte de Kinshasa"
      />
      
      <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs shadow-sm z-10">
        © <a 
          href="https://www.openstreetmap.org/copyright" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          OpenStreetMap
        </a>
      </div>
    </div>
  );
}