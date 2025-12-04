import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useAppState } from '../../hooks/useAppState';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { SoundNotification } from '../SoundNotification';
import { RideTimer } from '../RideTimer';
import { EmergencyAlert } from '../EmergencyAlert';
import { CommissionSettings } from '../CommissionSettings';
import { supabase } from '../../lib/supabase';
import { VEHICLE_PRICING, isDayTime, VehicleCategory } from '../../lib/pricing';
import { useDriverLocation, isNearPickupLocation, calculateDistance } from '../../lib/gps-utils';
import { 
  Power, 
  Euro, 
  Clock, 
  Star, 
  Navigation,
  User,
  Settings,
  TrendingUp,
  Car,
  Key,
  Percent,
  CreditCard,
  Lock,
  CheckCircle,
  AlertCircle,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { 
  notifyRideConfirmed,
  notifyDriverEnroute,
  notifyDriverArrived,
  notifyRideStarted,
  notifyRideCompleted,
  notifyPaymentReceived,
  notifyRideCancelled
} from '../../lib/sms-service';

async function updateBalanceInBackend(
  driverId: string,
  operation: 'add' | 'subtract',
  amount: number
): Promise<number | null> {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/drivers/${driverId}/balance`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation,
          amount,
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        console.log(
          
        );
        return data.balance;
      }
    }
    return null;
  } catch (error) {
    console.error('❌ Erreur mise à jour solde backend:', error);
    return null;
  }
}

export function DriverDashboard() {
  const { state, setCurrentScreen, updateDriver, setCurrentDriver, setCurrentView } = useAppState();
  const driver = state.currentDriver; // Récupérer le conducteur actuel
  const [isOnline, setIsOnline] = useState(driver?.isOnline || false);
  const [rideRequest, setRideRequest] = useState<any>(null);
  const [showRideRequest, setShowRideRequest] = useState(false);
  const [currentRide, setCurrentRide] = useState<any>(null);
  const [confirmationCode, setConfirmationCode] = useState<string>('');
  const [enteredCode, setEnteredCode] = useState<string>('');
  const [rideStartTime, setRideStartTime] = useState<Date | null>(null);
  const [freeWaitingEnabled, setFreeWaitingEnabled] = useState(true);
  const [showCommissionSettings, setShowCommissionSettings] = useState(false);
  const [postpaidEnabled, setPostpaidEnabled] = useState(false);
  const [postpaidPaid, setPostpaidPaid] = useState(false); // État du paiement pour activer post-payé
  const [showPaymentModal, setShowPaymentModal] = useState(false); // Modal de paiement
  
  const [paymentPhone, setPaymentPhone] = useState('');
  const [paymentOperator, setPaymentOperator] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState(''); // Nouveau : montant de recharge
  
  // Force re-render du solde
  const [balanceRenderKey, setBalanceRenderKey] = useState(0);
  
  // 🆕 State séparé pour forcer l'affichage
  const [displayBalance, setDisplayBalance] = useState(0);
  
  // NOUVEAU: États pour la gestion de la proximité GPS et du temps d'attente
  const [isNearPickup, setIsNearPickup] = useState(false);
  const [canStartWaiting, setCanStartWaiting] = useState(false);
  const [waitingTimeStarted, setWaitingTimeStarted] = useState(false);
  const [waitingStartTime, setWaitingStartTime] = useState<Date | null>(null);
  
  // Hook pour suivre la position GPS du conducteur (seulement en course)
  const { location: driverLocation, error: gpsError } = useDriverLocation(
    currentRide !== null && currentRide.status === 'accepted'
  );
  
  // ✅ SOLDE SYNCHRONISÉ AVEC LE BACKEND (source de vérité unique)
  const [accountBalance, setAccountBalance] = useState(0);
  
  // 💾 Charger le solde depuis le backend au démarrage
  useEffect(() => {
    const loadBalanceFromBackend = async () => {
      if (!driver?.id) return;
      
      try {
        console.log('💰 Chargement du solde depuis le backend...');
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/drivers/${driver.id}/balance`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setAccountBalance(data.balance);
            setBalanceRenderKey(prev => prev + 1);
            console.log(`✅ Solde chargé depuis le backend: ${data.balance.toLocaleString()} CDF`);
          }
        }
      } catch (error) {
        console.error('❌ Erreur chargement solde:', error);
      }
    };
    
    loadBalanceFromBackend();
  }, [driver?.id]);
  
  // 🔄 Synchroniser le solde avec le backend toutes les 5 secondes
  useEffect(() => {
    if (!driver?.id) return;
    
    const syncInterval = setInterval(async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/drivers/${driver.id}/balance`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.balance !== accountBalance) {
            setAccountBalance(data.balance);
            setBalanceRenderKey(prev => prev + 1);
            console.log(`🔄 Solde synchronisé: ${data.balance.toLocaleString()} CDF`);
          }
        }
      } catch (error) {
        console.error('❌ Erreur sync solde:', error);
      }
    }, 5000); // Toutes les 5 secondes
    
    return () => clearInterval(syncInterval);
  }, [driver?.id, accountBalance]);

  // Auto-activer le post-payé si le solde est suffisant au chargement
  useEffect(() => {
    if (driver?.id && accountBalance > 0) {
      const minBalance = getMinimumBalance();
      if (accountBalance >= minBalance && !postpaidPaid) {
        // Activer automatiquement le post-payé si le solde est suffisant
        setPostpaidPaid(true);
        setPostpaidEnabled(true);
        console.log('✅ Post-payé activé automatiquement (solde suffisant)');
        
        // Notification au conducteur
        setTimeout(() => {
          toast.success(
            `✅ Mode Post-Payé activé automatiquement ! Votre solde: ${accountBalance.toLocaleString()} CDF`,
            { duration: 5000 }
          );
          toast.info(
            '🚗 Vous pouvez maintenant passer en ligne pour recevoir des courses',
            { duration: 4000 }
          );
        }, 500);
      }
    }
  }, [driver?.id]); // Se déclenche une seule fois au chargement

  // Détecter la proximité GPS au point de pickup
  useEffect(() => {
    if (!currentRide || currentRide.status !== 'accepted' || !driverLocation) {
      setIsNearPickup(false);
      setCanStartWaiting(false);
      return;
    }

    // Calculer la distance au point de pickup
    const distance = calculateDistance(
      driverLocation.lat,
      driverLocation.lng,
      currentRide.pickup.lat,
      currentRide.pickup.lng
    );

    const safeDistance = distance || 0;
    console.log(`📍 Distance au pickup: ${safeDistance.toFixed(2)}m`);

    // Si à moins de 10 mètres, autoriser le démarrage du temps d'attente
    if (distance <= 10) {
      if (!isNearPickup) {
        setIsNearPickup(true);
        setCanStartWaiting(true);
        toast.success('📍 Vous êtes arrivé au point de départ !', { duration: 3000 });
        
        // Notification SMS au passager
        if (rideRequest && driver) {
          notifyDriverArrived(
            rideRequest.passengerPhone || '+243999999999',
            driver.name,
            driver.phone || '+243999999999'
          ).catch(err => console.error('❌ Erreur envoi SMS arrivée:', err));
        }
      }
    } else {
      setIsNearPickup(false);
      if (distance > 50) { // Si le conducteur s'éloigne de plus de 50m
        setCanStartWaiting(false);
      }
    }
  }, [driverLocation, currentRide, isNearPickup]);

  // ✅ VÉRIFICATION TEMPS RÉEL DES DEMANDES DE COURSE depuis le backend
  useEffect(() => {
    // ✅ CORRECTION CRITIQUE : Polling simplifié - uniquement si en ligne
    if (!isOnline) {
      console.log('⏸️ Polling arrêté : conducteur hors ligne');
      return;
    }

    console.log('🔄 Démarrage du polling des demandes de courses...');

    // Vérifier les demandes toutes les 5 secondes
    const checkRideRequests = async () => {
      if (!driver?.id) return;

      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/rides/pending/${driver.id}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.ride) {
            // 🔥 FIX : Vérifier si c'est une NOUVELLE demande avant d'afficher
            const newRideId = data.ride.id;
            const currentRideId = rideRequest?.id;
            
            // N'afficher que si c'est une nouvelle demande différente
            if (newRideId !== currentRideId) {
              console.log('📱 Nouvelle demande de course reçue:', data.ride);
              setRideRequest(data.ride);
              setShowRideRequest(true);
            } else {
              // C'est la même demande, ne rien faire
              console.log('🔍 Même demande déjà affichée, pas de notification');
            }
          } else if (data.success && !data.ride) {
            console.log('🔍 Polling actif - Aucune demande en attente');
            // Si plus de demande en attente, fermer la notification si elle était ouverte
            if (showRideRequest && !currentRide) {
              setShowRideRequest(false);
              setRideRequest(null);
            }
          }
        }
      } catch (error) {
        console.error('❌ Erreur lors de la vérification des demandes:', error);
      }
    };

    // Vérifier immédiatement puis toutes les 5 secondes
    checkRideRequests();
    const interval = setInterval(checkRideRequests, 5000);
    
    return () => {
      console.log('🛑 Arrêt du polling des demandes');
      clearInterval(interval);
    };
  }, [isOnline, driver?.id, rideRequest?.id, showRideRequest, currentRide]);

  // ==================== FONCTION DE RAFRAÎCHISSEMENT TEMPS RÉEL ====================
  const refreshDriverData = async () => {
    if (!driver?.id) return;
    
    console.log('🔄 Rafraîchissement des données du conducteur...');
    
    try {
      // 1. Récupérer les données à jour du profil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', driver.id)
        .single();
      
      if (profileError) {
        console.error('❌ Erreur récupération profil:', profileError);
      } else if (profileData) {
        console.log('✅ Profil actualisé:', profileData);
        
        // Mettre à jour le driver avec les nouvelles données
        updateDriver({
          ...driver,
          name: profileData.name || driver.name,
          phone: profileData.phone || driver.phone,
          rating: profileData.rating || driver.rating,
          // Autres champs si nécessaires
        });
      }
      
      // 2. Récupérer les statistiques de courses du jour
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: ridesData, error: ridesError } = await supabase
        .from('rides')
        .select('*')
        .eq('driver_id', driver.id)
        .eq('status', 'completed')
        .gte('created_at', today.toISOString());
      
      if (!ridesError && ridesData) {
        const todayEarnings = ridesData.reduce((sum, ride) => sum + (ride.final_price || 0), 0);
        const todayRidesCount = ridesData.length;
        
        console.log(`📊 Courses aujourd'hui: ${todayRidesCount}, Revenus: ${todayEarnings.toLocaleString()} CDF`);
        
        // Mettre à jour les statistiques du driver
        updateDriver({
          ...driver,
          earnings: todayEarnings / 2500, // Convertir en USD pour compatibilité
          ridesCount: todayRidesCount,
        });
      }
      
      // 3. Synchroniser le solde depuis localStorage
      const savedBalance = localStorage.getItem(`driver_balance_${driver.id}`);
      if (savedBalance) {
        const balance = parseFloat(savedBalance);
        setAccountBalance(balance);
        setBalanceRenderKey(prev => prev + 1);
        console.log(`💰 Solde synchronisé: ${balance.toLocaleString()} CDF`);
      }
      
      // 4. Récupérer les informations du véhicule
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('driver_id', driver.id)
        .single();
      
      if (!vehicleError && vehicleData) {
        console.log('🚗 Véhicule actualisé:', vehicleData);
        
        updateDriver({
          ...driver,
          vehicleInfo: {
            ...driver.vehicleInfo,
            type: vehicleData.category,
            licensePlate: vehicleData.license_plate,
            model: vehicleData.model,
            year: vehicleData.year,
          }
        });
      }
      
      console.log('✅ Données du conducteur rafraîchies avec succès !');
      toast.success('📊 Tableau de bord actualisé !', { duration: 2000 });
      
    } catch (error) {
      console.error('❌ Erreur lors du rafraîchissement:', error);
    }
  };
  // ==================== FIN FONCTION DE RAFRAÎCHISSEMENT ====================

  // Fonction helper pour obtenir le tarif horaire correct selon le type de véhicule
  const getHourlyRate = (): number => {
    const vehicleType = driver.vehicleInfo?.type as VehicleCategory;
    if (!vehicleType || !VEHICLE_PRICING[vehicleType]) {
      return 7; // Fallback au tarif Smart Flex jour
    }
    
    const currentHour = new Date().getHours();
    const isDay = isDayTime(currentHour);
    const pricing = VEHICLE_PRICING[vehicleType];
    
    return isDay ? (pricing.hourlyRateDay || 0) : (pricing.hourlyRateNight || 0);
  };

  // Calculer le solde minimum requis pour une course (1 heure au tarif actuel)
  const getMinimumBalance = (): number => {
    const hourlyRateUSD = getHourlyRate();
    return hourlyRateUSD * 2500; // Convertir en CDF (1 USD = 2500 CDF)
  };

  // Vérifier si le solde est suffisant
  const hasEnoughBalance = (): boolean => {
    // ✅ SIMPLIFIER : Vérifier uniquement le solde minimum
    return accountBalance >= getMinimumBalance();
  };
  
  // Calculer le solde affiché avec useMemo pour forcer le re-render
  const displayedBalance = useMemo(() => {
    return accountBalance;
  }, [accountBalance, balanceRenderKey]); // Dépend du balanceRenderKey ET accountBalance

  const toggleOnlineStatus = async () => {
    // ✅ VÉRIFICATION DU SOLDE UNIQUEMENT (plus besoin de post-payé)
    if (!isOnline && accountBalance <= 0) {
      toast.error(
        'Solde insuffisant ! Vous devez recharger votre compte pour vous mettre en ligne.',
        { duration: 5000 }
      );
      setShowPaymentModal(true);
      return;
    }

    // Vérifier si le solde est suffisant pour une course minimale
    if (!isOnline && !hasEnoughBalance()) {
      const minBalance = getMinimumBalance();
      toast.error(
        `Solde insuffisant ! Vous devez avoir au moins ${minBalance.toLocaleString()} CDF pour une course.`,
        { duration: 5000 }
      );
      setShowPaymentModal(true);
      return;
    }

    const newStatus = !isOnline;

    // Appeler l'API backend pour mettre à jour le statut
    try {
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/drivers/toggle-online-status`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            isOnline: newStatus,
            location: driverLocation || null
          })
        }
      );

      const result = await response.json();

      if (!result.success) {
        // Si le backend refuse l'activation (solde insuffisant)
        toast.error(result.error || 'Impossible de changer le statut');
        if (result.error?.includes('Solde insuffisant')) {
          setShowPaymentModal(true);
        }
        return;
      }

      // Mise à jour réussie
      setIsOnline(newStatus);

      if (driver) {
        updateDriver(driver.id, { isOnline: newStatus });
      }

      toast.success(newStatus ? 'Vous êtes maintenant en ligne' : 'Vous êtes maintenant hors ligne');

      if (newStatus) {
        toast.info('Recherche de courses en cours...');
      }
    } catch (error) {
      console.error('❌ Erreur toggle status:', error);
      toast.error('Erreur lors du changement de statut');
    }
  };
  
  const handlePostpaidToggle = (checked: boolean) => {
    if (checked && !postpaidPaid) {
      // Si on veut activer mais pas encore payé, montrer le modal de paiement
      setShowPaymentModal(true);
    } else if (!checked) {
      // Désactiver directement
      setPostpaidEnabled(false);
      toast.info('Mode Post-Payé désactivé');
    } else {
      // Déjà payé, juste activer
      setPostpaidEnabled(checked);
      toast.success('Mode Post-Payé activé !');
    }
  };
  
  const handlePostpaidPayment = () => {
    // Validation du montant
    if (!rechargeAmount || parseInt(rechargeAmount) < 1000) {
      toast.error('Le montant minimum de recharge est de 1,000 CDF');
      return;
    }
    
    // Validation de l'opérateur
    if (!paymentOperator) {
      toast.error('Veuillez sélectionner un opérateur de paiement');
      return;
    }
    
    // Validation du téléphone
    if (!paymentPhone) {
      toast.error('Veuillez entrer votre numéro de téléphone');
      return;
    }
    
    // Validation du numéro de téléphone (10 chiffres maximum, formats RDC)
    if (paymentPhone.length < 9 || paymentPhone.length > 10) {
      toast.error('Numéro invalide. Utilisez 10 chiffres (ex: 0XXXXXXXXX)');
      return;
    }
    
    // Simuler le paiement Mobile Money
    setIsProcessingPayment(true);
    
    const operatorNames: { [key: string]: string } = {
      orange: 'Orange Money',
      mpesa: 'M-Pesa',
      airtel: 'Airtel Money'
    };
    
    const amountToPay = parseInt(rechargeAmount);
    
    // Utiliser un seul toast qui s'update pour éviter les problèmes
    const toastId = toast.loading(`Connexion à ${operatorNames[paymentOperator]}...`);
    
    setTimeout(() => {
      toast.loading(`Traitement du paiement de ${amountToPay.toLocaleString()} CDF...`, { id: toastId });
      
      setTimeout(async () => {
        setPostpaidEnabled(true);
        setPostpaidPaid(true);
        setShowPaymentModal(false);
        setIsProcessingPayment(false);
        
        // ✅ Ajouter le montant au backend (source de vérité unique)
        const newBalance = await updateBalanceInBackend(driver.id, 'add', amountToPay);
        if (newBalance !== null) {
          setAccountBalance(newBalance);
          setBalanceRenderKey(prev => prev + 1);
        } else {
          // Fallback: mise à jour locale si le backend échoue
          setAccountBalance(prev => prev + amountToPay);
        }
        
        // Réinitialiser le formulaire
        setPaymentPhone('');
        setPaymentOperator('');
        setRechargeAmount('');
        
        // Dismiss le toast de loading et afficher le succès
        toast.success(
          `✅ Recharge de ${amountToPay.toLocaleString()} CDF réussie via ${operatorNames[paymentOperator]} !`,
          { id: toastId, duration: 5000 }
        );
        toast.info('Vous pouvez maintenant activer le mode Post-Payé et recevoir des courses.', {
          duration: 4000
        });
        
        // Force re-render du solde
        setBalanceRenderKey(prev => prev + 1);
        
        // Rafraîchir les données du tableau de bord
        setTimeout(() => {
          refreshDriverData();
        }, 2500);
      }, 2000);
    }, 1500);
  };

  const handleAcceptRide = async () => {
    // Vérifier le solde avant d'accepter la course
    const estimatedCost = rideRequest?.estimatedPrice || 31250; // Coût estimé en CDF
    
    if (accountBalance < estimatedCost) {
      toast.error(
        `❌ Solde insuffisant ! Coût estimé: ${estimatedCost.toLocaleString()} CDF • Votre solde: ${accountBalance.toLocaleString()} CDF`,
        { duration: 6000 }
      );
      toast.warning(
        `Vous devez recharger au moins ${(estimatedCost - accountBalance).toLocaleString()} CDF pour accepter cette course`,
        { duration: 5000 }
      );
      
      // Refuser automatiquement la course
      setShowRideRequest(false);
      
      // Ouvrir le modal de recharge
      setTimeout(() => {
        setShowPaymentModal(true);
      }, 1000);
      
      // Notification SMS au passager
      if (rideRequest && driver) {
        try {
          await notifyRideCancelled(
            rideRequest.passengerPhone || '+243999999999',
            driver.phone || '+243999999999',
            rideRequest.passengerName || 'Passager',
            driver.name,
            'Le conducteur a un solde insuffisant'
          );
          console.log('✅ SMS refus (solde insuffisant) envoyé au passager');
        } catch (error) {
          console.error('❌ Erreur envoi SMS refus:', error);
        }
      }
      
      return; // Arrêter l'exécution ici
    }
    
    // Générer un code de confirmation automatique que le passager recevra
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setConfirmationCode(code);
    
    // ✅ Créer les données de la course à partir de la vraie demande du passager
    const rideData = {
      id: rideRequest.id || `ride_${Date.now()}`,
      passengerId: rideRequest.userId || rideRequest.passengerId,
      driverId: driver?.id,
      pickup: { 
        lat: rideRequest.pickupLat, 
        lng: rideRequest.pickupLng, 
        address: rideRequest.pickupAddress 
      },
      destination: { 
        lat: rideRequest.dropoffLat, 
        lng: rideRequest.dropoffLng, 
        address: rideRequest.dropoffAddress 
      },
      status: 'accepted',
      confirmationCode: code,
      estimatedPrice: estimatedCost, // Prix réel de la demande
      estimatedDuration: Math.ceil((rideRequest.distanceKm || 5) / 20 * 60), // Estimation en minutes (20 km/h en ville)
      createdAt: new Date(),
      pickupInstructions: rideRequest.pickupInstructions // Instructions du passager
    };
    
    setCurrentRide(rideData);
    setShowRideRequest(false);
    toast.success(`Course acceptée ! En attente du code de confirmation du passager.`);
    
    // 📱 SMS: Notification au passager que le conducteur a accepté
    if (rideRequest && driver) {
      try {
        await notifyRideConfirmed(
          rideRequest.passengerPhone || '+243999999999',
          driver.phone || '+243999999999',
          driver.name,
          rideRequest.passengerName || 'Passager',
          `${driver.vehicleInfo?.make} ${driver.vehicleInfo?.model} - ${driver.vehicleInfo?.plate}`,
          rideRequest.pickup?.address || rideRequest.pickupAddress || 'Point de depart',
          rideRequest.destination?.address || rideRequest.dropoffAddress || 'Destination',
          driver.vehicleInfo?.type || 'Standard',
          '5'
        );
        console.log('✅ SMS confirmation envoyé au passager et conducteur');
      } catch (error) {
        console.error('❌ Erreur envoi SMS confirmation:', error);
      }
    }
  };

  const handleDeclineRide = async () => {
    setShowRideRequest(false);
    toast.info('Course refusée');
    
    // 📱 SMS: Notification au passager que le conducteur a refusé
    if (rideRequest && driver) {
      try {
        await notifyRideCancelled(
          rideRequest.passengerPhone || '+243999999999',
          driver.phone || '+243999999999',
          rideRequest.passengerName || 'Passager',
          driver.name,
          'Le conducteur a refusé la course'
        );
        console.log('✅ SMS refus envoyé au passager');
      } catch (error) {
        console.error('❌ Erreur envoi SMS refus:', error);
      }
    }
  };

  const handleConfirmStart = async () => {
    if (!enteredCode) {
      toast.error('Veuillez entrer le code de confirmation du passager');
      return;
    }
    
    if (enteredCode !== confirmationCode) {
      toast.error('Code incorrect ! Vérifiez le code avec le passager');
      return;
    }
    
    if (confirmationCode && currentRide) {
      setRideStartTime(new Date());
      setCurrentRide({ ...currentRide, status: 'in_progress' });
      toast.success('Course démarrée !');
      setEnteredCode('');
      
      // Le SMS de démarrage sera envoyé quand le driver désactive le temps d'attente gratuite
    }
  };

  const handleCompleteRide = async () => {
    if (currentRide && rideStartTime) {
      // Calculer la durée de la course en secondes
      const endTime = new Date();
      const durationInSeconds = Math.floor((endTime.getTime() - rideStartTime.getTime()) / 1000);
      
      // Calculer le coût de la course (temps facturable après 10 minutes gratuites)
      const freeWaitingTimeSeconds = 10 * 60; // 10 minutes
      const billableSeconds = Math.max(0, durationInSeconds - freeWaitingTimeSeconds);
      
      // Calculer le nombre d'heures (toute heure entamée compte)
      const hours = Math.ceil(billableSeconds / 3600);
      
      // Obtenir le tarif horaire actuel
      const hourlyRateUSD = getHourlyRate();
      
      // Calculer le coût total en USD puis convertir en CDF
      const costUSD = hours * hourlyRateUSD;
      const costCDF = costUSD * 2500; // 1 USD = 2500 CDF
      
      // Récupérer les paramètres de commission (par défaut 15%)
      const commissionRate = 0.15; // 15% de commission
      const commissionAmount = costCDF * commissionRate;
      const finalCostForDriver = Math.round(costCDF); // Le conducteur paie le montant total (commission incluse)
      
      // Vérifier que le solde est suffisant (sécurité)
      if (accountBalance < finalCostForDriver) {
        toast.error(
          `Solde insuffisant ! Coût de la course: ${finalCostForDriver.toLocaleString()} CDF. Rechargez votre compte.`,
          { duration: 6000 }
        );
        return;
      }
      
      // ✅ Déduire le montant du solde dans le backend
      const newBalance = await updateBalanceInBackend(driver.id, 'subtract', finalCostForDriver);
      
      if (newBalance !== null) {
        setAccountBalance(newBalance);
        console.log(`💰 Solde mis à jour dans le backend: ${newBalance.toLocaleString()} CDF`);
        
        // Notification du nouveau solde
        setTimeout(() => {
          toast.info(
            `Nouveau solde: ${newBalance.toLocaleString()} CDF`,
            { duration: 4000 }
          );
          
          // Si le solde devient insuffisant, alerter
          const minBalance = getMinimumBalance();
          if (newBalance < minBalance) {
            toast.warning(
              `⚠️ Votre solde est insuffisant pour une nouvelle course. Rechargez au moins ${(minBalance - newBalance).toLocaleString()} CDF`,
              { duration: 6000 }
            );
          }
        }, 1000);
      } else {
        // Fallback: mise à jour locale si le backend échoue
        setAccountBalance(prev => prev - finalCostForDriver);
      }
      
      // Forcer le re-render visuel du solde
      setBalanceRenderKey(prev => prev + 1);
      
      // Mettre à jour l'état
      setCurrentRide(null);
      setConfirmationCode('');
      setRideStartTime(null);
      
      // Rafraîchir les données du tableau de bord
      setTimeout(() => {
        refreshDriverData();
      }, 1000);
      
      // Notification de succès avec détails
      toast.success(
        `Course terminée ! Durée: ${Math.floor(durationInSeconds / 60)} min • Coût: ${finalCostForDriver.toLocaleString()} CDF`,
        { duration: 5000 }
      );
      
      // 📱 SMS: Notification de fin de course
      if (driver && rideRequest) {
        const durationStr = `${Math.floor(durationInSeconds / 60)} min`;
        notifyRideCompleted(
          rideRequest.passengerPhone || '+243999999999',
          driver.phone || '+243999999999',
          finalCostForDriver,
          durationStr
        ).catch(err => console.error('❌ Erreur envoi SMS fin de course:', err));
        
        // 📱 SMS: Notification de paiement reçu
        notifyPaymentReceived(
          driver.phone || '+243999999999',
          finalCostForDriver,
          'Post-Payé SmartCabb'
        ).catch(err => console.error(' Erreur envoi SMS paiement:', err));
      }
    } else {
      setCurrentRide(null);
      setConfirmationCode('');
      setRideStartTime(null);
      toast.success('Course terminée !');
    }
  };

  if (!driver) {
    // Rediriger vers login si pas de conducteur connecté
    console.error('❌ Pas de conducteur connecté, redirection vers driver-login');
    setCurrentScreen('driver-login');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Redirection...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50 flex flex-col"
    >
      {/* Header */}
      <div className="bg-white shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl truncate">Bonjour {driver.name.split(' ')[0]}</h1>
              <p className="text-sm text-gray-600 truncate">
                {isOnline ? 'En ligne' : 'Hors ligne'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentScreen('driver-settings')}
            className="w-10 h-10 flex-shrink-0 ml-2"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Online Status */}
      <div className="p-6">
        {/* Solde du compte - AFFICHAGE DIRECT */}
        <Card 
          key={`balance-${Date.now()}-${accountBalance}`}
          className="p-6 mb-4 bg-gradient-to-r from-green-500 to-emerald-600 border-0 text-white"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <CreditCard className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-100 mb-1">Solde de votre compte</p>
                <div className="flex items-baseline space-x-2">
                  <h2 className="text-3xl font-bold">
                    {accountBalance.toLocaleString()} CDF
                  </h2>
                  <span className="text-lg text-green-100 font-medium">
                    (${(accountBalance / 2500).toFixed(2)} USD)
                  </span>
                </div>
                {postpaidPaid && postpaidEnabled && (
                  <p className="text-xs text-green-100 mt-1">
                    {hasEnoughBalance() 
                      ? ` Solde suffisant (minimum: ${getMinimumBalance().toLocaleString()} CDF)`
                      : `⚠️ Solde insuffisant - Rechargez au moins ${(getMinimumBalance() - accountBalance).toLocaleString()} CDF`
                    }
                  </p>
                )}
              </div>
            </div>
            <div>
              <Button
                onClick={() => setShowPaymentModal(true)}
                variant="outline"
                className="bg-white bg-opacity-10 hover:bg-opacity-20 border-white border-opacity-30 text-white h-10"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Recharger
              </Button>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
              <div className="flex-1">
                <h3 className="font-semibold">
                  {isOnline ? 'Vous êtes en ligne' : 'Vous êtes hors ligne'}
                </h3>
                <p className="text-sm text-gray-600">
                  {isOnline 
                    ? '✅ Prêt à recevoir des courses' 
                    : accountBalance <= 0
                      ? '⚠️ Solde insuffisant - Rechargez pour vous mettre en ligne'
                      : '👆 Activez pour recevoir des courses'
                  }
                </p>
              </div>
            </div>
            <Switch
              checked={isOnline}
              onCheckedChange={toggleOnlineStatus}
              disabled={accountBalance <= 0}
            />
          </div>
        </Card>
      </div>

      {/* Current Ride */}
      {currentRide && (
        <div className="px-6 pb-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Course en cours</h3>
            
            {confirmationCode && currentRide.status === 'accepted' && (
              <div className="mb-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center mb-2">
                    <Key className="w-5 h-5 text-orange-600 mr-2" />
                    <p className="text-sm text-orange-600 font-semibold">Demandez le code au passager</p>
                  </div>
                  <p className="text-xs text-orange-500">
                    Le passager a reçu un code de confirmation. Demandez-lui le code et saisissez-le ci-dessous.
                  </p>
                </div>
                
                {/* Indicateur de proximité GPS */}
                {driverLocation && (
                  <div className={`mb-3 p-3 rounded-lg border-2 ${
                    isNearPickup 
                      ? 'bg-green-50 border-green-300' 
                      : 'bg-blue-50 border-blue-300'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MapPin className={`w-5 h-5 ${isNearPickup ? 'text-green-600' : 'text-blue-600'}`} />
                        <div>
                          <p className={`text-sm font-semibold ${isNearPickup ? 'text-green-800' : 'text-blue-800'}`}>
                            {isNearPickup ? '✅ Vous êtes arrivé !' : '📍 En route vers le passager'}
                          </p>
                          {driverLocation && currentRide && (
                            <p className="text-xs text-gray-600">
                              Distance: {calculateDistance(
                                driverLocation.lat,
                                driverLocation.lng,
                                currentRide.pickup.lat,
                                currentRide.pickup.lng
                              ).toFixed(0)}m du point de départ
                            </p>
                          )}
                        </div>
                      </div>
                      {isNearPickup && (
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      )}
                    </div>
                  </div>
                )}
                
                {gpsError && (
                  <div className="mb-3 p-3 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-yellow-800">Mode GPS désactivé</p>
                        <p className="text-xs text-yellow-700">L'application fonctionne normalement</p>
                        <p className="text-xs text-gray-600 mt-1">
                          📍 Position par défaut: Kinshasa Centre
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="code" className="text-sm text-gray-600">Code de confirmation du passager</Label>
                    <Input
                      id="code"
                      type="text"
                      placeholder="Entrez le code à 4 chiffres"
                      value={enteredCode}
                      onChange={(e) => setEnteredCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className="mt-1 text-center text-lg font-mono"
                      maxLength={4}
                    />
                  </div>
                  
                  <Button
                    onClick={handleConfirmStart}
                    disabled={enteredCode.length !== 4}
                    className="w-full bg-green-500 hover:bg-green-600"
                  >
                    {enteredCode.length !== 4 ? 'Entrez le code complet' : 'Démarrer la course'}
                  </Button>
                </div>
              </div>
            )}

            {rideStartTime && currentRide.status === 'in_progress' && (
              <div className="mb-4">
                <RideTimer
                  isActive={true}
                  startTime={rideStartTime}
                  hourlyRate={getHourlyRate()}
                  showWaitingTime={true}
                />
              </div>
            )}

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Départ</p>
                <p className="font-medium">{currentRide.pickup.address}</p>
                {/* 🆕 Instructions de prise en charge */}
                {currentRide.pickupInstructions && (
                  <div className="mt-2 bg-green-50 border-l-4 border-green-500 p-3 rounded-r-lg">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-green-700 font-medium mb-1">Point de repère</p>
                        <p className="text-sm text-green-900">{currentRide.pickupInstructions}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600">Destination</p>
                <p className="font-medium">{currentRide.destination.address}</p>
              </div>
            </div>

            {currentRide.status === 'in_progress' && (
              <div className="space-y-3 mt-4">
                <Button
                  onClick={() => setCurrentScreen('navigation')}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  🚗 Voir les contrôles de navigation (avec chrono)
                </Button>
                
                <Button
                  onClick={handleCompleteRide}
                  className="w-full bg-green-500 hover:bg-green-600"
                >
                  Terminer la course
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Stats */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Euro className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 truncate">Aujourd'hui</p>
                <p className="text-lg font-semibold truncate">{(driver.earnings * 2500).toLocaleString()} CDF</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 truncate">En ligne</p>
                <p className="text-lg font-semibold truncate">6h 30m</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 truncate">Note</p>
                <p className="text-lg font-semibold truncate">{driver.rating}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 truncate">Courses</p>
                <p className="text-lg font-semibold truncate">{driver.totalRides}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Vehicle Info */}
      <div className="px-6 pb-6">
        <Card className="p-4">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Car className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              {driver?.vehicleInfo ? (
                <>
                  <h3 className="font-semibold truncate">
                    {driver.vehicleInfo.color} {driver.vehicleInfo.make} {driver.vehicleInfo.model}
                  </h3>
                  <p className="text-sm text-gray-600 font-mono truncate">{driver.vehicleInfo.plate}</p>
                </>
              ) : (
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-400 truncate">
                    Véhicule non configuré
                  </h3>
                  <p className="text-sm text-gray-500 truncate">Ajoutez vos informations de véhicule</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="px-6 pb-6">
        <h3 className="text-lg mb-4">Actions rapides</h3>
        <div className="space-y-3">
          <Button
            onClick={() => {
              console.log('🔘 Clic sur bouton "Voir mes gains"');
              setCurrentScreen('earnings');
            }}
            variant="outline"
            className="w-full justify-start h-12"
          >
            <Euro className="w-5 h-5 mr-3" />
            Voir mes gains
          </Button>
          <Button
            onClick={() => {
              console.log('🔘 Clic sur bouton "Mon profil"');
              setCurrentScreen('driver-profile');
            }}
            variant="outline"
            className="w-full justify-start h-12"
          >
            <User className="w-5 h-5 mr-3" />
            Mon profil
          </Button>
          
          {/* Post-Payé Toggle avec statut de paiement */}
          <Card className={`p-4 border-2 ${postpaidPaid ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${postpaidPaid ? 'bg-green-100' : 'bg-orange-100'}`}>
                    {postpaidPaid ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Lock className="w-5 h-5 text-orange-600" />
                    )}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${postpaidPaid ? 'text-green-900' : 'text-orange-900'}`}>
                      Mode Post-Payé
                    </h3>
                    <p className={`text-xs ${postpaidPaid ? 'text-green-600' : 'text-orange-600'}`}>
                      {postpaidPaid 
                        ? (postpaidEnabled ? 'Activé et payé ✅' : 'Payé - Activez pour recevoir des courses')
                        : 'Rechargez votre compte pour recevoir des courses'}
                    </p>
                  </div>
                </div>
                {postpaidPaid && (
                  <Switch
                    checked={postpaidEnabled}
                    onCheckedChange={handlePostpaidToggle}
                    className="data-[state=checked]:bg-green-600"
                  />
                )}
              </div>
              
              {!postpaidPaid && (
                <Button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Recharger mon compte
                </Button>
              )}
            </div>
          </Card>
          
          <div className="flex space-x-2">
            <Button
              onClick={() => setShowCommissionSettings(!showCommissionSettings)}
              variant="outline"
              className="flex-1 justify-start h-12"
            >
              <Percent className="w-5 h-5 mr-3" />
              Commissions
            </Button>
            <EmergencyAlert userType="driver" />
          </div>
        </div>
        
        {/* Commission Settings Panel */}
        {showCommissionSettings && (
          <div className="px-6 pb-6">
            <CommissionSettings userType="driver" driverId={driver.id} />
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="mt-auto bg-white border-t p-4">
        <Button
          onClick={() => {
            console.log('🚪 Déconnexion du conducteur depuis Dashboard');
            setCurrentDriver(null);
            setCurrentScreen('landing');
            toast.success('Déconnexion réussie');
          }}
          variant="ghost"
          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          Déconnexion
        </Button>
      </div>

      {/* Sound Notification */}
      <SoundNotification shouldPlay={showRideRequest} duration={15000} />

      {/* Ride Request Modal */}
      {showRideRequest && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center p-6 z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-sm"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Navigation className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl mb-2">Nouvelle course !</h3>
              <p className="text-gray-600">Un passager vous attend</p>
            </div>

            <div className="space-y-3 mb-6">
              <div>
                <p className="text-sm text-gray-600">Départ</p>
                <p className="font-semibold">{rideRequest?.pickup?.address || rideRequest?.pickupAddress || 'Adresse de départ'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Destination</p>
                <p className="font-semibold">{rideRequest?.destination?.address || rideRequest?.dropoffAddress || 'Adresse de destination'}</p>
              </div>
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-600">Distance</p>
                  <p className="font-semibold">{rideRequest?.distance?.toFixed(1) || rideRequest?.distanceKm?.toFixed(1) || '0'} km</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estimation</p>
                  <p className="font-semibold">{(rideRequest?.estimatedPrice || 0).toLocaleString()} CDF</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleDeclineRide}
                variant="outline"
                className="flex-1 h-12"
              >
                Refuser
              </Button>
              <Button
                onClick={handleAcceptRide}
                className="flex-1 h-12 bg-green-500 hover:bg-green-600"
              >
                Accepter
              </Button>
            </div>

            {/* Auto decline timer */}
            <motion.div
              className="mt-4 text-center text-sm text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              Refus automatique dans 15s
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      {/* Modal de Paiement Mobile Money */}
      {showPaymentModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-6 z-50"
          onClick={() => !isProcessingPayment && setShowPaymentModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-8 h-8 text-orange-600" />
                </div>
              </div>
              <h3 className="text-xl text-center mb-2">Recharger votre compte</h3>
              <p className="text-sm text-center text-gray-600">
                Rechargez votre compte pour activer le mode Post-Payé
              </p>
            </div>

            <div className="space-y-4">
              {/* Montant de recharge - NOUVEAU */}
              <div>
                <Label htmlFor="recharge-amount">Montant de recharge (CDF)</Label>
                <Input
                  id="recharge-amount"
                  type="number"
                  placeholder="Exemple: 10000"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)}
                  disabled={isProcessingPayment}
                  className="mt-1 h-12 text-lg"
                  min="1000"
                  step="1000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Montant minimum: 1,000 CDF
                </p>
              </div>

              {/* Montant à payer - mis à jour */}
              {rechargeAmount && parseInt(rechargeAmount) >= 1000 && (
                <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border-2 border-orange-200 text-center">
                  <span className="text-sm text-gray-600">Montant à payer</span>
                  <span className="font-semibold text-3xl text-orange-600 block mt-1">
                    {parseInt(rechargeAmount).toLocaleString()} CDF
                  </span>
                </div>
              )}

              {/* Opérateur - DÉPLACÉ EN PREMIER */}
              <div>
                <Label>Choisissez votre opérateur Mobile Money</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <Button
                    type="button"
                    variant={paymentOperator === 'orange' ? 'default' : 'outline'}
                    className={`h-20 ${paymentOperator === 'orange' ? 'bg-orange-500 hover:bg-orange-600 border-2 border-orange-600' : 'border-2'}`}
                    onClick={() => setPaymentOperator('orange')}
                    disabled={isProcessingPayment}
                  >
                    <div className="text-center">
                      <div className="font-semibold">Orange</div>
                      <div className="text-xs">Money</div>
                    </div>
                  </Button>
                  <Button
                    type="button"
                    variant={paymentOperator === 'mpesa' ? 'default' : 'outline'}
                    className={`h-20 ${paymentOperator === 'mpesa' ? 'bg-green-600 hover:bg-green-700 border-2 border-green-700' : 'border-2'}`}
                    onClick={() => setPaymentOperator('mpesa')}
                    disabled={isProcessingPayment}
                  >
                    <div className="text-center">
                      <div className="font-semibold">M-Pesa</div>
                      <div className="text-xs">Vodacom</div>
                    </div>
                  </Button>
                  <Button
                    type="button"
                    variant={paymentOperator === 'airtel' ? 'default' : 'outline'}
                    className={`h-20 ${paymentOperator === 'airtel' ? 'bg-red-600 hover:bg-red-700 border-2 border-red-700' : 'border-2'}`}
                    onClick={() => setPaymentOperator('airtel')}
                    disabled={isProcessingPayment}
                  >
                    <div className="text-center">
                      <div className="font-semibold">Airtel</div>
                      <div className="text-xs">Money</div>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Téléphone - APRÈS L'OPÉRATEUR */}
              {paymentOperator && (
                <div>
                  <Label htmlFor="payment-phone">Numéro de téléphone Mobile Money</Label>
                  <Input
                    id="payment-phone"
                    type="tel"
                    placeholder="0XXXXXXXXX"
                    value={paymentPhone}
                    onChange={(e) => {
                      // Limiter à 10 chiffres maximum (formats RDC)
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setPaymentPhone(value);
                    }}
                    disabled={isProcessingPayment}
                    className="mt-1 h-12 text-lg font-mono"
                    maxLength={10}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    10 chiffres maximum • Formats acceptés: 0XXXXXXXXX, +243XXXXXXXXX
                  </p>
                </div>
              )}

              {/* Information */}
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800">
                    <strong>Important :</strong> Après le paiement, vous pourrez activer le mode Post-Payé
                    et commencer à recevoir des demandes de courses.
                  </p>
                </div>
              </div>

              {/* Boutons */}
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={() => setShowPaymentModal(false)}
                  disabled={isProcessingPayment}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handlePostpaidPayment}
                  className="flex-1 h-12 bg-orange-500 hover:bg-orange-600"
                  disabled={isProcessingPayment || !paymentPhone || !paymentOperator || !rechargeAmount || parseInt(rechargeAmount) < 1000}
                >
                  {isProcessingPayment ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Traitement...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Payer maintenant
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
