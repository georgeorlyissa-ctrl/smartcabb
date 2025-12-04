import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { useAppState } from '../../hooks/useAppState';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { TimerControl } from './TimerControl';
import { RideCompletionSummaryDialog } from '../RideCompletionSummaryDialog';
import { EmergencyAlert } from '../EmergencyAlert';
import { FreeWaitingToggle } from '../FreeWaitingToggle';
import { InteractiveMapView } from '../InteractiveMapView';
import { VEHICLE_PRICING, VehicleCategory, calculateHourlyPrice, convertUSDtoCDF } from '../../lib/pricing';
import { 
  Navigation, 
  Phone, 
  MessageCircle, 
  User,
  MapPin,
  CheckCircle,
  Clock,
  Loader
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCDF } from '../../lib/pricing';
import { notifyRideStarted } from '../../lib/sms-service';

export function NavigationScreen() {
  const { setCurrentScreen, updateRide, state } = useAppState();
  const [phase, setPhase] = useState<'pickup' | 'destination'>('pickup');
  const [timeToPickup, setTimeToPickup] = useState(5);
  const [isTimerDisabled, setIsTimerDisabled] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentCost, setCurrentCost] = useState(0);
  const [waitingTime, setWaitingTime] = useState(0);
  const [freeWaitingDisabled, setFreeWaitingDisabled] = useState(false);
  const [waitingTimeFrozen, setWaitingTimeFrozen] = useState<number | null>(null);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [billingStartTime, setBillingStartTime] = useState<number | null>(null);
  const [billingElapsedTime, setBillingElapsedTime] = useState(0);

  useEffect(() => {
    // Simulate arrival at pickup
    const pickupTimer = setTimeout(() => {
      setPhase('destination');
      toast.success('Passager récupéré !');
    }, 8000);

    // Update time countdown
    const timeTimer = setInterval(() => {
      setTimeToPickup(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      clearTimeout(pickupTimer);
      clearInterval(timeTimer);
    };
  }, []);

  // Waiting time logic (starts immediately when pickup phase ends)
  // IMPORTANT: Se bloque quand l'attente gratuite est désactivée
  useEffect(() => {
    if (phase === 'destination' && waitingTimeFrozen === null) {
      const interval = setInterval(() => {
        setWaitingTime(prev => {
          // Si l'attente gratuite est désactivée et qu'on est encore dans les 10 min
          // on bloque le compteur à sa valeur actuelle
          if (freeWaitingDisabled && prev < 600) {
            return prev; // Bloqué !
          }
          return prev + 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [phase, freeWaitingDisabled, waitingTimeFrozen]);

  // NOUVEAU : Chrono de facturation (actif quand attente gratuite désactivée OU après 10 min)
  useEffect(() => {
    const isBillingActive = freeWaitingDisabled || waitingTime >= 600;
    
    // Démarrer automatiquement le chrono quand on atteint 10 minutes
    if (phase === 'destination' && waitingTime >= 600 && !billingStartTime && !freeWaitingDisabled) {
      const startTime = Date.now();
      setBillingStartTime(startTime);
      if (updateRide && state.currentRide?.id) {
        updateRide(state.currentRide.id, {
          billingStartTime: startTime,
          billingElapsedTime: 0
        });
      }
      console.log('🚀 Chrono de facturation démarré automatiquement (10 minutes atteintes)');
    }
    
    if (phase === 'destination' && isBillingActive && !isTimerDisabled && billingStartTime) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - billingStartTime) / 1000);
        setBillingElapsedTime(elapsed);
        
        // Synchroniser avec le state global
        if (updateRide && state.currentRide?.id) {
          updateRide(state.currentRide.id, {
            billingElapsedTime: elapsed
          });
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [phase, freeWaitingDisabled, waitingTime, billingStartTime, isTimerDisabled, updateRide, state.currentRide?.id]);

  // Timer logic for billing - NOUVEAU : Calcul basé sur billingElapsedTime
  useEffect(() => {
    if (phase === 'destination' && !isTimerDisabled) {
      const interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [phase, isTimerDisabled]);

  // Calcul du coût en temps réel basé sur billingElapsedTime - NOUVEAU SYSTÈME PAR PALIERS
  useEffect(() => {
    // Récupérer la catégorie du véhicule depuis la course actuelle
    const vehicleCategory = (state.currentRide?.vehicleType?.toLowerCase().replace(' ', '_') || 'smart_confort') as VehicleCategory;
    
    // Calculer le prix selon le nouveau système horaire
    const hours = billingElapsedTime / 3600; // Convertir secondes en heures
    const currentHour = new Date().getHours();
    const pricing = VEHICLE_PRICING[vehicleCategory];
    
    // Calculer le prix en USD puis convertir en CDF
    const priceUSD = calculateHourlyPrice(vehicleCategory, hours, currentHour, false);
    const totalCost = priceUSD ? convertUSDtoCDF(priceUSD) : 0;
    
    setCurrentCost(totalCost);
    
    console.log(`💰 CALCUL TARIFICATION 2025:`);
    console.log(`   Catégorie: ${pricing.displayName}`);
    console.log(`   Temps écoulé: ${billingElapsedTime}s (${Math.floor(billingElapsedTime / 60)}min ${billingElapsedTime % 60}s)`);
    console.log(`   Heures: ${(hours || 0).toFixed(2)}h`);
    console.log(`   Période: ${currentHour >= 6 && currentHour <= 20 ? 'Jour' : 'Nuit'}`);
    console.log(`   Tarif horaire: $${currentHour >= 6 && currentHour <= 20 ? pricing.hourlyRateDay : pricing.hourlyRateNight}/h`);
    console.log(`   💵 TOTAL: ${totalCost.toLocaleString()} CDF ($${priceUSD})`);
  }, [billingElapsedTime, state.currentRide?.vehicleType]);

  const handleCompleteRide = () => {
    // ARRÊTER TOUS LES TIMERS
    // Le chrono et le prix doivent se figer à leur valeur actuelle
    
    if (updateRide && state.currentRide?.id) {
      updateRide(state.currentRide.id, {
        actualPrice: currentCost,
        timerDisabled: true, // Désactiver le timer pour arrêter le comptage
        freeWaitingDisabled: freeWaitingDisabled,
        waitingTime: waitingTime,
        waitingTimeFrozen: waitingTimeFrozen,
        elapsedTime: elapsedTime,
        billingElapsedTime: billingElapsedTime, // Figer le temps de facturation
        completedAt: new Date().toISOString()
      });
    }
    
    // Figer les états locaux pour empêcher tout changement
    setIsTimerDisabled(true);
    setBillingStartTime(null); // Arrêter le chrono de facturation
    
    setShowCompletionDialog(true);
    
    toast.success('Course terminée !', {
      description: `Montant final : ${currentCost.toLocaleString()} CDF`
    });
  };

  const handleCallPassenger = () => {
    toast.info('Appel du passager...');
  };

  const handleMessagePassenger = () => {
    toast.info('Envoi d\'un message...');
  };

  const handleTimerToggle = (disabled: boolean) => {
    setIsTimerDisabled(disabled);
    if (updateRide && state.currentRide?.id) {
      updateRide(state.currentRide.id, {
        timerDisabled: disabled
      });
    }
  };

  const handleDisableFreeWaiting = async () => {
    const newState = !freeWaitingDisabled;
    setFreeWaitingDisabled(newState);
    
    // Quand on désactive l'attente gratuite, on gèle le compteur de temps d'attente
    if (newState && waitingTime < 600) {
      setWaitingTimeFrozen(waitingTime);
      // NOUVEAU : Démarrer le chrono de facturation
      setBillingStartTime(Date.now());
      setBillingElapsedTime(0);
      console.log(`⏸️ Temps d'attente gelé à ${waitingTime}s (${Math.floor(waitingTime / 60)}min ${waitingTime % 60}s)`);
      console.log(`🚀 Chrono de facturation démarré !`);
      
      // 📱 SMS: Notification de démarrage de course au passager
      if (state.currentRide && state.currentDriver) {
        try {
          await notifyRideStarted(
            state.currentUser?.phone || '+243999999999', // Téléphone du passager
            state.currentDriver.phone || '+243999999999', // Téléphone du conducteur
            state.currentUser?.name || 'Passager',
            state.currentDriver.name,
            state.currentRide.destination.address
          );
          console.log('✅ SMS démarrage de course envoyé au passager (attente gratuite désactivée)');
        } catch (error) {
          console.error('❌ Erreur envoi SMS démarrage:', error);
        }
      }
    } else if (!newState) {
      // Quand on réactive, on dégèle le compteur
      setWaitingTimeFrozen(null);
      // NOUVEAU : Arrêter le chrono de facturation
      setBillingStartTime(null);
      setBillingElapsedTime(0);
      console.log('▶️ Temps d\'attente dégelé - Compteur reprend');
      console.log('⏹️ Chrono de facturation arrêté');
    }
    
    if (updateRide && state.currentRide?.id) {
      updateRide(state.currentRide.id, {
        freeWaitingDisabled: newState,
        waitingTimeFrozen: newState ? waitingTime : null,
        billingStartTime: newState ? Date.now() : null,
        billingElapsedTime: 0
      });
    }
    
    // Message de confirmation
    if (newState) {
      toast.warning('Attente gratuite désactivée', {
        description: `Compteur bloqué à ${Math.floor(waitingTime / 60)}min ${waitingTime % 60}s - Facturation commence maintenant`
      });
    } else {
      toast.success('Attente gratuite réactivée', {
        description: 'Les 10 minutes gratuites recommencent à compter'
      });
    }
  };

  const handleOfferPostpaid = () => {
    if (updateRide && state.currentRide?.id) {
      updateRide(state.currentRide.id, {
        paymentMethod: 'postpaid',
        paymentDetails: {
          ...state.currentRide.paymentDetails,
          interestRate: 15
        }
      });
    }
    toast.success('Option post payé envoyée au passager');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-white flex flex-col"
    >
      {/* Status Bar */}
      <div className={`p-4 text-white ${phase === 'pickup' ? 'bg-blue-500' : 'bg-green-500'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Navigation className="w-5 h-5" />
            <span className="font-semibold">
              {phase === 'pickup' ? 'Vers le passager' : 'Vers la destination'}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{phase === 'pickup' ? `${timeToPickup} min` : '8 min'}</span>
          </div>
        </div>
      </div>

      {/* Map - Carte réduite pour voir les infos sans scroller */}
      <div className="relative h-[45vh] max-h-[450px]">
        <InteractiveMapView
          center={state.currentRide?.pickup}
          markers={state.currentRide ? [
            state.currentRide.pickup,
            state.currentRide.destination
          ] : []}
          zoom={14}
          className="w-full h-full"
          showUserLocation={true}
          enableGeolocation={true}
        />
        
        {/* GPS Coordinates overlay */}
        {state.currentRide && (
          <div className="absolute top-20 left-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg text-xs space-y-1 pointer-events-none z-[1001]">
            <div className="flex items-center">
              <MapPin className="w-3 h-3 mr-1 text-blue-400" />
              <span>Départ: {state.currentRide.pickup.address.substring(0, 30)}...</span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-3 h-3 mr-1 text-red-400" />
              <span>Arrivée: {state.currentRide.destination.address.substring(0, 30)}...</span>
            </div>
          </div>
        )}
        
        {/* Your location */}
        <motion.div
          animate={{ 
            x: phase === 'pickup' ? [0, 20, 40] : [40, 60, 80],
            y: phase === 'pickup' ? [0, -10, -20] : [-20, -30, -40]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        >
          <div className="w-6 h-6 bg-yellow-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
            <Navigation className="w-3 h-3 text-white" />
          </div>
        </motion.div>
      </div>

      {/* Trip Info Panel */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="bg-white rounded-t-3xl shadow-2xl p-6"
      >
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6" />

        {/* Passenger Info */}
        <div className="flex items-center justify-between mb-6">
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setCurrentScreen('client-info')}
          >
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold">Grace-Divine Kambamba</h3>
              <div className="flex items-center space-x-1">
                <span className="text-sm text-gray-600">4.9</span>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div key={star} className="w-3 h-3 bg-yellow-400 rounded-full" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-blue-600">Voir les infos client</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={handleCallPassenger}
              variant="outline"
              size="icon"
              className="w-10 h-10"
            >
              <Phone className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleMessagePassenger}
              variant="outline"
              size="icon"
              className="w-10 h-10"
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Destination Info */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start space-x-3">
            <div className={`w-3 h-3 rounded-full mt-2 ${phase === 'pickup' ? 'bg-blue-500' : 'bg-green-500'}`} />
            <div>
              <p className="text-sm text-gray-600">
                {phase === 'pickup' ? 'Récupérer le passager' : 'Départ'}
              </p>
              <p className="font-semibold">Boulevard du 30 Juin, Gombe, Kinshasa</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-3 h-3 bg-red-500 rounded-full mt-2" />
            <div>
              <p className="text-sm text-gray-600">Destination</p>
              <p className="font-semibold">Marché Central, Kalamu, Kinshasa</p>
            </div>
          </div>
        </div>

        {/* Trip Details */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Distance</p>
              <p className="font-semibold">8.7 km</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tarif</p>
              <p className="font-semibold">{currentCost.toLocaleString()} CDF</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Durée</p>
              <p className="font-semibold">25 min</p>
            </div>
          </div>
        </div>

        {/* Timer Control - TOUJOURS VISIBLE pour le conducteur */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          {phase === 'pickup' ? (
            // Pendant l'approche du passager
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <div className="text-center">
                <h3 className="font-semibold text-blue-800 mb-2">En route vers le passager</h3>
                <p className="text-sm text-blue-600">Le chrono d'attente démarrera une fois arrivé</p>
              </div>
            </div>
          ) : (
            // Une fois le passager récupéré - Contrôles complets
            <TimerControl
              isTimerActive={phase === 'destination'}
              isTimerDisabled={isTimerDisabled}
              onTimerToggle={handleTimerToggle}
              onOfferPostpaid={handleOfferPostpaid}
              onDisableFreeWaiting={handleDisableFreeWaiting}
              currentCost={currentCost}
              elapsedTime={elapsedTime}
              freeWaitingDisabled={freeWaitingDisabled}
              waitingTime={waitingTime}
              billingElapsedTime={billingElapsedTime}
            />
          )}
        </motion.div>

        {/* Action Button */}
        {phase === 'pickup' ? (
          <Button
            onClick={() => {
              setPhase('destination');
              toast.success('Passager récupéré !');
            }}
            className="w-full h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Passager récupéré
          </Button>
        ) : (
          <Button
            onClick={handleCompleteRide}
            className="w-full h-14 bg-green-500 hover:bg-green-600 text-white rounded-xl"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Course terminée
          </Button>
        )}
      </motion.div>

      {/* Ride Completion Dialog */}
      <RideCompletionSummaryDialog
        isOpen={showCompletionDialog}
        onClose={() => {
          setShowCompletionDialog(false);
          toast.success('Course terminée !');
          setCurrentScreen('earnings');
        }}
        userType="driver"
        rideData={{
          duration: elapsedTime,
          distance: 8.7, // km - could be calculated or passed from props
          baseCost: Math.round(currentCost * 0.3), // Estimation : ~30% du coût total
          waitingTime: waitingTime,
          waitingCost: Math.round(currentCost * 0.7), // Estimation : ~70% du coût total (course elle-même)
          totalCost: currentCost,
          freeWaitingDisabled: freeWaitingDisabled,
          billingElapsedTime: billingElapsedTime, // NOUVEAU : temps de facturation figé
          passengerName: 'Grace-Divine Kambamba',
          vehicleType: state.currentRide?.vehicleType || 'Smart Confort',
          startLocation: 'Boulevard du 30 Juin, Gombe, Kinshasa',
          endLocation: 'Marché Central, Kalamu, Kinshasa'
        }}
      />
    </motion.div>
  );
}