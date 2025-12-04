import { Component, ReactNode } from 'react';
import { Button } from './ui/button';
import { AlertCircle, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('❌ ErrorBoundary caught an error:', error);
    console.error('❌ Error info:', errorInfo);
    console.error('❌ Component Stack:', errorInfo.componentStack);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    // 🧹 Nettoyer les données corrompues dans localStorage
    try {
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
    
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Si un fallback personnalisé est fourni, l'utiliser
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-6">
              <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
              <h2 className="text-3xl mb-3 text-gray-900">Une erreur est survenue</h2>
              <p className="text-gray-600 mb-2">
                Nous sommes désolés, quelque chose s'est mal passé.
              </p>
            </div>

            {/* Détails de l'erreur */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-red-800 font-mono break-words">
                {this.state.error?.message || 'Erreur inconnue'}
              </p>
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