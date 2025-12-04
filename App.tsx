import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './hooks/useAppState';
import { Toaster } from './components/ui/sonner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { lazy, Suspense, useEffect } from 'react';
import { LoadingScreen } from './components/LoadingScreen';
import { PWAInstallPrompt, OnlineStatusIndicator } from './components/PWAInstallPrompt';
import { PageTransition } from './components/PageTransition';
import { applyBrowserOptimizations } from './utils/browserDetection';
import { applySafariFixes, isPrivateBrowsing } from './utils/safariCompatibility';
import { APP_VERSION, BUILD_TIME, checkForUpdate } from './utils/cacheManager';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { startUpdateDetection } from './utils/updateDetector'; // 🔥 NOUVEAU

// 🌐 Landing Page (Site Vitrine) - Chargement prioritaire
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));

// 🚀 LandingScreen (Sélection Passager/Conducteur)
import { LandingScreen } from './components/LandingScreen';

// 🎯 AppRouter (Gère LandingScreen et PassengerApp)
import { AppRouter } from './components/AppRouter';

// 🌐 Pages secondaires - Chargées à la demande
const ServicesPage = lazy(() => import('./pages/ServicesPage').then(m => ({ default: m.ServicesPage })));
const DriversLandingPage = lazy(() => import('./pages/DriversLandingPage').then(m => ({ default: m.DriversLandingPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));

// 🌐 Terms Page
const TermsPage = lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })));

// 🌐 Privacy Page
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));

// 🌐 Legal Page
const LegalPage = lazy(() => import('./pages/LegalPage').then(m => ({ default: m.LegalPage })));

// 📱 Passenger App
const PassengerApp = lazy(() => import('./pages/PassengerApp').then(m => ({ default: m.PassengerApp })));

// 🚗 Driver App
const DriverApp = lazy(() => import('./pages/DriverApp').then(m => ({ default: m.DriverApp })));

// 👨‍💼 Admin Panel
const AdminApp = lazy(() => import('./pages/AdminApp').then(m => ({ default: m.AdminApp })));

// 🔐 Reset Password Page
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { ResetPasswordByPhonePage } from './components/auth/ResetPasswordByPhonePage';
import { CreateAuthFromProfilePage } from './components/auth/CreateAuthFromProfilePage';

// 🧪 Test SMS Direct
import { TestSMSDirect } from './components/TestSMSDirect';

// 🔧 Loading fallback
const SuspenseFallback = () => {
  console.log('⏳ SuspenseFallback - Chargement en cours...');
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-white">
      <LoadingScreen />
    </div>
  );
};

