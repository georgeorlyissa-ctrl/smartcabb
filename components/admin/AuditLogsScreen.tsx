import { useState, useEffect } from 'react';
import { motion } from '../../lib/motion';
import { ArrowLeft, Shield, Download, Search, User, Calendar as CalendarIcon, FileText } from '../../lib/icons';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar } from '../ui/calendar';
import { toast } from '../../lib/toast';
import { useAppState } from '../../hooks/useAppState';
import { supabase } from '../../lib/supabase';
import { Badge } from '../ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

// ✅ Utiliser des fonctions natives au lieu de date-fns
const formatDate = (date: Date, formatStr: string = 'dd/MM/yyyy HH:mm:ss') => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  if (formatStr === 'dd/MM/yyyy HH:mm:ss') {
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }
  if (formatStr === 'yyyy-MM-dd HH:mm:ss') {
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  if (formatStr === 'yyyy-MM-dd-HHmm') {
    return `${year}-${month}-${day}-${hours}${minutes}`;
  }
  return `${day}/${month}/${year}`;
};

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  user?: {
    name: string;
    email: string;
    role: string;
  };
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  'login': { label: 'Connexion', color: 'blue' },
  'logout': { label: 'Déconnexion', color: 'gray' },
  'create_ride': { label: 'Création course', color: 'green' },
  'cancel_ride': { label: 'Annulation course', color: 'red' },
  'complete_ride': { label: 'Course terminée', color: 'green' },
  'approve_driver': { label: 'Approbation conducteur', color: 'green' },
  'reject_driver': { label: 'Rejet conducteur', color: 'red' },
  'approve_refund': { label: 'Approbation remboursement', color: 'green' },
  'reject_refund': { label: 'Rejet remboursement', color: 'red' },
  'update_settings': { label: 'Modification paramètres', color: 'orange' },
  'create_promo': { label: 'Création promo', color: 'purple' },
  'delete_user': { label: 'Suppression utilisateur', color: 'red' },
  'update_commission': { label: 'Modification commission', color: 'orange' }
};

interface AuditLogsScreenProps {
  onBack?: () => void;
}

export function AuditLogsScreen({ onBack }: AuditLogsScreenProps) {
  const { setCurrentScreen } = useAppState();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 50;

  useEffect(() => {
    loadLogs();
  }, [page, actionFilter, entityFilter, startDate, endDate]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          user:profiles(name, email, role)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }

      if (entityFilter !== 'all') {
        query = query.eq('entity_type', entityFilter);
      }

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }

      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }

      const { data, error, count } = await query;

      if (error) {
        if (error.code === 'PGRST205' || error.code === '42P01' || error.message?.includes('does not exist')) {
          console.log('ℹ️ Table audit_logs non trouvée - retour tableau vide');
          setLogs([]);
          setTotalPages(1);
          setLoading(false);
          return;
        }
        throw error;
      }

      setLogs(data || []);
      setTotalPages(Math.ceil((count || 0) / pageSize));

    } catch (error: any) {
      const isNetworkError = error.message?.includes('Failed to fetch') || 
                            error.message?.includes('Network request failed') ||
                            error.message?.includes('Connection timeout');
      
      if (isNetworkError) {
        console.warn('⚠️ Impossible de charger les logs (mode prévisualisation)');
      } else {
        console.error('Error loading audit logs:', error);
        toast.error('Erreur de chargement des logs');
      }
      setLogs([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
          *,
          user:profiles(name, email, role)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === 'PGRST205' || error.code === '42P01' || error.message?.includes('does not exist')) {
          toast.error('Table audit_logs non trouvée');
          return;
        }
        throw error;
      }

      if (!data || data.length === 0) {
        toast.info('Aucun log à exporter');
        return;
      }

      const csv = convertToCSV(data || []);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-logs-${formatDate(new Date(), 'yyyy-MM-dd-HHmm')}.csv`;
      link.click();

      toast.success('Logs exportés');
    } catch (error: any) {
      const isNetworkError = error.message?.includes('Failed to fetch');
      if (!isNetworkError) {
        console.error('Error exporting logs:', error);
        toast.error('Erreur lors de l\'exportation');
      }
    }
  };

  const convertToCSV = (logs: AuditLog[]) => {
    const headers = ['Date', 'Utilisateur', 'Rôle', 'Action', 'Type', 'Détails', 'IP'];
    const rows = logs.map(log => [
      formatDate(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
      log.user?.name || 'N/A',
      log.user?.role || 'N/A',
      ACTION_LABELS[log.action]?.label || log.action,
      log.entity_type,
      JSON.stringify(log.details),
      log.ip_address || 'N/A'
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
  };

  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    return (
      log.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getActionBadge = (action: string) => {
    const config = ACTION_LABELS[action] || { label: action, color: 'gray' };
    return (
      <Badge variant="outline" className={`border-${config.color}-500 text-${config.color}-600`}>
        {config.label}
      </Badge>
    );
  };

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
            <h1 className="text-2xl flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Logs d'audit
            </h1>
            <p className="text-sm text-gray-600">Traçabilité complète des actions administratives</p>
          </div>
        </div>

        <Button onClick={exportLogs} className="gap-2">
          <Download className="w-4 h-4" />
          Exporter
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher..."
              className="pl-10"
            />
          </div>

          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Type d'action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les actions</SelectItem>
              <SelectItem value="login">Connexions</SelectItem>
              <SelectItem value="create_ride">Créations course</SelectItem>
              <SelectItem value="approve_driver">Approbations</SelectItem>
            </SelectContent>
          </Select>

          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Type d'entité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les entités</SelectItem>
              <SelectItem value="ride">Courses</SelectItem>
              <SelectItem value="driver">Conducteurs</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <CalendarIcon className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                />
              </PopoverContent>
            </Popover>

            {startDate && (
              <Button variant="ghost" size="sm" onClick={() => setStartDate(undefined)}>
                ×
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Logs List */}
      <Card className="p-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">Aucun log d'audit trouvé</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredLogs.map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm text-gray-600">
                        {formatDate(new Date(log.created_at))}
                      </span>
                      {getActionBadge(log.action)}
                      <Badge variant="outline">{log.entity_type}</Badge>
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{log.user?.name || 'Utilisateur inconnu'}</span>
                        <span className="text-gray-600">({log.user?.role})</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Précédent
            </Button>
            <span className="text-sm text-gray-600">
              Page {page} sur {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Suivant
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}