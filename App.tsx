import React, { lazy, Suspense, useEffect } from 'react';
import { Router, Routes, Route, Navigate } from './lib/simple-router';
import { Toaster } from 'sonner';
import { LoadingScreen } from './components/LoadingScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PWAInstallPrompt, OnlineStatusIndicator } from './components/PWAInstallPrompt';
import { ExchangeRateSync } from './components/ExchangeRateSync';
import { PageTransition } from './components/PageTransition';
import { AppProvider } from './hooks/useAppState';
import { BackendSyncProvider } from './components/BackendSyncProvider';
import { applyBrowserOptimizations, applySafariFixes, isPrivateBrowsing } from './utils/browserDetection';
import { BUILD_VERSION, BUILD_TIMESTAMP } from './BUILD_VERSION';
import { startUpdateDetection } from './utils/updateDetector';
import { checkForUpdate } from './utils/cacheManager';

// 🔥 BUILD v517.89 - FIX STRUCTURE OBJET KV STORE: {balance: X, updated_at: ...}
console.log('🚀 BUILD v517.89 - FIX STRUCTURE OBJET KV STORE: {balance: X, updated_at: ...}');
console.log('❌ PROBLÈME v517.88: Le NaN persiste ENCORE après isNaN() !');
console.log('   Log erreur: "Données KV: { balance: 40700, updated_at: ... } Type: object"');
console.log('   → parseFloat(String(object)) = parseFloat("[object Object]") = NaN ❌');
console.log('');
console.log('🎯 VRAIE CAUSE RACINE:');
console.log('   Le KV store stocke une STRUCTURE OBJET au lieu d\'un nombre simple:');
console.log('   {');
console.log('     balance: 40700,');
console.log('     updated_at: "2025-12-22T23:45:46.397Z"');
console.log('   }');
console.log('');
console.log('   Code v517.88: parseFloat(String({balance: 40700}))');
console.log('                 ↓');
console.log('                 parseFloat("[object Object]")');
console.log('                 ↓');
console.log('                 NaN ❌');
console.log('');
console.log('✅ SOLUTION v517.89:');
console.log('   DÉTECTER structure objet et EXTRAIRE .balance AVANT parseFloat() !');
console.log('');
console.log('   Pattern correct (déjà utilisé dans toggle-online-status):');
console.log('   let balanceValue = 0;');
console.log('   if (typeof balance === "number") {');
console.log('     balanceValue = balance;  // Nombre simple ✅');
console.log('   } else if (balance && typeof balance === "object" && "balance" in balance) {');
console.log('     balanceValue = balance.balance;  // Extraire propriété ✅');
console.log('   } else {');
console.log('     balanceValue = parseFloat(String(balance));  // Fallback');
console.log('   }');
console.log('   if (isNaN(balanceValue)) { /* Réparation */ }');
console.log('');
console.log('BACKEND driver-routes.tsx:');
console.log('   GET /:driverId/balance:');
console.log('   ✅ Extraction .balance si objet (3 cas: number / objet / autre)');
console.log('   ✅ isNaN() après extraction');
console.log('   ✅ Log: "Structure objet détectée, extraction de .balance: X"');
console.log('');
console.log('   POST /:driverId/balance (add):');
console.log('   ✅ Extraction .balance si objet (3 cas)');
console.log('   ✅ isNaN() après extraction ET après calcul');
console.log('   ✅ Log: "Structure objet détectée (add), extraction de .balance: X"');
console.log('');
console.log('   POST /:driverId/balance (subtract):');
console.log('   ✅ Extraction .balance si objet (3 cas)');
console.log('   ✅ isNaN() après extraction ET après calcul');
console.log('   ✅ Log: "Structure objet détectée (subtract), extraction de .balance: X"');
console.log('');
console.log('✅ v517.88 MAINTENU: isNaN() après parseFloat() (localStorage frontend)');
console.log('✅ v517.87 MAINTENU: Validation recharge (parseInt)');
console.log('✅ v517.86 MAINTENU: Validation courses (handleCompleteRide)');
console.log('✅ v517.85 MAINTENU: rideId unique');
console.log('');
console.log('⚡ TRIPLE PROTECTION ANTI-NaN:');
console.log('   🛡️ Backend GET: isNaN() après parseFloat()');
console.log('   🛡️ Backend POST: isNaN() après parseFloat() + newBalance');
console.log('   🛡️ Frontend: isNaN() après CHAQUE parseFloat()');
console.log('🎉 AUCUN NaN NE PEUT SURVIVRE ! 💯');

