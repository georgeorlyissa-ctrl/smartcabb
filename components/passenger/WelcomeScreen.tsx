import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { useAppState } from "../../hooks/useAppState";
import { Car, MapPin, Star, ArrowLeft, Sparkles, Shield, Zap } from "lucide-react";
import { SmartCabbLogo } from "../SmartCabbLogo";
import { DatabaseSetupModal } from "../DatabaseSetupModal";
import { WelcomeBackScreen } from "../WelcomeBackScreen";
import { getSession } from "../../lib/auth-service";
import { useNavigate } from "react-router-dom";

export function WelcomeScreen() {
  console.log("🏠 WelcomeScreen - Composant monté");

  const { setCurrentScreen, setCurrentView, setIsAdmin } = useAppState();
  const navigate = useNavigate();
  const [showDatabaseModal, setShowDatabaseModal] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [userName, setUserName] = useState("");
  const [userType, setUserType] = useState<"passenger" | "driver">("passenger");
  const [userPhoto, setUserPhoto] = useState<string | undefined>(undefined);

  console.log("✅ WelcomeScreen rendu - Prêt à afficher");

  // Vérification de session au chargement
  useEffect(() => {
    console.log("🔍 useEffect - Début de la vérification de session");

    const checkSession = async () => {
      // Vérifier si on a déjà affiché le WelcomeBack dans cette session
      const hasSeenWelcomeBack = sessionStorage.getItem('smartcabb_welcome_shown');
      
      if (hasSeenWelcomeBack) {
        console.log('ℹ️ WelcomeBack déjà affiché - Navigation directe');
        setShowWelcomeBack(false);
        setIsCheckingSession(false);
        return;
      }

      const timeoutId = setTimeout(() => {
        console.log("⏱️ Timeout de vérification de session");
      }, 500);

      try {
        console.log("🔍 checkSession - Appel de getSession()...");
        const session = await getSession();
        console.log("🔍 checkSession - Résultat getSession():", session);

        clearTimeout(timeoutId);

        if (session.success && session.profile) {
          console.log("✅ Session active détectée:", session.profile.full_name, "- Rôle:", session.profile.role);

          if (session.profile.role === "admin") {
            console.log("🔐 Admin détecté - Redirection directe");
            setIsAdmin(true);
            setCurrentView("admin");
            setCurrentScreen("admin-dashboard");
            setIsCheckingSession(false);
            return;
          }

          setUserName(session.profile.full_name);
          setUserType(session.profile.role === "driver" ? "driver" : "passenger");
          setShowWelcomeBack(true);
          setIsCheckingSession(false);
        } else {
          console.log("ℹ️ Aucune session active");
          setShowWelcomeBack(false);
          setIsCheckingSession(false);
        }
      } catch (error) {
        clearTimeout(timeoutId);
        console.warn("⚠️ Erreur lors de la vérification de session:", error);
        setShowWelcomeBack(false);
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, [setCurrentScreen, setCurrentView, setIsAdmin]);

  const handleWelcomeBackComplete = () => {
    console.log("🎉 Welcome Back terminé, redirection...");
    
    // Marquer comme vu pour cette session
    sessionStorage.setItem('smartcabb_welcome_shown', 'true');

    if (userType === "driver") {
      console.log("🚗 Redirection vers Driver Dashboard");
      setCurrentView("driver");
      setCurrentScreen("driver-dashboard");
      navigate("/driver");
    } else {
      console.log("📱 Redirection vers Passenger Map");
      setCurrentView("passenger");
      setCurrentScreen("map");
    }
  };

  const handleNewUserStart = () => {
    console.log("👤 Nouvel utilisateur - Affichage page normale");
    setShowWelcomeBack(false);
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-cyan-500 to-cyan-600 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  if (showWelcomeBack) {
    return (
      <WelcomeBackScreen
        userName={userName}
        userType={userType}
        userPhoto={userPhoto}
        onContinue={handleWelcomeBackComplete}
        onChangeUser={handleNewUserStart}
      />
    );
  }

  const handleNavigation = (screen: string) => {
    console.log(`🎯 handleNavigation appelé avec screen: ${screen}`);
    try {
      setCurrentScreen(screen);
      console.log(`✅ setCurrentScreen('${screen}') appelé avec succès`);
    } catch (error) {
      console.error(`❌ Erreur lors de setCurrentScreen('${screen}'):`, error);
    }
  };

  console.log("✅ WelcomeScreen - Rendu du JSX");

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-cyan-500 to-cyan-600 relative overflow-hidden">
      {/* Animated Background Elements - CSS uniquement */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Bouton retour */}
        <div className="p-6 animate-in fade-in slide-in-from-left duration-500">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              console.log("⬅️ Retour au Landing Screen");
              // ✅ Réinitialiser la vue pour retourner au choix Passager/Conducteur
              setCurrentView(null);
              setCurrentScreen('landing');
              navigate("/");
            }}
            className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>

        {/* Header */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-32">
          <div className="w-full max-w-md animate-in fade-in zoom-in duration-700">
            {/* Logo animé */}
            <div className="flex justify-center mb-6 relative">
              <div className="animate-spin-slow">
                <SmartCabbLogo className="w-24 h-24" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                <Sparkles className="w-5 h-5 text-gray-900" />
              </div>
            </div>

            {/* Titre */}
            <h1 className="text-center text-5xl mb-3 font-bold">
              <span className="bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
                SmartCabb
              </span>
            </h1>
            <p className="text-center text-xl text-white/90 mb-2">
              Bienvenue !
            </p>
            <p className="text-center text-white/80 mb-12">
              Votre transport intelligent à Kinshasa
            </p>

            {/* Features - 3 cartes compactes */}
            <div className="space-y-3 mb-8 animate-in fade-in slide-in-from-bottom duration-700" style={{ animationDelay: '200ms' }}>
              {[
                { icon: MapPin, text: "Géolocalisation en temps réel", color: "yellow" },
                { icon: Star, text: "Conducteurs 5 étoiles", color: "yellow" },
                { icon: Shield, text: "Paiements sécurisés", color: "white" }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all hover:translate-x-2 animate-in fade-in slide-in-from-left duration-500"
                  style={{ animationDelay: `${300 + index * 100}ms` }}
                >
                  <div className={`w-12 h-12 rounded-xl ${feature.color === 'yellow' ? 'bg-yellow-400/20' : 'bg-white/20'} flex items-center justify-center flex-shrink-0`}>
                    <feature.icon className={`w-6 h-6 ${feature.color === 'yellow' ? 'text-yellow-400' : 'text-white'}`} />
                  </div>
                  <span className="text-white font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className="px-6 pb-8 space-y-4 max-w-md mx-auto w-full animate-in fade-in slide-in-from-bottom duration-700" style={{ animationDelay: '600ms' }}>
          <Button
            onClick={() => handleNavigation("register")}
            className="w-full h-16 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-2xl text-lg font-semibold shadow-2xl shadow-cyan-500/50 transition-all hover:scale-105"
          >
            S'inscrire
          </Button>
          <Button
            onClick={() => handleNavigation("login")}
            className="w-full h-16 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/20 rounded-2xl text-lg font-semibold transition-all hover:scale-105"
          >
            Se connecter
          </Button>
        </div>
      </div>

      {/* Database Setup Modal */}
      {showDatabaseModal && (
        <DatabaseSetupModal onClose={() => setShowDatabaseModal(false)} />
      )}
    </div>
  );
}