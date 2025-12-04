import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { usePWA } from '../hooks/usePWA';
import { motion, AnimatePresence } from 'motion/react';

export function PWAInstallPrompt() {
  const { isInstallable, isInstalled, promptInstall } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà refusé
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Afficher le prompt après 30 secondes si installable
    if (isInstallable && !isInstalled) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled]);

  const handleInstall = async () => {
    const success = await promptInstall();
    if (success) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setIsDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Ne rien afficher si déjà installé ou refusé
  if (isInstalled || isDismissed || !isInstallable) {
    return null;
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
        >
          <Card className="border-orange-500 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Download className="w-5 h-5 text-orange-600" />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Installer SmartCabb
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Installez l'application pour un accès rapide et une meilleure expérience.
                  </p>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={handleInstall}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                      size="sm"
                    >
                      Installer
                    </Button>
                    <Button
                      onClick={handleDismiss}
                      variant="outline"
                      size="sm"
                    >
                      Plus tard
                    </Button>
                  </div>
                </div>
                
                <button
                  onClick={handleDismiss}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Composant pour afficher le statut en ligne/hors ligne
export function OnlineStatusIndicator() {
  const [isOnline, setIsOnline] = useState(true); // Optimiste par défaut
  const [showOffline, setShowOffline] = useState(false);
  const [offlineConfirmed, setOfflineConfirmed] = useState(false);

  useEffect(() => {
    // Initialiser l'état avec navigator.onLine
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => {
      console.log('✅ Connexion rétablie');
      setIsOnline(true);
      setShowOffline(false);
      setOfflineConfirmed(false);
    };

    const handleOffline = () => {
      console.log('⚠️ Connexion perdue');
      setIsOnline(false);
      
      // Vérifier réellement si on est hors ligne avec un ping
      // Attendre 2 secondes avant de confirmer (éviter les faux positifs)
      setTimeout(() => {
        if (!navigator.onLine) {
          console.log('❌ Hors ligne confirmé');
          setOfflineConfirmed(true);
          setShowOffline(true);
        }
      }, 2000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Vérifier périodiquement la connexion (toutes les 30 secondes)
    const intervalId = setInterval(() => {
      if (!navigator.onLine && !offlineConfirmed) {
        handleOffline();
      } else if (navigator.onLine && offlineConfirmed) {
        handleOnline();
      }
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [offlineConfirmed]);

  // Ne rien afficher si on est en ligne ou si ce n'est pas confirmé
  if (!showOffline || !offlineConfirmed) return null;

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white py-2 px-4 text-center text-sm shadow-lg"
        >
          <p>📡 Connexion limitée - Vérifiez votre connexion Internet</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