// 🌐 Landing Page (Site Vitrine) - Import direct pour fiabilité
import { LandingPage } from './pages/LandingPage';

// 🚀 LandingScreen (Sélection Passager/Conducteur) - Import direct
import { LandingScreen } from './components/LandingScreen';

// 🎯 AppRouter (Gère LandingScreen et PassengerApp) - Import direct
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

// 📱 Passenger App - Import direct pour fiabilité
import { PassengerApp } from './pages/PassengerApp';

// 🚗 Driver App - ✅ FIX: Import direct pour éviter les erreurs de lazy loading
import { DriverApp } from './pages/DriverApp';

// 👨‍💼 Admin Panel - Import direct pour fiabilité
import { AdminApp } from './pages/AdminApp';

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

// 🔧 Retry logic pour lazy loading
function lazyWithRetry(componentImport: () => Promise<any>) {
  return lazy(() => {
    return new Promise((resolve, reject) => {
      const hasRefreshed = JSON.parse(
        window.sessionStorage.getItem('retry-lazy-refreshed') || 'false'
      );

      componentImport()
        .then((component) => {
          window.sessionStorage.setItem('retry-lazy-refreshed', 'false');
          resolve(component);
        })
        .catch((error) => {
          if (!hasRefreshed) {
            console.log('⚠️ Échec chargement lazy, tentative de rafraîchissement...');
            window.sessionStorage.setItem('retry-lazy-refreshed', 'true');
            return window.location.reload();
          }
          console.error('❌ Échec chargement lazy après refresh:', error);
          reject(error);
        });
    });
  });
}

function App() {
  console.log(`🚀 SmartCabb v${BUILD_VERSION} - Build ${BUILD_TIMESTAMP} - Démarrage...`);
  
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
        const currentPath = window.location.pathname;
        
        console.log('🔍 Vérification cohérence:', { savedView, savedScreen, currentPath });
        
        // ✅ NOUVEAU: Forcer la vue basée sur l'URL actuelle
        if (currentPath.includes('/driver')) {
          if (savedView !== 'driver') {
            console.log('🔄 URL contient /driver, forçage de la vue à driver dans localStorage');
            localStorage.setItem('smartcab_current_view', 'driver');
          }
        } else if (currentPath.includes('/admin')) {
          if (savedView !== 'admin') {
            console.log('🔄 URL contient /admin, forçage de la vue à admin dans localStorage');
            localStorage.setItem('smartcab_current_view', 'admin');
          }
        } else if (currentPath.includes('/passenger') || currentPath.includes('/app')) {
          // Ne forcer que si on n'est pas sur /app/driver ou /app/admin
          if (!currentPath.includes('/driver') && !currentPath.includes('/admin') && savedView !== 'passenger') {
            console.log('🔄 URL contient /passenger ou /app, forçage de la vue à passenger dans localStorage');
            localStorage.setItem('smartcab_current_view', 'passenger');
          }
        }
        
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
          const isViewAdminButScreenPassenger = savedView === 'admin' && !neutralScreen && !savedScreen.startsWith('admin-');
          
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
    try {
      if (typeof startUpdateDetection === 'function') {
        startUpdateDetection();
        console.log('✅ Détection de mise à jour activée');
      } else {
        console.warn('⚠️ startUpdateDetection non disponible');
      }
    } catch (error) {
      console.error('Erreur startUpdateDetection:', error);
    }
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <AppProvider>
          <BackendSyncProvider />
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

            {/* 🔄 Synchronisation automatique du taux de change depuis le backend */}
            <ExchangeRateSync />

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
      </Router>
    </ErrorBoundary>
  );
}

export default App;