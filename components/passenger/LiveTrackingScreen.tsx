import { useEffect } from 'react';
import { LiveTrackingMap } from './LiveTrackingMap';
import { useAppState } from '../../hooks/useAppState';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { toast } from 'sonner';

export function LiveTrackingScreen() {
  const { state, setCurrentScreen, updateRide } = useAppState();
  const currentRide = state.currentRide;

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

      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-between text-sm">
          <div>
            <p className="text-gray-600">Prix estimé</p>
            <p className="text-lg font-bold text-gray-900">
              {currentRide.estimatedPrice?.toLocaleString()} CDF
            </p>
          </div>
          <div>
            <p className="text-gray-600">Durée estimée</p>
            <p className="text-lg font-bold text-gray-900">
              {currentRide.estimatedDuration || 15} min
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
