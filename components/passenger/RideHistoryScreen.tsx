import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useAppState } from '../../hooks/useAppState';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Star, 
  CreditCard, 
  Smartphone, 
  Banknote,
  Calendar,
  Route
} from 'lucide-react';

export function RideHistoryScreen() {
  const { setCurrentScreen, rides, state, drivers } = useAppState();

  // Filter rides for current user
  const userRides = rides
    .filter(ride => ride.passengerId === state.currentUser?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getPaymentIcon = (method?: string) => {
    switch (method) {
      case 'mobile_money':
        return <Smartphone className="w-4 h-4" />;
      case 'card':
        return <CreditCard className="w-4 h-4" />;
      case 'cash':
        return <Banknote className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const getPaymentLabel = (method?: string) => {
    switch (method) {
      case 'mobile_money':
        return 'Mobile Money';
      case 'card':
        return 'Carte bancaire';
      case 'cash':
        return 'Espèces';
      default:
        return 'Non spécifié';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Terminée';
      case 'cancelled':
        return 'Annulée';
      case 'in_progress':
        return 'En cours';
      case 'pending':
        return 'En attente';
      default:
        return 'Acceptée';
    }
  };

  const getDriverName = (driverId?: string) => {
    if (!driverId) return 'Aucun chauffeur';
    const driver = drivers.find(d => d.id === driverId);
    return driver?.name || 'Chauffeur inconnu';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentScreen('map')}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl">Historique des courses</h1>
              <p className="text-sm text-gray-600">{userRides.length} course(s) réalisée(s)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {userRides.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Route className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg mb-2">Aucune course</h3>
            <p className="text-gray-600 mb-6">Vous n'avez pas encore effectué de course</p>
            <Button onClick={() => setCurrentScreen('map')}>
              Réserver une course
            </Button>
          </motion.div>
        ) : (
          userRides.map((ride, index) => (
            <motion.div
              key={ride.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(ride.status)}`}>
                      {getStatusLabel(ride.status)}
                    </span>
                    <span className="text-xs text-gray-500">
                      Course #{ride.id.slice(-4)}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{(ride.actualPrice || ride.estimatedPrice).toLocaleString()} CDF</p>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      {getPaymentIcon(ride.paymentMethod)}
                      <span>{getPaymentLabel(ride.paymentMethod)}</span>
                    </div>
                  </div>
                </div>

                {/* Itinéraire */}
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div className="w-0.5 h-8 bg-gray-300"></div>
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <MapPin className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-600">Départ</span>
                        </div>
                        <p className="text-sm font-medium">{ride.pickup.address}</p>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <MapPin className="w-4 h-4 text-red-600" />
                          <span className="text-sm text-gray-600">Destination</span>
                        </div>
                        <p className="text-sm font-medium">{ride.destination.address}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Détails supplémentaires */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-gray-600">Date</p>
                        <p className="font-medium">
                          {new Date(ride.createdAt).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-gray-600">Heure</p>
                        <p className="font-medium">
                          {new Date(ride.createdAt).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {ride.driverId && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Chauffeur</p>
                          <p className="font-medium">{getDriverName(ride.driverId)}</p>
                        </div>
                        {ride.rating && (
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{ride.rating}/5</span>
                          </div>
                        )}
                      </div>
                      {ride.comment && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">Commentaire</p>
                          <p className="text-sm italic">"{ride.comment}"</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}