function App() {
  console.log(`🚀 SmartCabb v${APP_VERSION} - Build ${BUILD_TIME} - Démarrage...`);
  
  // Appliquer les optimisations navigateur au démarrage
  useEffect(() => {
    try {
      applyBrowserOptimizations();
      
      // 🍎 Appliquer les correctifs Safari/iOS
      applySafariFixes();
      
      // 📱 FIX UNIVERSEL: Calculer la vraie hauteur du viewport sur mobile
      const setViewportHeight = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      };
      
      // Appliquer au chargement
      setViewportHeight();
      
      // Ré-appliquer lors du redimensionnement (rotation, clavier mobile, etc.)
      let resizeTimeout: number;
      const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = window.setTimeout(() => {
          setViewportHeight();
        }, 100);
      };
      
      window.addEventListener('resize', handleResize);
      window.addEventListener('orientationchange', setViewportHeight);
      
      // ⚠️ Vérifier si on est en mode navigation privée Safari
      isPrivateBrowsing().then(isPrivate => {
        if (isPrivate) {
          console.warn('⚠️ Mode navigation privée détecté - Certaines fonctionnalités peuvent être limitées');
        }
      });
      
      // Vérifier si une nouvelle version est disponible
      if (checkForUpdate()) {
        console.log('🔄 Nouvelle version détectée - Cache rafraîchi');
      }

      // 🧹 NETTOYAGE DU LOCALSTORAGE : Détecter et supprimer les données corrompues
      try {
        console.log('🧹 Vérification de l\'intégrité des données...');
        
        const keysToValidate = [
          'smartcab_current_user',
          'smartcab_current_driver',
          'smartcab_current_ride',
          'smartcab_system_settings'
        ];
        
        keysToValidate.forEach(key => {
          try {
            const data = localStorage.getItem(key);
            if (data) {
              const parsed = JSON.parse(data);
              
              // Validation spécifique pour éviter les erreurs toLocaleString
              if (key === 'smartcab_system_settings' && parsed) {
                if (parsed.exchangeRate !== undefined && (typeof parsed.exchangeRate !== 'number' || isNaN(parsed.exchangeRate))) {
                  console.warn(`⚠️ exchangeRate invalide, suppression de ${key}`);
                  localStorage.removeItem(key);
                }
              }
              
              if (key === 'smartcab_current_driver' && parsed) {
                if (parsed.accountBalance !== undefined && (typeof parsed.accountBalance !== 'number' || isNaN(parsed.accountBalance))) {
                  console.warn(`⚠️ accountBalance invalide, suppression de ${key}`);
                  localStorage.removeItem(key);
                }
              }
            }
          } catch (e) {
            console.warn(`⚠️ Données corrompues détectées pour ${key}, suppression...`);
            localStorage.removeItem(key);
          }
        });
        
        console.log('✅ Vérification terminée');
      } catch (error) {
        console.error('❌ Erreur lors de la vérification:', error);
      }

      // 🧹 NETTOYAGE DU LOCALSTORAGE : Détecter et corriger les incohérences
      try {
        const savedView = localStorage.getItem('smartcab_current_view');
        const savedScreen = localStorage.getItem('smartcab_current_screen');
        
        console.log('🔍 Vérification cohérence:', { savedView, savedScreen });
        
        // Détecter les incohérences
        if (savedView && savedScreen) {
          // Écrans neutres qui sont OK pour n'importe quelle vue
          const neutralScreens = [
            'landing', 
            'user-selection', 
            'welcome-back', 
            'welcome-back-driver', 
            'welcome-back-passenger',
            'forgot-password',
            'reset-password-otp'
          ];
          
          const isNeutralScreen = neutralScreens.includes(savedScreen);
          
          // Seulement détecter les vraies incohérences (pas les écrans neutres)
          const isViewDriverButScreenAdmin = savedView === 'driver' && savedScreen.startsWith('admin-');
          const isViewDriverButScreenPassenger = savedView === 'driver' && !isNeutralScreen && !savedScreen.startsWith('driver-') && (savedScreen.startsWith('passenger-') || ['map', 'welcome', 'login', 'register', 'booking', 'ride', 'payment', 'rating'].includes(savedScreen));
          
          const isViewPassengerButScreenAdmin = savedView === 'passenger' && savedScreen.startsWith('admin-');
          const isViewPassengerButScreenDriver = savedView === 'passenger' && savedScreen.startsWith('driver-');
          
          const isViewAdminButScreenDriver = savedView === 'admin' && savedScreen.startsWith('driver-');
          const isViewAdminButScreenPassenger = savedView === 'admin' && !isNeutralScreen && !savedScreen.startsWith('admin-');
          
          if (isViewDriverButScreenAdmin || isViewDriverButScreenPassenger ||
              isViewPassengerButScreenAdmin || isViewPassengerButScreenDriver ||
              isViewAdminButScreenDriver || isViewAdminButScreenPassenger) {
            console.warn('⚠️ Incohérence détectée entre view et screen - Nettoyage...', {
              savedView,
              savedScreen,
              isViewDriverButScreenAdmin,
              isViewDriverButScreenPassenger,
              isViewPassengerButScreenAdmin,
              isViewPassengerButScreenDriver,
              isViewAdminButScreenDriver,
              isViewAdminButScreenPassenger
            });
            localStorage.removeItem('smartcab_current_view');
            localStorage.removeItem('smartcab_current_screen');
            console.log('✅ localStorage nettoyé');
          }
        }
      } catch (error) {
        console.warn('⚠️ Erreur nettoyage localStorage:', error);
      }

      // 🔧 Détecter et gérer les tokens de réinitialisation de mot de passe
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');
      
      if (accessToken && type === 'recovery') {
        console.log('🔐 Token de réinitialisation détecté dans l\'URL');
        const currentPath = window.location.pathname;
        
        // Si on n'est pas déjà sur la page de réinitialisation, y rediriger
        if (currentPath !== '/auth/reset-password') {
          console.log('➡️ Redirection vers /auth/reset-password');
          window.location.href = '/auth/reset-password' + window.location.hash;
        }
      }

      // 🧹 NETTOYER LES ANCIENNES DEMANDES DE COURSE AU DÉMARRAGE
      const cleanupOldRides = async () => {
        try {
          console.log('🧹 Nettoyage des anciennes demandes de course...');
          
          // ⚠️ DÉSACTIVÉ TEMPORAIREMENT pour éviter l'erreur au démarrage
          // Cette fonctionnalité nécessite que le serveur Supabase Edge Functions soit déployé
          // Une fois le backend déployé, décommenter ce code
          
          /* 
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/rides/cleanup`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${publicAnonKey}`
              }
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            console.log(`✅ Nettoyage terminé: ${data.deletedCount} demande(s) supprimée(s)`);
          }
          */
          
          console.log('ℹ️ Nettoyage désactivé - Sera activé après déploiement du backend');
        } catch (error) {
          console.warn('⚠️ Erreur nettoyage demandes:', error);
        }
      };

      // Lancer le nettoyage après 2 secondes (ne pas bloquer le démarrage)
      setTimeout(cleanupOldRides, 2000);
      
      // Cleanup lors du démontage
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', setViewportHeight);
      };
    } catch (error) {
      console.error('Erreur lors de l\'application des optimisations:', error);
    }
  }, []);

  // 🔥 DÉTECTER LES MISES À JOUR
  useEffect(() => {
    startUpdateDetection();
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppProvider>
          <div className="app-container">
            {/* Online/Offline Indicator */}
            <OnlineStatusIndicator />
            
            {/* PWA Install Prompt */}
            <PWAInstallPrompt />
            
            {/* Toast Notifications */}
            <Toaster 
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#fff',
                  color: '#1a1a1a',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                },
              }}
            />

            {/* Animation de transition entre pages */}
            <PageTransition />

            {/* Main Routing - Sans AnimatePresence pour compatibilité Figma Make */}
            <Suspense fallback={<SuspenseFallback />}>
              <Routes>
                {/* Site Vitrine - PAGE D'ACCUEIL */}
                <Route path="/" element={<LandingPage />} />
                
                {/* Services Page */}
                <Route path="/services" element={<ServicesPage />} />
                
                {/* Drivers Landing Page */}
                <Route path="/drivers" element={<DriversLandingPage />} />
                
                {/* Contact Page */}
                <Route path="/contact" element={<ContactPage />} />
                
                {/* About Page */}
                <Route path="/about" element={<AboutPage />} />
                
                {/* Terms Page */}
                <Route path="/terms" element={<TermsPage />} />

                {/* Privacy Page */}
                <Route path="/privacy" element={<PrivacyPage />} />

                {/* Legal Page */}
                <Route path="/legal" element={<LegalPage />} />
                
                {/* Driver App */}
                <Route path="/driver/*" element={<DriverApp />} />
                
                {/* Admin Panel */}
                <Route path="/admin/*" element={<AdminApp />} />
                
                {/* Reset Password Page */}
                <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
                <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/auth/reset-password-by-phone" element={<ResetPasswordByPhonePage />} />
                <Route path="/auth/create-auth-from-profile" element={<CreateAuthFromProfilePage />} />
                
                {/* Test SMS Direct */}
                <Route path="/test/sms-direct" element={<TestSMSDirect />} />
                
                {/* Redirections pour compatibilité */}
                <Route path="/passenger" element={<Navigate to="/app" replace />} />
                <Route path="/passager" element={<Navigate to="/app" replace />} />
                <Route path="/conducteur" element={<Navigate to="/driver" replace />} />
                
                {/* Application SmartCabb - DÉPLACÉE SUR /app */}
                <Route path="/app/*" element={<AppRouter />} />
                
                {/* Anciennes pages - Redirection vers accueil */}
                <Route path="/preview_page_v2.html" element={<Navigate to="/" replace />} />
                <Route path="/index.html" element={<Navigate to="/" replace />} />
                
                {/* Catch-all route - Redirige vers la page d'accueil */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </div>
        </AppProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
