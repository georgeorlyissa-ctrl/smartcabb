import { motion } from 'motion/react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { Car, Users, DollarSign, TrendingUp, MapPin, Clock } from 'lucide-react';
import { Card } from './ui/card';

export function LiveStatsPanel() {
  const { drivers, rides, getPassengers, getStats } = useSupabaseData();
  const passengers = getPassengers();
  const supabaseStats = getStats();

  // Statistiques en temps réel
  const onlineDrivers = drivers.filter(d => d.is_available).length;
  const totalDrivers = drivers.length;
  const activeRides = rides.filter(r => r.status === 'started').length;
  const completedToday = rides.filter(r => {
    const today = new Date();
    const rideDate = new Date(r.created_at);
    return r.status === 'completed' && 
           rideDate.toDateString() === today.toDateString();
  }).length;
  
  const totalRevenue = supabaseStats.totalRevenue;
  
  const totalPassengers = passengers.length;

  const stats = [
    {
      label: 'Conducteurs en ligne',
      value: `${onlineDrivers}/${totalDrivers}`,
      icon: Car,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      trend: onlineDrivers > 0 ? '+live' : null
    },
    {
      label: 'Courses actives',
      value: activeRides,
      icon: MapPin,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      trend: activeRides > 0 ? 'en cours' : null
    },
    {
      label: 'Courses complétées',
      value: completedToday,
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      trend: 'aujourd\'hui'
    },
    {
      label: 'Revenus totaux',
      value: `${totalRevenue.toLocaleString('fr-FR')} CDF`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      trend: completedToday > 0 ? `+${completedToday} aujourd'hui` : null
    },
    {
      label: 'Passagers actifs',
      value: totalPassengers,
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      trend: null
    },
    {
      label: 'Courses totales',
      value: rides.length,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      trend: `${completedToday} complétées`
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  {stat.trend && (
                    <p className="text-xs text-gray-500 mt-1">
                      {stat.trend}
                    </p>
                  )}
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              
              {/* Barre de progression pour conducteurs en ligne */}
              {stat.label === 'Conducteurs en ligne' && totalDrivers > 0 && (
                <div className="mt-3">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(onlineDrivers / totalDrivers) * 100}%` }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className="h-full bg-blue-500"
                    />
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
