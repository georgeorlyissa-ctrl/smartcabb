import { Button } from './ui/button';
import { useAppState } from '../hooks/useAppState';
import { SmartCabbLogo } from './SmartCabbLogo';
import { 
  Car, 
  Shield, 
  Users,
  MapPin,
  Zap,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { flushSync } from 'react-dom';

export function LandingScreen() {
  console.log('🏠 LandingScreen - Composant monté - VERSION CYAN - BUILD:', Date.now());
  
  const { setCurrentScreen, setCurrentView, state } = useAppState();
  const navigate = useNavigate();

  const handleGetStarted = (role: 'passenger' | 'driver') => {
    console.log('🎯 handleGetStarted IMMÉDIAT - role:', role);
    
    // Mise à jour SYNCHRONE du state React ET localStorage avec flushSync
    const newScreen = role === 'passenger' ? 'welcome' : 'driver-welcome';
    
    // flushSync force React à appliquer immédiatement les updates sans batching
    flushSync(() => {
      setCurrentView(role);
      setCurrentScreen(newScreen);
    });
    
    // Navigation pour conducteur seulement
    if (role === 'driver') {
      navigate('/driver');
    }
    
    console.log('✅ Transition effectuée vers:', role);
  };

  const handleAdminAccess = () => {
    console.log('👨‍💼 handleAdminAccess appelé - Navigation vers /admin');
    navigate('/admin');
  };

  const handleBackToSite = () => {
    console.log('⬅️ Retour au site vitrine');
    navigate('/site');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#001428] via-[#003D7A] to-[#002447] relative overflow-hidden flex items-center justify-center">
      {/* Animated Background Elements - CSS uniquement */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Grille de points */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, rgba(0, 152, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Bouton retour en haut à gauche */}
      <div className="absolute top-6 left-6 animate-in fade-in slide-in-from-left duration-500">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleBackToSite}
          className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Badge Admin uniquement - EN HAUT À DROITE */}
      <div className="absolute top-6 right-6 animate-in fade-in slide-in-from-right duration-500">
        <button
          type="button"
          onClick={handleAdminAccess}
          className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse hover:scale-110 transition-transform cursor-pointer shadow-lg shadow-yellow-400/50"
          title="Accès Admin"
        >
          <Shield className="w-6 h-6 text-gray-900" />
        </button>
      </div>

      {/* Content centré */}
      <div className="relative z-10 w-full max-w-lg px-6">
        {/* Logo et titre au centre */}
        <div className="text-center mb-8 animate-in fade-in zoom-in duration-700">
          <div className="mx-auto mb-6 relative inline-block">
            <div className="animate-spin-slow">
              <SmartCabbLogo className="w-28 h-28 mx-auto" />
            </div>
          </div>

          <h1 className="text-5xl mb-3 font-bold">
            <span className="bg-gradient-to-r from-cyan-400 to-yellow-400 bg-clip-text text-transparent">
              SmartCabb
            </span>
          </h1>
          <p className="text-lg text-gray-300">
            Votre transport intelligent & fiabilisé
          </p>
        </div>

        {/* Features Cards - 3 cartes compactes */}
        <div className="space-y-3 mb-8 animate-in fade-in slide-in-from-bottom duration-700" style={{ animationDelay: '200ms' }}>
          {[
            { icon: MapPin, label: 'Géolocalisation en temps réel', color: 'cyan' },
            { icon: Shield, label: 'Conducteurs 5 étoiles', color: 'yellow' },
            { icon: Zap, label: 'Paiements sécurisés', color: 'cyan' }
          ].map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all cursor-pointer hover:translate-x-2 animate-in fade-in slide-in-from-left duration-500"
              style={{ animationDelay: `${300 + index * 100}ms` }}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color === 'cyan' ? 'from-cyan-500/20 to-cyan-600/20' : 'from-yellow-500/20 to-yellow-600/20'} flex items-center justify-center flex-shrink-0`}>
                <feature.icon className={`w-6 h-6 ${feature.color === 'cyan' ? 'text-cyan-400' : 'text-yellow-400'}`} />
              </div>
              <span className="text-white font-medium">{feature.label}</span>
            </div>
          ))}
        </div>

        {/* Boutons d'action - CÔTE À CÔTE: Passager et Conducteur */}
        <div className="flex items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom duration-700" style={{ animationDelay: '600ms' }}>
          <Button
            type="button"
            onClick={() => handleGetStarted('passenger')}
            className="flex-1 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-2xl text-lg font-semibold shadow-2xl shadow-cyan-500/50 group transition-all hover:scale-105"
          >
            <Car className="w-5 h-5 mr-2" />
            Passager
          </Button>

          <Button
            type="button"
            onClick={() => handleGetStarted('driver')}
            className="flex-1 h-16 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/20 rounded-2xl text-lg font-semibold group transition-all hover:scale-105"
          >
            <Users className="w-5 h-5 mr-2" />
            Conducteur
          </Button>
        </div>

        {/* Help text en bas */}
        <div className="text-center mt-6 flex items-center justify-center gap-2 animate-in fade-in duration-1000" style={{ animationDelay: '800ms' }}>
          <button 
            type="button"
            onClick={() => navigate('/contact')}
            className="text-sm text-gray-400 hover:text-cyan-400 transition-colors"
          >
            Besoin d'aide ?
          </button>
          <span className="text-gray-600">•</span>
          <button 
            type="button"
            onClick={() => navigate('/about')}
            className="text-sm text-gray-400 hover:text-cyan-400 transition-colors"
          >
            À propos
          </button>
        </div>
      </div>
    </div>
  );
}