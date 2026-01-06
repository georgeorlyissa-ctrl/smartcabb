import { useState, useEffect } from 'react';
import { motion } from '../../framer-motion';
import { Car, Search, Phone, MapPin, Star, Shield, Calendar, DollarSign } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { useAppState } from '../../hooks/useAppState';
import { useSupabaseData, type EnrichedDriver } from '../../hooks/useSupabaseData';
import { DriverDetailModal } from './DriverDetailModal';
import type { Vehicle } from '../../lib/supabase';

interface DriversListScreenProps {
  onBack?: () => void;
}

export function DriversListScreen({ onBack }: DriversListScreenProps) {
  const { setCurrentScreen } = useAppState();
  const { drivers, rides, loading, refresh, vehicleService } = useSupabaseData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline' | 'pending'>('all');
  const [selectedDriver, setSelectedDriver] = useState<EnrichedDriver | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = (driver.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (driver.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'online' && driver.is_available) ||
                         (filterStatus === 'offline' && !driver.is_available) ||
                         (filterStatus === 'pending' && driver.status === 'pending');
    return matchesSearch && matchesFilter;
  });

  const handleOpenDriverDetails = async (driver: EnrichedDriver) => {
    setSelectedDriver(driver);
    
    // Charger le véhicule du conducteur
    const vehicle = await vehicleService.getVehicleByDriverId(driver.id);
    setSelectedVehicle(vehicle);
    
    setShowDetailModal(true);
  };

  const exportDriversData = () => {
    const csvData = [
      ['Nom', 'Email', 'Téléphone', 'Véhicule', 'Immatriculation', 'Statut', 'Note', 'Courses totales', 'Gains totaux (CDF)', 'Date inscription'],
      ...filteredDrivers.map(driver => [
        driver.full_name || '',
        driver.email || '',
        driver.phone || '',
        `${driver.vehicle_color} ${driver.vehicle_make} ${driver.vehicle_model}`,
        driver.vehicle_plate || '',
        driver.status === 'approved' ? 'Approuvé' : driver.status === 'pending' ? 'En attente' : 'Rejeté',
        (driver.rating || 0).toFixed(1),
        driver.total_rides.toString(),
        (driver.total_earnings || 0).toFixed(0),
        driver.created_at ? new Date(driver.created_at).toLocaleDateString('fr-FR') : 'N/A'
      ])
    ];

    // Format CSV compatible Excel (séparateur point-virgule pour format européen)
    const csvContent = '\uFEFF' + csvData.map(row => row.join(';')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `smartcabb-conducteurs-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exportation de ${filteredDrivers.length} conducteur(s) terminée !`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onBack ? onBack() : setCurrentScreen('admin-dashboard')}
                className="w-10 h-10"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl">Gestion des chauffeurs</h1>
                  <p className="text-sm text-gray-600">{drivers.length} chauffeurs enregistrés</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={refresh}
                variant="outline"
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
              <Button
                onClick={exportDriversData}
                variant="outline"
                className="text-green-600 border-green-200 hover:bg-green-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Exporter CSV
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Rechercher un chauffeur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 bg-gray-50 border-0 rounded-xl"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  key="filter-all"
                  onClick={() => setFilterStatus('all')}
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  className="h-12"
                >
                  Tous
                </Button>
                <Button
                  key="filter-online"
                  onClick={() => setFilterStatus('online')}
                  variant={filterStatus === 'online' ? 'default' : 'outline'}
                  className="h-12"
                >
                  En ligne
                </Button>
                <Button
                  key="filter-offline"
                  onClick={() => setFilterStatus('offline')}
                  variant={filterStatus === 'offline' ? 'default' : 'outline'}
                  className="h-12"
                >
                  Hors ligne
                </Button>
                <Button
                  key="filter-pending"
                  onClick={() => setFilterStatus('pending')}
                  variant={filterStatus === 'pending' ? 'default' : 'outline'}
                  className="h-12"
                >
                  En attente
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Drivers List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {filteredDrivers.map((driver, index) => (
            <motion.div
              key={driver.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="w-8 h-8 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold">{driver.full_name}</h3>
                        <Badge variant={driver.is_available ? 'default' : 'secondary'}>
                          {driver.is_available ? 'En ligne' : 'Hors ligne'}
                        </Badge>
                        <Badge variant={
                          driver.status === 'approved' ? 'default' : 
                          driver.status === 'pending' ? 'secondary' : 
                          'destructive'
                        }>
                          {driver.status === 'approved' ? 'Approuvé' : 
                           driver.status === 'pending' ? 'En attente' : 'Rejeté'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Mail className="w-4 h-4" />
                          <span>{driver.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Phone className="w-4 h-4" />
                          <span>{driver.phone || 'Non renseigné'}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center space-x-1">
                          <Car className="w-4 h-4" />
                          <span>{driver.vehicle_color} {driver.vehicle_make} {driver.vehicle_model}</span>
                          <span className="font-mono">({driver.vehicle_plate})</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    {/* Stats */}
                    <div className="text-center">
                      <div className="flex items-center space-x-1 mb-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-semibold">{(driver.rating || 0).toFixed(1)}</span>
                      </div>
                      <p className="text-xs text-gray-600">Note</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">{driver.total_rides || 0}</p>
                      <p className="text-xs text-gray-600">Courses</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">{(driver.total_earnings || 0).toFixed(0)} CDF</p>
                      <p className="text-xs text-gray-600">Gains</p>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleOpenDriverDetails(driver)}
                        variant="outline"
                        size="sm"
                        className="h-8"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Voir détails
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredDrivers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-12"
          >
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg text-gray-600 mb-2">Aucun chauffeur trouvé</h3>
            <p className="text-gray-500">Ajustez vos filtres de recherche</p>
          </motion.div>
        )}

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{drivers.length}</p>
                <p className="text-sm text-gray-600">Total chauffeurs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {drivers.filter(d => d.is_available).length}
                </p>
                <p className="text-sm text-gray-600">En ligne</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {drivers.filter(d => d.status === 'approved').length}
                </p>
                <p className="text-sm text-gray-600">Approuvés</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {drivers.filter(d => d.status === 'pending').length}
                </p>
                <p className="text-sm text-gray-600">En attente</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600">
                  {drivers.length > 0 ? ((drivers.reduce((sum, d) => sum + (d.rating || 0), 0) / drivers.length) || 0).toFixed(1) : '0.0'}
                </p>
                <p className="text-sm text-gray-600">Note moyenne</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Modal de détails du conducteur */}
      <DriverDetailModal
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        driver={selectedDriver}
        vehicle={selectedVehicle}
        rides={rides}
        onUpdate={() => {
          refresh();
          setShowDetailModal(false);
        }}
      />
    </div>
  );
}