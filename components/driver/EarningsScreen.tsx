import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useAppState } from '../../hooks/useAppState';
import { 
  ArrowLeft, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Clock,
  MapPin,
  Star
} from 'lucide-react';

export function EarningsScreen() {
  const { state, setCurrentScreen } = useAppState();
  const driver = state.currentDriver;

  const todayRides = [
    {
      id: 1,
      time: '14:30',
      pickup: 'Palais de la Nation',
      destination: 'Marché Central',
      distance: '4.2 km',
      duration: '12 min',
      earnings: 12500,
      rating: 5
    },
    {
      id: 2,
      time: '13:15',
      pickup: 'Université de Kinshasa',
      destination: 'Boulevard du 30 Juin',
      distance: '3.8 km',
      duration: '18 min',
      earnings: 11750,
      rating: 4
    },
    {
      id: 3,
      time: '12:00',
      pickup: 'Gombe',
      destination: 'Kalamu',
      distance: '2.1 km',
      duration: '8 min',
      earnings: 8250,
      rating: 5
    }
  ];

  const totalToday = todayRides.reduce((sum, ride) => sum + ride.earnings, 0);

  if (!driver) return null;

  return (
    <motion.div 
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ type: 'spring', damping: 25 }}
      className="min-h-screen bg-gray-50 flex flex-col"
    >
      {/* Header */}
      <div className="bg-white shadow-sm p-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentScreen('driver-dashboard')}
            className="w-10 h-10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl">Mes gains</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-4 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Aujourd'hui</p>
                <p className="text-2xl font-bold">{totalToday.toLocaleString()} CDF</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-200" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Cette semaine</p>
                <p className="text-2xl font-bold">{(totalToday * 4.5).toLocaleString()} CDF</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-200" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Courses</p>
                <p className="text-lg font-semibold">{todayRides.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Temps actif</p>
                <p className="text-lg font-semibold">6h 30m</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Today's Rides */}
      <div className="flex-1 px-6 pb-6">
        <h2 className="text-lg mb-4">Courses d'aujourd'hui</h2>
        
        <div className="space-y-3">
          {todayRides.map((ride, index) => (
            <motion.div
              key={ride.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">{ride.time}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-green-600">CDF</span>
                    <span className="font-semibold text-green-600">
                      {ride.earnings.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Départ</p>
                      <p className="font-medium">{ride.pickup}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Destination</p>
                      <p className="font-medium">{ride.destination}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{ride.distance} • {ride.duration}</span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span>{ride.rating}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Back to Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Button
            onClick={() => setCurrentScreen('driver-dashboard')}
            className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
          >
            Retour au tableau de bord
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}