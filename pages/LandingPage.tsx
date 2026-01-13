import React, { useState, useEffect } from 'react';
import { Link } from '../lib/simple-router';
import { motion } from '../lib/motion';

// Images hero pour le carrousel - Téléphones avec carte GPS/navigation/transport
const heroImages = [
  'https://images.unsplash.com/photo-1599202860130-f600f4948364?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydHBob25lJTIwbmF2aWdhdGlvbiUyMG1hcHxlbnwxfHx8fDE3NjQzMjI1MjB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  'https://images.unsplash.com/photo-1638447841552-8194177a5536?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaG9uZSUyMGdwcyUyMG1hcCUyMG5hdmlnYXRpb258ZW58MXx8fHwxNzY0MzIzMzk5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  'https://images.unsplash.com/photo-1634743556192-d19f0c69ff3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjYXIlMjByaWRlJTIwYXBwfGVufDF8fHx8MTc2NDMzNDkzM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  'https://images.unsplash.com/photo-1762944079807-eb4aab5a2cf6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydHBob25lJTIwdHJhbnNwb3J0YXRpb24lMjBjaXR5fGVufDF8fHx8MTc2NDMzNDkzM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
];

export function LandingPage() {
  const [activeSection, setActiveSection] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [language, setLanguage] = useState('fr');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Marquer la page comme chargée après le premier render
  useEffect(() => {
    setIsPageLoaded(true);
  }, []);

  // Carrousel automatique des images (change toutes les 3 secondes)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 3000); // 3 secondes

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'how', 'why', 'services'];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animation des statistiques
  useEffect(() => {
    const animateValue = (element: HTMLElement, target: number, suffix: string) => {
      let current = 0;
      const increment = target / 50;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          element.textContent = target + suffix;
          clearInterval(timer);
        } else {
          element.textContent = Math.floor(current) + suffix;
        }
      }, 30);
    };

    const stats = document.querySelectorAll('.stat-number');
    stats.forEach((stat) => {
      const element = stat as HTMLElement;
      const target = parseInt(element.getAttribute('data-target') || '0');
      const suffix = element.getAttribute('data-suffix') || '';
      animateValue(element, target, suffix);
    });
  }, []);

  return (
    <div className="min-h-screen bg-white landing-page-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        
        /* IMPORTANT: Override global CSS for landing page */
        .landing-page-wrapper {
          font-family: 'Poppins', sans-serif !important;
        }
        
        .landing-page-wrapper h2,
        .landing-page-wrapper h3,
        .landing-page-wrapper h4 {
          font-size: inherit !important;
          line-height: inherit !important;
          font-weight: inherit !important;
        }
        
        /* Ne pas bloquer le h1 hero - laisser Tailwind gérer la taille */
        .landing-page-wrapper p {
          font-size: inherit !important;
          line-height: inherit !important;
          font-weight: inherit !important;
        }

        html {
          scroll-behavior: smooth;
        }

        .floating-card-new-1 {
          animation: float1 3s ease-in-out infinite;
        }

        .floating-card-new-2 {
          animation: float2 3s ease-in-out infinite;
          animation-delay: 0.5s;
        }

        @keyframes float1 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }

        @keyframes float2 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }

        .step-card {
          transition: all 0.3s ease;
        }

        .step-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .why-card {
          transition: all 0.3s ease;
        }

        .why-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 191, 165, 0.15);
          border-color: #00BFA5;
          background: white;
        }

        .language-dropdown {
          position: relative;
        }

        .language-dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border-radius: 10px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          min-width: 150px;
          margin-top: 0.5rem;
          overflow: hidden;
          z-index: 1000;
        }

        .language-dropdown-item {
          width: 100%;
          padding: 0.75rem 1rem;
          border: none;
          background: transparent;
          text-align: left;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .language-dropdown-item:hover {
          background: #f3f4f6;
        }

        .language-dropdown-item.active {
          background: #e0f2f1;
          color: #00BFA5;
          font-weight: 600;
        }

        @keyframes pulse-glow {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 10px 25px rgba(250, 204, 21, 0.4);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 15px 35px rgba(250, 204, 21, 0.6);
          }
        }

        .pulse-button {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg">
                SC
              </div>
              <span className="text-xl sm:text-2xl font-bold">
                SMART<span className="text-cyan-500">CABB</span>
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-8">
              <Link 
                to="/" 
                className={`font-medium text-base transition-colors ${activeSection === 'home' ? 'text-cyan-500' : 'text-gray-700 hover:text-cyan-500'}`}
              >
                {language === 'fr' ? 'Accueil' : 'Home'}
              </Link>
              <Link to="/services" className="font-medium text-base text-gray-700 hover:text-cyan-500 transition-colors">
                Services
              </Link>
              <Link to="/drivers" className="font-medium text-base text-gray-700 hover:text-cyan-500 transition-colors">
                {language === 'fr' ? 'Chauffeurs' : 'Drivers'}
              </Link>
              <Link to="/contact" className="font-medium text-base text-gray-700 hover:text-cyan-500 transition-colors">
                Contact
              </Link>
              <Link to="/about" className="font-medium text-gray-700 hover:text-cyan-500 whitespace-nowrap">
                {language === 'fr' ? 'À Propos' : 'About'}
              </Link>
              
              <Link 
                to="/app/passenger"
                className="w-full border-2 border-cyan-500 text-cyan-500 px-6 py-2 rounded-full font-semibold hover:bg-cyan-500 hover:text-white transition-all text-center"
              >
                {language === 'fr' ? 'Connexion' : 'Login'}
              </Link>

              {/* Language Dropdown */}
              <div className="language-dropdown">
                <button
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  <span className="font-semibold text-cyan-500">{language === 'fr' ? 'FR' : 'EN'}</span>
                  <span className="text-sm text-gray-600 hidden xl:inline">{language === 'fr' ? 'Français' : 'English'}</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showLanguageDropdown && (
                  <div className="language-dropdown-menu">
                    <button
                      onClick={() => { setLanguage('fr'); setShowLanguageDropdown(false); }}
                      className={`language-dropdown-item ${language === 'fr' ? 'active' : ''}`}
                    >
                      <span className="font-semibold">FR</span>
                      <span className="text-sm">Français</span>
                    </button>
                    <button
                      onClick={() => { setLanguage('en'); setShowLanguageDropdown(false); }}
                      className={`language-dropdown-item ${language === 'en' ? 'active' : ''}`}
                    >
                      <span className="font-semibold">EN</span>
                      <span className="text-sm">English</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col gap-4">
                <Link to="/" className="font-medium text-gray-700 hover:text-cyan-500">{language === 'fr' ? 'Accueil' : 'Home'}</Link>
                <Link to="/services" className="font-medium text-gray-700 hover:text-cyan-500">Services</Link>
                <Link to="/drivers" className="font-medium text-gray-700 hover:text-cyan-500">{language === 'fr' ? 'Chauffeurs' : 'Drivers'}</Link>
                <Link to="/contact" className="font-medium text-gray-700 hover:text-cyan-500">Contact</Link>
                <Link to="/about" className="font-medium text-gray-700 hover:text-cyan-500">{language === 'fr' ? 'À Propos' : 'About'}</Link>
                <Link 
                  to="/app"
                  className="w-full border-2 border-cyan-500 text-cyan-500 px-6 py-2 rounded-full font-semibold hover:bg-cyan-500 hover:text-white transition-all text-center"
                >
                  {language === 'fr' ? 'Connexion' : 'Login'}
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-12 mt-16 relative overflow-hidden" style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1758620323739-5d2cd8cdc22c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkcml2ZXIlMjBzdGVlcmluZyUyMHdoZWVsJTIwcGFzc2VuZ2VycyUyMGNhciUyMGludGVyaW9yfGVufDF8fHx8MTc2MjA5MTAyNnww&ixlib=rb-4.1.0&q=80&w=1080)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '480px'
      }}>
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/70 to-cyan-600/65"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <div className="animate-in fade-in slide-in-from-left duration-700">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 leading-tight text-white">
                {language === 'fr' ? (
                  <>Votre trajet, votre <span className="text-yellow-300">choix</span></>
                ) : (
                  <>Your ride, your <span className="text-yellow-300">choice</span></>
                )}
              </h1>
              <p className="text-lg text-white/95 mb-6 leading-relaxed">
                {language === 'fr' 
                  ? 'La meilleure façon de se déplacer en Rép Dem Congo. Rapide, sûr et abordable.'
                  : 'The best way to move around in the DRC. Fast, safe and affordable.'
                }
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <a 
                  href="#cta-section"
                  className="inline-flex items-center justify-center px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-full transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  {language === 'fr' ? 'Télécharger App' : 'Download App'}
                </a>
                <Link 
                  to="/app/passenger"
                  className="pulse-button inline-flex items-center justify-center px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-full transition-all shadow-lg hover:shadow-xl"
                >
                  {language === 'fr' ? 'Commander une course maintenant' : 'Book a ride now'}
                </Link>
                <Link 
                  to="/drivers"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white/20 hover:bg-white hover:text-cyan-500 text-white font-semibold rounded-full border-2 border-white transition-all backdrop-blur-md"
                >
                  {language === 'fr' ? 'Devenir Chauffeur' : 'Become Driver'}
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-extrabold text-yellow-300 stat-number" data-target="100" data-suffix="+">0</div>
                  <div className="text-xs text-white/90 mt-1">{language === 'fr' ? 'Chauffeurs' : 'Drivers'}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-extrabold text-yellow-300 stat-number" data-target="500" data-suffix="+">0</div>
                  <div className="text-xs text-white/90 mt-1">{language === 'fr' ? 'Clients satisfaits' : 'Satisfied Customers'}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-extrabold text-yellow-300 stat-number" data-target="24" data-suffix="/7">0</div>
                  <div className="text-xs text-white/90 mt-1">{language === 'fr' ? 'Service disponible' : 'Service Available'}</div>
                </div>
              </div>
            </div>

            {/* Right Image - Animated Phone Mockup avec design harmonieux */}
            <div className="relative hidden md:block">
              {/* Formes décoratives flottantes en arrière-plan */}
              <motion.div
                className="absolute top-10 right-0 w-72 h-72 bg-yellow-300/10 rounded-full blur-3xl"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ 
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="absolute bottom-0 left-10 w-64 h-64 bg-cyan-300/10 rounded-full blur-3xl"
                animate={{ 
                  scale: [1.2, 1, 1.2],
                  opacity: [0.4, 0.6, 0.4]
                }}
                transition={{ 
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              />

              {/* Conteneur principal avec glassmorphism */}
              <motion.div 
                className="relative z-10"
                initial={{ opacity: 0, x: 100, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ 
                  duration: 0.8, 
                  delay: 0.3,
                  type: "spring",
                  stiffness: 100
                }}
              >
                {/* Cadre avec effet de verre */}
                <div className="relative p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/20 shadow-2xl">
                  {/* Téléphone animé avec carrousel */}
                  <motion.div 
                    className="relative overflow-hidden"
                    animate={{ 
                      y: [0, -15, 0],
                      rotateZ: [0, 1, 0, -1, 0]
                    }}
                    transition={{ 
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    {/* Carrousel d'images */}
                    <div className="relative w-full h-full">
                      {heroImages.map((image, index) => (
                        <motion.img
                          key={index}
                          src={image}
                          alt={`SmartCabb App - ${index === 0 ? 'Navigation GPS' : index === 1 ? 'Carte interactive' : index === 2 ? 'Application de transport moderne' : 'Smartphone transport urbain'}`}
                          className="mx-auto max-w-md w-full rounded-2xl shadow-2xl"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{
                            opacity: currentImageIndex === index ? 1 : 0,
                            scale: currentImageIndex === index ? 1 : 0.9,
                            zIndex: currentImageIndex === index ? 1 : 0
                          }}
                          transition={{
                            duration: 0.7,
                            ease: "easeInOut"
                          }}
                          style={{
                            position: index === 0 ? 'relative' : 'absolute',
                            top: index === 0 ? 'auto' : 0,
                            left: index === 0 ? 'auto' : 0,
                            right: index === 0 ? 'auto' : 0
                          }}
                        />
                      ))}
                    </div>
                    
                    {/* Reflet lumineux animé */}
                    <motion.div
                      className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/20 to-transparent rounded-t-2xl pointer-events-none"
                      style={{ zIndex: 10 }}
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </motion.div>

                  {/* Indicateurs de carrousel (dots) */}
                  <div className="flex justify-center gap-2 mt-6">
                    {heroImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`transition-all duration-300 rounded-full ${
                          currentImageIndex === index
                            ? 'w-8 h-2 bg-yellow-300'
                            : 'w-2 h-2 bg-white/40 hover:bg-white/60'
                        }`}
                        aria-label={`Voir image ${index + 1}`}
                      />
                    ))}
                  </div>

                  {/* Cercles décoratifs autour du téléphone */}
                  <motion.div
                    className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-full opacity-80 shadow-lg flex items-center justify-center"
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                      scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                    }}
                  >
                    <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </motion.div>

                  <motion.div
                    className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-full opacity-80 shadow-lg flex items-center justify-center"
                    animate={{ 
                      rotate: -360,
                      scale: [1, 1.15, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 15, repeat: Infinity, ease: "linear" },
                      scale: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
                    }}
                  >
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </motion.div>

                  {/* Particules flottantes */}
                  <motion.div
                    className="absolute top-1/4 -right-8 w-3 h-3 bg-yellow-300 rounded-full shadow-lg"
                    animate={{ 
                      y: [-20, 20, -20],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <motion.div
                    className="absolute bottom-1/3 -left-6 w-2 h-2 bg-cyan-300 rounded-full shadow-lg"
                    animate={{ 
                      y: [20, -20, 20],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{ 
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1
                    }}
                  />
                </div>

                {/* Ombre portée douce */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-yellow-400/20 blur-3xl -z-10 scale-110"></div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom duration-700">
            <h2 className="text-4xl font-bold mb-4">{language === 'fr' ? 'Comment ça marche ?' : 'How it works?'}</h2>
            <p className="text-xl text-gray-600">{language === 'fr' ? 'Réservez votre course en 4 étapes simples' : 'Book your ride in 4 simple steps'}</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                icon: <svg width="35" height="35" fill="white" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>,
                title: language === 'fr' ? 'Localiser' : 'Locate',
                description: language === 'fr' ? 'Indiquez votre position et votre destination' : 'Set your location and destination'
              },
              {
                icon: <svg width="35" height="35" fill="white" viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>,
                title: language === 'fr' ? 'Choisir' : 'Choose',
                description: language === 'fr' ? 'Sélectionnez le type de véhicule qui vous convient' : 'Select the vehicle type that suits you'
              },
              {
                icon: <svg width="35" height="35" fill="white" viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>,
                title: language === 'fr' ? 'Réserver' : 'Book',
                description: language === 'fr' ? 'Confirmez votre réservation en un clic' : 'Confirm your booking with one click'
              },
              {
                icon: <svg width="35" height="35" fill="white" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>,
                title: language === 'fr' ? 'Profitez' : 'Enjoy',
                description: language === 'fr' ? 'Montez à bord et profitez de votre trajet' : 'Get in and enjoy your ride'
              }
            ].map((step, idx) => (
              <div
                key={idx}
                className="step-card bg-white p-8 rounded-2xl text-center animate-in fade-in zoom-in duration-500"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose SmartCabb Section */}
      <section id="why" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom duration-700">
            <h2 className="text-4xl font-bold mb-4">{language === 'fr' ? 'Pourquoi choisir SMART CABB ?' : 'Why choose SMART CABB?'}</h2>
            <p className="text-xl text-gray-600">{language === 'fr' ? 'Un service de qualité avec des avantages inégalés' : 'Quality service with unmatched benefits'}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="white"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-5-5 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>,
                title: language === 'fr' ? 'Sécurité d\'abord' : 'Safety first',
                description: language === 'fr' ? 'Tous nos chauffeurs sont rigoureusement vérifiés. Votre trajet est suivi en temps réel.' : 'All our drivers are rigorously verified. Your trip is tracked in real time.'
              },
              {
                icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="white"><path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/></svg>,
                title: language === 'fr' ? 'Prix transparents' : 'Transparent prices',
                description: language === 'fr' ? 'Fini les négociations de prix ! Le tarif est affiché avant que vous ne confirmiez votre course.' : 'No more price negotiations! The fare is displayed before you confirm your ride.'
              },
              {
                icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="white"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>,
                title: language === 'fr' ? 'Disponibilité 24/7' : '24/7 Availability',
                description: language === 'fr' ? 'Nos chauffeurs sont disponibles à tout moment, de jour comme de nuit.' : 'Our drivers are available at any time, day or night.'
              },
              {
                icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="white"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>,
                title: language === 'fr' ? 'Confort et fiabilité' : 'Comfort and reliability',
                description: language === 'fr' ? 'Des véhicules bien entretenus pour une expérience de voyage agréable.' : 'Well-maintained vehicles for a pleasant travel experience.'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="why-card bg-gray-50 p-8 rounded-2xl text-center border-2 border-transparent animate-in fade-in zoom-in duration-500"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center shadow-lg">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta-section" className="py-20 px-4 bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-in fade-in zoom-in duration-700">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {language === 'fr' ? 'Prêt à voyager avec SmartCabb ?' : 'Ready to travel with SmartCabb?'}
            </h2>
            <p className="text-xl mb-10 text-white/90">
              {language === 'fr' 
                ? 'Téléchargez l\'application maintenant et profitez de votre première course'
                : 'Download the app now and enjoy your first ride'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                to="/app"
                className="inline-flex items-center justify-center px-10 py-4 bg-white text-cyan-500 font-bold rounded-full hover:bg-gray-100 transition-all shadow-lg transform hover:scale-105"
              >
                <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                App Store
              </Link>
              <Link 
                to="/app"
                className="inline-flex items-center justify-center px-10 py-4 bg-white text-cyan-500 font-bold rounded-full hover:bg-gray-100 transition-all shadow-lg transform hover:scale-105"
              >
                <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.24-.84-.76-.84-1.35zm10.84-.75l5.81-5.81-3.86-2.17-1.95 1.95v6.03zm6.42-6.42c.51-.28.74-.79.74-1.33 0-.54-.23-1.05-.74-1.33l-2.14-1.2-4.28 4.28 4.28 4.28 2.14-1.2zM13.69 12L3.84 1.85c.11-.06.23-.1.35-.13.13-.03.27-.05.41-.05.5 0 .98.19 1.35.53l7.74 7.8z"/>
                </svg>
                Google Play
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}