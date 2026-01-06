"use client";

// 🔥 v311.5 - Version simplifiée SANS recharts (évite les erreurs de build Vercel)
import { useMemo } from 'react';
import { motion } from '../../framer-motion';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useSupabaseData } from '../../hooks/useSupabaseData';
import { TrendingUp, Calendar, DollarSign } from 'lucide-react';

export function StatsCharts() {
  const { rides, drivers } = useSupabaseData();

  // Préparer les données des 7 derniers jours
  const last7DaysData = useMemo(() => {
    const today = new Date();
    const days = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
      
      const dayRides = rides.filter(r => {
        const rideDate = new Date(r.created_at);
        return rideDate.toDateString() === date.toDateString();
      });
      
      const completedRides = dayRides.filter(r => r.status === 'completed');
      const revenue = completedRides.reduce((sum, r) => sum + (r.total_amount || 0), 0);
      
      days.push({
        date: dateStr,
        courses: dayRides.length,
        completees: completedRides.length,
        revenus: revenue / 1000 // En milliers de CDF
      });
    }
    
    return days;
  }, [rides]);

  // Données par catégorie de véhicule
  const categoryData = useMemo(() => {
    const categories = ['SmartCabb Standard', 'SmartCabb Confort', 'SmartCabb Plus', 'SmartCabb Business'];
    
    return categories.map(category => {
      const categoryRides = rides.filter(r => r.category === category && r.status === 'completed');
      const revenue = categoryRides.reduce((sum, r) => sum + (r.total_amount || 0), 0);
      
      return {
        category: category.replace('SmartCabb ', ''),
        courses: categoryRides.length,
        revenus: revenue / 1000 // En milliers de CDF
      };
    });
  }, [rides]);

  // Données de performance des conducteurs (top 5)
  const topDriversData = useMemo(() => {
    const sortedDrivers = [...drivers]
      .sort((a, b) => b.total_rides - a.total_rides)
      .slice(0, 5);
    
    return sortedDrivers.map(driver => ({
      nom: driver.full_name?.split(' ')[0] || 'Conducteur',
      courses: driver.total_rides,
      note: driver.rating
    }));
  }, [drivers]);

  const maxCourses = Math.max(...last7DaysData.map(d => d.courses), 1);
  const maxCompletees = Math.max(...last7DaysData.map(d => d.completees), 1);
  const maxRevenus = Math.max(...last7DaysData.map(d => d.revenus), 1);
  const maxCategoryCourses = Math.max(...categoryData.map(d => d.courses), 1);
  const maxDriverCourses = Math.max(...topDriversData.map(d => d.courses), 1);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Graphique des courses sur 7 jours */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Activité des 7 derniers jours
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Évolution quotidienne des courses
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {last7DaysData.map((day, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 font-medium w-20">{day.date}</span>
                  <div className="flex gap-4 text-xs">
                    <span className="text-blue-600">Total: {day.courses}</span>
                    <span className="text-green-600">Complétées: {day.completees}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <div className="bg-gray-200 rounded-full h-6 overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full transition-all duration-500"
                        style={{ width: `${(day.courses / maxCourses) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-200 rounded-full h-6 overflow-hidden">
                      <div 
                        className="bg-green-500 h-full transition-all duration-500"
                        style={{ width: `${(day.completees / maxCompletees) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-xs text-gray-600">Courses totales</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-xs text-gray-600">Courses complétées</span>
            </div>
          </div>
        </Card>

        {/* Graphique des revenus par jour */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                Revenus quotidiens
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                En milliers de CDF
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {last7DaysData.map((day, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-20 text-sm text-gray-600 font-medium">{day.date}</div>
                <div className="flex-1">
                  <div className="bg-gray-200 rounded-full h-8 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-green-600 h-full flex items-center justify-end px-3 text-white text-sm font-semibold transition-all duration-500"
                      style={{ width: `${(day.revenus / maxRevenus) * 100}%` }}
                    >
                      {day.revenus > 0 && `${(day.revenus || 0).toFixed(1)}k CDF`}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Graphique par catégorie */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                Performance par catégorie
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Nombre de courses et revenus
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {categoryData.map((cat, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{cat.category}</span>
                  <span className="text-sm text-gray-600">{cat.courses} courses</span>
                </div>
                <div className="bg-gray-200 rounded-full h-8 overflow-hidden">
                  <div 
                    className="bg-purple-500 h-full flex items-center justify-end px-3 text-white text-xs font-semibold transition-all duration-500"
                    style={{ width: `${(cat.courses / maxCategoryCourses) * 100}%` }}
                  >
                    {cat.revenus > 0 && `${(cat.revenus || 0).toFixed(1)}k CDF`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top conducteurs */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-orange-600" />
                Top 5 conducteurs
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Par nombre de courses
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {topDriversData.map((driver, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{driver.nom}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{driver.courses} courses</span>
                      <span className="text-xs text-yellow-600">⭐ {(driver.note || 0).toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="bg-gray-200 rounded-full h-6 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-orange-400 to-orange-600 h-full transition-all duration-500"
                      style={{ width: `${(driver.courses / maxDriverCourses) * 100}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}