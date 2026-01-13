import { useState, useEffect } from 'react';
import { toast } from '../../lib/toast';
import { motion } from '../../lib/motion';
import { Button } from '../ui/button';
import { Phone, MessageCircle, Clock, DollarSign, CheckCircle } from '../../lib/icons';
import { TimerControl } from './TimerControl';
import { RideCompletionSummaryDialog } from '../RideCompletionSummaryDialog';

interface NavigationScreenProps {
  onBack: () => void;
}

export function NavigationScreen({ onBack }: NavigationScreenProps) {
  const { state, setCurrentScreen, updateRide, updateDriver } = useAppState();
  const [phase, setPhase] = useState<'pickup' | 'destination'>('pickup');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentCost, setCurrentCost] = useState(0);
  const [isTimerDisabled, setIsTimerDisabled] = useState(false);
  const [waitingTime, setWaitingTime] = useState(0);
  const [freeWaitingDisabled, setFreeWaitingDisabled] = useState(false);
  const [waitingTimeFrozen, setWaitingTimeFrozen] = useState<number | null>(null);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [billingStartTime, setBillingStartTime] = useState<number | null>(null);
  const [billingElapsedTime, setBillingElapsedTime] = useState(0);
  const [passengerPaid, setPassengerPaid] = useState(false);
  const [passengerName, setPassengerName] = useState<string>('');
  
  // ✅ CHARGER LE VRAI NOM DU PASSAGER DEPUIS LE BACKEND
  useEffect(() => {
    const loadPassengerName = async () => {
      if (!state.currentRide?.passengerId) {
        console.warn('⚠️ Pas de passengerId dans la course');
        setPassengerName(state.currentRide?.passengerName || 'Passager');
        return;
      }

      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/passengers/${state.currentRide.passengerId}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.passenger) {
            setPassengerName(data.passenger.name || 'Passager');
            console.log(`✅ Nom du passager chargé: ${data.passenger.name}`);
          } else {
            setPassengerName(state.currentRide?.passengerName || 'Passager');
          }
        } else {
          setPassengerName(state.currentRide?.passengerName || 'Passager');
        }
      } catch (error) {
        console.error('❌ Erreur chargement nom passager:', error);
        setPassengerName(state.currentRide?.passengerName || 'Passager');
      }
    };

    loadPassengerName();
  }, [state.currentRide?.passengerId]);
  
  // ✅ PRODUCTION : Pas de simulation automatique - Le driver confirme manuellement
  const handleArriveAtPickup = () => {
    setPhase('destination');
    toast.success('Arrivé au point de départ !', {
      description: 'Vous pouvez maintenant commencer la course'
    });
  };

  // ✅ Timer d'attente (compte jusqu'à 10 minutes = 600 secondes)
  useEffect(() => {
    if (phase === 'destination' && !freeWaitingDisabled && waitingTime < 600) {
      const interval = setInterval(() => {
        setWaitingTime(prev => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [phase, freeWaitingDisabled, waitingTime]);

  // ✅ NOUVEAU : Auto-démarrage du chrono de facturation après 10 minutes d'attente
  useEffect(() => {
    if (phase === 'destination' && waitingTime >= 600 && !freeWaitingDisabled && !billingStartTime) {
      setFreeWaitingDisabled(true);
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

  // ✅ CORRECTION MAJEURE : Utiliser estimatedPrice au lieu de recalculer
  useEffect(() => {
    // ✅ UTILISER LE PRIX ESTIMÉ DU PASSAGER COMME BASE
    const basePrice = state.currentRide?.estimatedPrice || 0;
    
    // Si la facturation n'est pas active, garder le prix de base
    if (!isBillingActive || isTimerDisabled) {
      setCurrentCost(basePrice);
      console.log(`💰 Prix actuel: ${basePrice.toLocaleString()} CDF (prix de base)`);
      return;
    }

    // ✅ Calculer UNIQUEMENT la surcharge de temps d'attente (après les 10 min gratuites)
    const vehicleCategory = (state.currentRide?.vehicleType?.toLowerCase().replace(' ', '_') || 'smart_confort') as VehicleCategory;
    const pricing = VEHICLE_PRICING[vehicleCategory];
    
    // Nombre d'heures facturées (après les 10 min gratuites)
    const billedSeconds = Math.max(0, billingElapsedTime);
    const billedHours = billedSeconds / 3600; // Conversion en heures
    
    // Tarif horaire selon jour/nuit
    const currentHour = new Date().getHours();
    const isDay = currentHour >= 6 && currentHour <= 20;
    const hourlyRateUSD = isDay 
      ? pricing.pricing.course_heure.jour.usd
      : pricing.pricing.course_heure.nuit.usd;
    
    // Surcharge en USD
    const surchargeUSD = hourlyRateUSD * billedHours;
    
    // Conversion en CDF
    const exchangeRate = state.systemSettings?.exchangeRate || 2850;
    const surchargeCDF = Math.round(surchargeUSD * exchangeRate);
    
    // ✅ PRIX FINAL = Prix de base + Surcharge
    const totalCost = basePrice + surchargeCDF;
    
    setCurrentCost(totalCost);
    
    console.log(`💰 TARIFICATION DÉTAILLÉE:
      📦 Prix de base (passager): ${basePrice.toLocaleString()} CDF
      ⏱️  Facturation: ${Math.floor(billedSeconds / 60)}min ${billedSeconds % 60}s
      💸 Surcharge: ${surchargeCDF.toLocaleString()} CDF
      💵 TOTAL: ${totalCost.toLocaleString()} CDF
    `);
    
    // Vérification erreurs
    if (totalCost === 0 || isNaN(totalCost)) {
      console.error('❌ ERREUR : Montant invalide !');
      console.error({ basePrice, billedHours, surchargeUSD, surchargeCDF, totalCost });
    }
  }, [isBillingActive, isTimerDisabled, billingElapsedTime, state.currentRide?.estimatedPrice, state.systemSettings?.exchangeRate]);

  const handleCompleteRide = async () => {
    // ARRÊTER TOUS LES TIMERS
    // Le chrono et le prix doivent se figer à leur valeur actuelle
    
    // ✅ RÉCUPÉRER LES VRAIES DONNÉES DE LA COURSE DEPUIS LE STATE
    const vehicleCategory = (state.currentRide?.vehicleType?.toLowerCase().replace(' ', '_') || 'smart_confort') as VehicleCategory;
    const pricing = VEHICLE_PRICING[vehicleCategory];
    const pickupAddress = state.currentRide?.pickup?.address || 'Point de départ';
    const destinationAddress = state.currentRide?.destination?.address || 'Destination';
    const distance = state.currentRide?.distance || 0;
    
    // ✅ CALCUL DE LA COMMISSION (15%)
    const commissionRate = state.systemSettings?.commissionRate || 0.15;
    const commission = Math.round(currentCost * commissionRate);
    const driverEarnings = currentCost - commission;
    
    console.log(`💰 CLÔTURE DE LA COURSE:
      💵 Montant total: ${currentCost.toLocaleString()} CDF
      💸 Commission (15%): ${commission.toLocaleString()} CDF
      👤 Gains conducteur: ${driverEarnings.toLocaleString()} CDF
    `);
    
    // ✅ ENREGISTRER LA COURSE DANS LE BACKEND
    try {
      console.log('📞 Enregistrement de la course dans le backend...');
      
      const rideData = {
        rideId: state.currentRide?.id,
        finalPrice: currentCost,
        duration: elapsedTime,
        rating: 0, // Pas de notation côté conducteur
        feedback: '',
        paymentMethod: 'cash' // Le conducteur a confirmé le paiement
      };
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/rides/complete`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(rideData)
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur backend enregistrement course:', errorText);
        toast.error('⚠️ Erreur lors de l\'enregistrement de la course');
      } else {
        const result = await response.json();
        console.log('✅ Course enregistrée dans le backend avec succès:', result);
        toast.success('✅ Course enregistrée avec succès !');
      }
    } catch (error) {
      console.error('❌ Erreur réseau lors de l\'enregistrement:', error);
      toast.error('⚠️ Erreur réseau - Course non enregistrée');
    }
    
    if (updateRide && state.currentRide?.id) {
      updateRide(state.currentRide.id, {
        actualPrice: currentCost,
        finalPrice: currentCost, // ✅ NOUVEAU : Sauvegarder comme finalPrice aussi
        timerDisabled: true, // Désactiver le timer pour arrêter le comptage
        freeWaitingDisabled: freeWaitingDisabled,
        waitingTime: waitingTime,
        waitingTimeFrozen: waitingTimeFrozen,
        elapsedTime: elapsedTime,
        billingElapsedTime: billingElapsedTime, // Figer le temps de facturation
        completedAt: new Date().toISOString(),
        status: 'completed',
        paymentStatus: 'paid', // ✅ Marquer comme payé pour débloquer le passager
        // ✅ Sauvegarder les détails de la course
        pickup: { address: pickupAddress },
        destination: { address: destinationAddress },
        distance: distance
      });
    }
    
    // Figer les états locaux pour empêcher tout changement
    setIsTimerDisabled(true);
    setBillingStartTime(null); // Arrêter le chrono de facturation
    
    // ✅ AJOUTER LE MONTANT DE LA COURSE AU SOLDE DU CONDUCTEUR
    if (state.currentDriver?.id && currentCost > 0) {
      console.log(`💰 Ajout de ${currentCost.toLocaleString()} CDF au solde du conducteur...`);
      
      const newBalance = await updateDriverBalance(state.currentDriver.id, 'add', currentCost);
      
      if (newBalance !== null) {
        toast.success('🎉 Course terminée avec succès !', {
          description: `Vous avez gagné ${currentCost.toLocaleString()} CDF. Nouveau solde : ${newBalance.toLocaleString()} CDF`
        });
      } else {
        toast.warning('⚠️ Course terminée', {
          description: `Montant gagné : ${currentCost.toLocaleString()} CDF (synchronisation du solde en cours...)`
        });
      }
    }
    
    setShowCompletionDialog(true);
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
    toast.info('Option post-payé proposée au passager');
  };

  const isBillingActive = waitingTime >= 600 || freeWaitingDisabled;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-gray-50 p-4"
    >
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center space-x-2"
          >
            ← Retour
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${phase === 'pickup' ? 'bg-yellow-500' : 'bg-green-500'}`} />
            <span className="font-medium">
              {phase === 'pickup' ? 'En route vers le client' : 'Course en cours'}
            </span>
          </div>
        </div>

        {/* Passenger Info */}
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <h3 className="font-semibold mb-2">Informations passager</h3>
          <p className="text-sm">{passengerName}</p>
          <div className="flex items-center space-x-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCallPassenger}
              className="flex items-center space-x-1"
            >
              <Phone className="w-4 h-4" />
              <span>Appeler</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleMessagePassenger}
              className="flex items-center space-x-1"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Message</span>
            </Button>
          </div>
        </div>

        {/* Locations */}
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full mt-2" />
            <div>
              <p className="text-sm text-gray-600">Point de départ</p>
              <p className="font-medium">{state.currentRide?.pickup?.address || 'Point de départ non spécifié'}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-3 h-3 bg-red-500 rounded-full mt-2" />
            <div>
              <p className="text-sm text-gray-600">Destination</p>
              <p className="font-medium">{state.currentRide?.destination?.address || 'Destination non spécifiée'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Timer and Cost Display */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-lg shadow-md p-6 mb-4"
      >
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Temps écoulé</p>
            <p className="text-xl font-bold">{formatTime(elapsedTime)}</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Coût actuel</p>
            <p className="text-xl font-bold">{currentCost.toLocaleString()} CDF</p>
          </div>
        </div>

        {/* Timer Controls - Afficher uniquement si en destination */}
        {phase === 'destination' && (
          <TimerControl
            isTimerActive={!isTimerDisabled}
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-lg shadow-md p-4"
      >
        {phase === 'pickup' ? (
          <Button
            onClick={handleArriveAtPickup}
            className="w-full h-14 bg-green-500 hover:bg-green-600 text-white rounded-xl"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Arrivé au point de départ
          </Button>
        ) : (
          <div className="space-y-3">
            {!passengerPaid ? (
              <Button
                onClick={() => {
                  setPassengerPaid(true);
                  toast.success('Paiement confirmé', {
                    description: 'Vous pouvez maintenant clôturer la course'
                  });
                }}
                className="w-full h-14 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Confirmer le paiement du passager
              </Button>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-800 font-semibold">✅ Paiement confirmé</p>
                <p className="text-xs text-green-600 mt-1">Vous pouvez maintenant terminer la course</p>
              </div>
            )}
            
            {/* Bouton de clôture de course */}
            <Button
              onClick={handleCompleteRide}
              disabled={!passengerPaid}
              className={`w-full h-14 rounded-xl ${
                passengerPaid 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-gray-300 cursor-not-allowed'
              } text-white`}
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              {passengerPaid ? 'Clôturer la course' : 'Confirmer le paiement d\'abord'}
            </Button>
          </div>
        )}
      </motion.div>

      {/* Ride Completion Dialog */}
      <RideCompletionSummaryDialog
        isOpen={showCompletionDialog}
        onClose={() => {
          setShowCompletionDialog(false);
          toast.success('Retour au tableau de bord');
          // ✅ Rediriger vers le dashboard conducteur après la clôture
          setCurrentScreen('driver-dashboard');
        }}
        userType="driver"
        rideData={{
          duration: elapsedTime,
          distance: state.currentRide?.distance || 0,
          baseCost: 0, // ✅ CORRECTION : Ne pas calculer baseCost/waitingCost séparément
          waitingTime: waitingTime,
          waitingCost: 0, // ✅ CORRECTION : Tout est dans totalCost
          totalCost: currentCost, // ✅ C'est le montant RÉEL calculé
          freeWaitingDisabled: freeWaitingDisabled,
          billingElapsedTime: billingElapsedTime,
          passengerName: state.currentUser?.name || state.currentRide?.passengerName || 'Passager',
          vehicleType: (state.currentRide?.vehicleType || 'Smart Confort') as 'Smart Standard' | 'Smart Confort' | 'Smart Plus',
          startLocation: state.currentRide?.pickup?.address || state.currentRide?.pickupAddress || 'Point de départ',
          endLocation: state.currentRide?.destination?.address || state.currentRide?.destinationAddress || 'Destination'
        }}
      />
    </motion.div>
  );
}