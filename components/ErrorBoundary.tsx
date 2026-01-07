import * as React from 'react';
import { Button } from './ui/button';
import { AlertCircle, Home, WifiOff } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
  isOfflineError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  private mounted = false;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, isOfflineError: false };
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('❌ ErrorBoundary - getDerivedStateFromError:', error);
    return { hasError: true, error, errorInfo: null, isOfflineError: false };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('❌ ErrorBoundary caught an error:', error);
    console.error('❌ Error info:', errorInfo);
    console.error('❌ Component Stack:', errorInfo.componentStack);
    
    // 🔍 Détecter si c'est une erreur de module dynamique
    const isDynamicImportError = error.message?.includes('Failed to fetch dynamically imported module') ||
                                 error.message?.includes('error loading dynamically imported module');
    
    // 🌐 Vérifier l'état de la connexion de manière plus fiable
    let isActuallyOffline = false;
    
    if (isDynamicImportError) {
      console.warn('⚠️ Erreur de chargement de module dynamique détectée');
      
      // Vérifier plusieurs indicateurs de connexion
      if (typeof window !== 'undefined') {
        const navigatorOffline = !window.navigator.onLine;
        
        // Test supplémentaire : tenter de charger une ressource depuis le serveur
        // Si on est vraiment hors ligne, l'ErrorBoundary devrait seulement s'afficher
        // quand navigator.onLine est false
        if (navigatorOffline) {
          console.warn('📡 Navigator.onLine = false - Mode hors ligne confirmé');
          isActuallyOffline = true;
        } else {
          console.log('✅ Navigator.onLine = true - Connexion détectée');
          console.log('⚠️ Erreur de module, mais connexion active - Probablement un problème de build/cache');
        }
      }
    }
    
    if (this.mounted) {
      this.setState({ errorInfo, isOfflineError: isActuallyOffline });
    }
  }

  handleReset = () => {
    // 🧹 Nettoyer les données corrompues dans localStorage
    try {
      // ✅ SSR FIX: Vérifier que nous sommes côté client
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        console.warn('⚠️ localStorage non disponible (SSR)');
        this.setState({ hasError: false, error: null, errorInfo: null, isOfflineError: false });
        return;
      }
      
      console.log('🧹 Nettoyage des données corrompues...');
      
      // Supprimer les données potentiellement corrompues
      const keysToCheck = [
        'smartcab_current_user',
        'smartcab_current_driver',
        'smartcab_current_ride',
        'smartcab_system_settings'
      ];
      
      keysToCheck.forEach(key => {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            JSON.parse(data); // Vérifier si le JSON est valide
          }
        } catch (e) {
          console.warn(`⚠️ Données corrompues détectées pour ${key}, suppression...`);
          localStorage.removeItem(key);
        }
      });
      
      console.log('✅ Nettoyage terminé');
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage:', error);
    }
    
    this.setState({ hasError: false, error: null, errorInfo: null, isOfflineError: false });
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, isOfflineError: false });
    
    // ✅ SSR FIX: Vérifier que nous sommes côté client
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      // Si un fallback personnalisé est fourni, l'utiliser
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 📡 Affichage spécial pour les erreurs hors ligne
      if (this.state.isOfflineError) {
        return (
          <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center p-6">
            <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl p-8">
              <div className="text-center mb-6">
                <WifiOff className="w-20 h-20 text-orange-500 mx-auto mb-4" />
                <h2 className="text-3xl mb-3 text-gray-900">Mode hors ligne</h2>
                <p className="text-gray-600 mb-2">
                  Cette page n'est pas disponible hors ligne.
                </p>
              </div>

              {/* Message informatif */}
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-orange-800">
                  Vous devez être connecté à Internet pour accéder aux panneaux Admin et Conducteur.
                </p>
                <p className="text-sm text-orange-700 mt-2">
                  Veuillez vous reconnecter ou revenir à l'accueil.
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button 
                  onClick={this.handleReset}
                  className="w-full h-12 bg-cyan-500 hover:bg-cyan-600 text-white"
                >
                  Réessayer
                </Button>
                <Button 
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="w-full h-12"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Retour à l'accueil
                </Button>
              </div>

              {/* Info supplémentaire */}
              <p className="text-xs text-gray-500 text-center mt-6">
                Si le problème persiste, vérifiez la console du navigateur
              </p>
            </div>
          </div>
        );
      }

      // 🔴 Affichage standard pour les autres erreurs
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-6">
              <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
              <h2 className="text-3xl mb-3 text-gray-900">Erreur de chargement</h2>
              <p className="text-gray-600 mb-2">
                Une erreur est survenue lors du chargement de cette page.
              </p>
            </div>

            {/* Détails de l'erreur */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-red-800 font-mono break-words">
                {this.state.error?.message || 'Erreur inconnue'}
              </p>
              
              {/* Conseil pour problème de cache/build */}
              {this.state.error?.message?.includes('Failed to fetch') && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800 font-bold">💡 Solution rapide :</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    1. Videz le cache du navigateur (Ctrl+Shift+Delete)<br/>
                    2. Actualisez la page (Ctrl+F5 ou Cmd+Shift+R)<br/>
                    3. Si le problème persiste, attendez quelques minutes que le serveur se mette à jour
                  </p>
                </div>
              )}
              
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="mt-3">
                  <summary className="text-xs text-red-600 cursor-pointer hover:text-red-800">
                    Détails techniques
                  </summary>
                  <pre className="mt-2 text-xs text-red-700 overflow-auto max-h-40 bg-red-100 p-2 rounded">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button 
                onClick={this.handleReset}
                className="w-full h-12 bg-cyan-500 hover:bg-cyan-600 text-white"
              >
                Réessayer
              </Button>
              <Button 
                onClick={this.handleGoHome}
                variant="outline"
                className="w-full h-12"
              >
                <Home className="w-4 h-4 mr-2" />
                Retour à l'accueil
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
