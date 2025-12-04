import { useAppState } from '../hooks/useAppState';
import { LandingScreen } from './LandingScreen';
import { PassengerApp } from '../pages/PassengerApp';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * AppRouter - Gère l'affichage entre LandingScreen et PassengerApp
 * 
 * IMPORTANT: Utilise CSS pour cacher/afficher au lieu de mount/unmount
 * Cela évite le rechargement du lazy loading en production
 */
export function AppRouter() {
  const { state } = useAppState();
  const { currentView, currentScreen } = state;
  const [shouldPreloadPassenger, setShouldPreloadPassenger] = useState(false);
  const navigate = useNavigate();

  // 🔧 Détecter si on a un token de réinitialisation et rediriger
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');

    if (accessToken && type === 'recovery') {
      console.log('✅ Token de réinitialisation détecté dans AppRouter, redirection...');
      navigate('/auth/reset-password' + window.location.hash, { replace: true });
    }
  }, [navigate]);

  console.log('🎯 AppRouter - currentView:', currentView, 'currentScreen:', currentScreen);

  // Utiliser useMemo pour éviter les re-renders inutiles
  const shouldShowPassengerApp = useMemo(() => {
    const passengerScreens = ['welcome', 'login', 'register', 'forgot-password', 'map', 'ride', 'payment', 'rating', 'settings', 'profile', 'history', 'promo-code', 'wallet', 'estimate', 'ride-history', 'passenger-settings'];
    return currentView === 'passenger' || passengerScreens.includes(currentScreen);
  }, [currentView, currentScreen]);

  // Pré-charger PassengerApp dès qu'on est sur LandingScreen
  useEffect(() => {
    if (!shouldShowPassengerApp && !shouldPreloadPassenger) {
      // Petit délai pour ne pas bloquer le render initial
      const timer = setTimeout(() => {
        console.log('🔄 Pré-chargement de PassengerApp en arrière-plan');
        setShouldPreloadPassenger(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [shouldShowPassengerApp, shouldPreloadPassenger]);

  const showLanding = !currentView || !shouldShowPassengerApp;

  console.log('📺 AppRouter - showLanding:', showLanding, 'shouldShowPassengerApp:', shouldShowPassengerApp);

  // NOUVELLE APPROCHE: Garder les deux composants montés, utiliser CSS pour basculer
  return (
    <div className="relative w-full h-full">
      {/* LandingScreen - Caché avec CSS quand non actif */}
      <div 
        className="absolute inset-0 w-full h-full transition-opacity duration-300"
        style={{ 
          opacity: showLanding ? 1 : 0,
          pointerEvents: showLanding ? 'auto' : 'none',
          zIndex: showLanding ? 20 : 0,
          visibility: showLanding ? 'visible' : 'hidden'
        }}
      >
        <LandingScreen />
      </div>

      {/* PassengerApp - Pré-chargé et affiché quand actif */}
      {(shouldShowPassengerApp || shouldPreloadPassenger) && (
        <div 
          className="absolute inset-0 w-full h-full transition-opacity duration-300"
          style={{ 
            opacity: shouldShowPassengerApp ? 1 : 0,
            pointerEvents: shouldShowPassengerApp ? 'auto' : 'none',
            zIndex: shouldShowPassengerApp ? 20 : 0,
            visibility: shouldShowPassengerApp ? 'visible' : 'hidden'
          }}
        >
          <PassengerApp />
        </div>
      )}
    </div>
  );
}