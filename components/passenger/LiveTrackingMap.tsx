import { useState, useEffect, useCallback } from 'react';
import { motion } from '../../framer-motion';
import { useAppState } from '../../hooks/useAppState';
import { toast } from 'sonner';

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface LiveTrackingMapProps {
  driverId: string;
  pickup: Location;
  destination: Location;
  driverName: string;
}

export function LiveTrackingMap({ driverId, pickup, destination, driverName }: LiveTrackingMapProps) {
  const { state } = useAppState();
  const [driverLocation, setDriverLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // 🗺️ Charger Leaflet dynamiquement
  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window === 'undefined') return;

      // Charger le CSS de Leaflet
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Charger le JS de Leaflet
      if (!(window as any).L) {
        return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }
    };

    loadLeaflet().catch(err => {
      console.error('❌ Erreur chargement Leaflet:', err);
      setError('Impossible de charger la carte');
    });
  }, []);

  // 🗺️ Initialiser la carte Leaflet
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current || typeof window === 'undefined') return;

    const initMap = () => {
      const L = (window as any).L;
      if (!L) {
        console.warn('⚠️ Leaflet pas encore chargé');
        return;
      }

      try {
        // Créer la carte centrée sur Kinshasa
        const map = L.map(mapRef.current!).setView([pickup.lat, pickup.lng], 13);

        // Ajouter les tuiles OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);

        // Icône personnalisée pour le pickup (vert)
        const pickupIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: #10b981; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"/></svg>
                 </div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32]
        });

        // Icône personnalisée pour la destination (rouge)
        const destinationIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: #ef4444; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"/></svg>
                 </div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32]
        });

        // Ajouter les marqueurs de départ et arrivée
        const pickupMarker = L.marker([pickup.lat, pickup.lng], { icon: pickupIcon })
          .addTo(map)
          .bindPopup(`<b>Départ</b><br/>${pickup.address || 'Point de départ'}`);

        const destMarker = L.marker([destination.lat, destination.lng], { icon: destinationIcon })
          .addTo(map)
          .bindPopup(`<b>Destination</b><br/>${destination.address || 'Point d\'arrivée'}`);

        markersRef.current = [pickupMarker, destMarker];
        mapInstanceRef.current = map;

        // Ajuster la vue pour montrer les deux points
        const bounds = L.latLngBounds([
          [pickup.lat, pickup.lng],
          [destination.lat, destination.lng]
        ]);
        map.fitBounds(bounds, { padding: [50, 50] });

        setIsLoading(false);
        console.log('✅ Carte OpenStreetMap initialisée');
      } catch (err) {
        console.error('❌ Erreur initialisation carte:', err);
        setError('Erreur initialisation de la carte');
        setIsLoading(false);
      }
    };

    // Essayer d'initialiser, sinon attendre un peu
    if ((window as any).L) {
      initMap();
    } else {
      const timer = setTimeout(initMap, 500);
      return () => clearTimeout(timer);
    }
  }, [pickup, destination]);

  // 🚗 Polling de la position du conducteur
  useEffect(() => {
    if (!driverId) return;

    const fetchDriverLocation = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/drivers/location/${driverId}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.location) {
            setDriverLocation({
              lat: data.location.lat,
              lng: data.location.lng
            });

            // Mettre à jour la carte avec la position du conducteur
            updateDriverMarker(data.location.lat, data.location.lng);
          }
        }
      } catch (err) {
        console.debug('🔍 Récupération position conducteur:', err);
      }
    };

    // Polling toutes les 3 secondes
    fetchDriverLocation();
    const interval = setInterval(fetchDriverLocation, 3000);

    return () => clearInterval(interval);
  }, [driverId]);

  // 🚗 Mettre à jour le marqueur du conducteur sur la carte
  const updateDriverMarker = (lat: number, lng: number) => {
    if (!mapInstanceRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    // Supprimer l'ancien marqueur de conducteur s'il existe
    const existingDriverMarker = markersRef.current.find((m: any) => m.options?.isDriver);
    if (existingDriverMarker) {
      mapInstanceRef.current.removeLayer(existingDriverMarker);
      markersRef.current = markersRef.current.filter((m: any) => !m.options?.isDriver);
    }

    // Créer un nouveau marqueur pour le conducteur (voiture bleue)
    const driverIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: #3b82f6; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 4px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.4);">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
             </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40]
    });

    const driverMarker = L.marker([lat, lng], { 
      icon: driverIcon,
      isDriver: true 
    })
      .addTo(mapInstanceRef.current)
      .bindPopup(`<b>${driverName}</b><br/>Position actuelle`);

    markersRef.current.push(driverMarker);

    // Centrer légèrement sur le conducteur si la course est en cours
    if (state.currentRide?.status === 'in_progress') {
      mapInstanceRef.current.setView([lat, lng], 15, { animate: true });
    }
  };

  // Fonction pour appeler le chauffeur
  const handleCallDriver = () => {
    const phone = state.currentRide?.driverPhone;
    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      toast.error('Numéro du chauffeur indisponible');
    }
  };

  // Fonction pour contacter via WhatsApp
  const handleWhatsApp = () => {
    const phone = state.currentRide?.driverPhone?.replace(/\D/g, '');
    if (phone) {
      const message = encodeURIComponent(`Bonjour ${driverName}, je suis votre passager SmartCabb.`);
      window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    } else {
      toast.error('Numéro du chauffeur indisponible');
    }
  };

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100 p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-900 mb-2">Erreur de carte</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {/* Carte Leaflet */}
      <div ref={mapRef} className="h-full w-full" />

      {/* Loader pendant le chargement */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-600">Chargement de la carte...</p>
          </div>
        </div>
      )}

      {/* Badge de statut en haut */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-4 left-4 right-4 z-[1000]"
      >
        <div className="bg-white rounded-2xl shadow-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Votre chauffeur</p>
              <p className="font-semibold text-lg">{driverName}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCallDriver}
                className="w-10 h-10 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center shadow-lg"
              >
                <Phone className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={handleWhatsApp}
                className="w-10 h-10 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center shadow-lg"
              >
                <MessageCircle className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Barre de progression si disponible */}
          {driverLocation && (
            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-muted-foreground">En cours</span>
                </div>
                <span className="font-semibold text-primary">
                  {state.currentRide?.estimatedDuration || 15} min
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Légende en bas */}
      <div className="absolute bottom-4 left-4 right-4 z-[1000]">
        <div className="bg-white rounded-xl shadow-lg border border-border p-3">
          <div className="flex items-center justify-around text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full" />
              <span>Départ</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full" />
              <span>Chauffeur</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full" />
              <span>Arrivée</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}