import { useEffect, useState } from 'react';
import {
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Star,
  Navigation,
  X,
  User,
  Car,
  AlertTriangle,
  Award,
  Shield
} from '../../lib/icons';
import { Button } from '../ui/button';
import { motion } from '../../lib/motion';
import { useAppState } from '../../hooks/useAppState';
import { useTranslation } from '../../hooks/useTranslation';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { toast } from '../../lib/toast';

interface DriverFoundScreenProps {
  driverData: {
    id: string;
    full_name: string;
    phone: string;
    rating: number;
    total_rides: number;
    photo_url?: string; // ✅ Ajout photo
    vehicle?: {
      make: string;
      model: string;
      year: number;
      color: string;
      license_plate: string;
    };
  };
  confirmationCode: string;
  estimatedArrival: number; // en minutes
}

export function DriverFoundScreen({ driverData: initialDriverData, confirmationCode, estimatedArrival }: DriverFoundScreenProps) {
  const { t } = useTranslation();
  const { setCurrentScreen, state, updateRide } = useAppState();
  const [arrivalTime, setArrivalTime] = useState(estimatedArrival);
  const [driverData, setDriverData] = useState(initialDriverData);
  const [isLoadingDriverData, setIsLoadingDriverData] = useState(true);

  // ✅ Charger les VRAIES données du chauffeur depuis le backend
  useEffect(() => {
    const fetchDriverData = async () => {
      if (!initialDriverData.id) return;

      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/drivers/${initialDriverData.id}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.driver) {
            console.log('✅ Données chauffeur chargées depuis la DB:', data.driver);
            setDriverData({
              id: data.driver.id,
              full_name: data.driver.full_name,
              phone: data.driver.phone,
              rating: data.driver.rating || 5.0,
              total_rides: data.driver.total_rides || 0, // ✅ Vraies données
              photo_url: data.driver.photo || data.driver.photo_url, // ✅ Support des deux formats
              vehicle: data.driver.vehicle
            });
          }
        }
      } catch (error) {
        console.error('❌ Erreur chargement données chauffeur:', error);
      } finally {
        setIsLoadingDriverData(false);
      }
    };

    fetchDriverData();
  }, [initialDriverData.id]);

  // Compte à rebours de l'arrivée
  useEffect(() => {
    if (arrivalTime > 0) {
      const timer = setInterval(() => {
        setArrivalTime((prev) => Math.max(0, prev - 1));
      }, 60000); // Décrémenter chaque minute

      return () => clearInterval(timer);
    }
  }, [arrivalTime]);

  // ✅ POLLING : Détecter quand le conducteur confirme le code
  useEffect(() => {
    if (!state.currentRide?.id) return;

    const checkRideStatus = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/rides/status/${state.currentRide.id}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          
          // Si le conducteur a confirmé le code → course démarre
          if (data.ride?.status === 'in_progress') {
            console.log('🚗 Conducteur a confirmé le code ! Course démarrée');
            
            // Mettre à jour le state
            if (updateRide) {
              updateRide(state.currentRide.id, {
                status: 'in_progress',
                startedAt: data.ride.startedAt || new Date().toISOString()
              });
            }
            
            // Notification
            toast.success('Course démarrée !', {
              description: 'Votre chauffeur a confirmé le code. Suivez votre trajet en temps réel.',
              duration: 5000
            });
            
            // Navigation vers l'écran de tracking
            setCurrentScreen('ride-tracking');
          }
        }
      } catch (error) {
        console.debug('🔍 Vérification statut:', error instanceof Error ? error.message : 'erreur');
      }
    };

    // Vérifier toutes les 2 secondes
    const interval = setInterval(checkRideStatus, 2000);
    
    // Première vérification immédiate
    checkRideStatus();

    return () => clearInterval(interval);
  }, [state.currentRide?.id, setCurrentScreen, updateRide]);

  const handleWhatsAppCall = () => {
    // Ouvrir WhatsApp avec le numéro du chauffeur
    const phoneNumber = driverData.phone.replace(/\D/g, ''); // Retirer les caractères non numériques
    const message = encodeURIComponent(
      `Bonjour ${driverData.full_name}, je suis votre passager SmartCabb. Mon code de confirmation est ${confirmationCode}.`
    );
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  const handlePhoneCall = () => {
    window.location.href = `tel:${driverData.phone}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentScreen('map')}
            className="w-10 h-10 hover:bg-muted"
          >
            <X className="w-5 h-5 text-primary" />
          </Button>
          <h1 className="text-primary">Chauffeur trouvé !</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Animation de succès */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="flex flex-col items-center justify-center py-6"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <Car className="w-12 h-12 text-white" />
            </motion.div>
          </div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Chauffeur en route !</h2>
          <p className="text-muted-foreground text-center">
            Votre chauffeur arrive dans environ <span className="font-semibold text-primary">{arrivalTime} min</span>
          </p>
        </motion.div>

        {/* Code de confirmation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-6 h-6 text-amber-600" />
            <h3 className="font-semibold text-amber-900">Code de confirmation</h3>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-amber-300">
            <p className="text-xs text-muted-foreground mb-2">Donnez ce code au chauffeur avant de démarrer</p>
            <div className="text-4xl font-bold text-center text-amber-600 tracking-widest">
              {confirmationCode}
            </div>
          </div>
          <p className="text-xs text-amber-700 mt-3 text-center">
            ⚠️ Ne partagez ce code qu'avec votre chauffeur
          </p>
        </motion.div>

        {/* Informations du chauffeur */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg border border-border overflow-hidden"
        >
          {/* En-tête avec photo */}
          <div className="bg-gradient-to-r from-secondary to-primary p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                {driverData.photo_url ? (
                  <img 
                    src={driverData.photo_url} 
                    alt={driverData.full_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback si l'image ne charge pas
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <User className={`w-10 h-10 text-primary ${driverData.photo_url ? 'hidden' : ''}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold">{driverData.full_name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{driverData.rating.toFixed(1)}</span>
                  <span className="text-sm opacity-90">
                    ({isLoadingDriverData ? '...' : driverData.total_rides} courses)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Détails du véhicule */}
          {driverData.vehicle && (
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Car className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Véhicule</p>
                  <p className="font-semibold">
                    {driverData.vehicle.make} {driverData.vehicle.model} ({driverData.vehicle.year})
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Couleur</p>
                  <p className="font-medium">{driverData.vehicle.color}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Plaque</p>
                  <p className="font-mono font-bold text-primary">{driverData.vehicle.license_plate}</p>
                </div>
              </div>
            </div>
          )}

          {/* Badges de confiance */}
          <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="flex items-center gap-3 mb-3">
              <Award className="w-5 h-5 text-green-600" />
              <p className="font-semibold text-green-900">Chauffeur vérifié</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-white border border-green-200 rounded-full text-xs font-medium text-green-700">
                ✓ Permis vérifié
              </span>
              <span className="px-3 py-1 bg-white border border-green-200 rounded-full text-xs font-medium text-green-700">
                ✓ Assurance valide
              </span>
              <span className="px-3 py-1 bg-white border border-green-200 rounded-full text-xs font-medium text-green-700">
                ✓ Identité confirmée
              </span>
            </div>
          </div>
        </motion.div>

        {/* Informations de trajet */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg border border-border p-6 space-y-4"
        >
          <h3 className="font-semibold text-lg mb-4">Détails du trajet</h3>
          
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-secondary mt-1" />
            <div>
              <p className="text-sm text-muted-foreground">Point de départ</p>
              <p className="font-medium">{state.pickup?.address || 'Chargement...'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-accent mt-1" />
            <div>
              <p className="text-sm text-muted-foreground">Destination</p>
              <p className="font-medium">{state.destination?.address || 'Chargement...'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 mt-1" />
            <div>
              <p className="text-sm text-muted-foreground">Durée estimée</p>
              <p className="font-medium">{state.currentRide?.estimatedDuration || 15} minutes</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Boutons d'action fixes en bas */}
      <div className="bg-white border-t border-border p-4 space-y-3">
        <Button
          onClick={() => setCurrentScreen('driver-approaching')}
          className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg"
        >
          <Navigation className="w-5 h-5 mr-2" />
          Voir la distance et l'ETA
        </Button>
        
        <Button
          onClick={handleWhatsAppCall}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          Contacter sur WhatsApp
        </Button>
        
        <Button
          onClick={handlePhoneCall}
          variant="outline"
          className="w-full border-2 border-primary text-primary py-6 text-lg hover:bg-primary hover:text-white"
        >
          <Phone className="w-5 h-5 mr-2" />
          Appeler le chauffeur
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          En attente que le chauffeur confirme votre code...
        </p>
      </div>
    </div>
  );
}