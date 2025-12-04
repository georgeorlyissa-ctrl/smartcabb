import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { useAppState } from '../../hooks/useAppState';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { WelcomeDialog } from '../WelcomeDialog';
import { RideTimer } from '../RideTimer';
import { RideCompletionDialog } from '../RideCompletionDialog';
import { RideCompletionSummaryDialog } from '../RideCompletionSummaryDialog';
import { EmergencyAlert } from '../EmergencyAlert';
import { CancellationCompensation } from '../CancellationCompensation';
import { CancelRideReasonModal } from './CancelRideReasonModal';
import { InteractiveMapView } from '../InteractiveMapView';
import { 
  Phone, 
  MessageCircle, 
  X, 
  MapPin, 
  Clock,
  Star,
  Navigation,
  User,
  Check,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Timer,
  CreditCard,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';

export function RideTrackingScreen() {
  const { state, setCurrentScreen, updateRide, drivers } = useAppState();
  const [rideStatus, setRideStatus] = useState<'searching' | 'accepted' | 'arriving' | 'in_progress'>('searching');
  const [estimatedArrival, setEstimatedArrival] = useState(5);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showCancelReasonModal, setShowCancelReasonModal] = useState(false);
  const [selectedCancelReason, setSelectedCancelReason] = useState('');
  const [customCancelReason, setCustomCancelReason] = useState('');
  const [waitingTimeExceeded, setWaitingTimeExceeded] = useState(false);
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(true);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const [rideStartTime, setRideStartTime] = useState<Date | null>(null);
  const [totalCost, setTotalCost] = useState(0);
  const [rideDuration, setRideDuration] = useState(0);
  const [waitingTime, setWaitingTime] = useState(0);
  const [freeWaitingDisabled, setFreeWaitingDisabled] = useState(false);
  const [isBillingActive, setIsBillingActive] = useState(false);
  const [billingElapsedTime, setBillingElapsedTime] = useState(0);

  // Debugging logs
  console.log('RideTrackingScreen state:', {
    currentRide: state.currentRide,
    rideStatus,
    user: state.currentUser,
    isBillingActive,
    billingElapsedTime
  });

  // Gérer la redirection quand la course est termine
  useEffect(() => {
    if (state.currentRide?.status === 'ride_completed') {
      console.log('Ride completed, redirecting to ride-completed screen');
      // Petit délai pour que l'utilisateur voie le message de confirmation
      setTimeout(() => {
        setCurrentScreen('ride-completed');
      }, 1500);
      return;
    }
  }, [state.currentRide?.status, setCurrentScreen]);

  // Simulate driver assignment and ride progression
  useEffect(() => {
    if (!state.currentRide?.id) {
      console.log('No current ride found, staying in searching state');
      return;
    }

    // Si la course existe déjà avec un statut, synchroniser l'état local
    if (state.currentRide.status && state.currentRide.status !== 'pending') {
      console.log('Synchronizing with existing ride status:', state.currentRide.status);
      if (state.currentRide.status === 'accepted') {
        setRideStatus('accepted');
      } else if (state.currentRide.status === 'arriving') {
        setRideStatus('arriving');
      } else if (state.currentRide.status === 'in_progress') {
        setRideStatus('in_progress');
        if (state.currentRide.billingStartTime) {
          setRideStartTime(new Date(state.currentRide.billingStartTime));
        }
      } else if (state.currentRide.status === 'ride_completed') {
        // Ne pas continuer la simulation si la course est déjà terminée
        return;
      }
      return;
    }

    console.log('Starting ride progression for ride:', state.currentRide.id);

    const timers: NodeJS.Timeout[] = [];

    // Étape 1: Chauffeur trouvé
    timers.push(setTimeout(async () => {
      console.log('Setting ride status to accepted');
      setRideStatus('accepted');
      if (updateRide && state.currentRide?.id) {
        updateRide(state.currentRide.id, { 
          status: 'accepted', 
          driverId: 'driver1' 
        });
      }
      toast.success('Chauffeur trouvé!');
      
      // Envoi SMS de confirmation de réservation
      if (state.currentUser && state.currentRide) {
        const driver = drivers.find(d => d.id === 'driver1');
        if (driver) {
          // 1. SMS de confirmation de réservation
          await notifyRideConfirmed(
            state.currentUser.phone || '',
            driver.phone || '',
            driver.name,
            state.currentUser.name || state.currentUser.email || 'Passager',
            `${driver.vehicleModel} - ${driver.licensePlate}`,
            state.currentRide.pickup?.address || state.currentRide.pickupAddress || 'Point de depart',
            state.currentRide.destination?.address || state.currentRide.destinationAddress || 'Destination',
            state.currentRide.vehicleCategory || 'Standard',
            estimatedArrival.toString()
          ).catch(err => console.error('Erreur envoi SMS confirmation:', err));
          
          // 2. 📱 NOUVEAU: SMS avec le code de confirmation à 4 chiffres
          if (state.currentRide.confirmationCode) {
            await notifyConfirmationCode(
              state.currentUser.phone || '',
              state.currentRide.confirmationCode,
              driver.name
            ).catch(err => console.error('Erreur envoi SMS code confirmation:', err));
            console.log('✅ Code de confirmation envoyé au passager:', state.currentRide.confirmationCode);
          }
        }
      }
    }, 3000));

    // Étape 2: Chauffeur en route
    timers.push(setTimeout(() => {
      console.log('Setting ride status to arriving');
      setRideStatus('arriving');
      if (updateRide && state.currentRide?.id) {
        updateRide(state.currentRide.id, { 
          status: 'arriving'
        });
      }
      toast.info('Le chauffeur arrive');
    }, 8000));

    // Étape 3: Chauffeur arrivé
    timers.push(setTimeout(async () => {
      console.log('Driver arrived at pickup location');
      toast.info('Le chauffeur est arrivé à votre position');
      
      // Envoi SMS d'arrivée du conducteur
      if (state.currentUser && state.currentRide) {
        const driver = drivers.find(d => d.id === state.currentRide.driverId);
        if (driver) {
          await notifyDriverArrived(
            state.currentUser.phone || '',
            driver.name,
            `${driver.vehicleModel} - ${driver.licensePlate}`
          ).catch(err => console.error('Erreur envoi SMS arrivée:', err));
        }
      }
    }, 15000));

    // Étape 4: Course démarrée
    timers.push(setTimeout(async () => {
      console.log('Setting ride status to in_progress');
      const startTime = new Date();
      setRideStatus('in_progress');
      setRideStartTime(startTime);
      if (updateRide && state.currentRide?.id) {
        updateRide(state.currentRide.id, { 
          status: 'in_progress',
          billingStartTime: startTime
        });
      }
      toast.success('Course démarrée');
      
      // Envoi SMS de démarrage de course
      if (state.currentUser && state.currentRide) {
        const driver = drivers.find(d => d.id === state.currentRide.driverId);
        if (driver) {
          await notifyRideStarted(
            state.currentUser.phone || '',
            driver.phone || '',
            state.currentUser.name || state.currentUser.email || 'Passager',
            driver.name,
            state.currentRide.destinationAddress || 'Destination'
          ).catch(err => console.error('Erreur envoi SMS démarrage:', err));
        }
      }
    }, 22000));

    // Update estimated arrival time and check waiting time exceeded
    const arrivalTimer = setInterval(() => {
      setEstimatedArrival(prev => {
        const newValue = Math.max(0, prev - 1);
        // Si le temps d'attente dépasse 10 minutes (600 secondes), le passager ne peut plus annuler sans amende
        if (prev > 0 && newValue === 0 && rideStatus === 'arriving') {
          setWaitingTimeExceeded(true);
        }
        return newValue;
      });
    }, 6000);

    return () => {
      timers.forEach(timer => clearTimeout(timer));
      clearInterval(arrivalTimer);
    };
  }, [state.currentRide?.id, state.currentRide?.status, updateRide]);

  // Synchroniser l'état de facturation avec le conducteur
  useEffect(() => {
    if (state.currentRide && rideStatus === 'in_progress') {
      // Mettre à jour le temps d'attente depuis la course
      if (state.currentRide.waitingTime !== undefined) {
        setWaitingTime(state.currentRide.waitingTime);
      }
      
      // Mettre à jour l'état de désactivation de l'attente gratuite
      if (state.currentRide.freeWaitingDisabled !== undefined) {
        setFreeWaitingDisabled(state.currentRide.freeWaitingDisabled);
      }
      
      // NOUVEAU : Synchroniser le temps de facturation écoulé
      if (state.currentRide.billingElapsedTime !== undefined) {
        setBillingElapsedTime(state.currentRide.billingElapsedTime);
      }
      
      // Déterminer si la facturation est active
      const billingActive = (state.currentRide.waitingTime || 0) >= 600 || state.currentRide.freeWaitingDisabled;
      if (billingActive !== isBillingActive) {
        setIsBillingActive(billingActive);
        
        // Toast pour informer le passager
        if (billingActive && !isBillingActive) {
          if (state.currentRide.freeWaitingDisabled) {
            toast.warning('💰 Facturation commencée', {
              description: 'Le conducteur a désactivé l\'attente gratuite'
            });
          } else {
            toast.info('💰 Facturation commencée', {
              description: 'Les 10 minutes d\'attente gratuite sont épuisées'
            });
          }
        }
      }
    }
  }, [state.currentRide, rideStatus, isBillingActive]);

  // Auto-complete ride after some time
  useEffect(() => {
    if (rideStatus === 'in_progress' && rideStartTime && state.currentRide?.id) {
      const completeTimer = setTimeout(async () => {
        const endTime = new Date();
        const duration = (endTime.getTime() - rideStartTime.getTime()) / 60000;
        const finalPrice = Math.max(totalCost, state.currentRide?.estimatedPrice || 12500);
        
        console.log('Completing ride automatically');
        updateRide(state.currentRide.id, { 
          status: 'ride_completed',
          completedAt: endTime,
          actualPrice: finalPrice,
          duration: Math.round(duration)
        });
        
        setRideDuration(duration);
        toast.success('Course terminée !');
        
        // Envoi SMS de fin de course avec montant
        if (state.currentUser && state.currentRide) {
          const driver = drivers.find(d => d.id === state.currentRide.driverId);
          if (driver) {
            const durationStr = `${Math.round(duration)} min`;
            await notifyRideCompleted(
              state.currentUser.phone || '',
              driver.phone || '',
              finalPrice,
              durationStr
            ).catch(err => console.error('Erreur envoi SMS fin de course:', err));
          }
        }
      }, 15000);

      return () => clearTimeout(completeTimer);
    }
  }, [rideStatus, rideStartTime, totalCost, state.currentRide?.id, state.currentRide?.estimatedPrice, updateRide, setCurrentScreen, state.currentUser, drivers]);

  const handleCancelRide = async () => {
    // Fermer les modals
    setShowCancelReasonModal(false);
    setShowCancelConfirm(false);
    
    if (state.currentRide?.id) {
      let penaltyAmount = 0;
      const cancelReason = selectedCancelReason === 'Autre' ? customCancelReason : selectedCancelReason;
      
      // Si le temps d'attente est dépassé, appliquer une amende de 50%
      if (waitingTimeExceeded && rideStatus === 'arriving') {
        penaltyAmount = Math.round((state.currentRide.estimatedPrice || 0) * 0.5);
        updateRide(state.currentRide.id, { 
          status: 'cancelled',
          penaltyAmount,
          cancellationReason: cancelReason || 'Annulation tardive - Amende de 50%'
        });
        toast.error(`Course annulée avec amende de ${penaltyAmount.toLocaleString()} CDF (50% du prix)`);
      } else {
        updateRide(state.currentRide.id, { status: 'cancelled', cancellationReason: cancelReason });
        toast.success('Course annulée');
      }
      
      // Envoi SMS d'annulation
      if (state.currentUser && state.currentRide) {
        const driver = drivers.find(d => d.id === state.currentRide.driverId);
        if (driver) {
          await notifyRideCancelled(
            state.currentUser.phone || '',
            driver.phone || '',
            state.currentUser.name || state.currentUser.email || 'Passager',
            driver.name,
            cancelReason
          ).catch(err => console.error('Erreur envoi SMS annulation:', err));
        }
      }
      
      setCurrentScreen('map');
    }
  };

  const assignedDriver = drivers.find(d => d.id === state.currentRide?.driverId);

  // Gérer la redirection si aucune course n'est trouvée
  useEffect(() => {
    if (!state.currentRide) {
      console.log('No current ride, setting timer for redirect');
      const redirectTimer = setTimeout(() => {
        console.log('No current ride found after delay, redirecting to map');
        setCurrentScreen('map');
      }, 5000); // Délai réduit

      return () => clearTimeout(redirectTimer);
    }
  }, [state.currentRide, setCurrentScreen]);

  // Si aucune course n'est en cours, afficher le loader
  if (!state.currentRide) {
    console.log('No current ride found, showing loading state');
    
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-white flex flex-col items-center justify-center p-6"
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <h2 className="text-xl mb-4">Préparation de votre course...</h2>
          <p className="text-gray-600 mb-6">Veuillez patienter un instant.</p>
          <p className="text-sm text-gray-400">Redirection automatique dans quelques secondes...</p>
        </div>
      </motion.div>
    );
  }

  const getStatusMessage = () => {
    // Priorité au statut de la course depuis l'état global
    if (state.currentRide?.status === 'ride_completed') {
      return 'Course terminée ! Redirection...';
    }
    
    switch (rideStatus) {
      case 'searching':
        return 'Recherche d\'un chauffeur...';
      case 'accepted':
        return `${assignedDriver?.name || 'Chauffeur'} arrive dans ${estimatedArrival} min`;
      case 'arriving':
        return 'Le chauffeur est arrivé';
      case 'in_progress':
        return 'Course en cours...';
      default:
        return 'En attente...';
    }
  };

  const handleTimeUpdate = (minutes: number, cost: number) => {
    setTotalCost(cost);
  };

  const handleRateRide = (rating: number) => {
    if (state.currentRide?.id) {
      updateRide(state.currentRide.id, { rating });
    }
    setShowCompletionDialog(false);
    setShowSummaryDialog(false);
    setCurrentScreen('map');
  };

  const handleTip = (amount: number) => {
    if (state.currentRide?.id) {
      updateRide(state.currentRide.id, { 
        tip: amount,
        actualPrice: (state.currentRide.actualPrice || 0) + amount
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-white flex flex-col relative"
    >
      {/* Map Area - Carte Interactive OpenStreetMap */}
      <div className="flex-1 relative">
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
        
        {/* Emergency Alert Button */}
        <div className="absolute top-4 right-4 z-10">
          <EmergencyAlert userType="passenger" />
        </div>
        
        {/* Status badge overlay */}
        {state.currentRide && (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg">
            <div className="flex items-center gap-2">
              {rideStatus === 'searching' && (
                <>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                  <span className="text-sm">Recherche de conducteur...</span>
                </>
              )}
              {rideStatus === 'accepted' && (
                <>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-sm">Conducteur en route</span>
                </>
              )}
              {rideStatus === 'arriving' && (
                <>
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                  <span className="text-sm">Conducteur arrive</span>
                </>
              )}
              {rideStatus === 'in_progress' && (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm">Course en cours</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Status Panel */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="bg-white rounded-t-3xl shadow-2xl p-6"
      >
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6" />

        {/* Timer for active ride */}
        {rideStatus === 'in_progress' && rideStartTime && (
          <div className="mb-4">
            <RideTimer
              isActive={true}
              startTime={rideStartTime}
              hourlyRate={state.currentRide?.hourlyRate || 7}
              onTimeUpdate={handleTimeUpdate}
              showWaitingTime={true}
            />
          </div>
        )}

        {/* Status */}
        <div className="text-center mb-6">
          <h2 className="text-lg mb-2">{getStatusMessage()}</h2>
          {rideStatus === 'searching' && (
            <div className="flex flex-col items-center space-y-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full"
              />
              <p className="text-sm text-gray-500">Connexion avec les chauffeurs disponibles...</p>
            </div>
          )}
        </div>

        {/* Driver Info */}
        {rideStatus !== 'searching' && assignedDriver && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  {assignedDriver.photo ? (
                    <img 
                      src={assignedDriver.photo} 
                      alt={assignedDriver.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-gray-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{assignedDriver.name}</h3>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-600">{assignedDriver.rating}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {assignedDriver.vehicleInfo.color} {assignedDriver.vehicleInfo.make} {assignedDriver.vehicleInfo.model}
                  </p>
                  <p className="text-sm font-mono">{assignedDriver.vehicleInfo.plate}</p>
                  {state.currentRide?.confirmationCode && rideStatus === 'arriving' && (
                    <p className="text-sm font-bold text-green-600">
                      Code: {state.currentRide.confirmationCode}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="w-10 h-10"
                >
                  <Phone className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-10 h-10"
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Billing Alert - Shown when billing is active */}
        {rideStatus === 'in_progress' && isBillingActive && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="mb-6 bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 rounded-xl shadow-lg border-2 border-red-600"
          >
            <div className="flex items-center justify-center space-x-2 mb-3">
              <DollarSign className="w-6 h-6 animate-pulse" />
              <span className="font-bold text-lg">💰 FACTURATION EN COURS</span>
              <DollarSign className="w-6 h-6 animate-pulse" />
            </div>
            
            {freeWaitingDisabled ? (
              <div className="text-center space-y-1 mb-3">
                <p className="text-sm font-medium">
                  Attente gratuite désactivée par le conducteur
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <Timer className="w-4 h-4" />
                  <span>Temps d'attente gelé : {Math.floor(waitingTime / 60)}min {waitingTime % 60}s</span>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-1 mb-3">
                <p className="text-sm font-medium">
                  Les 10 minutes d'attente gratuite sont épuisées
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Temps dépassé : {Math.floor((waitingTime - 600) / 60)}min {(waitingTime - 600) % 60}s</span>
                </div>
              </div>
            )}
            
            {/* NOUVEAU : Chrono de facturation en temps réel */}
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3 mb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">Temps écoulé:</span>
                </div>
                <span className="font-mono text-2xl font-bold">
                  {Math.floor(billingElapsedTime / 60)}:{(billingElapsedTime % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center">
              <p className="text-xs font-medium">
                La facturation est maintenant basée sur le temps de trajet
              </p>
            </div>
          </motion.div>
        )}

        {/* Trip Info */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">
              {rideStatus === 'in_progress' ? 'Coût actuel' : 'Prix estimé'}
            </span>
            <span className="font-semibold">
              {rideStatus === 'in_progress' && totalCost > 0 
                ? totalCost.toLocaleString() 
                : state.currentRide?.estimatedPrice?.toLocaleString()
              } CDF
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Durée estimée</span>
            <span className="font-semibold">{state.currentRide?.estimatedDuration} min</span>
          </div>
          {state.currentRide?.vehicleType && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Type de véhicule</span>
              <span className="font-semibold capitalize">
                {state.currentRide.vehicleType.replace('_', ' ')}
              </span>
            </div>
          )}
          
          {/* Waiting time info - shown during in_progress */}
          {rideStatus === 'in_progress' && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center space-x-1">
                <Timer className="w-4 h-4" />
                <span>Temps d'attente</span>
              </span>
              <span className={`font-semibold ${isBillingActive ? 'text-red-600' : 'text-green-600'}`}>
                {Math.floor(waitingTime / 60)}min {waitingTime % 60}s
                {!isBillingActive && ' 🆓'}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        {rideStatus !== 'in_progress' && state.currentRide?.status !== 'ride_completed' && (
          <div className="space-y-3">
            {/* Warning about penalty */}
            {waitingTimeExceeded && rideStatus === 'arriving' && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-700">
                  <span className="font-medium">Attention :</span> L'annulation maintenant entraînera une amende de 50% du prix de la course ({Math.round((state.currentRide?.estimatedPrice || 0) * 0.5).toLocaleString()} CDF).
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={() => setShowCancelReasonModal(true)}
              variant="destructive"
              className="w-full h-12 rounded-xl"
            >
              <X className="w-4 h-4 mr-2" />
              {waitingTimeExceeded && rideStatus === 'arriving' ? 'Annuler (avec amende)' : 'Annuler la course'}
            </Button>
          </div>
        )}

        {/* Debug/Dépannage - bouton de secours */}
        {state.currentRide?.status === 'ride_completed' && (
          <div className="space-y-3">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Course terminée avec succès ! Redirection en cours...
              </AlertDescription>
            </Alert>
            
            <Button
              onClick={() => setCurrentScreen('ride-completed')}
              className="w-full h-12 rounded-xl bg-green-500 hover:bg-green-600"
            >
              <Check className="w-4 h-4 mr-2" />
              Continuer manuellement
            </Button>
          </div>
        )}

        {rideStatus === 'in_progress' && (
          <Alert className="border-green-200 bg-green-50">
            <Clock className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Course en cours. Vous arriverez bientôt à destination.
            </AlertDescription>
          </Alert>
        )}
      </motion.div>

      {/* Cancel Reason Modal - NEW */}
      <CancelRideReasonModal
        isOpen={showCancelReasonModal}
        onClose={() => {
          setShowCancelReasonModal(false);
          setSelectedCancelReason('');
          setCustomCancelReason('');
        }}
        onConfirm={(reason) => {
          setSelectedCancelReason(reason);
          handleCancelRide();
        }}
        hasPenalty={waitingTimeExceeded && rideStatus === 'arriving'}
        penaltyAmount={Math.round((state.currentRide?.estimatedPrice || 0) * 0.5)}
      />

      {/* Cancel Confirmation */}
      {showCancelConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-sm"
          >
            <h3 className="text-lg mb-4">Annuler la course ?</h3>
            <p className="text-gray-600 mb-4">
              Êtes-vous sûr de vouloir annuler cette course ?
            </p>
            {waitingTimeExceeded && rideStatus === 'arriving' && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-orange-800">Amende d'annulation</p>
                    <p className="text-xs text-orange-700">
                      Une amende de {Math.round((state.currentRide?.estimatedPrice || 0) * 0.5).toLocaleString()} CDF (50% du prix) sera appliquée pour cette annulation tardive.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex space-x-3">
              <Button
                onClick={() => setShowCancelConfirm(false)}
                variant="outline"
                className="flex-1"
              >
                Retour
              </Button>
              <Button
                onClick={handleCancelRide}
                variant="destructive"
                className="flex-1"
              >
                Annuler
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Welcome Dialog */}
      <WelcomeDialog
        isOpen={showWelcomeDialog}
        onClose={() => setShowWelcomeDialog(false)}
        userName={state.currentUser?.name || 'Utilisateur'}
        estimatedArrival={estimatedArrival}
      />

      {/* Completion Dialog */}
      <RideCompletionDialog
        isOpen={showCompletionDialog}
        onClose={() => {
          setShowCompletionDialog(false);
          setCurrentScreen('map');
        }}
        totalCost={totalCost || state.currentRide?.actualPrice || 0}
        duration={rideDuration}
        onRateRide={handleRateRide}
      />

      {/* Ride Summary Dialog */}
      <RideCompletionSummaryDialog
        isOpen={showSummaryDialog}
        onClose={() => {
          setShowSummaryDialog(false);
          // Rediriger vers l'écran de confirmation de course terminée
          setCurrentScreen('ride-completed');
        }}
        userType="passenger"
        rideData={{
          duration: (rideDuration * 60) || (state.currentRide?.duration ? state.currentRide.duration * 60 : 900), // Convertir en secondes
          distance: 8.7, // km - pourrait être calculé
          baseCost: 15000, // Coût de base Smart Confort
          waitingTime: waitingTime || 0,
          waitingCost: freeWaitingDisabled ? 
            Math.floor((waitingTime / 3600) * 20000) : 
            Math.floor(Math.max(0, waitingTime - 600) / 3600 * 20000),
          totalCost: state.currentRide?.actualPrice || totalCost || 15000,
          freeWaitingDisabled: freeWaitingDisabled,
          driverName: assignedDriver?.name || 'Pierre Kabamba',
          vehicleType: (state.currentRide?.vehicleType?.replace('_', ' ') as any) || 'Smart Confort',
          startLocation: 'Boulevard du 30 Juin, Gombe, Kinshasa',
          endLocation: 'Marché Central, Kalamu, Kinshasa'
        }}
        onRateRide={handleRateRide}
        onTip={handleTip}
      />
    </motion.div>
  );
}