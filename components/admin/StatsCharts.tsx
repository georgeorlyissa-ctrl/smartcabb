import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
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
        category: category.replace('Smart ', ''),
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

  const chartConfig = {
    courses: {
      label: 'Courses',
      color: 'hsl(var(--chart-1))'
    },
    completees: {
      label: 'Complétées',
      color: 'hsl(var(--chart-2))'
    },
    revenus: {
      label: 'Revenus (k CDF)',
      color: 'hsl(var(--chart-3))'
    },
    note: {
      label: 'Note',
      color: 'hsl(var(--chart-4))'
    }
  };

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
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={last7DaysData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tick={{ fill: '#6b7280' }}
                  />
                  <YAxis className="text-xs" tick={{ fill: '#6b7280' }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="courses" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="completees" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartContainer>
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
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={last7DaysData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tick={{ fill: '#6b7280' }}
                  />
                  <YAxis className="text-xs" tick={{ fill: '#6b7280' }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="courses" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="completees" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartContainer>
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
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                  <XAxis 
                    dataKey="category" 
                    className="text-xs"
                    tick={{ fill: '#6b7280' }}
                  />
                  <YAxis className="text-xs" tick={{ fill: '#6b7280' }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="courses" 
                    fill="#8b5cf6" 
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartContainer>
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
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topDriversData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                  <XAxis type="number" className="text-xs" tick={{ fill: '#6b7280' }} />
                  <YAxis 
                    type="category" 
                    dataKey="nom" 
                    className="text-xs"
                    tick={{ fill: '#6b7280' }}
                    width={80}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="courses" 
                    fill="#f97316" 
                    radius={[0, 8, 8, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartContainer>
        </Card>
      </motion.div>
    </div>
  );
}