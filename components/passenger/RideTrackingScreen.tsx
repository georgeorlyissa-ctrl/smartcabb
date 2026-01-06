import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useAppState } from '../../hooks/useAppState';
import { InteractiveMapView } from '../InteractiveMapView';
import { 
  Navigation,
  MapPin,
  Clock,
  Phone,
  MessageCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

export function RideTrackingScreen() {
  const { state, setCurrentScreen } = useAppState();
  const [driverLocation, setDriverLocation] = useState<Location | null>(null);
  const currentRide = state.currentRide;

  // ✅ POLLING : Obtenir la position du conducteur en temps réel
  useEffect(() => {
    if (!currentRide?.driverId) return;

    const fetchDriverLocation = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/drivers/${currentRide.driverId}/location`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.location) {
            setDriverLocation({
              lat: data.location.lat,
              lng: data.location.lng,
              address: data.location.address
            });
          }
        }
      } catch (error) {
        console.error('❌ Erreur récupération position conducteur:', error);
      }
    };

    // Première récupération immédiate
    fetchDriverLocation();

    // Puis toutes les 5 secondes
    const interval = setInterval(fetchDriverLocation, 5000);

    return () => clearInterval(interval);
  }, [currentRide?.driverId]);

  // ✅ POLLING : Vérifier si la course est terminée
  useEffect(() => {
    if (!currentRide?.id) return;

    const checkRideStatus = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/rides/status/${currentRide.id}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log('🔍 Statut course:', data.ride?.status);
          
          if (data.ride?.status === 'completed') {
            console.log('✅ Course terminée, redirection vers paiement');
            setCurrentScreen('payment');
          }
        } else {
          console.debug('⚠️ Erreur récupération statut:', response.status);
        }
      } catch (error) {
        console.debug('🔍 Erreur vérification statut course:', error instanceof Error ? error.message : 'erreur');
      }
    };

    // Première vérification immédiate
    checkRideStatus();

    // Vérifier toutes les 3 secondes (plus rapide pour meilleure réactivité)
    const interval = setInterval(checkRideStatus, 3000);

    return () => clearInterval(interval);
  }, [currentRide?.id, setCurrentScreen]);

  if (!currentRide) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-6">
          <p>Aucune course en cours</p>
        </Card>
      </div>
    );
  }

  const handleCallDriver = () => {
    if (currentRide.driver?.phone) {
      window.open(`tel:${currentRide.driver.phone}`, '_self');
    }
  };

  const handleWhatsAppDriver = () => {
    if (currentRide.driver?.phone) {
      const cleanPhone = currentRide.driver.phone.replace(/[\s\-\(\)]/g, '');
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Carte en plein écran */}
      <div className="flex-1 relative">
        <InteractiveMapView
          center={driverLocation || currentRide.pickup}
          drivers={driverLocation ? [{
            id: currentRide.driverId || '',
            name: currentRide.driver?.name || 'Conducteur',
            location: driverLocation,
            available: true,
            rating: currentRide.driver?.rating || 5,
            vehicleInfo: currentRide.driver?.vehicle || {
              make: 'Véhicule',
              model: '',
              color: '',
              licensePlate: ''
            }
          }] : []}
          showRoute={true}
          routeStart={currentRide.pickup}
          routeEnd={currentRide.destination}
          enableGeolocation={true}
          className="w-full h-full"
        />

        {/* Overlay - Info conducteur */}
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="absolute top-4 left-4 right-4"
        >
          <Card className="p-4 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-lg">🚗</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{currentRide.driver?.name || 'Conducteur'}</h3>
                <p className="text-sm text-gray-600">
                  {currentRide.driver?.vehicle?.make} {currentRide.driver?.vehicle?.model}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={handleCallDriver}
                  size="sm"
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Phone className="w-4 h-4" />
                </Button>
                <Button 
                  onClick={handleWhatsAppDriver}
                  size="sm"
                  className="bg-green-500 hover:bg-green-600"
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Overlay - Détails trajet */}
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="absolute bottom-0 left-0 right-0"
        >
          <Card className="rounded-t-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-center mb-2">
              <div className="w-12 h-1 bg-gray-300 rounded-full" />
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Course en cours</h2>
              <div className="flex items-center space-x-2 text-green-600">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                <span className="text-sm font-medium">En direct</span>
              </div>
            </div>

            {/* Itinéraire */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <MapPin className="w-3 h-3 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600">Départ</p>
                  <p className="font-medium text-sm">{currentRide.pickup?.address || 'N/A'}</p>
                </div>
              </div>

              <div className="ml-3 border-l-2 border-dashed border-gray-300 h-4" />

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <MapPin className="w-3 h-3 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600">Destination</p>
                  <p className="font-medium text-sm">{currentRide.destination?.address || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Prix */}
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Prix de la course</span>
                <span className="text-2xl font-bold text-green-600">
                  {currentRide.estimatedPrice?.toLocaleString() || 'N/A'} CDF
                </span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}