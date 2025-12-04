import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAppState } from '../hooks/useAppState';
import { RLSFixModal } from '../components/RLSFixModal';
import { RLSBlockingScreen } from '../components/RLSBlockingScreen';
import { LoadingScreen } from '../components/LoadingScreen';
import { LandingScreen } from '../components/LandingScreen';
import { UserSelectionScreen } from '../components/UserSelectionScreen';
import { WelcomeBackScreen } from '../components/WelcomeBackScreen';
import { ErrorBoundary } from '../components/ErrorBoundary';

// Import direct sans lazy loading pour debug
import { WelcomeScreen } from '../components/passenger/WelcomeScreen';
import { LoginScreen } from '../components/passenger/LoginScreen';
import { RegisterScreen } from '../components/passenger/RegisterScreen';
import { ForgotPasswordScreen } from '../components/ForgotPasswordScreen';
import { ResetPasswordOTPScreen } from '../components/ResetPasswordOTPScreen';
import { MapScreen } from '../components/passenger/MapScreen';
import { EstimateScreen } from '../components/passenger/EstimateScreen';
import { RideScreen } from '../components/passenger/RideScreen';
import { PaymentScreen } from '../components/passenger/PaymentScreen';
import { RatingScreen } from '../components/passenger/RatingScreen';
import { SettingsScreen } from '../components/passenger/SettingsScreen';
import { ProfileScreen } from '../components/passenger/ProfileScreen';
import { RideHistoryScreen } from '../components/passenger/RideHistoryScreen';
import { PromoCodeScreen } from '../components/passenger/PromoCodeScreen';
import { WalletScreen } from '../components/passenger/WalletScreen';
import { PrivacySettingsScreen } from '../components/passenger/PrivacySettingsScreen';
import { PaymentMethodScreen } from '../components/passenger/PaymentMethodScreen';
import { PaymentSettingsScreen } from '../components/passenger/PaymentSettingsScreen';
import { SupportScreen } from '../components/passenger/SupportScreen';
import { useEffect, useMemo } from 'react';

