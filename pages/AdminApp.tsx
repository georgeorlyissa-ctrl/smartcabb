import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAppState } from '../hooks/useAppState';
import { RLSFixModal } from '../components/RLSFixModal';
import { RLSBlockingScreen } from '../components/RLSBlockingScreen';
// import { useSupabaseData } from '../hooks/useSupabaseData'; // Non utilisé, commenté pour éviter erreurs
import { LoadingScreen } from '../components/LoadingScreen';
import { useEffect, useRef, Component, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

// Import des composants existants seulement
import { AdminLoginScreen } from '../components/admin/AdminLoginScreen';
import { AdminRegisterScreen } from '../components/admin/AdminRegisterScreen';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { DriversListScreen } from '../components/admin/DriversListScreen';
import { ClientsListScreen } from '../components/admin/ClientsListScreen';
import { FinancialReportsScreen } from '../components/admin/FinancialReportsScreen';
import { PromoCodesScreen } from '../components/admin/PromoCodesScreen';
import { SettingsScreen } from '../components/admin/SettingsScreen';
import { GlobalSettingsScreen } from '../components/admin/GlobalSettingsScreen';
import { SMSSettingsScreen } from '../components/admin/SMSSettingsScreen';
import { EmailSettingsScreen } from '../components/admin/EmailSettingsScreen';
import { EmailHistoryScreen } from '../components/admin/EmailHistoryScreen';
import { AdminNotificationsCenter } from '../components/admin/AdminNotificationsCenter';
import { PostpaidRequestsScreen } from '../components/admin/PostpaidRequestsScreen';
import { ContactMessagesScreen } from '../components/admin/ContactMessagesScreen';
import { CustomerSupportScreen } from '../components/admin/CustomerSupportScreen';
import { MarketingCampaignsScreen } from '../components/admin/MarketingCampaignsScreen';
import { RefundManagementScreen } from '../components/admin/RefundManagementScreen';
import { AuditLogsScreen } from '../components/admin/AuditLogsScreen';
import { BackupAndRecoveryScreen } from '../components/admin/BackupAndRecoveryScreen';
import { AdvancedAnalyticsDashboard } from '../components/admin/AdvancedAnalyticsDashboard';
import { AdminToolsScreen } from '../components/admin/AdminToolsScreen';
import { ChatMessagesScreen } from '../components/admin/ChatMessagesScreen';
import { BudgetDashboard } from '../components/admin/BudgetDashboard';
import { DataCleanupPanel } from '../components/admin/DataCleanupPanel';
import { PendingRechargesScreenNew } from '../components/admin/PendingRechargesScreenNew';
import { AdminAnalyticsDashboard } from '../components/admin/AdminAnalyticsDashboard';

function AdminAppContent() {
  const { state, setCurrentScreen, setCurrentView, updateUser } = useAppState();
  const { currentScreen } = state;
  const initialized = useRef(false);
  
  // Définir l'écran par défaut quand on arrive sur /admin
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    
    console.log('👔 AdminApp - Démarrage avec currentScreen:', state.currentScreen);
    
    // ❌ NE PAS charger AdminApp si on est sur un écran driver ou passenger
    if (state.currentScreen?.startsWith('driver-') || 
        (!state.currentScreen?.startsWith('admin-') && state.currentScreen && 
         state.currentScreen !== 'landing' && state.currentScreen !== 'user-selection')) {
      console.log('⚠️ Écran driver/passenger détecté, on ne touche pas à la vue');
      return;
    }
    
    // ✅ SÉCURITÉ : Ne mettre la vue admin que visuellement
    // NE PAS définir setIsAdmin(true) automatiquement !
    // setIsAdmin(true) doit être défini UNIQUEMENT après connexion réussie
    setCurrentView('admin');
    
    // Toujours forcer le login au démarrage
    if (!state.currentScreen || !state.currentScreen.startsWith('admin-')) {
      setCurrentScreen('admin-login');
    }
  }, []);
  
  // État RLS local
  const showRLSModal = false;
  const showRLSBlockingScreen = false;

  // Show RLS blocking screen if there's a critical RLS issue
  if (showRLSBlockingScreen) {
    return <RLSBlockingScreen />;
  }
  
  // Si currentScreen n'est pas défini, afficher le login par défaut
  const screenToShow = currentScreen || 'admin-login';

  return (
    <>
      {/* RLS Fix Modal (non-blocking) */}
      {showRLSModal && <RLSFixModal />}

      {/* Main Admin App Screens */}
      <div className="h-screen w-screen overflow-auto">
        {screenToShow === 'admin-login' && <AdminLoginScreen />}
        {screenToShow === 'admin-register' && <AdminRegisterScreen />}
        {screenToShow === 'admin-dashboard' && <AdminDashboard />}
        {screenToShow === 'admin-drivers' && <DriversListScreen />}
        {screenToShow === 'admin-clients' && <ClientsListScreen />}
        {screenToShow === 'admin-financial-reports' && <FinancialReportsScreen />}
        {screenToShow === 'admin-promo-codes' && <PromoCodesScreen />}
        {screenToShow === 'admin-settings' && <SettingsScreen />}
        {screenToShow === 'admin-global-settings' && <GlobalSettingsScreen />}
        {screenToShow === 'admin-sms-settings' && <SMSSettingsScreen />}
        {screenToShow === 'admin-email-settings' && <EmailSettingsScreen />}
        {screenToShow === 'admin-email-history' && <EmailHistoryScreen />}
        {screenToShow === 'admin-notifications' && <AdminNotificationsCenter />}
        {screenToShow === 'admin-postpaid-requests' && <PostpaidRequestsScreen />}
        {screenToShow === 'admin-contact-messages' && <ContactMessagesScreen onBack={() => setCurrentScreen('admin-dashboard')} />}
        {screenToShow === 'admin-customer-support' && <CustomerSupportScreen />}
        {screenToShow === 'admin-marketing' && <MarketingCampaignsScreen />}
        {screenToShow === 'admin-refunds' && <RefundManagementScreen />}
        {screenToShow === 'admin-audit-logs' && <AuditLogsScreen />}
        {screenToShow === 'admin-backup' && <BackupAndRecoveryScreen />}
        {screenToShow === 'admin-analytics' && <AdvancedAnalyticsDashboard />}
        {screenToShow === 'admin-tools' && <AdminToolsScreen />}
        {screenToShow === 'admin-chat-messages' && <ChatMessagesScreen />}
        {screenToShow === 'admin-budget-dashboard' && <BudgetDashboard />}
        {screenToShow === 'data-cleanup' && <DataCleanupPanel />}
        {screenToShow === 'pending-recharges' && <PendingRechargesScreenNew />}
        
        {/* Drivers list (alias) */}
        {screenToShow === 'drivers-list' && <DriversListScreen />}
        {screenToShow === 'clients-list' && <ClientsListScreen />}
        {screenToShow === 'contact-messages' && <ContactMessagesScreen onBack={() => setCurrentScreen('admin-dashboard')} />}
        {screenToShow === 'postpaid-requests' && <PostpaidRequestsScreen />}
        {screenToShow === 'refund-management' && <RefundManagementScreen />}
        {screenToShow === 'analytics-dashboard' && <AdminAnalyticsDashboard />}
        {screenToShow === 'financial-reports' && <FinancialReportsScreen />}
        {screenToShow === 'audit-logs' && <AuditLogsScreen />}
        {screenToShow === 'backup-and-recovery' && <BackupAndRecoveryScreen />}
        {screenToShow === 'sms-settings' && <SMSSettingsScreen />}
        {screenToShow === 'global-settings' && <GlobalSettingsScreen />}
      </div>
    </>
  );
}

// Error Boundary spécifique pour AdminApp
class AdminAppErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('❌ AdminApp Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="max-w-md w-full mx-4 bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Erreur Panel Admin</h1>
                <p className="text-sm text-gray-500">Une erreur s'est produite</p>
              </div>
            </div>
            
            <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-800 font-mono">
                {this.state.error?.message || 'Erreur inconnue'}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = '/admin';
                }}
                className="w-full h-12 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-medium transition"
              >
                Réessayer
              </button>
              
              <button
                onClick={() => {
                  window.location.href = '/';
                }}
                className="w-full h-12 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition"
              >
                Retour à l'accueil
              </button>
            </div>

            <p className="text-xs text-gray-400 text-center mt-4">
              Si le problème persiste, vérifiez la console du navigateur
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function AdminApp() {
  return (
    <AdminAppErrorBoundary>
      <div className="admin-app-container w-full h-full">
        <Routes>
          <Route path="/*" element={<AdminAppContent />} />
        </Routes>
      </div>
    </AdminAppErrorBoundary>
  );
}