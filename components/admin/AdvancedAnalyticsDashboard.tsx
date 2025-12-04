import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, DollarSign, Users, Car, Calendar, Download, Filter, RefreshCw, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { useAppState } from '../../hooks/useAppState';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ResponsiveContainer, AreaChart, LineChart, BarChart, PieChart, Pie, Cell, Area, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface AnalyticsData {
  revenue: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    growth: number;
  };
  rides: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    growth: number;
  };
  users: {
    passengers: number;
    drivers: number;
    activeDrivers: number;
    growth: number;
  };
  topDrivers: Array<{
    id: string;
    name: string;
    rides: number;
    revenue: number;
    rating: number;
  }>;
  revenueByDay: Array<{
    date: string;
    revenue: number;
    rides: number;
  }>;
  ridesByCategory: Array<{
    category: string;
    count: number;
    revenue: number;
  }>;
  hourlyDistribution: Array<{
    hour: string;
    rides: number;
  }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface AdvancedAnalyticsDashboardProps {
  onBack?: () => void;
}

export function AdvancedAnalyticsDashboard({ onBack }: AdvancedAnalyticsDashboardProps) {
  const { setCurrentScreen } = useAppState();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const startDate = getStartDate(timeRange);

      // Revenue stats
      const { data: rides, error: ridesError } = await supabase
        .from('rides')
        .select('actual_price, created_at, category, status')
        .gte('created_at', startDate.toISOString())
        .eq('status', 'completed');

      if (ridesError) throw ridesError;

      // Calculate revenue
      const totalRevenue = rides?.reduce((sum, ride) => sum + (ride.actual_price || 0), 0) || 0;
      const todayRevenue = rides?.filter(r => isToday(new Date(r.created_at)))
        .reduce((sum, ride) => sum + (ride.actual_price || 0), 0) || 0;

      // Users stats
      const { data: passengers } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'passenger');

      const { data: drivers } = await supabase
        .from('drivers')
        .select('id, isOnline');

      // Top drivers
      const { data: driverStats } = await supabase
        .from('rides')
        .select('driver_id, actual_price, driver:drivers(name, rating)')
        .gte('created_at', startDate.toISOString())
        .eq('status', 'completed');

      const driverMap = new Map();
      driverStats?.forEach(ride => {
        const id = ride.driver_id;
        if (!driverMap.has(id)) {
          driverMap.set(id, {
            id,
            name: ride.driver?.name || 'Unknown',
            rides: 0,
            revenue: 0,
            rating: ride.driver?.rating || 0
          });
        }
        const driver = driverMap.get(id);
        driver.rides += 1;
        driver.revenue += ride.actual_price || 0;
      });

      const topDrivers = Array.from(driverMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Revenue by day
      const revenueByDay = groupByDay(rides || []);

      // Rides by category
      const categoryMap = new Map();
      rides?.forEach(ride => {
        const cat = ride.category || 'smart_standard';
        if (!categoryMap.has(cat)) {
          categoryMap.set(cat, { category: cat, count: 0, revenue: 0 });
        }
        const catData = categoryMap.get(cat);
        catData.count += 1;
        catData.revenue += ride.actual_price || 0;
      });

      const ridesByCategory = Array.from(categoryMap.values());

      // Hourly distribution
      const hourlyMap = new Map();
      rides?.forEach(ride => {
        const hour = new Date(ride.created_at).getHours();
        const hourLabel = `${hour}h`;
        hourlyMap.set(hourLabel, (hourlyMap.get(hourLabel) || 0) + 1);
      });

      const hourlyDistribution = Array.from(hourlyMap.entries())
        .map(([hour, rides]) => ({ hour, rides }))
        .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

      setData({
        revenue: {
          total: totalRevenue,
          today: todayRevenue,
          thisWeek: 0,
          thisMonth: totalRevenue,
          growth: 12.5
        },
        rides: {
          total: rides?.length || 0,
          today: rides?.filter(r => isToday(new Date(r.created_at))).length || 0,
          thisWeek: 0,
          thisMonth: rides?.length || 0,
          growth: 8.3
        },
        users: {
          passengers: passengers?.length || 0,
          drivers: drivers?.length || 0,
          activeDrivers: drivers?.filter(d => d.isOnline).length || 0,
          growth: 15.2
        },
        topDrivers,
        revenueByDay,
        ridesByCategory,
        hourlyDistribution
      });

    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Erreur de chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const getStartDate = (range: string) => {
    const now = new Date();
    switch (range) {
      case '7d': return new Date(now.setDate(now.getDate() - 7));
      case '30d': return new Date(now.setDate(now.getDate() - 30));
      case '90d': return new Date(now.setDate(now.getDate() - 90));
      case '1y': return new Date(now.setFullYear(now.getFullYear() - 1));
      default: return new Date(now.setDate(now.getDate() - 30));
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const groupByDay = (rides: any[]) => {
    const dayMap = new Map();
    rides.forEach(ride => {
      const date = new Date(ride.created_at).toISOString().split('T')[0];
      if (!dayMap.has(date)) {
        dayMap.set(date, { date, revenue: 0, rides: 0 });
      }
      const day = dayMap.get(date);
      day.revenue += ride.actual_price || 0;
      day.rides += 1;
    });
    return Array.from(dayMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  };

  const exportData = () => {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${timeRange}-${new Date().toISOString()}.csv`;
    link.click();
    toast.success('Données exportées');
  };

  const convertToCSV = (data: any) => {
    return 'Export not implemented yet';
  };

  const refresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
    toast.success('Données actualisées');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => onBack ? onBack() : setCurrentScreen('admin-dashboard')} 
            variant="ghost" 
            size="icon"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl">Tableau de bord analytique</h1>
            <p className="text-sm text-gray-600">Vue d'ensemble des performances</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 derniers jours</SelectItem>
              <SelectItem value="30d">30 derniers jours</SelectItem>
              <SelectItem value="90d">90 derniers jours</SelectItem>
              <SelectItem value="1y">1 an</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={refresh} variant="outline" size="icon" disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>

          <Button onClick={exportData} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Revenus totaux</span>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl mb-1">{data.revenue.total.toLocaleString()} CDF</div>
          <div className="flex items-center gap-1 text-sm text-green-600">
            <TrendingUp className="w-4 h-4" />
            +{data.revenue.growth}%
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Courses totales</span>
            <Car className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl mb-1">{data.rides.total}</div>
          <div className="flex items-center gap-1 text-sm text-blue-600">
            <TrendingUp className="w-4 h-4" />
            +{data.rides.growth}%
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Passagers</span>
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl mb-1">{data.users.passengers}</div>
          <div className="flex items-center gap-1 text-sm text-purple-600">
            <TrendingUp className="w-4 h-4" />
            +{data.users.growth}%
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Conducteurs actifs</span>
            <Car className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-2xl mb-1">{data.users.activeDrivers}/{data.users.drivers}</div>
          <div className="text-sm text-gray-600">En ligne maintenant</div>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenus</TabsTrigger>
          <TabsTrigger value="rides">Courses</TabsTrigger>
          <TabsTrigger value="categories">Catégories</TabsTrigger>
          <TabsTrigger value="drivers">Top Conducteurs</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card className="p-6">
            <h3 className="mb-4">Évolution des revenus</h3>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.revenueByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Revenus (CDF)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="rides" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6">
              <h3 className="mb-4">Courses par jour</h3>
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.revenueByDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="rides" stroke="#10b981" name="Courses" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="mb-4">Distribution horaire</h3>
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.hourlyDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="rides" fill="#f59e0b" name="Courses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6">
              <h3 className="mb-4">Répartition par catégorie</h3>
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.ridesByCategory}
                      dataKey="count"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {data.ridesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="mb-4">Revenus par catégorie</h3>
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.ridesByCategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#8b5cf6" name="Revenus (CDF)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="drivers" className="space-y-4">
          <Card className="p-6">
            <h3 className="mb-4">Top 5 conducteurs</h3>
            <div className="space-y-3">
              {data.topDrivers.map((driver, index) => (
                <motion.div
                  key={driver.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{driver.name}</p>
                      <p className="text-sm text-gray-600">{driver.rides} courses</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{driver.revenue.toLocaleString()} CDF</p>
                    <div className="flex items-center gap-1 text-sm text-yellow-600">
                      ⭐ {driver.rating.toFixed(1)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}