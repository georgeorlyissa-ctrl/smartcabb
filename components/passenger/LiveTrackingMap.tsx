import { useEffect, useState } from 'react';
import { LiveTrackingMap } from './LiveTrackingMap';
import { useAppState } from '../../hooks/useAppState';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { toast } from 'sonner';
import { Share2, AlertTriangle, Clock, Navigation } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';

export function LiveTrackingScreen() {
  const { state, setCurrentScreen, updateRide } = useAppState();
  const currentRide = state.currentRide;
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showSOSDialog, setShowSOSDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  // ⏱️ Chronomètre - CORRECTION : Utiliser billingStartTime au lieu de startedAt
  // Le chronomètre démarre UNIQUEMENT quand le driver désactive le temps d'attente
  useEffect(() => {
    const billingStart = currentRide?.billingStartTime;
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
  }, [currentRide?.billingStartTime]);

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
    const shareText = `🚕 Je suis en course SmartCabb\n\n📍 Départ: ${state.pickup?.address || 'Position de départ'}\n📍 Arrivée: ${state.destination?.address || 'Destination'}\n👤 Conducteur: ${currentRide?.driverName || 'N/A'}\n🚗 Véhicule: ${currentRide?.vehicleType || 'N/A'}\n⏱️ Temps écoulé: ${formatTime(elapsedTime)}\n\nSuivez ma course en temps réel: https://smartcabb.com/track/${currentRide?.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Ma course SmartCabb',
          text: shareText
        });
        toast.success('Itinéraire partagé avec succès !');
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
        rideId: currentRide?.id,
        driverName: currentRide?.driverName,
        driverPhone: currentRide?.driverPhone,
        vehicleInfo: `${currentRide?.vehicleType} - ${currentRide?.vehiclePlate || 'N/A'}`,
        currentLocation: state.pickup,
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

  useEffect(() => {
    if (!currentRide?.id) return;

    const checkRideStatus = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/rides/status/${currentRide.id}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          
          // 🆕 SYNCHRONISER billingStartTime depuis le backend
          if (data.ride && updateRide) {
            // Mise à jour locale avec les données du backend
            updateRide(currentRide.id, {
              billingStartTime: data.ride.billingStartTime,
              freeWaitingDisabled: data.ride.freeWaitingDisabled,
              billingElapsedTime: data.ride.billingElapsedTime
            });
          }
          
          if (data.ride?.status === 'completed') {
            console.log('✅ Course terminée par le conducteur ! Passage au paiement');
            
            if (updateRide) {
              updateRide(currentRide.id, {
                status: 'completed',
                completedAt: data.ride.completedAt || new Date().toISOString(),
                finalPrice: data.ride.finalPrice || currentRide.estimatedPrice
              });
            }
            
            toast.success('Course terminée !', {
              description: 'Votre chauffeur a terminé la course. Procédez au paiement.',
              duration: 5000
            });
            
            setCurrentScreen('payment');
          }
        }
      } catch (error) {
        console.debug('🔍 Vérification statut:', error instanceof Error ? error.message : 'erreur');
      }
    };

    const interval = setInterval(checkRideStatus, 3000);
    checkRideStatus();

    return () => clearInterval(interval);
  }, [currentRide?.id, setCurrentScreen, updateRide]);

  if (!currentRide) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900 mb-4">Aucune course en cours</p>
          <button
            onClick={() => setCurrentScreen('map')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Retour à la carte
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Course en cours</h1>
            <p className="text-sm text-gray-600">
              {currentRide.driverName || 'Conducteur'} vous emmène à destination
            </p>
          </div>
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        </div>
      </div>

      <div className="flex-1 p-4">
        <LiveTrackingMap 
          driverId={currentRide.driverId || ''}
          pickup={state.pickup || { lat: -4.3276, lng: 15.3136, address: 'Kinshasa' }}
          destination={state.destination || { lat: -4.3276, lng: 15.3136, address: 'Kinshasa' }}
          driverName={currentRide.driverName || 'Conducteur'}
        />
      </div>

      <div className="bg-white border-t border-gray-200 p-4 space-y-4">
        {/* Chronomètre + Infos de course */}
        <div className="flex items-center justify-center mb-3">
          <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900 tabular-nums">
              {formatTime(elapsedTime)}
            </span>
          </div>
        </div>

        {/* Prix et Durée estimée */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-1">Prix estimé</p>
            <p className="text-lg font-bold text-gray-900">
              {currentRide.estimatedPrice?.toLocaleString()} CDF
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-1">Durée estimée</p>
            <p className="text-lg font-bold text-gray-900">
              {currentRide.estimatedDuration || 15} min
            </p>
          </div>
        </div>

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
              <p><strong>📍 Départ:</strong> {state.pickup?.address || 'Position de départ'}</p>
              <p><strong>📍 Arrivée:</strong> {state.destination?.address || 'Destination'}</p>
              <p><strong>👤 Conducteur:</strong> {currentRide?.driverName || 'N/A'}</p>
              <p><strong>⏱️ Temps:</strong> {formatTime(elapsedTime)}</p>
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