function PassengerAppContent() {
  const { state, setCurrentScreen, setCurrentView } = useAppState();
  const { currentScreen, currentUser: user } = state;
  const navigate = useNavigate();
  const location = useLocation();
  const showRLSModal = false; // Désactivé pour passager
  const showRLSBlockingScreen = false; // Désactivé pour passager
  
  // Pour l'app passager, on ne charge pas les données Supabase
  const dataLoading = false; // Désactivé pour app passager

  // ✅ Initialisation: définir l'écran par défaut
  useEffect(() => {
    console.log('🚀 PassengerApp monté - currentScreen:', currentScreen, 'location:', location.pathname);
    
    // ❌ NE PAS charger PassengerApp si on est sur un écran admin ou driver
    if (currentScreen?.startsWith('admin-') || currentScreen?.startsWith('driver-')) {
      console.log('⚠️ Écran admin/driver détecté, on ne touche pas à la vue');
      return;
    }
    
    // Si on arrive sur /app sans écran défini, initialiser à 'welcome'
    if (!currentScreen || currentScreen === '') {
      console.log('🔄 Initialisation vers welcome depuis PassengerApp');
      setCurrentView('passenger');
      setCurrentScreen('welcome');
    }
    
    // Si on est sur user-selection et qu'on a déjà un utilisateur, aller à map
    if (currentScreen === 'user-selection' && user) {
      console.log('✅ Utilisateur déjà connecté, redirection vers map');
      setCurrentScreen('map');
    }
  }, []); // Une seule fois au montage

  // ✅ Gérer le cas où currentScreen est vide PENDANT le render
  const screenToShow = useMemo(() => {
    const screen = currentScreen && currentScreen !== '' ? currentScreen : 'welcome';
    console.log('📺 PassengerApp - screenToShow calculé:', screen, '| currentUser:', user?.name || 'aucun');
    return screen;
  }, [currentScreen, user]);

  console.log('🎯 PassengerApp render - currentScreen:', currentScreen, '-> screenToShow:', screenToShow);

  // Show RLS blocking screen if there's a critical RLS issue
  if (showRLSBlockingScreen) {
    return <RLSBlockingScreen />;
  }

  // Show loading screen
  if (dataLoading) {
    return <LoadingScreen />;
  }

  // Mémoïser le rendu des écrans
  const screenComponent = useMemo(() => {
    switch(screenToShow) {
      case 'landing':
        return <LandingScreen />;
      case 'user-selection':
        return <UserSelectionScreen />;
      case 'welcome-back':
      case 'welcome-back-passenger':
        return (
          <WelcomeBackScreen 
            userName={user?.name || user?.email?.split('@')[0] || undefined}
            userType="passenger"
            onComplete={() => setCurrentScreen('login')}
          />
        );
      case 'welcome':
        return (
          <ErrorBoundary>
            <WelcomeScreen />
          </ErrorBoundary>
        );
      case 'login':
        return (
          <ErrorBoundary>
            <LoginScreen />
          </ErrorBoundary>
        );
      case 'register':
        return (
          <ErrorBoundary>
            <RegisterScreen />
          </ErrorBoundary>
        );
      case 'forgot-password':
        return (
          <ErrorBoundary>
            <ForgotPasswordScreen 
              onBack={() => setCurrentScreen('login')} 
              userType="passenger" 
            />
          </ErrorBoundary>
        );
      case 'reset-password-otp':
        return (
          <ErrorBoundary>
            <ResetPasswordOTPScreen 
              onBack={() => setCurrentScreen('login')} 
              onSuccess={() => setCurrentScreen('login')}
              userType="passenger" 
            />
          </ErrorBoundary>
        );
      case 'map':
        return (
          <ErrorBoundary>
            <MapScreen />
          </ErrorBoundary>
        );
      case 'estimate':
        return (
          <ErrorBoundary>
            <EstimateScreen />
          </ErrorBoundary>
        );
      case 'ride':
        return (
          <ErrorBoundary>
            <RideScreen />
          </ErrorBoundary>
        );
      case 'payment':
        return (
          <ErrorBoundary>
            <PaymentScreen />
          </ErrorBoundary>
        );
      case 'rating':
        return (
          <ErrorBoundary>
            <RatingScreen />
          </ErrorBoundary>
        );
      case 'settings':
        return (
          <ErrorBoundary>
            <SettingsScreen />
          </ErrorBoundary>
        );
      case 'passenger-settings':
        return (
          <ErrorBoundary>
            <SettingsScreen />
          </ErrorBoundary>
        );
      case 'profile':
        return (
          <ErrorBoundary>
            <ProfileScreen />
          </ErrorBoundary>
        );
      case 'ride-history':
        return (
          <ErrorBoundary>
            <RideHistoryScreen />
          </ErrorBoundary>
        );
      case 'promo-code':
        return (
          <ErrorBoundary>
            <PromoCodeScreen />
          </ErrorBoundary>
        );
      case 'wallet':
        return (
          <ErrorBoundary>
            <WalletScreen />
          </ErrorBoundary>
        );
      case 'privacy-settings':
        return (
          <ErrorBoundary>
            <PrivacySettingsScreen />
          </ErrorBoundary>
        );
      case 'payment-method':
        return (
          <ErrorBoundary>
            <PaymentMethodScreen />
          </ErrorBoundary>
        );
      case 'payment-methods':
        return (
          <ErrorBoundary>
            <PaymentSettingsScreen />
          </ErrorBoundary>
        );
      case 'payment-settings':
        return (
          <ErrorBoundary>
            <PaymentSettingsScreen />
          </ErrorBoundary>
        );
      case 'support':
        return (
          <ErrorBoundary>
            <SupportScreen />
          </ErrorBoundary>
        );
      default:
        return (
          <ErrorBoundary>
            <WelcomeScreen />
          </ErrorBoundary>
        );
    }
  }, [screenToShow]);

  return (
    <ErrorBoundary>
      {/* RLS Fix Modal (non-blocking) */}
      {showRLSModal && <RLSFixModal />}

      {/* Main App Screens - Optimisé pour mobile */}
      <div className="h-screen transition-opacity duration-300" style={{ willChange: 'opacity' }}>
        {screenComponent}
      </div>
    </ErrorBoundary>
  );
}

export function PassengerApp() {
  console.log('📱 PassengerApp - Composant principal chargé');
  
  return (
    <Routes>
      <Route path="/*" element={<PassengerAppContent />} />
    </Routes>
  );
}