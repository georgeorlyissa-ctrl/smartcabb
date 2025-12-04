import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Button } from "../ui/button";
import { useAppState } from "../../hooks/useAppState";
import { Car, DollarSign, Star, MapPin, ArrowLeft, Sparkles, TrendingUp, Shield } from "lucide-react";
import { SmartCabbLogo } from "../SmartCabbLogo";
import { WelcomeBackScreen } from "../WelcomeBackScreen";
import { getSession } from "../../lib/auth-service";
import { useNavigate } from "react-router-dom";

export function DriverWelcomeScreen() {
  console.log("🚗 DriverWelcomeScreen - Composant monté");

  const { setCurrentScreen, setCurrentView, setIsAdmin } = useAppState();
  const navigate = useNavigate();
  const [isCheckingSession, setIsCheckingSession] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [userName, setUserName] = useState("");
  const [userPhoto, setUserPhoto] = useState<string | undefined>(undefined);

  console.log("✅ DriverWelcomeScreen rendu - Prêt à afficher");

  useEffect(() => {
    console.log("🔍 useEffect - Début de la vérification de session");

    const checkSession = async () => {
      // Vérifier si on a déjà affiché le WelcomeBack dans cette session
      const hasSeenWelcomeBack = sessionStorage.getItem('smartcabb_driver_welcome_shown');
      
      if (hasSeenWelcomeBack) {
        console.log('ℹ️ WelcomeBack conducteur déjà affiché - Navigation directe');
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

        if (session.success && session.profile && session.profile.role === "driver") {
          console.log("✅ Session conducteur active:", session.profile.full_name);
          setUserName(session.profile.full_name);
          setShowWelcomeBack(true);
          setIsCheckingSession(false);
        } else {
          console.log("ℹ️ Aucune session conducteur active");
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
    console.log("🎉 Welcome Back conducteur terminé, redirection...");
    
    // Marquer comme vu pour cette session
    sessionStorage.setItem('smartcabb_driver_welcome_shown', 'true');
    
    setCurrentView("driver");
    setCurrentScreen("driver-dashboard");
  };

  const handleNavigation = (screen: string) => {
    console.log('🚀 handleNavigation appelé avec screen:', screen);
    setCurrentScreen(screen);
  };

  const handleBackClick = () => {
    console.log('⬅️ Bouton retour cliqué - Redirection vers landing page');
    // ✅ SOLUTION DÉFINITIVE: Forcer un hard reload vers la landing page
    window.location.href = '/';
  };

  if (isCheckingSession) {
    return null;
  }

  if (showWelcomeBack && userName) {
    return (
      <WelcomeBackScreen
        userName={userName}
        userType="driver"
        userPhoto={userPhoto}
        onComplete={handleWelcomeBackComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#001428] via-[#003D7A] to-[#002447] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Bouton retour */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="absolute top-6 left-6 z-50"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              console.log('⬅️ Retour au site vitrine');
              navigate('/');
            }}
            className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </motion.div>

        {/* Header */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-12"
          >
            <div className="mx-auto mb-6 relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <SmartCabbLogo className="w-32 h-32 mx-auto" />
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center"
              >
                <Car className="w-5 h-5 text-gray-900" />
              </motion.div>
            </div>
            <h1 className="text-5xl mb-4 font-bold">
              <span className="bg-gradient-to-r from-cyan-400 to-yellow-400 bg-clip-text text-transparent">
                SmartCabb Driver
              </span>
            </h1>
            <p className="text-lg text-gray-300 max-w-md leading-relaxed">
              Gagnez de l'argent en conduisant avec SmartCabb
            </p>
          </motion.div>

          {/* Features Premium */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full max-w-sm space-y-4 mb-12"
          >
            {[
              { icon: DollarSign, label: 'Revenus flexibles et attractifs', color: 'yellow' },
              { icon: TrendingUp, label: 'Horaires de travail libres', color: 'cyan' },
              { icon: Shield, label: 'Paiements sécurisés garantis', color: 'yellow' }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ x: 10 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color === 'cyan' ? 'from-cyan-500/20 to-cyan-600/20' : 'from-yellow-500/20 to-yellow-600/20'} flex items-center justify-center`}>
                  <feature.icon className={`w-6 h-6 ${feature.color === 'cyan' ? 'text-cyan-400' : 'text-yellow-400'}`} />
                </div>
                <span className="text-white font-medium">{feature.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Actions Premium */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="px-6 pb-8 space-y-4"
        >
          <Button
            onClick={() => handleNavigation("driver-registration")}
            className="w-full h-16 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-2xl text-lg font-semibold shadow-2xl shadow-cyan-500/50"
          >
            Devenir conducteur
          </Button>
          <Button
            onClick={() => handleNavigation("driver-login")}
            className="w-full h-16 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/20 rounded-2xl text-lg font-semibold"
          >
            Se connecter
          </Button>
        </motion.div>

        {/* Bottom Links Premium */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="px-6 pb-6 flex justify-center gap-8 text-sm"
        >
          <button
            onClick={() => {
              console.log("👤 Navigation vers Espace Passager");
              navigate("/app");
            }}
            className="text-gray-400 hover:text-cyan-400 transition-colors font-medium"
          >
            Espace Passager
          </button>
          <button
            onClick={() => {
              console.log("👨‍💼 Navigation vers Administration");
              navigate("/admin");
            }}
            className="text-gray-400 hover:text-cyan-400 transition-colors font-medium"
          >
            Administration
          </button>
        </motion.div>
      </div>
    </div>
  );
}