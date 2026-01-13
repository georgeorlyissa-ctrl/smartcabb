import { useEffect, useState } from 'react';
import { Loader2 } from '../lib/icons';

interface Location {
  lat: number;
  lng: number;
  address?: string;
  accuracy?: number;
}

interface Driver {
  id: string;
  name: string;
  location: Location;
  vehicleInfo?: {
    make: string;
    color: string;
  };
  rating?: number;
}

interface InteractiveMapViewProps {
  center?: Location;
  markers?: Location[];
  drivers?: Driver[];
  zoom?: number;
  className?: string;
  showUserLocation?: boolean;
  onLocationUpdate?: (location: Location) => void;
  enableGeolocation?: boolean;
  showRoute?: boolean;
  routeStart?: Location;
  routeEnd?: Location;
  minZoom?: number;
  maxZoom?: number;
  enableZoomControls?: boolean;
}

/**
 * 🗺️ CARTE INTERACTIVE - VERSION SIMPLIFIÉE TEMPORAIRE
 * 
 * Utilise OpenStreetMap en iframe pour éviter les problèmes de build
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
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<Location | null>(null);

  // Géolocalisation GPS simple
  useEffect(() => {
    if (!enableGeolocation) return;

    const handleSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = position.coords;
      const newLocation: Location = {
        lat: latitude,
        lng: longitude,
        address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        accuracy
      };
      
      setUserLocation(newLocation);
      
      if (onLocationUpdate) {
        onLocationUpdate(newLocation);
      }
    };

    const handleError = (error: GeolocationPositionError) => {
      console.log('📍 Géolocalisation non disponible:', error.message);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        handleError,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }

    setIsLoading(false);
  }, [enableGeolocation, onLocationUpdate]);

  // Coordonnées pour la carte
  const mapCenter = center || userLocation || { lat: -4.3276, lng: 15.3136 }; // Kinshasa par défaut
  
  // Construire l'URL de la carte OSM
  const bbox = `${mapCenter.lng - 0.1},${mapCenter.lat - 0.1},${mapCenter.lng + 0.1},${mapCenter.lat + 0.1}`;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${mapCenter.lat},${mapCenter.lng}`;

  return (
    <div className={className} style={{ position: 'relative' }}>
      {/* Carte OpenStreetMap en iframe */}
      <iframe
        width="100%"
        height="100%"
        frameBorder="0"
        scrolling="no"
        src={mapUrl}
        style={{ 
          border: 0, 
          minHeight: '400px',
          borderRadius: '12px',
          backgroundColor: '#e5e7eb'
        }}
        className="w-full h-full"
        title="Carte interactive"
        onLoad={() => setIsLoading(false)}
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

      {/* Informations de position */}
      {showRoute && routeStart && routeEnd && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          zIndex: 1000,
          maxWidth: '300px'
        }}>
          <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '24px', 
              height: '24px', 
              background: '#10B981', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>A</div>
            <span style={{ fontSize: '13px', color: '#374151' }}>
              {routeStart.address || `${routeStart.lat.toFixed(4)}, ${routeStart.lng.toFixed(4)}`}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '24px', 
              height: '24px', 
              background: '#EF4444', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>B</div>
            <span style={{ fontSize: '13px', color: '#374151' }}>
              {routeEnd.address || `${routeEnd.lat.toFixed(4)}, ${routeEnd.lng.toFixed(4)}`}
            </span>
          </div>
        </div>
      )}

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

      {/* Attribution */}
      <div style={{
        position: 'absolute',
        bottom: '4px',
        left: '4px',
        background: 'rgba(255, 255, 255, 0.8)',
        padding: '2px 6px',
        borderRadius: '4px',
        fontSize: '10px',
        color: '#6B7280',
        zIndex: 1000
      }}>
        © <a 
          href="https://www.openstreetmap.org/copyright" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ color: '#3B82F6', textDecoration: 'none' }}
        >
          OpenStreetMap
        </a>
      </div>
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
