import { useState, useEffect } from 'react';
import { motion } from '../../lib/motion';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { useAppState } from '../../hooks/useAppState';
import { useSupabaseData, type EnrichedDriver } from '../../hooks/useSupabaseData';
import { DriverDetailModal } from './DriverDetailModal';
import { 
  ArrowLeft, 
  Search, 
  Users, 
  Star,
  Car,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Filter,
  FileText,
  Eye,
  RefreshCw,
  Download
} from '../../lib/admin-icons';
import { toast } from '../../lib/toast';
import type { Vehicle } from '../../lib/supabase';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

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

  const cleanInvalidDrivers = async () => {
    if (!confirm('⚠️ Voulez-vous vraiment supprimer tous les conducteurs invalides (sans nom, sans email, ou données incomplètes) ?\n\nCette action est irréversible.')) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/cleanup/invalid-drivers`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Nettoyage réussi:', data);
        
        // Le serveur renvoie data.data au lieu de data.details
        const deletedCount = data.data?.drivers || data.details?.drivers || 0;
        toast.success(`${deletedCount} conducteur(s) invalide(s) supprimé(s) avec succès !`);
        
        // Rafraîchir la liste
        await refresh();
      } else {
        const errorData = await response.json();
        console.error('❌ Erreur nettoyage:', errorData);
        toast.error(errorData.message || 'Erreur lors du nettoyage');
      }
    } catch (error) {
      console.error('❌ Erreur nettoyage:', error);
      toast.error('Erreur lors du nettoyage des conducteurs invalides');
    }
  };

  const debugDrivers = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/cleanup/debug-drivers`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 DEBUG - Tous les conducteurs:', data);
        toast.success(`${data.total} conducteurs - Consultez la console pour les détails`);
      } else {
        const errorData = await response.json();
        console.error('❌ Erreur debug:', errorData);
        toast.error('Erreur lors du diagnostic');
      }
    } catch (error) {
      console.error('❌ Erreur debug:', error);
      toast.error('Erreur lors du diagnostic des conducteurs');
    }
  };

  const deleteAllDrivers = async () => {
    // PREMIÈRE CONFIRMATION
    if (!confirm('💥 ATTENTION : Voulez-vous vraiment supprimer TOUS LES CONDUCTEURS sans exception ?\n\n⚠️ Cette action supprimera :\n- Tous les conducteurs (même ceux avec des données valides)\n- Tous leurs véhicules\n- Tous leurs profils\n- Tous leurs comptes utilisateurs\n\n❌ CETTE ACTION EST IRRÉVERSIBLE !\n\nCliquez OK pour continuer ou Annuler pour arrêter.')) {
      return;
    }

    // DEUXIÈME CONFIRMATION
    if (!confirm('🔴 DERNIÈRE CHANCE !\n\nÊtes-vous ABSOLUMENT SÛR de vouloir supprimer TOUS les conducteurs ?\n\nTapez "OUI" dans votre tête et cliquez OK uniquement si vous êtes certain.')) {
      return;
    }

    try {
      toast.success('💥 Suppression en cours... Cela peut prendre quelques secondes...');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/cleanup/delete-all-drivers`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Suppression nucléaire réussie:', data);
        
        const deletedCount = data.data?.drivers || 0;
        toast.success(`💥 ${deletedCount} conducteur(s) supprimé(s) avec succès ! Base de données nettoyée.`);
        
        // Rafraîchir la liste
        await refresh();
      } else {
        const errorData = await response.json();
        console.error('❌ Erreur suppression:', errorData);
        toast.error(errorData.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      toast.error('Erreur lors de la suppression de tous les conducteurs');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => onBack ? onBack() : setCurrentScreen('dashboard')}
                variant="ghost"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Conducteurs</h1>
                <p className="text-sm text-gray-500">{filteredDrivers.length} conducteur(s)</p>
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
              <Button
                onClick={debugDrivers}
                variant="outline"
                className="text-purple-600 border-purple-200 hover:bg-purple-50"
              >
                <Eye className="w-4 h-4 mr-2" />
                Debug
              </Button>
              <Button
                onClick={cleanInvalidDrivers}
                variant="outline"
                className="text-orange-600 border-orange-200 hover:bg-orange-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Nettoyer invalides
              </Button>
              <Button
                onClick={deleteAllDrivers}
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50 font-bold"
              >
                <XCircle className="w-4 h-4 mr-2" />
                💥 SUPPRIMER TOUS
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Rechercher par nom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setFilterStatus('all')}
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
              >
                Tous
              </Button>
              <Button
                onClick={() => setFilterStatus('online')}
                variant={filterStatus === 'online' ? 'default' : 'outline'}
                size="sm"
              >
                En ligne
              </Button>
              <Button
                onClick={() => setFilterStatus('offline')}
                variant={filterStatus === 'offline' ? 'default' : 'outline'}
                size="sm"
              >
                Hors ligne
              </Button>
              <Button
                onClick={() => setFilterStatus('pending')}
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                size="sm"
              >
                En attente
              </Button>
            </div>
          </div>
        </div>

        {/* Drivers List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Chargement des conducteurs...</p>
          </div>
        ) : filteredDrivers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun conducteur trouvé</h3>
            <p className="text-gray-500">Aucun conducteur ne correspond à vos critères de recherche.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDrivers.map((driver) => (
              <motion.div
                key={driver.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleOpenDriverDetails(driver)}>
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {driver.full_name || 'Conducteur inconnu'}
                        </h3>
                        <div className="flex items-center gap-2">
                          {driver.status === 'approved' ? (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approuvé
                            </Badge>
                          ) : driver.status === 'pending' ? (
                            <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                              <Filter className="w-3 h-3 mr-1" />
                              En attente
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800 text-xs">
                              <XCircle className="w-3 h-3 mr-1" />
                              Rejeté
                            </Badge>
                          )}
                          {driver.is_available && (
                            <Badge className="bg-blue-100 text-blue-800 text-xs">
                              En ligne
                            </Badge>
                          )}
                        </div>
                      </div>
                      {driver.rating && (
                        <div className="flex items-center bg-yellow-50 px-2 py-1 rounded">
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                          <span className="text-sm font-semibold text-yellow-700">
                            {driver.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 mb-4">
                      {driver.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="truncate">{driver.email}</span>
                        </div>
                      )}
                      {driver.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{driver.phone}</span>
                        </div>
                      )}
                      {(driver.vehicle_make || driver.vehicle_model) && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Car className="w-4 h-4 mr-2 text-gray-400" />
                          <span>
                            {driver.vehicle_color} {driver.vehicle_make} {driver.vehicle_model}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{driver.total_rides || 0}</div>
                        <div className="text-xs text-gray-500">Courses</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {(driver.total_earnings || 0).toLocaleString()} CDF
                        </div>
                        <div className="text-xs text-gray-500">Gains</div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedDriver && (
        <DriverDetailModal
          driver={selectedDriver}
          vehicle={selectedVehicle}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedDriver(null);
            setSelectedVehicle(null);
          }}
          onRefresh={refresh}
        />
      )}
    </div>
  );
}
