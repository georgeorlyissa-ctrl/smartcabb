import { useState, useEffect } from 'react';
import React from 'react';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { useAppState } from '../hooks/useAppState';
import { AlertCircle } from '../lib/icons';

function AdminAppContent() {
  const { state, setCurrentScreen, setCurrentView, updateUser } = useAppState();
  const { currentScreen } = state;
  const initialized = useState(false);
  const location = useLocation();
  
  // Définir l'écran par défaut quand on arrive sur /admin
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    
    console.log('👔 AdminApp - Démarrage avec currentScreen:', state.currentScreen);
    console.log('👔 AdminApp - location.pathname:', location.pathname);
    
    // ✅ DÉTECTION DE ROUTE : Vérifier qu'on est bien sur une route admin
    const isAdminRoute = location.pathname.includes('/admin');
    
    if (!isAdminRoute) {
      console.log('⚠️ AdminApp chargé mais pas sur route /admin, on ignore');
      return;
    }
    
    // ❌ NE PAS charger AdminApp si on est sur un écran driver ou passenger
    if (state.currentScreen?.startsWith('driver-') || state.currentScreen?.startsWith('passenger-')) {
      console.log('⚠️ Écran driver/passenger détecté, on ne touche pas à la vue');
      return;
    }
    
    // ✅ SÉCURITÉ : Ne mettre la vue admin que visuellement
    // NE PAS définir setIsAdmin(true) automatiquement !
    // setIsAdmin(true) doit être défini UNIQUEMENT après connexion réussie
    setCurrentView('admin');
    
    // ✅ Si on arrive sur /admin sans écran défini ou avec un écran non-admin, afficher le login
    // Liste des écrans admin valides (avec et sans préfixe 'admin-')
    const validAdminScreens = [
      'admin-login', 'admin-register', 'admin-dashboard', 'admin-drivers', 'admin-clients',
      'admin-financial-reports', 'admin-promo-codes', 'admin-settings', 'admin-global-settings',
      'admin-sms-settings', 'admin-email-settings', 'admin-email-history', 'admin-notifications',
      'admin-postpaid-requests', 'admin-contact-messages', 'admin-customer-support', 'admin-marketing',
      'admin-refunds', 'admin-audit-logs', 'admin-backup', 'admin-analytics', 'admin-tools',
      'admin-chat-messages', 'admin-budget-dashboard', 'admin-pending-recharges',
      // Alias sans préfixe admin-
      'drivers-list', 'clients-list', 'contact-messages', 'postpaid-requests', 'refund-management',
      'analytics-dashboard', 'financial-reports', 'audit-logs', 'backup-and-recovery',
      'sms-settings', 'global-settings', 'admin-diagnostic', 'data-cleanup', 'pending-recharges', 'admin-users-management'
    ];
    
    if (!state.currentScreen || !validAdminScreens.includes(state.currentScreen)) {
      console.log('👔 AdminApp - Initialisation avec admin-login');
      setCurrentScreen('admin-login');
    }
  }, [location.pathname]);
  
  // État RLS local
  const showRLSModal = false;
  const showRLSBlockingScreen = false;

  // Show RLS blocking screen if there's a critical RLS issue
  if (showRLSBlockingScreen) {
    return <RLSBlockingScreen />;
  }
  
  // ✅ AMÉLIORATION : Liste complète des écrans admin valides
  const validAdminScreens = [
    'admin-login', 'admin-register', 'admin-dashboard', 'admin-drivers', 'admin-clients',
    'admin-financial-reports', 'admin-promo-codes', 'admin-settings', 'admin-global-settings',
    'admin-sms-settings', 'admin-email-settings', 'admin-email-history', 'admin-notifications',
    'admin-postpaid-requests', 'admin-contact-messages', 'admin-customer-support', 'admin-marketing',
    'admin-refunds', 'admin-audit-logs', 'admin-backup', 'admin-analytics', 'admin-tools',
    'admin-chat-messages', 'admin-budget-dashboard', 'admin-pending-recharges',
    // Alias sans préfixe admin-
    'drivers-list', 'clients-list', 'contact-messages', 'postpaid-requests', 'refund-management',
    'analytics-dashboard', 'financial-reports', 'audit-logs', 'backup-and-recovery',
    'sms-settings', 'global-settings', 'admin-diagnostic', 'data-cleanup', 'pending-recharges', 'admin-users-management'
  ];
  
  // ✅ FALLBACK AMÉLIORÉ : Vérifier si l'écran est dans la liste des écrans admin valides
  const screenToShow = currentScreen && validAdminScreens.includes(currentScreen)
    ? currentScreen 
    : 'admin-login';
  
  console.log('👔 AdminApp - Affichage de l\'écran:', screenToShow);

  return (
    <>
      {/* Diagnostic au chargement */}
      <AdminDiagnostic />
      
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
        {screenToShow === 'admin-sms-settings' && <SMSSettingsScreen onBack={() => setCurrentScreen('admin-dashboard')} />}
        {screenToShow === 'admin-email-settings' && <EmailSettingsScreen onBack={() => setCurrentScreen('admin-dashboard')} />}
        {screenToShow === 'admin-email-history' && <EmailHistoryScreen onBack={() => setCurrentScreen('admin-dashboard')} />}
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
        {screenToShow === 'admin-pending-recharges' && <PendingRechargesScreenNew />}
        
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
        {screenToShow === 'sms-settings' && <SMSSettingsScreen onBack={() => setCurrentScreen('admin-dashboard')} />}
        {screenToShow === 'global-settings' && <GlobalSettingsScreen />}
        {screenToShow === 'admin-diagnostic' && <AdminDiagnostic />}
        {screenToShow === 'admin-users-management' && <UsersManagementScreen onBack={() => setCurrentScreen('admin-dashboard')} />}
      </div>
    </>
  );
}

// Error Boundary spécifique pour AdminApp
class AdminAppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  private mounted = false;

  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  static getDerivedStateFromError(error: Error) {
    console.error('❌ AdminApp - getDerivedStateFromError:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('❌ AdminApp Error:', error, errorInfo);
    console.error('❌ Stack:', error.stack);
    console.error('❌ Component Stack:', errorInfo?.componentStack);
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
  // Wrapper de sécurité pour attraper les erreurs au niveau root
  try {
    return (
      <AdminAppErrorBoundary>
        <div className="admin-app-container w-full h-full">
          <Routes>
            <Route path="/*" element={<AdminAppContent />} />
          </Routes>
        </div>
      </AdminAppErrorBoundary>
    );
  } catch (error) {
    console.error('❌ CRITICAL ERROR in AdminApp:', error);
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-md w-full mx-4 bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Erreur Critique</h1>
              <p className="text-sm text-gray-500">Une erreur est survenue au démarrage</p>
            </div>
          </div>
          
          <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-800 font-mono">
              {error instanceof Error ? error.message : 'Erreur inconnue'}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => { window.location.href = '/admin'; }}
              className="w-full h-12 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-medium transition"
            >
              Réessayer
            </button>
            
            <button
              onClick={() => { window.location.href = '/'; }}
              className="w-full h-12 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }
}