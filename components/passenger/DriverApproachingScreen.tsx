import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useAppState } from '../../hooks/useAppState';
import { 
  ArrowLeft, 
  Phone, 
  MessageCircle, 
  Navigation,
  User,
  Car,
  Clock,
  MapPin,
  Star
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatCDF } from '../../lib/pricing';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

export function DriverApproachingScreen() {
  const { state, setCurrentScreen, updateDriver } = useAppState();
  const currentRide = state.currentRide;
  
  // ✅ FIX: Ajouter une vérification de sécurité pour éviter l'erreur "Cannot read properties of undefined"
  const driver = state.drivers?.find(d => d.id === currentRide?.driverId) || null;
  
  const [driverDistance, setDriverDistance] = useState<number>(0);
  const [estimatedTime, setEstimatedTime] = useState<number>(0);
  const [driverLocation, setDriverLocation] = useState<{lat: number, lng: number} | null>(null);

  // 🔥 FIX 3: CHARGER LA POSITION DU CONDUCTEUR DEPUIS LE BACKEND
  useEffect(() => {
    if (!driver?.id) return;
    
    const loadDriverLocation = async () => {
      try {
        console.log('📍 Chargement position conducteur depuis backend...');
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/drivers/location/${driver.id}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.location) {
            console.log('✅ Position conducteur reçue:', data.location);
            // Mettre à jour le state local du conducteur
            updateDriver(driver.id, { location: data.location });
          } else {
            console.warn('⚠️ Position conducteur non disponible');
          }
        }
      } catch (error) {
        console.error('❌ Erreur chargement position conducteur:', error);
      }
    };
    
    // Charger immédiatement
    loadDriverLocation();
    
    // Recharger toutes les 5 secondes pour suivi en temps réel
    const interval = setInterval(loadDriverLocation, 5000);
    
    return () => clearInterval(interval);
  }, [driver?.id, updateDriver]);

  // 🚗 CALCULER LA DISTANCE ET L'ETA EN TEMPS RÉEL
  useEffect(() => {
    // ✅ FIX: Vérifier que le conducteur existe avant de continuer
    if (!currentRide?.pickup || !driver || !driver.location) {
      console.warn('⚠️ Impossible de calculer la distance: données manquantes', {
        hasRide: !!currentRide,
        hasPickup: !!currentRide?.pickup,
        hasDriver: !!driver,
        hasDriverLocation: !!driver?.location
      });
      // 🔥 FIX 2: Initialiser avec des valeurs par défaut au lieu de laisser 0
      setDriverDistance(0);
      setEstimatedTime(0);
      return;
    }

    const calculateDistanceAndETA = () => {
      // 🔥 FIX 2: VALIDATION DES COORDONNÉES AVANT CALCUL
      // Vérifier que toutes les coordonnées sont valides
      const driverLat = driver.location?.lat;
      const driverLng = driver.location?.lng;
      const pickupLat = currentRide.pickup?.lat;
      const pickupLng = currentRide.pickup?.lng;
      
      // Si une coordonnée est invalide (undefined, null, NaN), arrêter
      if (
        typeof driverLat !== 'number' || isNaN(driverLat) ||
        typeof driverLng !== 'number' || isNaN(driverLng) ||
        typeof pickupLat !== 'number' || isNaN(pickupLat) ||
        typeof pickupLng !== 'number' || isNaN(pickupLng)
      ) {
        console.warn('⚠️ Coordonnées GPS invalides:', {
          driverLat,
          driverLng,
          pickupLat,
          pickupLng
        });
        setDriverDistance(0);
        setEstimatedTime(0);
        return;
      }

      // Formule de Haversine pour calculer la distance
      const R = 6371; // Rayon de la Terre en km
      const dLat = (pickupLat - driverLat) * Math.PI / 180;
      const dLng = (pickupLng - driverLng) * Math.PI / 180;
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(driverLat * Math.PI / 180) * Math.cos(pickupLat * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      
      // 🔥 FIX 2: VÉRIFIER QUE LE RÉSULTAT EST VALIDE
      if (isNaN(distance) || distance < 0) {
        console.warn('⚠️ Distance calculée invalide:', distance);
        setDriverDistance(0);
        setEstimatedTime(0);
        return;
      }

      setDriverDistance(distance);
      setDriverLocation({ lat: driverLat, lng: driverLng });

      // Calculer l'ETA (vitesse moyenne en ville: 30 km/h)
      const averageSpeed = 30; // km/h
      const timeInHours = distance / averageSpeed;
      const timeInMinutes = Math.ceil(timeInHours * 60);
      setEstimatedTime(timeInMinutes);
      
      console.log(`📍 Distance conducteur → pickup: ${distance.toFixed(2)} km (${timeInMinutes} min)`);
    };

    calculateDistanceAndETA();

    // Mettre à jour toutes les 10 secondes (simulation de mise à jour en temps réel)
    const interval = setInterval(calculateDistanceAndETA, 10000);

    return () => clearInterval(interval);
  }, [driver?.location, currentRide?.pickup]);

  // 🎨 ANIMATION DE PROGRESSION
  const getProgressPercentage = () => {
    if (driverDistance <= 0.1) return 95; // Très proche
    if (driverDistance <= 0.5) return 80;
    if (driverDistance <= 1) return 60;
    if (driverDistance <= 2) return 40;
    if (driverDistance <= 3) return 20;
    return 10;
  };

  const handleCall = () => {
    if (driver?.phone) {
      window.location.href = `tel:${driver.phone}`;
    }
  };

  const handleMessage = () => {
    if (driver?.phone) {
      window.location.href = `sms:${driver.phone}`;
    }
  };

  if (!currentRide || !driver) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="p-6">
          <p className="text-center text-gray-600">Aucune course en cours</p>
          <Button onClick={() => setCurrentScreen('map')} className="w-full mt-4">
            Retour
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentScreen('ride-in-progress')}
              className="p-2 hover:bg-muted"
            >
              <ArrowLeft className="w-5 h-5 text-primary" />
            </Button>
            <div>
              <h1 className="text-primary">Votre chauffeur arrive</h1>
              <p className="text-sm text-muted-foreground">Trajet en cours</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* 🚗 CARTE DE DISTANCE VISUELLE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-primary mb-2">
                {driverDistance < 0.1 
                  ? "Votre chauffeur est arrivé !" 
                  : "Votre chauffeur est en route"}
              </h2>
              <p className="text-muted-foreground">
                {driverDistance < 0.1 
                  ? "Il vous attend au point de prise en charge" 
                  : "Suivez sa progression en temps réel"}
              </p>
            </div>

            {/* 📍 VISUALISATION DE LA DISTANCE */}
            <div className="relative mb-8">
              {/* Ligne de progression */}
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-secondary to-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${getProgressPercentage()}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>

              {/* Icônes */}
              <div className="flex items-center justify-between mt-4">
                {/* Conducteur */}
                <motion.div
                  className="flex flex-col items-center"
                  initial={{ x: 0 }}
                  animate={{ x: `${getProgressPercentage() * 0.9}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center shadow-lg mb-2">
                    <Car className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-xs font-medium text-gray-700">{driver.name}</p>
                </motion.div>

                {/* Passager */}
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg mb-2">
                    <User className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-xs font-medium text-gray-700">Vous</p>
                </div>
              </div>
            </div>

            {/* ⏱️ INFORMATIONS DE DISTANCE ET TEMPS */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl text-center shadow-sm">
                <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Navigation className="w-5 h-5 text-secondary" />
                </div>
                <p className="text-2xl font-bold text-primary mb-1">
                  {driverDistance === 0 ? (
                    <span className="text-base text-muted-foreground">Calcul...</span>
                  ) : driverDistance < 0.1 ? (
                    <>{'< 100 m'}</>
                  ) : (
                    <>{driverDistance.toFixed(1)} km</>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">Distance</p>
              </div>

              <div className="bg-white p-4 rounded-xl text-center shadow-sm">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <p className="text-2xl font-bold text-primary mb-1">
                  {estimatedTime === 0 ? (
                    <span className="text-base text-muted-foreground">Calcul...</span>
                  ) : estimatedTime < 1 ? (
                    <>{'< 1 min'}</>
                  ) : (
                    <>{estimatedTime} min</>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">Temps d'arrivée</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* 👤 INFORMATIONS DU CONDUCTEUR */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Votre chauffeur</h3>
            
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg">{driver.name}</h4>
                <div className="flex items-center space-x-1 mt-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{driver.rating || 4.8}</span>
                  <span className="text-xs text-muted-foreground">
                    ({driver.totalRides || 0} courses)
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {driver.vehicle?.brand} {driver.vehicle?.model} • {driver.vehicle?.color}
                </p>
                <p className="text-sm font-medium text-primary">
                  {driver.vehicle?.licensePlate}
                </p>
              </div>
            </div>

            {/* Actions de communication */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleCall}
                className="bg-green-600 hover:bg-green-700"
              >
                <Phone className="w-4 h-4 mr-2" />
                Appeler
              </Button>
              <Button
                onClick={handleMessage}
                variant="outline"
                className="border-primary text-primary"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* 📍 DÉTAILS DE LA COURSE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Détails de la course</h3>
            
            <div className="space-y-3">
              {/* Point de départ */}
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-3 h-3 bg-secondary rounded-full"></div>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Point de prise en charge</p>
                  <p className="font-medium">{currentRide.pickup?.address || 'Adresse de départ'}</p>
                </div>
              </div>

              {/* Ligne de séparation */}
              <div className="ml-4 border-l-2 border-dashed border-gray-300 h-8"></div>

              {/* Point d'arrivée */}
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Destination</p>
                  <p className="font-medium">{currentRide.destination?.address || 'Adresse d\'arrivée'}</p>
                </div>
              </div>
            </div>

            {/* Prix estimé */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Prix estimé</span>
                <span className="text-xl font-bold text-primary">
                  {formatCDF(currentRide.estimatedPrice || 0)}
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* 💡 CONSEILS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-4 bg-blue-50 border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>💡 Conseils :</strong><br/>
              • Soyez visible au point de prise en charge<br/>
              • Vérifiez la plaque d'immatriculation du véhicule<br/>
              • Contactez le chauffeur si vous avez des questions
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
