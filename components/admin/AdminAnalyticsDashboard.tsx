import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Car, 
  Users, 
  Calendar,
  Download,
  RefreshCw,
  Star
} from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { toast } from 'sonner';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const CATEGORY_NAMES = {
  smart_standard: 'Standard',
  smart_confort: 'Confort',
  smart_plus: 'Plus',
  smart_business: 'Business'
};

export function AdminAnalyticsDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [periodData, setPeriodData] = useState<any[]>([]);
  const [categoryStats, setCategoryStats] = useState<any>({});
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [period, setPeriod] = useState(7); // 7 jours par défaut
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, [period]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadOverviewStats(),
        loadPeriodStats(),
        loadCategoryStats(),
        loadLeaderboard()
      ]);
    } catch (error) {
      console.error('❌ Erreur chargement données:', error);
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const loadOverviewStats = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/admin/stats/overview`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('❌ Erreur stats overview:', error);
    }
  };

  const loadPeriodStats = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/admin/stats/period/${period}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPeriodData(data.data || []);
      }
    } catch (error) {
      console.error('❌ Erreur stats période:', error);
    }
  };

  const loadCategoryStats = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/admin/stats/categories`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCategoryStats(data.categories || {});
      }
    } catch (error) {
      console.error('❌ Erreur stats catégories:', error);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/admin/drivers/leaderboard`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
      }
    } catch (error) {
      console.error('❌ Erreur leaderboard:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return `${value.toLocaleString()} CDF`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  const categoryPieData = Object.entries(categoryStats).map(([key, value]: [string, any]) => ({
    name: CATEGORY_NAMES[key as keyof typeof CATEGORY_NAMES] || key,
    value: value.rides,
    revenue: value.revenue
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Vue d'ensemble des performances SmartCabb</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadAllData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>

        {/* Période selector */}
        <div className="flex gap-2">
          {[7, 14, 30, 90].map(days => (
            <Button
              key={days}
              onClick={() => setPeriod(days)}
              variant={period === days ? 'default' : 'outline'}
              size="sm"
            >
              {days} jours
            </Button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Courses du jour */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Car className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Courses aujourd'hui</h3>
          <p className="text-3xl font-bold text-gray-900">{stats?.today?.rides || 0}</p>
          <p className="text-xs text-gray-500 mt-2">
            Total: {stats?.allTime?.totalRides || 0} courses
          </p>
        </Card>

        {/* Revenus du jour */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Revenus aujourd'hui</h3>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(stats?.today?.revenue || 0)}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Total: {formatCurrency(stats?.allTime?.totalRevenue || 0)}
          </p>
        </Card>

        {/* Commissions */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-sm text-orange-600 font-semibold">15%</span>
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Commissions aujourd'hui</h3>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(stats?.today?.commissions || 0)}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Total: {formatCurrency(stats?.allTime?.totalCommissions || 0)}
          </p>
        </Card>

        {/* Conducteurs actifs */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <Calendar className="w-5 h-5 text-purple-500" />
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Conducteurs actifs</h3>
          <p className="text-3xl font-bold text-gray-900">{stats?.today?.activeDrivers || 0}</p>
          <p className="text-xs text-gray-500 mt-2">
            {stats?.allTime?.totalDrivers || 0} conducteurs enregistrés
          </p>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Évolution des revenus */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Évolution des revenus ({period} jours)</h3>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={periodData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatDate} />
                <YAxis />
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Revenus" />
                <Line type="monotone" dataKey="commissions" stroke="#10b981" name="Commissions" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Courses par catégorie */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Répartition par catégorie</h3>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Nombre de courses par jour */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Courses quotidiennes</h3>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={periodData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatDate} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="rides" fill="#3b82f6" name="Courses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Conducteurs actifs par jour */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Conducteurs actifs par jour</h3>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={periodData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatDate} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="activeDrivers" fill="#10b981" name="Conducteurs" />
                <Bar dataKey="activePassengers" fill="#f59e0b" name="Passagers" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">🏆 Top Conducteurs</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Rang</th>
                <th className="text-left py-3 px-4">Conducteur</th>
                <th className="text-right py-3 px-4">Courses</th>
                <th className="text-right py-3 px-4">Gains</th>
                <th className="text-right py-3 px-4">Commissions</th>
                <th className="text-right py-3 px-4">Note</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.slice(0, 10).map((driver, index) => (
                <tr key={driver.driverId} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className={`font-bold ${
                      index === 0 ? 'text-yellow-500' :
                      index === 1 ? 'text-gray-400' :
                      index === 2 ? 'text-orange-600' :
                      'text-gray-600'
                    }`}>
                      #{index + 1}
                    </span>
                  </td>
                  <td className="py-3 px-4">{driver.driverId}</td>
                  <td className="text-right py-3 px-4">{driver.totalRides}</td>
                  <td className="text-right py-3 px-4">{formatCurrency(driver.totalEarnings)}</td>
                  <td className="text-right py-3 px-4">{formatCurrency(driver.totalCommissions)}</td>
                  <td className="text-right py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold">{driver.averageRating.toFixed(1)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {leaderboard.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Aucune donnée disponible
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}