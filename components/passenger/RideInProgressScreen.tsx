import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useAppState } from '../../hooks/useAppState';
import { 
  MapPin, 
  Clock, 
  DollarSign,
  User,
  Phone,
  Car,
  AlertCircle,
  Sun,
  Moon,
  Zap,
  Timer
} from 'lucide-react';
import { convertUSDtoCDF, convertCDFtoUSD, getExchangeRate } from '../../lib/pricing';
import { PRICING_CONFIG } from '../../lib/pricing-data';
import { RatingDialog } from './RatingDialog';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { toast } from 'sonner';

const FREE_WAITING_TIME = 10 * 60; // 10 minutes en secondes

// Fonction pour détecter jour/nuit
function getTimeOfDay(): 'jour' | 'nuit' {
  const hour = new Date().getHours();
  // Jour: 06:00-20:59 | Nuit: 21:00-05:59
  if (hour >= 6 && hour <= 20) {
    return 'jour';
  }
  return 'nuit';
}

export function RideInProgressScreen() {
  const { state, setCurrentScreen, updateRide } = useAppState();
  const currentRide = state.currentRide;
  
  const [elapsedTime, setElapsedTime] = useState(0); // Temps écoulé en secondes
  const [currentCost, setCurrentCost] = useState(0); // Coût actuel en CDF
  const [currentCostUSD, setCurrentCostUSD] = useState(0); // Coût actuel en USD
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [rideCompleted, setRideCompleted] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState<'jour' | 'nuit'>(getTimeOfDay());
  
  // 🆕 États pour le compteur de facturation synchronisé
  const [billingActive, setBillingActive] = useState(false);
  const [billingElapsedTime, setBillingElapsedTime] = useState(0);
  const [showBillingNotification, setShowBillingNotification] = useState(false);
  
  // État pour tracker les notifications envoyées
  const [notificationsSent, setNotificationsSent] = useState({
    rideStarted: false,
    billingStarted: false,
    rideCompleted: false
  });

  // Mettre à jour l'heure du jour toutes les minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeOfDay(getTimeOfDay());
    }, 60000); // Vérifier toutes les minutes
    return () => clearInterval(interval);
  }, []);

  // 🆕 SYNCHRONISATION DU COMPTEUR DE FACTURATION AVEC LE CONDUCTEUR
  useEffect(() => {
    if (!currentRide || currentRide.status !== 'in_progress') return;

    // Vérifier si le conducteur a activé la facturation
    if (currentRide.billingStartTime && !billingActive) {
      console.log('💰 Facturation activée par le conducteur !', {
        billingStartTime: currentRide.billingStartTime,
        currentTime: Date.now()
      });
      
      setBillingActive(true);
      setShowBillingNotification(true);
      
      // Notification immédiate au passager
      toast.warning('⚡ Facturation commencée !', {
        description: 'Le conducteur a activé la facturation. Le compteur est en cours.',
        duration: 7000
      });

      // Masquer la notification après 5 secondes
      setTimeout(() => {
        setShowBillingNotification(false);
      }, 5000);
    }

    // Synchroniser le temps de facturation avec le conducteur
    if (currentRide.billingStartTime && billingActive) {
      const startTime = currentRide.billingStartTime;
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setBillingElapsedTime(elapsed);
        
        console.log('⏱️ Temps de facturation côté passager:', {
          elapsed,
          billingStartTime: startTime,
          currentTime: Date.now()
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [currentRide?.billingStartTime, currentRide?.billingElapsedTime, billingActive]);

  // 🆕 DÉTECTION DE LA CLÔTURE DE LA COURSE
  useEffect(() => {
    if (!currentRide) return;

    // Si la course est terminée et qu'on a un temps de facturation final
    if (currentRide.status === 'completed' && currentRide.billingElapsedTime !== undefined && !rideCompleted) {
      console.log('🏁 Course clôturée par le conducteur !', {
        billingElapsedTime: currentRide.billingElapsedTime,
        estimatedPrice: currentRide.estimatedPrice
      });

      setRideCompleted(true);
      setBillingElapsedTime(currentRide.billingElapsedTime);
      
      // 🆕 NOTIFICATION AVEC TEMPS DE FACTURATION EXACT
      const minutes = Math.floor(currentRide.billingElapsedTime / 60);
      const seconds = currentRide.billingElapsedTime % 60;
      
      const timeStr = minutes > 0 
        ? `${minutes}min ${seconds}s`
        : `${seconds}s`;
      
      toast.success('🏁 Course terminée !', {
        description: `Temps de facturation: ${timeStr}. Montant: ${(currentRide.estimatedPrice || 0).toLocaleString()} CDF`,
        duration: 8000
      });

      // Rediriger vers le paiement après 2 secondes
      setTimeout(() => {
        setCurrentScreen('payment');
      }, 2000);
    }
  }, [currentRide?.status, currentRide?.billingElapsedTime, rideCompleted]);

  // Chronomètre général de la course
  useEffect(() => {
    if (!currentRide || currentRide.status !== 'in_progress') return;

    // Notification au démarrage de la course (une seule fois)
    if (!notificationsSent.rideStarted) {
      toast.success('Course démarrée !', {
        description: 'Le chronomètre est activé. Les 10 premières minutes sont gratuites.',
        duration: 5000
      });
      setNotificationsSent(prev => ({ ...prev, rideStarted: true }));
    }

    const startTime = currentRide.startedAt ? new Date(currentRide.startedAt).getTime() : Date.now();
    
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      setElapsedTime(elapsed);
      
      // Calculer le coût en temps réel
      const { costCDF, costUSD } = calculateRealTimeCost(elapsed);
      setCurrentCost(costCDF);
      setCurrentCostUSD(costUSD);
      
      // Notification quand la facturation commence automatiquement (après 10 minutes)
      if (elapsed >= FREE_WAITING_TIME && !notificationsSent.billingStarted && !billingActive) {
        toast.warning('Facturation automatique commencée', {
          description: `Les 10 minutes gratuites sont écoulées. Facturation en cours.`,
          duration: 6000
        });
        setNotificationsSent(prev => ({ ...prev, billingStarted: true }));
        setBillingActive(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentRide, timeOfDay, billingActive]);

  // Calculer le coût en temps réel avec taux de change dynamique
  const calculateRealTimeCost = (totalSeconds: number): { costCDF: number; costUSD: number } => {
    if (!currentRide || totalSeconds < FREE_WAITING_TIME) {
      return { costCDF: 0, costUSD: 0 };
    }

    // Temps de facturation (après les 10 minutes gratuites)
    const billedSeconds = totalSeconds - FREE_WAITING_TIME;
    const billedHours = billedSeconds / 3600;
    
    // Récupérer le taux horaire selon la catégorie et le moment
    const category = currentRide.vehicleCategory || 'standard';
    const hourlyRateUSD = PRICING_CONFIG.waitingTimePricing[category]?.[timeOfDay] || 
                          PRICING_CONFIG.waitingTimePricing.standard[timeOfDay];
    
    // Calculer le coût
    const costUSD = billedHours * hourlyRateUSD;
    const costCDF = convertUSDtoCDF(costUSD);
    
    return { costCDF: Math.round(costCDF), costUSD: parseFloat(costUSD.toFixed(2)) };
  };

  if (!currentRide) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-6">
          <p>Aucune course en cours</p>
        </Card>
      </div>
    );
  }

  // Format de temps pour affichage
  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}h ${mins}min ${secs}s`;
    }
    return `${mins}min ${secs}s`;
  };

  const category = currentRide.vehicleCategory || 'standard';
  const hourlyRateUSD = PRICING_CONFIG.waitingTimePricing[category]?.[timeOfDay] || 
                        PRICING_CONFIG.waitingTimePricing.standard[timeOfDay];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Course en cours</h1>
              <p className="text-sm text-gray-600">Trajet vers votre destination</p>
            </div>
            <div className="flex items-center space-x-2">
              {timeOfDay === 'jour' ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-blue-500" />
              )}
              <span className="text-sm font-medium capitalize">{timeOfDay}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🆕 NOTIFICATION DE FACTURATION ACTIVÉE */}
      <AnimatePresence>
        {showBillingNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-0 right-0 z-50 mx-4"
          >
            <Card className="p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">⚡ Facturation activée !</h3>
                  <p className="text-sm text-white/90">Le conducteur a activé le compteur de facturation.</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 space-y-4">
        {/* 🆕 COMPTEUR DE FACTURATION SYNCHRONISÉ */}
        {billingActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4"
          >
            <Card className="p-6 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                    <Timer className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">⚡ Facturation en cours</h3>
                    <p className="text-sm text-white/80">Temps facturé</p>
                  </div>
                </div>
              </div>
              
              {/* Compteur de facturation */}
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-5xl font-bold font-mono mb-2 tracking-wider">
                    {formatTime(billingElapsedTime)}
                  </div>
                  <div className="text-sm text-white/70">
                    Taux: {hourlyRateUSD}$/h • {convertUSDtoCDF(hourlyRateUSD).toLocaleString()} CDF/h
                  </div>
                </div>
              </div>

              {/* Coût en temps réel de la facturation */}
              {billingElapsedTime > 0 && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/80">Coût facturation:</span>
                    <span className="text-2xl font-bold">
                      {Math.round(convertUSDtoCDF((billingElapsedTime / 3600) * hourlyRateUSD)).toLocaleString()} CDF
                    </span>
                  </div>
                  <div className="text-xs text-white/60 text-right mt-1">
                    ≈ {((billingElapsedTime / 3600) * hourlyRateUSD).toFixed(2)} USD
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* Chronomètre principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Clock className="w-8 h-8" />
                <div>
                  <h2 className="text-lg font-semibold">Temps écoulé</h2>
                  <p className="text-sm text-blue-100">
                    {elapsedTime < FREE_WAITING_TIME 
                      ? `Attente gratuite: ${Math.floor((FREE_WAITING_TIME - elapsedTime) / 60)} min restantes`
                      : 'Facturation en cours'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-5xl font-bold font-mono mb-2 tracking-wider">
                {formatTime(elapsedTime)}
              </div>
            </div>

            {/* Barre de progression */}
            <div className="mt-4">
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ${
                    elapsedTime < FREE_WAITING_TIME ? 'bg-green-400' : 'bg-yellow-400'
                  }`}
                  style={{ 
                    width: `${Math.min((elapsedTime / FREE_WAITING_TIME) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Coût en temps réel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <DollarSign className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold">Coût actuel</h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Prix de base:</span>
                <span className="font-semibold">{currentRide.estimatedPrice?.toLocaleString() || 0} CDF</span>
              </div>

              {elapsedTime >= FREE_WAITING_TIME && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Temps d'attente:</span>
                  <span className="font-semibold text-orange-600">+{currentCost.toLocaleString()} CDF</span>
                </div>
              )}

              <div className="pt-3 border-t flex justify-between items-center">
                <span className="text-lg font-bold">Total:</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {(currentRide.estimatedPrice + currentCost).toLocaleString()} CDF
                  </div>
                  <div className="text-sm text-gray-500">
                    ≈ {((currentRide.estimatedPrice + currentCost) / getExchangeRate()).toFixed(2)} USD
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Informations du trajet */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Détails du trajet</h3>
            
            <div className="space-y-4">
              {/* Départ */}
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Départ</p>
                  <p className="font-medium">{currentRide.pickup.address}</p>
                </div>
              </div>

              {/* Destination */}
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Destination</p>
                  <p className="font-medium">{currentRide.destination.address}</p>
                </div>
              </div>

              {/* Conducteur */}
              <div className="flex items-start space-x-3 pt-3 border-t">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Conducteur</p>
                  <p className="font-medium">{currentRide.driverName || 'Chauffeur'}</p>
                </div>
              </div>

              {/* Véhicule */}
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Car className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Véhicule</p>
                  <p className="font-medium capitalize">{currentRide.vehicleCategory || 'Standard'}</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Note d'information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Informations de facturation</p>
                <ul className="space-y-1 text-xs">
                  <li>• Les 10 premières minutes d'attente sont gratuites</li>
                  <li>• Après 10 minutes: facturation à {hourlyRateUSD}$/heure ({convertUSDtoCDF(hourlyRateUSD).toLocaleString()} CDF/h)</li>
                  <li>• Tarif {timeOfDay} en vigueur</li>
                  {billingActive && <li className="font-bold text-orange-700">• ⚡ Facturation activée par le conducteur</li>}
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Dialog d'évaluation */}
      {showRatingDialog && (
        <RatingDialog
          onClose={() => {
            setShowRatingDialog(false);
            setCurrentScreen('home');
          }}
        />
      )}
    </div>
  );
}