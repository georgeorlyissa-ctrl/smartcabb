import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { useAppState } from '../../hooks/useAppState';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Star,
  Navigation,
  Clock,
  User,
  Car,
  X,
  CreditCard,
  Smartphone,
  Banknote,
  Wallet
} from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { AlternativeVehicleDialog } from './AlternativeVehicleDialog';
import { VehicleCategory } from '../../lib/pricing';

interface DriverData {
  id: string;
  full_name: string;
  phone: string;
  rating: number;
  total_rides: number;
  vehicle?: {
    make: string;
    model: string;
    year: number;
    color: string;
    license_plate: string;
  };
}

export function RideScreen() {
  const { t } = useTranslation();
  const { setCurrentScreen, state, updateRide } = useAppState();
  const [searchingDriver, setSearchingDriver] = useState(true);
  const [driverFound, setDriverFound] = useState(false);
  const [driverArriving, setDriverArriving] = useState(false);
  const [rideInProgress, setRideInProgress] = useState(false);
  const [arrivalTime, setArrivalTime] = useState(3);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'mobile_money' | 'card' | 'cash' | 'wallet'>('wallet');
  const [driverData, setDriverData] = useState<DriverData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // 🆕 États pour la gestion des alternatives
  const [showAlternativeDialog, setShowAlternativeDialog] = useState(false);
  const [alternativeCategory, setAlternativeCategory] = useState<VehicleCategory | null>(null);
  const [alternativeDriversCount, setAlternativeDriversCount] = useState(0);
  const [checkingAlternative, setCheckingAlternative] = useState(false);

  const currentRide = state.currentRide;

  // Chercher un conducteur disponible dans la base de données
  useEffect(() => {
    // 🔒 NE PAS démarrer si pas de rideId - éviter les vérifications inutiles
    if (!currentRide?.id) {
      console.debug('⏳ En attente de la création de la course...');
      return;
    }

    let checkInterval: NodeJS.Timeout;
    let timeoutTimer: NodeJS.Timeout;
    let hasCheckedAlternative = false;

    const checkRideStatus = async () => {
      // Double vérification de sécurité
      if (!currentRide?.id) {
        return;
      }

      try {
        console.log('🔍 Vérification statut de la course:', currentRide.id);
        
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/rides/status/${currentRide.id}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.warn('⚠️ Statut non OK:', response.status, errorText);
          // Ne pas afficher d'erreur, juste logger
          return;
        }

        const data = await response.json();
        
        if (data.success && data.ride) {
          const ride = data.ride;
          
          // Si un conducteur a accepté la course
          if (ride.status === 'accepted' && ride.driverId) {
            console.log('✅ Conducteur a accepté la course !');
            clearInterval(checkInterval);
            clearTimeout(timeoutTimer);
            
            // Récupérer les infos du conducteur
            const driverResponse = await fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/drivers/${ride.driverId}`,
              {
                headers: {
                  'Authorization': `Bearer ${publicAnonKey}`,
                  'Content-Type': 'application/json'
                }
              }
            );

            if (driverResponse.ok) {
              const driverData = await driverResponse.json();
              if (driverData.success) {
                setDriverData({
                  id: driverData.driver.id,
                  full_name: driverData.driver.name || driverData.driver.full_name,
                  phone: driverData.driver.phone || '',
                  rating: driverData.driver.rating || 4.8,
                  total_rides: driverData.driver.total_rides || 0,
                  vehicle: driverData.driver.vehicleInfo || driverData.driver.vehicle_info
                });
              }
            }
            
            setSearchingDriver(false);
            setDriverFound(true);
            setDriverArriving(true);
            setArrivalTime(3);
          }
        }
      } catch (error) {
        // Silencieux - ne pas polluer la console avec des erreurs réseau temporaires
        console.debug('🔍 Vérification statut:', error instanceof Error ? error.message : 'erreur');
      }
    };

    const checkAvailability = async () => {
      if (!currentRide?.id || hasCheckedAlternative || driverFound) return;

      hasCheckedAlternative = true;
      setCheckingAlternative(true);
      
      try {
        console.log('🔍 Vérification disponibilité après 30s...');
        
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/rides/check-availability/${currentRide.id}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.warn('⚠️ Disponibilité non vérifiable:', response.status, errorText);
          setCheckingAlternative(false);
          return;
        }

        const data = await response.json();
        console.log('📊 Résultat disponibilité:', data);

        if (data.success) {
          // Si un conducteur a accepté entre-temps
          if (data.accepted && data.ride) {
            console.log('✅ Un conducteur a accepté !');
            clearInterval(checkInterval);
            
            // Récupérer les infos du conducteur
            if (data.ride.driverId) {
              const driverResponse = await fetch(
                `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/drivers/${data.ride.driverId}`,
                {
                  headers: {
                    'Authorization': `Bearer ${publicAnonKey}`
                  }
                }
              );

              if (driverResponse.ok) {
                const driverData = await driverResponse.json();
                if (driverData.success) {
                  setDriverData({
                    id: driverData.driver.id,
                    full_name: driverData.driver.name || driverData.driver.full_name,
                    phone: driverData.driver.phone || '',
                    rating: driverData.driver.rating || 4.8,
                    total_rides: driverData.driver.total_rides || 0,
                    vehicle: driverData.driver.vehicleInfo || driverData.driver.vehicle_info
                  });
                }
              }
            }
            
            setSearchingDriver(false);
            setDriverFound(true);
            setDriverArriving(true);
            return;
          }

          // Si une alternative est disponible
          if (!data.available && data.alternative) {
            console.log('💡 Alternative disponible:', data.alternative.category);
            setAlternativeCategory(data.alternative.category as VehicleCategory);
            setAlternativeDriversCount(data.alternative.driversCount);
            setShowAlternativeDialog(true);
            setSearchingDriver(false);
          } 
          // Aucune alternative disponible
          else if (!data.available && !data.alternative) {
            console.log('❌ Aucun conducteur disponible');
            setError('Aucun conducteur disponible pour le moment. Veuillez réessayer plus tard.');
            setSearchingDriver(false);
            clearInterval(checkInterval);
          }
          // Des conducteurs sont disponibles, continuer à attendre
          else if (data.available) {
            console.log('✅ Conducteurs disponibles, on continue à attendre');
          }
        }
      } catch (error) {
        // Silencieux - ne pas polluer la console avec des erreurs réseau temporaires
        console.debug('🔍 Disponibilité:', error instanceof Error ? error.message : 'vérification en cours');
      } finally {
        setCheckingAlternative(false);
      }
    };

    // Vérifier le statut toutes les 5 secondes
    checkInterval = setInterval(checkRideStatus, 5000);
    
    // Vérification initiale immédiate
    checkRideStatus();

    // Après 30 secondes, vérifier la disponibilité et proposer une alternative
    timeoutTimer = setTimeout(() => {
      checkAvailability();
    }, 30000);

    return () => {
      clearInterval(checkInterval);
      clearTimeout(timeoutTimer);
    };
  }, [currentRide?.id, driverFound]);

  // Simuler l'arrivée du chauffeur
  useEffect(() => {
    if (driverArriving && arrivalTime > 0) {
      const timer = setInterval(() => {
        setArrivalTime((prev) => {
          if (prev <= 1) {
            setDriverArriving(false);
            setRideInProgress(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [driverArriving, arrivalTime]);

  const handleCancelRide = () => {
    console.log('❌ Annulation de la course');
    setCurrentScreen('map');
  };

  const handleCompleteRide = () => {
    console.log('✅ Course terminée, sélectionner mode de paiement');
    
    // Assigner un chauffeur simulé à la course
    if (currentRide?.id) {
      updateRide(currentRide.id, {
        driverId: 'driver-simulated-001',
        paymentMethod: selectedPaymentMethod,
        status: 'completed'
      });
    }
    
    // Naviguer vers l'écran de paiement
    setCurrentScreen('payment');
  };

  // 🆕 Accepter l'alternative proposée
  const handleAcceptAlternative = async (newPrice: number) => {
    if (!currentRide?.id || !alternativeCategory) {
      console.error('❌ Données manquantes pour accepter alternative');
      return;
    }

    try {
      console.log('✅ Acceptation alternative:', alternativeCategory, 'Prix:', newPrice);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/rides/accept-alternative`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            rideId: currentRide.id,
            alternativeCategory,
            newEstimatedPrice: newPrice
          })
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de l\'acceptation de l\'alternative');
      }

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Alternative acceptée, nouvelle recherche en cours');
        
        // Mettre à jour le prix localement
        if (currentRide.id) {
          updateRide(currentRide.id, {
            estimatedPrice: newPrice,
            vehicleType: alternativeCategory
          });
        }
        
        // Fermer le dialogue et reprendre la recherche
        setShowAlternativeDialog(false);
        setSearchingDriver(true);
        setError(null);
      } else {
        throw new Error(data.error || 'Erreur inconnue');
      }
    } catch (error) {
      console.error('❌ Erreur acceptation alternative:', error);
      setError('Erreur lors de l\'acceptation de l\'alternative');
    }
  };

  // 🆕 Refuser l'alternative
  const handleDeclineAlternative = () => {
    console.log('❌ Refus de l\'alternative');
    setShowAlternativeDialog(false);
    setError('Aucun conducteur disponible dans la catégorie demandée. Veuillez réessayer plus tard.');
    setSearchingDriver(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex flex-col">
      {/* 🆕 Dialogue d'alternative */}
      {alternativeCategory && (
        <AlternativeVehicleDialog
          isOpen={showAlternativeDialog}
          originalCategory={(currentRide?.vehicleType as VehicleCategory) || 'smart_standard'}
          alternativeCategory={alternativeCategory}
          availableDriversCount={alternativeDriversCount}
          estimatedDuration={currentRide?.estimatedDuration || 15}
          onAccept={handleAcceptAlternative}
          onDecline={handleDeclineAlternative}
        />
      )}

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelRide}
              className="p-2 hover:bg-muted"
            >
              <ArrowLeft className="w-5 h-5 text-primary" />
            </Button>
            <div>
              <h1 className="text-primary">
                {searchingDriver && 'Recherche de chauffeur...'}
                {driverFound && driverArriving && 'Chauffeur en route'}
                {rideInProgress && 'Course en cours'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {currentRide?.vehicleType || 'Smart Flex'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancelRide}
            className="text-destructive hover:bg-destructive/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col p-4 space-y-4">
        {/* Carte avec animation de recherche */}
        <AnimatePresence mode="wait">
          {/* Erreur - Aucun conducteur disponible */}
          {error && !searchingDriver && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex-1 flex flex-col items-center justify-center space-y-6 p-6"
            >
              <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center">
                <X className="w-16 h-16 text-red-500" />
              </div>

              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-red-600">Aucun conducteur disponible</h2>
                <p className="text-muted-foreground max-w-md">
                  {error}
                </p>
              </div>

              <Button
                onClick={() => setCurrentScreen('map')}
                className="bg-gradient-to-r from-secondary to-primary text-white px-8"
              >
                Retour à la carte
              </Button>
            </motion.div>
          )}

          {searchingDriver && (
            <motion.div
              key="searching"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex-1 flex flex-col items-center justify-center space-y-6"
            >
              {/* Animation de recherche */}
              <div className="relative">
                <motion.div
                  className="w-32 h-32 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 360]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Car className="w-16 h-16 text-white" />
                </motion.div>
                {/* Cercles d'ondes */}
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-secondary"
                  animate={{ 
                    scale: [1, 1.5, 2],
                    opacity: [0.6, 0.3, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut"
                  }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-primary"
                  animate={{ 
                    scale: [1, 1.5, 2],
                    opacity: [0.6, 0.3, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut",
                    delay: 0.5
                  }}
                />
              </div>

              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-primary">Recherche en cours...</h2>
                <p className="text-muted-foreground">
                  Nous cherchons un chauffeur proche de vous
                </p>
              </div>

              {/* Infos de la course */}
              <div className="w-full max-w-md bg-white rounded-2xl p-5 shadow-lg border border-border space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-3 h-3 bg-secondary rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Départ</p>
                    <p className="text-foreground">{currentRide?.pickup?.address || 'Gombe, Kinshasa'}</p>
                  </div>
                </div>
                
                <div className="h-6 border-l-2 border-dashed border-border ml-1.5" />
                
                <div className="flex items-start space-x-3">
                  <div className="w-3 h-3 bg-accent rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Destination</p>
                    <p className="text-foreground">{currentRide?.destination?.address || 'Kalamu, Kinshasa'}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-muted-foreground">Prix estimé</span>
                  <span className="text-xl font-bold text-primary">
                    {(currentRide?.estimatedPrice || 17500).toLocaleString()} CDF
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Chauffeur trouvé */}
          {driverFound && !rideInProgress && (
            <motion.div
              key="driver-found"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="flex-1 flex flex-col space-y-4"
            >
              {/* Carte du chauffeur */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-foreground truncate">{driverData?.full_name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{driverData?.rating}</span>
                        </div>
                        <span className="text-sm text-muted-foreground truncate">
                          ({driverData?.total_rides} courses)
                        </span>
                      </div>
                    </div>
                  </div>
                  {driverArriving && (
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-sm text-muted-foreground">Arrive dans</p>
                      <p className="text-3xl font-bold text-secondary">{arrivalTime}</p>
                      <p className="text-xs text-muted-foreground">minute{arrivalTime > 1 ? 's' : ''}</p>
                    </div>
                  )}
                </div>

                {/* Infos véhicule */}
                <div className="bg-white rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex-shrink-0">Véhicule</span>
                    <span className="font-medium truncate ml-2">{driverData?.vehicle?.make} {driverData?.vehicle?.model}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex-shrink-0">Couleur</span>
                    <span className="font-medium truncate ml-2">{driverData?.vehicle?.color}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex-shrink-0">Plaque</span>
                    <span className="font-medium font-mono truncate ml-2">{driverData?.vehicle?.license_plate}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(`tel:${driverData?.phone}`)}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Appeler
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => console.log('Message au chauffeur')}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                </div>
              </div>

              {/* Infos de la course */}
              <div className="bg-white rounded-2xl p-5 shadow-lg border border-border space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-3 h-3 bg-secondary rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Départ</p>
                    <p className="text-foreground">{currentRide?.pickup?.address || 'Gombe, Kinshasa'}</p>
                  </div>
                </div>
                
                <div className="h-6 border-l-2 border-dashed border-border ml-1.5" />
                
                <div className="flex items-start space-x-3">
                  <div className="w-3 h-3 bg-accent rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Destination</p>
                    <p className="text-foreground">{currentRide?.destination?.address || 'Kalamu, Kinshasa'}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground">Prix estimé</span>
                    <span className="text-xl font-bold text-primary">
                      {(currentRide?.estimatedPrice || 17500).toLocaleString()} CDF
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Durée estimée</span>
                    <span className="font-medium">
                      {currentRide?.estimatedDuration || 15} min
                    </span>
                  </div>
                </div>
              </div>

              {/* Bouton annuler */}
              <Button
                variant="outline"
                className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={handleCancelRide}
              >
                Annuler la course
              </Button>
            </motion.div>
          )}

          {/* Course en cours */}
          {rideInProgress && (
            <motion.div
              key="ride-in-progress"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col space-y-4"
            >
              {/* Statut */}
              <div className="bg-gradient-to-r from-secondary to-primary rounded-2xl p-6 text-white text-center">
                <div className="flex justify-center mb-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Navigation className="w-12 h-12" />
                  </motion.div>
                </div>
                <h2 className="text-2xl font-bold mb-2">Course en cours</h2>
                <p className="text-white/90">Votre chauffeur vous conduit à destination</p>
              </div>

              {/* Carte du chauffeur mini */}
              <div className="bg-white rounded-2xl p-4 shadow-lg border border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold">{driverData?.full_name}</p>
                      <p className="text-sm text-muted-foreground">{driverData?.vehicle?.make} {driverData?.vehicle?.model}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(`tel:${driverData?.phone}`)}
                    >
                      <Phone className="w-5 h-5 text-secondary" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => console.log('Message')}
                    >
                      <MessageCircle className="w-5 h-5 text-secondary" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Infos trajet */}
              <div className="bg-white rounded-2xl p-5 shadow-lg border border-border space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-3 h-3 bg-secondary rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Départ</p>
                    <p className="text-foreground">{currentRide?.pickup?.address || 'Gombe, Kinshasa'}</p>
                  </div>
                </div>
                
                <div className="h-6 border-l-2 border-dashed border-border ml-1.5" />
                
                <div className="flex items-start space-x-3">
                  <div className="w-3 h-3 bg-accent rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Destination</p>
                    <p className="text-foreground">{currentRide?.destination?.address || 'Kalamu, Kinshasa'}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Prix de la course</span>
                    <span className="text-2xl font-bold text-primary">
                      {(currentRide?.estimatedPrice || 17500).toLocaleString()} CDF
                    </span>
                  </div>
                </div>
              </div>

              {/* Sélecteur de mode de paiement */}
              <div className="bg-white rounded-2xl p-5 shadow-lg border border-border">
                <h3 className="font-semibold mb-4 text-foreground">Mode de paiement</h3>
                <div className="space-y-3">
                  {/* Mobile Money */}
                  <button
                    onClick={() => setSelectedPaymentMethod('mobile_money')}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-300 flex items-center space-x-4 ${
                      selectedPaymentMethod === 'mobile_money'
                        ? 'border-green-500 bg-green-50'
                        : 'border-border hover:border-green-200 hover:bg-green-50/50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      selectedPaymentMethod === 'mobile_money' ? 'bg-green-500' : 'bg-green-100'
                    }`}>
                      <Smartphone className={`w-6 h-6 ${
                        selectedPaymentMethod === 'mobile_money' ? 'text-white' : 'text-green-600'
                      }`} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-foreground">Mobile Money</p>
                      <p className="text-sm text-muted-foreground">Airtel, M-Pesa, Orange</p>
                    </div>
                    {selectedPaymentMethod === 'mobile_money' && (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>

                  {/* Carte bancaire */}
                  <button
                    onClick={() => setSelectedPaymentMethod('card')}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-300 flex items-center space-x-4 ${
                      selectedPaymentMethod === 'card'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-border hover:border-blue-200 hover:bg-blue-50/50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      selectedPaymentMethod === 'card' ? 'bg-blue-500' : 'bg-blue-100'
                    }`}>
                      <CreditCard className={`w-6 h-6 ${
                        selectedPaymentMethod === 'card' ? 'text-white' : 'text-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-foreground">Carte bancaire</p>
                      <p className="text-sm text-muted-foreground">Visa, Mastercard</p>
                    </div>
                    {selectedPaymentMethod === 'card' && (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>

                  {/* Espèces */}
                  <button
                    onClick={() => setSelectedPaymentMethod('cash')}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-300 flex items-center space-x-4 ${
                      selectedPaymentMethod === 'cash'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-border hover:border-orange-200 hover:bg-orange-50/50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      selectedPaymentMethod === 'cash' ? 'bg-orange-500' : 'bg-orange-100'
                    }`}>
                      <Banknote className={`w-6 h-6 ${
                        selectedPaymentMethod === 'cash' ? 'text-white' : 'text-orange-600'
                      }`} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-foreground">Espèces</p>
                      <p className="text-sm text-muted-foreground">Paiement en liquide</p>
                    </div>
                    {selectedPaymentMethod === 'cash' && (
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>

                  {/* Porte-monnaie */}
                  <button
                    onClick={() => setSelectedPaymentMethod('wallet')}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-300 flex items-center space-x-4 ${
                      selectedPaymentMethod === 'wallet'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-border hover:border-purple-200 hover:bg-purple-50/50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      selectedPaymentMethod === 'wallet' ? 'bg-purple-500' : 'bg-purple-100'
                    }`}>
                      <Wallet className={`w-6 h-6 ${
                        selectedPaymentMethod === 'wallet' ? 'text-white' : 'text-purple-600'
                      }`} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-foreground">Porte-monnaie</p>
                      <p className="text-sm text-muted-foreground">Paiement numérique</p>
                    </div>
                    {selectedPaymentMethod === 'wallet' && (
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
