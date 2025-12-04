import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Loader2 } from 'lucide-react';

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface Driver {
  id: string;
  name: string;
  location: Location;
  vehicleInfo?: {
    make: string;
    model: string;
    color: string;
    plate: string;
  };
  rating?: number;
  totalRides?: number;
}

interface InteractiveMapViewProps {
  center?: Location;
  markers?: Location[];
  drivers?: Driver[]; // 🆕 Liste des conducteurs à afficher
  zoom?: number;
  className?: string;
  showUserLocation?: boolean;
  onLocationUpdate?: (location: Location) => void;
  enableGeolocation?: boolean;
}

/**
 * Carte interactive OpenStreetMap avec Leaflet.js
 * Affiche Kinshasa avec détection GPS réelle de l'utilisateur
 */
export function InteractiveMapView({
  center,
  markers = [],
  drivers = [], // 🆕 Liste des conducteurs à afficher
  zoom = 14,
  className = "w-full h-full",
  showUserLocation = true,
  onLocationUpdate,
  enableGeolocation = true
}: InteractiveMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const accuracyCircleRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const isMountedRef = useRef(true);
  const isDestroyingRef = useRef(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Initialiser la carte Leaflet
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;
    
    isMountedRef.current = true;
    isDestroyingRef.current = false;
    
    const containerElement = mapContainerRef.current;

    // Importer Leaflet dynamiquement avec préchargement optimisé
    const loadLeaflet = async () => {
      try {
        // 🚀 OPTIMISATION 1: Charger CSS et JS en parallèle
        const cssPromise = new Promise<void>((resolve) => {
          if (document.querySelector('link[href*="leaflet.css"]')) {
            resolve();
            return;
          }
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          link.crossOrigin = '';
          link.onload = () => resolve();
          link.onerror = () => resolve(); // Continuer même si le CSS échoue
          document.head.appendChild(link);
        });

        // 🚀 OPTIMISATION 2: Charger Leaflet JS immédiatement
        const [L] = await Promise.all([
          import('https://unpkg.com/leaflet@1.9.4/dist/leaflet-src.esm.js'),
          cssPromise
        ]);

        if (!isMountedRef.current || !containerElement || !document.body.contains(containerElement)) return;

        // Position par défaut : centre de Kinshasa
        const defaultCenter: [number, number] = center 
          ? [center.lat, center.lng] 
          : [-4.3276, 15.3136];

        // 🔧 Nettoyer toute carte existante sur ce conteneur
        if ((containerElement as any)._leaflet_id) {
          try {
            const existingMap = (containerElement as any)._leaflet_map;
            if (existingMap) {
              existingMap.remove();
            }
            delete (containerElement as any)._leaflet_id;
            delete (containerElement as any)._leaflet_map;
          } catch (e) {
            console.warn('Erreur nettoyage carte existante:', e);
          }
        }

        // 🔧 Vider complètement le conteneur
        containerElement.innerHTML = '';

        // 🚀 OPTIMISATION 3: Créer la carte avec rendu rapide
        if (containerElement && !mapRef.current && !isDestroyingRef.current) {
          const map = L.map(containerElement, {
            center: defaultCenter,
            zoom: zoom,
            zoomControl: false,
            attributionControl: true,
            // 🚀 Optimisations de performance
            preferCanvas: false, // Désactiver Canvas pour éviter les erreurs de performance
            fadeAnimation: false,
            zoomAnimation: true,
            markerZoomAnimation: false,
            zoomAnimationThreshold: 4
          });

          // Stocker la référence de la carte dans le conteneur
          (containerElement as any)._leaflet_map = map;

          // Ajouter les contrôles de zoom
          L.control.zoom({
            position: 'topright'
          }).addTo(map);

          // Ajouter la couche OpenStreetMap
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
            minZoom: 10
          }).addTo(map);

          // Ajouter les marqueurs
          markers.forEach((marker) => {
            if (isMountedRef.current && !isDestroyingRef.current) {
              L.marker([marker.lat, marker.lng])
                .addTo(map)
                .bindPopup(marker.address || 'Marqueur');
            }
          });

          // Ajouter les conducteurs
          drivers.forEach((driver) => {
            if (isMountedRef.current && !isDestroyingRef.current) {
              const driverIcon = L.divIcon({
                className: 'driver-location-marker',
                html: `
                  <div style="
                    position: relative;
                    width: 24px;
                    height: 24px;
                  ">
                    <div style="
                      position: absolute;
                      width: 16px;
                      height: 16px;
                      top: 4px;
                      left: 4px;
                      background: #FF6347;
                      border: 3px solid white;
                      border-radius: 50%;
                      box-shadow: 0 0 15px rgba(255, 99, 71, 0.7), 0 2px 8px rgba(0, 0, 0, 0.3);
                      z-index: 2;
                    "></div>
                    
                    <div style="
                      position: absolute;
                      width: 24px;
                      height: 24px;
                      background: rgba(255, 99, 71, 0.3);
                      border-radius: 50%;
                      animation: pulse-ring 2s ease-out infinite;
                    "></div>
                  </div>
                  
                  <style>
                    @keyframes pulse-ring {
                      0% {
                        transform: scale(1);
                        opacity: 0.6;
                      }
                      100% {
                        transform: scale(2);
                        opacity: 0;
                      }
                    }
                  </style>
                `,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              });

              L.marker([driver.location.lat, driver.location.lng], { icon: driverIcon })
                .addTo(map)
                .bindPopup(`
                  <strong>${driver.name}</strong><br>
                  Véhicule: ${driver.vehicleInfo?.make} ${driver.vehicleInfo?.model} (${driver.vehicleInfo?.color})<br>
                  Plaque: ${driver.vehicleInfo?.plate}<br>
                  📍 ${driver.location.address || 'Kinshasa, RDC'}
                `);
            }
          });

          mapRef.current = map;
          
          if (isMountedRef.current) {
            setIsLoading(false);
          }

          // Démarrer la géolocalisation si activée
          if (enableGeolocation && showUserLocation && isMountedRef.current) {
            startGeolocation(map, L);
          }
        }
      } catch (error) {
        console.error('Erreur chargement Leaflet:', error);
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    loadLeaflet();

    // 🔧 Cleanup ultra-robuste
    return () => {
      isMountedRef.current = false;
      isDestroyingRef.current = true;
      
      // Arrêter la géolocalisation
      if (watchId !== null) {
        try {
          navigator.geolocation.clearWatch(watchId);
        } catch (e) {
          // Ignorer
        }
      }
      
      // Supprimer les marqueurs utilisateur
      if (userMarkerRef.current && mapRef.current) {
        try {
          mapRef.current.removeLayer(userMarkerRef.current);
        } catch (e) {
          // Ignorer
        }
      }
      
      if (accuracyCircleRef.current && mapRef.current) {
        try {
          mapRef.current.removeLayer(accuracyCircleRef.current);
        } catch (e) {
          // Ignorer
        }
      }
      
      // Détruire la carte
      if (mapRef.current) {
        try {
          const mapInstance = mapRef.current;
          
          // 🔧 Arrêter immédiatement toutes les animations et transitions
          if (mapInstance.stop) {
            mapInstance.stop();
          }
          
          // 🔧 Supprimer tous les event listeners
          mapInstance.off();
          
          // 🔧 Supprimer toutes les couches
          const layers: any[] = [];
          mapInstance.eachLayer((layer: any) => {
            layers.push(layer);
          });
          
          layers.forEach((layer) => {
            try {
              mapInstance.removeLayer(layer);
            } catch (e) {
              // Ignorer
            }
          });
          
          // 🔧 Détruire la carte
          mapInstance.remove();
          
        } catch (error) {
          // Ignorer les erreurs de cleanup
        } finally {
          mapRef.current = null;
        }
      }
      
      // 🔧 Nettoyer les propriétés Leaflet du conteneur
      if (containerElement) {
        try {
          delete (containerElement as any)._leaflet_id;
          delete (containerElement as any)._leaflet_map;
          containerElement.innerHTML = '';
        } catch (e) {
          // Ignorer
        }
      }
    };
  }, []);

  // Fonction de géolocalisation continue
  const startGeolocation = (map: any, L: any) => {
    if (!navigator.geolocation) {
      console.warn('Géolocalisation non supportée par le navigateur');
      const defaultLocation: Location = {
        lat: -4.3276,
        lng: 15.3136,
        address: 'Centre de Kinshasa (position par défaut)'
      };
      setUserLocation(defaultLocation);
      if (onLocationUpdate) {
        onLocationUpdate(defaultLocation);
      }
      return;
    }

    // Fonction de geocoding inverse pour obtenir l'adresse
    const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=fr&zoom=18&addressdetails=1`,
          { 
            signal: controller.signal,
            headers: {
              'User-Agent': 'SmartCabb'
            }
          }
        );
        clearTimeout(timeoutId);
        
        const data = await response.json();
        
        // ✅ AMÉLIORATION : Construire une adresse précise à partir des composants
        if (data.address) {
          const parts = [];
          
          // Ajouter le numéro de rue si disponible
          if (data.address.house_number) {
            parts.push(data.address.house_number);
          }
          
          // Ajouter le nom de la rue
          if (data.address.road) {
            parts.push(data.address.road);
          } else if (data.address.street) {
            parts.push(data.address.street);
          }
          
          // Ajouter le quartier
          if (data.address.neighbourhood) {
            parts.push(data.address.neighbourhood);
          } else if (data.address.suburb) {
            parts.push(data.address.suburb);
          }
          
          // Ajouter la commune
          if (data.address.city_district || data.address.district) {
            parts.push(data.address.city_district || data.address.district);
          }
          
          // Ajouter la ville
          if (data.address.city) {
            parts.push(data.address.city);
          }
          
          // Si on a des parties, les assembler
          if (parts.length > 0) {
            return parts.join(', ');
          }
        }
        
        // Si display_name est disponible, l'utiliser
        if (data.display_name) {
          return data.display_name;
        }
        
        // ✅ AMÉLIORATION : Retourner les coordonnées GPS précises en fallback
        const safeLat = lat || 0;
        const safeLng = lng || 0;
        return `${safeLat.toFixed(5)}°S ${Math.abs(safeLng).toFixed(5)}°E, Kinshasa`;
      } catch (error) {
        console.warn('Erreur reverse geocoding:', error);
        // ✅ AMÉLIORATION : Retourner les coordonnées GPS précises au lieu de juste "Kinshasa, RDC"
        const safeLat = lat || 0;
        const safeLng = lng || 0;
        return `${safeLat.toFixed(5)}°S ${Math.abs(safeLng).toFixed(5)}°E, Kinshasa, RDC`;
      }
    };

    const onSuccess = async (position: GeolocationPosition) => {
      if (!isMountedRef.current || !mapRef.current || isDestroyingRef.current) return;
      
      const { latitude, longitude, accuracy } = position.coords;
      
      const address = await reverseGeocode(latitude, longitude);
      
      if (!isMountedRef.current || isDestroyingRef.current) return;
      
      const newLocation: Location = {
        lat: latitude,
        lng: longitude,
        address: address
      };

      setUserLocation(newLocation);
      if (onLocationUpdate) {
        onLocationUpdate(newLocation);
      }

      if (!mapRef.current || isDestroyingRef.current) return;

      // Supprimer l'ancien marqueur
      if (userMarkerRef.current) {
        try {
          map.removeLayer(userMarkerRef.current);
        } catch (e) {
          // Ignorer
        }
      }
      if (accuracyCircleRef.current) {
        try {
          map.removeLayer(accuracyCircleRef.current);
        } catch (e) {
          // Ignorer
        }
      }

      // Créer une icône personnalisée pour l'utilisateur
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `
          <div style="
            position: relative;
            width: 24px;
            height: 24px;
          ">
            <div style="
              position: absolute;
              width: 16px;
              height: 16px;
              top: 4px;
              left: 4px;
              background: #0098FF;
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 0 15px rgba(0, 152, 255, 0.7), 0 2px 8px rgba(0, 0, 0, 0.3);
              z-index: 2;
            "></div>
            
            <div style="
              position: absolute;
              width: 24px;
              height: 24px;
              background: rgba(0, 152, 255, 0.3);
              border-radius: 50%;
              animation: pulse-ring 2s ease-out infinite;
            "></div>
          </div>
          
          <style>
            @keyframes pulse-ring {
              0% {
                transform: scale(1);
                opacity: 0.6;
              }
              100% {
                transform: scale(2);
                opacity: 0;
              }
            }
          </style>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      if (!isMountedRef.current || !mapRef.current || isDestroyingRef.current) return;

      try {
        userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon })
          .addTo(map)
          .bindPopup(`
            <strong>Votre position</strong><br>
            Précision: ±${Math.round(accuracy)}m<br>
            📍 ${address}
          `);

        accuracyCircleRef.current = L.circle([latitude, longitude], {
          radius: accuracy,
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.1,
          weight: 1
        }).addTo(map);

        // Centrer la carte sur la position (première fois seulement)
        if (!watchId && mapRef.current && !isDestroyingRef.current) {
          map.setView([latitude, longitude], 15, { animate: false });
        }

        console.log('📍 Position GPS détectée:', {
          lat: latitude,
          lng: longitude,
          accuracy: `±${Math.round(accuracy)}m`,
          address: address
        });
      } catch (error) {
        console.warn('Erreur lors de l\'ajout du marqueur:', error);
      }
    };

    const onError = (error: GeolocationPositionError) => {
      if (!isMountedRef.current || isDestroyingRef.current) return;
      
      console.info('📍 Géolocalisation non disponible - Utilisation position par défaut:', error.message);
      
      const defaultLocation: Location = {
        lat: -4.3276,
        lng: 15.3136,
        address: 'Boulevard du 30 Juin, Gombe, Kinshasa'
      };
      
      setUserLocation(defaultLocation);
      if (onLocationUpdate) {
        onLocationUpdate(defaultLocation);
      }
      
      if (mapRef.current && !isDestroyingRef.current) {
        try {
          map.setView([-4.3276, 15.3136], 13, { animate: false });
        } catch (e) {
          // Ignorer
        }
      }
    };

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    try {
      const id = navigator.geolocation.watchPosition(onSuccess, onError, options);
      setWatchId(id);
    } catch (error: any) {
      console.warn('⚠️ Erreur géolocalisation:', error);
      onError({
        code: 1,
        message: 'Géolocalisation non disponible',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3
      } as GeolocationPositionError);
    }
  };

  return (
    <div className={`relative ${className} overflow-hidden`}>
      {/* Conteneur de la carte */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full rounded-lg"
        style={{ 
          minHeight: '400px',
          maxWidth: '100%',
          position: 'relative'
        }}
      />

      {/* Indicateur de chargement */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Chargement de la carte...</p>
            <p className="text-xs text-gray-400 mt-1">Détection de votre position GPS...</p>
          </div>
        </div>
      )}

      {/* Info position utilisateur */}
      {userLocation && showUserLocation && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg z-[1000] max-w-xs">
          <div className="flex items-start gap-2">
            <Navigation className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900">Votre position</p>
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                📍 {userLocation.address || 'Kinshasa, RDC'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bouton recentrer */}
      {userLocation && (
        <button
          onClick={() => {
            if (mapRef.current && userLocation && isMountedRef.current && !isDestroyingRef.current) {
              try {
                mapRef.current.setView([userLocation.lat, userLocation.lng], 15, { animate: false });
              } catch (error) {
                console.warn('Impossible de recentrer la carte:', error);
              }
            }
          }}
          className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-colors z-[1000]"
          title="Recentrer sur ma position"
        >
          <MapPin className="w-5 h-5 text-blue-600" />
        </button>
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