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
