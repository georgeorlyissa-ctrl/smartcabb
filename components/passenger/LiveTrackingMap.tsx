import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { MapPin, Navigation, Car, AlertCircle, Phone, MessageCircle, Clock, Share2, AlertTriangle } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { useAppState } from '../../hooks/useAppState';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';

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
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showSOSDialog, setShowSOSDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // ⏱️ Chronomètre - Calculer le temps écoulé depuis le DÉBUT DE LA FACTURATION (pas le démarrage)
  useEffect(() => {
    // ✅ CORRECTION : Utiliser billingStartTime au lieu de startedAt
    // Le chrono démarre UNIQUEMENT quand le driver désactive le temps d'attente
    const billingStart = state.currentRide?.billingStartTime;
    if (!billingStart) {
      setElapsedTime(0);
      return;
    }

    const updateTimer = () => {
      const startTime = typeof billingStart === 'number' ? billingStart : new Date(billingStart).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000); // en secondes
      setElapsedTime(elapsed);
    };

    updateTimer(); // Mise à jour immédiate
    const timer = setInterval(updateTimer, 1000); // Mise à jour chaque seconde

    return () => clearInterval(timer);
  }, [state.currentRide?.billingStartTime]);

  // Formater le temps en HH:MM:SS ou MM:SS
   // Formater le temps en HH:MM:SS ou MM:SS
   // Formater le temps en HH:MM:SS ou MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 🔗 Partager l'itinéraire
  const handleShareTrip = async () => {
    const shareText = `🚕 Je suis en course SmartCabb\n\n📍 Départ: ${pickup.address || 'Position de départ'}\n📍 Arrivée: ${destination.address || 'Destination'}\n👤 Conducteur: ${driverName}\n⏱️ Temps écoulé: ${formatTime(elapsedTime)}\n💰 Prix: ${state.currentRide?.estimatedPrice?.toLocaleString() || 'N/A'} CDF\n\nSuivez ma course en temps réel: https://smartcabb.com/track/${state.currentRide?.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Ma course SmartCabb',
          text: shareText
        });
        toast.success('Itinéraire partagé avec succès !');
        setShowShareDialog(false);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Erreur partage:', error);
        }
      }
    } else {
      // Fallback: Copier dans le presse-papiers
      try {
        await navigator.clipboard.writeText(shareText);
        toast.success('Informations copiées dans le presse-papiers !');
        setShowShareDialog(false);
      } catch (error) {
        console.error('Erreur copie:', error);
        toast.error('Impossible de copier les informations');
      }
    }
  };

  // 🚨 Déclencher SOS
  const handleSOS = async () => {
    try {
      const sosData = {
        userId: state.currentUser?.id,
        userName: state.currentUser?.name,
        userPhone: state.currentUser?.phone,
        rideId: state.currentRide?.id,
        driverName: driverName,
        driverPhone: state.currentRide?.driverPhone,
        vehicleInfo: `${state.currentRide?.vehicleType || 'Véhicule'} - ${state.currentRide?.vehiclePlate || 'N/A'}`,
        currentLocation: driverLocation || pickup,
        timestamp: new Date().toISOString()
      };

      console.log('🚨 SOS déclenché:', sosData);
      
      // Envoyer l'alerte SOS au backend
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/emergency/sos`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(sosData)
        }
      );

      if (response.ok) {
        toast.success('🚨 Alerte SOS envoyée !', {
          description: 'Les services d\'urgence ont été notifiés.',
          duration: 5000
        });
        setShowSOSDialog(false);
      } else {
        toast.error('Erreur lors de l\'envoi de l\'alerte SOS');
      }
    } catch (error) {
      console.error('Erreur SOS:', error);
      toast.error('Impossible d\'envoyer l\'alerte SOS');
    }
  };

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

      {/* 🎯 NOUVEAU : Indicateur de destination flottant */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="absolute top-32 right-4 z-[1000]"
      >
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl shadow-2xl p-4 max-w-xs">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
              <Navigation className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white/80 uppercase tracking-wide mb-1">Destination</p>
              <p className="font-bold text-sm leading-tight line-clamp-2">
                {destination.address || 'Point d\'arrivée'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Panneau du bas avec chronomètre et infos */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute bottom-0 left-0 right-0 z-[1000]"
      >
        <div className="bg-white rounded-t-3xl shadow-2xl p-6 space-y-4">
          {/* Handle de drag */}
          <div className="flex justify-center mb-2">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* Titre et statut */}
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Course en cours</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-green-600 font-medium">En direct</span>
            </div>
          </div>

          {/* Itinéraire */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <MapPin className="w-3 h-3 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-600">Départ</p>
                <p className="font-medium text-sm">{pickup.address || 'Point de départ'}</p>
              </div>
            </div>

            <div className="ml-3 border-l-2 border-dashed border-gray-300 h-4" />

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <MapPin className="w-3 h-3 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-600">Destination</p>
                <p className="font-medium text-sm">{destination.address || 'Point d\'arrivée'}</p>
              </div>
            </div>
          </div>

          {/* Prix et chronomètre */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Prix estimé</span>
              <span className="text-2xl font-bold text-green-600">
                {state.currentRide?.estimatedPrice?.toLocaleString() || 'N/A'} CDF
              </span>
            </div>

            {/* Chronomètre - S'affiche UNIQUEMENT quand la facturation a démarré */}
            {state.currentRide?.billingStartTime && (
              <div className="mb-4">
                <div className="flex items-center justify-center py-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border-2 border-orange-200">
                  <Clock className="w-5 h-5 text-orange-600 mr-2" />
                  <div className="text-center">
                    <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-1">💰 Facturation en cours</p>
                    <span className="text-2xl font-bold text-orange-600 tabular-nums">
                      {formatTime(elapsedTime)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Boutons Partager et SOS */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => setShowShareDialog(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-md transition-all"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Partager
              </Button>
              <Button
                onClick={() => setShowSOSDialog(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl shadow-md transition-all"
              >
                <AlertTriangle className="w-5 h-5 mr-2" />
                SOS
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Dialog Partage */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-blue-600" />
              Partager votre course
            </DialogTitle>
            <DialogDescription>
              Partagez votre itinéraire avec vos amis ou votre famille pour qu'ils puissent suivre votre course en temps réel.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
              <p><strong>📍 Départ:</strong> {pickup.address || 'Position de départ'}</p>
              <p><strong>📍 Arrivée:</strong> {destination.address || 'Destination'}</p>
              <p><strong>👤 Conducteur:</strong> {driverName}</p>
              {state.currentRide?.startedAt && (
                <p><strong>⏱️ Temps:</strong> {formatTime(elapsedTime)}</p>
              )}
              <p><strong>💰 Prix:</strong> {state.currentRide?.estimatedPrice?.toLocaleString() || 'N/A'} CDF</p>
            </div>
            <Button
              onClick={handleShareTrip}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Partager maintenant
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog SOS */}
      <Dialog open={showSOSDialog} onOpenChange={setShowSOSDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Alerte SOS d'urgence
            </DialogTitle>
            <DialogDescription>
              En cas de problème grave, cette alerte notifiera immédiatement les services d'urgence et vos contacts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-sm text-red-800">
              <p className="font-semibold mb-2">⚠️ Cette action va :</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Alerter les services d'urgence</li>
                <li>Envoyer votre position GPS</li>
                <li>Notifier vos contacts d'urgence</li>
                <li>Enregistrer les infos du conducteur</li>
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => setShowSOSDialog(false)}
                variant="outline"
                className="py-3"
              >
                Annuler
              </Button>
              <Button
                onClick={handleSOS}
                className="bg-red-600 hover:bg-red-700 text-white py-3 font-semibold"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Confirmer SOS
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
