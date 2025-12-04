import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAppState } from '../hooks/useAppState';
import { RLSFixModal } from '../components/RLSFixModal';
import { RLSBlockingScreen } from '../components/RLSBlockingScreen';
import { LoadingScreen } from '../components/LoadingScreen';
import { LandingScreen } from '../components/LandingScreen';
import { UserSelectionScreen } from '../components/UserSelectionScreen';
import { WelcomeBackScreen } from '../components/WelcomeBackScreen';

// Import direct sans lazy loading pour debug
import { DriverWelcomeScreen } from '../components/driver/DriverWelcomeScreen';
import { DriverLoginScreen } from '../components/driver/DriverLoginScreen';
import { DriverRegistrationScreen } from '../components/driver/DriverRegistrationScreen';
import { DriverDashboard } from '../components/driver/DriverDashboard';
import { NavigationScreen } from '../components/driver/NavigationScreen';
import { EarningsScreen } from '../components/driver/EarningsScreen';
import { DriverSettingsScreen } from '../components/driver/DriverSettingsScreen';
import { DriverProfileScreen } from '../components/driver/DriverProfileScreen';
import { ClientInfoScreen } from '../components/driver/ClientInfoScreen';
import { DriverWalletScreen } from '../components/driver/DriverWalletScreen';
import { ForgotPasswordScreen } from '../components/ForgotPasswordScreen';
import { ResetPasswordOTPScreen } from '../components/ResetPasswordOTPScreen';
import { useEffect } from 'react';

function DriverAppContent() {
  const { state, setCurrentScreen, setCurrentView } = useAppState();
  const { currentScreen, currentUser: user } = state;
  const showRLSModal = false; // Désactivé pour chauffeur
  const showRLSBlockingScreen = false; // Désactivé pour chauffeur
  
  // Pour l'app conducteur, on ne charge pas les données Supabase en mode démo
  // const { loading: dataLoading } = useSupabaseData();
  const dataLoading = false; // Désactivé pour app conducteur

  // ✅ CORRECTION: Quand on arrive sur /driver, forcer la vue conducteur
  const location = useLocation();
  useEffect(() => {
    console.log('🚗 DriverApp - Démarrage avec currentScreen:', currentScreen);
    console.log('🚗 DriverApp - Location pathname:', location.pathname);
    
    // ✅ Si on est sur /driver, s'assurer qu'on est en mode conducteur
    if (location.pathname.startsWith('/driver')) {
      // Si on a déjà un écran driver valide, ne rien faire
      if (currentScreen && currentScreen.startsWith('driver-')) {
        console.log('✅ Écran driver déjà défini, on garde:', currentScreen);
        // Juste s'assurer que la vue est bien "driver"
        setCurrentView('driver');
        return; // Important : ne pas continuer
      }
      
      // Si on a un écran non-driver ou pas d'écran, initialiser
      if (!currentScreen || 
          currentScreen === 'landing' || 
          currentScreen === 'user-selection' ||
          currentScreen.startsWith('admin-') ||
          currentScreen.startsWith('passenger-')) {
        console.log('🔄 Initialisation vers driver-welcome');
        setCurrentView('driver');
        setCurrentScreen('driver-welcome');
      }
    }
  }, [location.pathname]); // Dépendance sur le pathname

  // Show RLS blocking screen if there's a critical RLS issue
  if (showRLSBlockingScreen) {
    return <RLSBlockingScreen />;
  }

  // Show loading screen
  if (dataLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      {/* RLS Fix Modal (non-blocking) */}
      {showRLSModal && <RLSFixModal />}

      {/* Main Driver App Screens */}
      <div className="h-screen">
        {currentScreen === 'landing' && <LandingScreen />}
        {currentScreen === 'user-selection' && <UserSelectionScreen />}
        {(currentScreen === 'welcome-back' || currentScreen === 'welcome-back-driver') && (
          <WelcomeBackScreen 
            userName={state.currentDriver?.name || state.currentDriver?.email?.split('@')[0] || undefined}
            userType="driver"
            onComplete={() => setCurrentScreen('driver-login')}
          />
        )}
        
        {/* Driver Screens */}
        {currentScreen === 'driver-welcome' && <DriverWelcomeScreen />}
        {currentScreen === 'driver-login' && <DriverLoginScreen />}
        {currentScreen === 'driver-registration' && <DriverRegistrationScreen />}
        {currentScreen === 'driver-dashboard' && <DriverDashboard />}
        {currentScreen === 'driver-navigation' && <NavigationScreen />}
        {currentScreen === 'driver-earnings' && <EarningsScreen />}
        {currentScreen === 'driver-settings' && <DriverSettingsScreen />}
        {currentScreen === 'driver-profile' && <DriverProfileScreen />}
        {currentScreen === 'driver-client-info' && <ClientInfoScreen />}
        {currentScreen === 'driver-wallet' && <DriverWalletScreen />}
        
        {/* Forgot Password Flow */}
        {currentScreen === 'forgot-password-driver' && (
          <ForgotPasswordScreen 
            onBack={() => setCurrentScreen('driver-login')} 
            userType="driver" 
          />
        )}
        {currentScreen === 'reset-password-otp-driver' && (
          <ResetPasswordOTPScreen 
            onBack={() => setCurrentScreen('driver-login')} 
            onSuccess={() => setCurrentScreen('driver-login')}
            userType="driver" 
          />
        )}
      </div>
    </>
  );
}

export function DriverApp() {
  return (
    <Routes>
      <Route path="/*" element={<DriverAppContent />} />
    </Routes>
  );
}