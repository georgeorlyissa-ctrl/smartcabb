import { Link } from '../lib/simple-router';
import { useState, useEffect } from 'react';
import { ChatWidget } from '../components/ChatWidget';
import { TestimonialsCarousel } from '../components/TestimonialsCarousel';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function ServicesPage() {
  const [language, setLanguage] = useState('fr');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(2000); // Taux par défaut
  const [currentStandardIndex, setCurrentStandardIndex] = useState(0);
  const [currentConfortIndex, setCurrentConfortIndex] = useState(0);
  const [currentBusinessIndex, setCurrentBusinessIndex] = useState(0);
  const [currentFamiliaIndex, setCurrentFamiliaIndex] = useState(0);

  // Images pour SmartCabb Standard - vos vraies images + fallback
  const standardVehicles = [
    { 
      src: '/vehicules/standard/Standard_1.png',
      fallback: 'https://images.unsplash.com/photo-1692970060626-8e96d7ee70d2?w=600',
      alt: 'SmartCabb Standard - Véhicule 1'
    },
    { 
      src: '/vehicules/standard/Standard_2.png',
      fallback: 'https://images.unsplash.com/photo-1648197323414-4255ea82d86b?w=600',
      alt: 'SmartCabb Standard - Véhicule 2'
    },
    { 
      src: '/vehicules/standard/Standard_3.png',
      fallback: 'https://images.unsplash.com/photo-1757782630151-8012288407e1?w=600',
      alt: 'SmartCabb Standard - Véhicule 3'
    },
    { 
      src: '/vehicules/standard/Standard_4.png',
      fallback: 'https://images.unsplash.com/photo-1692970060626-8e96d7ee70d2?w=600',
      alt: 'SmartCabb Standard - Véhicule 4'
    },
    { 
      src: '/vehicules/standard/Standard_5.png',
      fallback: 'https://images.unsplash.com/photo-1648197323414-4255ea82d86b?w=600',
      alt: 'SmartCabb Standard - Véhicule 5'
    },
    { 
      src: '/vehicules/standard/Standard_6.png',
      fallback: 'https://images.unsplash.com/photo-1757782630151-8012288407e1?w=600',
      alt: 'SmartCabb Standard - Véhicule 6'
    }
  ];

  // Images pour SmartCabb Confort - vos vraies images + fallback
  const confortVehicles = [
    { 
      src: '/vehicules/confort/confort 1.png',
      fallback: 'https://images.unsplash.com/photo-1648197323414-4255ea82d86b?w=600',
      alt: 'SmartCabb Confort - Véhicule 1'
    },
    { 
      src: '/vehicules/confort/Confort_2.png',
      fallback: 'https://images.unsplash.com/photo-1757782630151-8012288407e1?w=600',
      alt: 'SmartCabb Confort - Véhicule 2'
    },
    { 
      src: '/vehicules/confort/Confort_3.png',
      fallback: 'https://images.unsplash.com/photo-1687730594701-88cdea1ef5ae?w=600',
      alt: 'SmartCabb Confort - Véhicule 3'
    }
  ];

  // Images pour SmartCabb Business - vos vraies images + fallback
  const businessVehicles = [
    { 
      src: '/vehicules/business/business_1.png',
      fallback: 'https://images.unsplash.com/photo-1707726149138-879308167d60?w=600',
      alt: 'SmartCabb Business - Véhicule 1'
    },
    { 
      src: '/vehicules/business/Business_2.png',
      fallback: 'https://images.unsplash.com/photo-1603094541004-f31aeafaf0e6?w=600',
      alt: 'SmartCabb Business - Véhicule 2'
    },
    { 
      src: '/vehicules/business/Business_3.png',
      fallback: 'https://images.unsplash.com/photo-1666846865666-d2d2525c3613?w=600',
      alt: 'SmartCabb Business - Véhicule 3'
    },
    { 
      src: '/vehicules/business/Business_4.png',
      fallback: 'https://images.unsplash.com/photo-1707726149138-879308167d60?w=600',
      alt: 'SmartCabb Business - Véhicule 4'
    },
    { 
      src: '/vehicules/business/Business_5.png',
      fallback: 'https://images.unsplash.com/photo-1603094541004-f31aeafaf0e6?w=600',
      alt: 'SmartCabb Business - Véhicule 5'
    },
    { 
      src: '/vehicules/business/Business_6.png',
      fallback: 'https://images.unsplash.com/photo-1666846865666-d2d2525c3613?w=600',
      alt: 'SmartCabb Business - Véhicule 6'
    }
  ];

  // Images pour SmartCabb Familia (anciennement Plus) - vos vraies images + fallback
  const familiaVehicles = [
    { 
      src: '/vehicules/famille/Familiale_1.png',
      fallback: 'https://images.unsplash.com/photo-1720545044233-d2ac77fa6030?w=600',
      alt: 'SmartCabb Familia - Véhicule 1'
    },
    { 
      src: '/vehicules/famille/Familiale_2.png',
      fallback: 'https://images.unsplash.com/photo-1720545044233-d2ac77fa6030?w=600',
      alt: 'SmartCabb Familia - Véhicule 2'
    },
    { 
      src: '/vehicules/famille/Familiale_3.png',
      fallback: 'https://images.unsplash.com/photo-1720545044233-d2ac77fa6030?w=600',
      alt: 'SmartCabb Familia - Véhicule 3'
    },
    { 
      src: '/vehicules/famille/Familiale_4.png',
      fallback: 'https://images.unsplash.com/photo-1720545044233-d2ac77fa6030?w=600',
      alt: 'SmartCabb Familia - Véhicule 4'
    }
  ];

  // Récupérer la langue depuis localStorage au chargement
  useEffect(() => {
    const savedLang = localStorage.getItem('smartcabb_lang') || 'fr';
    setLanguage(savedLang);
  }, []);

  // Récupérer le taux de change depuis localStorage
  useEffect(() => {
    const rate = localStorage.getItem('smartcabb_exchange_rate');
    if (rate) {
      setExchangeRate(parseInt(rate));
    }
  }, []);

  // Carousel automatique pour SmartCabb Standard
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStandardIndex((prevIndex) => (prevIndex + 1) % standardVehicles.length);
    }, 3000); // Change toutes les 3 secondes
    return () => clearInterval(interval);
  }, []);

  // Carousel automatique pour SmartCabb Confort
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentConfortIndex((prevIndex) => (prevIndex + 1) % confortVehicles.length);
    }, 3000); // Change toutes les 3 secondes
    return () => clearInterval(interval);
  }, []);

  // Carousel automatique pour SmartCabb Business
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBusinessIndex((prevIndex) => (prevIndex + 1) % businessVehicles.length);
    }, 3000); // Change toutes les 3 secondes
    return () => clearInterval(interval);
  }, []);

  // Carousel automatique pour SmartCabb Familia
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFamiliaIndex((prevIndex) => (prevIndex + 1) % familiaVehicles.length);
    }, 3000); // Change toutes les 3 secondes
    return () => clearInterval(interval);
  }, []);

  // Sauvegarder la langue dans localStorage quand elle change
  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('smartcabb_lang', lang);
    setShowLanguageDropdown(false);
  };

  const t = (fr: string, en: string) => language === 'fr' ? fr : en;

  // Fonction helper pour formater les prix en CDF
  const formatCDF = (usd: number) => {
    const cdf = usd * exchangeRate;
    return new Intl.NumberFormat('fr-CD').format(cdf) + ' CDF';
  };

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        
        body {
          font-family: 'Poppins', sans-serif;
        }

        html {
          scroll-behavior: smooth;
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
      `}</style>

      {/* Navigation - DESIGN CONFORME */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center text-white font-bold text-base">
                SC
              </div>
              <span className="text-xl font-bold">
                SMART<span className="text-cyan-500">CABB</span>
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="font-medium text-gray-700 hover:text-cyan-500 transition-colors">
                {language === 'fr' ? 'Accueil' : 'Home'}
              </Link>
              <Link to="/services" className="font-medium text-cyan-500 transition-colors">
                Services
              </Link>
              <Link to="/drivers" className="font-medium text-gray-700 hover:text-cyan-500 transition-colors">
                {language === 'fr' ? 'Chauffeurs' : 'Drivers'}
              </Link>
              <Link to="/contact" className="font-medium text-gray-700 hover:text-cyan-500 transition-colors">
                Contact
              </Link>
              <Link to="/about" className="font-medium text-gray-700 hover:text-cyan-500 transition-colors">
                {language === 'fr' ? 'À Propos' : 'About'}
              </Link>
              
              <Link 
                to="/app"
                className="border-2 border-cyan-500 text-cyan-500 px-6 py-2 rounded-full font-semibold hover:bg-cyan-500 hover:text-white transition-all"
              >
                {language === 'fr' ? 'Connexion' : 'Login'}
              </Link>

              {/* Language Dropdown */}
              <div className="language-dropdown">
                <button
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="font-semibold text-cyan-500">{language === 'fr' ? 'FR' : 'EN'}</span>
                  <span className="text-sm text-gray-600">{language === 'fr' ? 'Français' : 'English'}</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showLanguageDropdown && (
                  <div className="language-dropdown-menu">
                    <button
                      onClick={() => handleLanguageChange('fr')}
                      className={`language-dropdown-item ${language === 'fr' ? 'active' : ''}`}
                    >
                      <span className="font-semibold">FR</span>
                      <span>Français</span>
                    </button>
                    <button
                      onClick={() => handleLanguageChange('en')}
                      className={`language-dropdown-item ${language === 'en' ? 'active' : ''}`}
                    >
                      <span className="font-semibold">EN</span>
                      <span>English</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section 
        className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(0, 191, 165, 0.95) 0%, rgba(0, 168, 144, 0.9) 100%), url(https://images.unsplash.com/photo-1758620323739-5d2cd8cdc22c?w=1200&q=80) center/cover',
        }}
      >
        <div className="max-w-7xl mx-auto text-center text-white">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
            {t('Nos Services', 'Our Services')}
          </h1>
          <p className="text-xl opacity-90">
            {t('Nous offrons la grille tarifaire optimale', 'We offer the optimal pricing grid')}
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {/* Smart Cabb Standard */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="relative">
                {/* Image du véhicule avec transition */}
                <div className="relative h-48 overflow-hidden">
                  {standardVehicles.map((vehicle, index) => (
                    <ImageWithFallback
                      key={index}
                      src={vehicle.src}
                      fallbackSrc={vehicle.fallback}
                      alt={vehicle.alt}
                      className="absolute w-full h-full object-cover transition-all duration-1000 ease-in-out"
                      style={{
                        opacity: currentStandardIndex === index ? 1 : 0,
                        transform: currentStandardIndex === index ? 'scale(1)' : 'scale(1.1)',
                      }}
                    />
                  ))}
                </div>
                
                {/* Indicateurs de carousel */}
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
                  {standardVehicles.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStandardIndex(index)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        currentStandardIndex === index
                          ? 'bg-white w-6'
                          : 'bg-white/50 w-1.5 hover:bg-white/75'
                      }`}
                      aria-label={`Go to vehicle ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="p-6">
                <span className="inline-block bg-cyan-500 text-white px-4 py-2 rounded-full font-semibold text-sm mb-4">
                  SMARTCABB STANDARD
                </span>
                <h3 className="text-2xl font-bold mb-2">🚗 SmartCabb Standard</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {t(
                    'Solution économique et climatisée pour vos déplacements quotidiens. Idéal pour 3 personnes.',
                    'Economical and air-conditioned solution for your daily trips. Ideal for 3 people.'
                  )}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  {t(
                    'Véhicules: Toyota IST, Suzuki Swift, Toyota Vitz, Toyota Blade, Toyota Ractis, Toyota Runx',
                    'Vehicles: Toyota IST, Suzuki Swift, Toyota Vitz, Toyota Blade, Toyota Ractis, Toyota Runx'
                  )}
                </p>
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-cyan-500">👥</span>
                    <span>3 {t('places', 'seats')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-cyan-500">❄️</span>
                    <span>{t('Climatisé', 'AC')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-cyan-500">🔒</span>
                    <span>{t('Sécurisé', 'Secure')}</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('Course/heure (jour)', 'Ride/hour (day)')}</span>
                    <span className="font-semibold">7$ / {formatCDF(7)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('Course/heure (nuit)', 'Ride/hour (night)')}</span>
                    <span className="font-semibold">10$ / {formatCDF(10)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('Location journalière', 'Daily rental')}</span>
                    <span className="font-semibold">60$ / {formatCDF(60)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('Aéroport A/R', 'Airport RT')}</span>
                    <span className="font-semibold">70$ / {formatCDF(70)}</span>
                  </div>
                </div>
                <Link to="/app/passenger" className="block w-full bg-cyan-500 text-white py-3 rounded-xl font-semibold text-center hover:bg-cyan-600 transition-colors">
                  {t('Demander maintenant', 'Request now')}
                </Link>
              </div>
            </div>

            {/* Smart Cabb Confort */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="relative">
                {/* Image du véhicule avec transition */}
                <div className="relative h-48 overflow-hidden">
                  {confortVehicles.map((vehicle, index) => (
                    <ImageWithFallback
                      key={index}
                      src={vehicle.src}
                      fallbackSrc={vehicle.fallback}
                      alt={vehicle.alt}
                      className="absolute w-full h-full object-cover transition-all duration-1000 ease-in-out"
                      style={{
                        opacity: currentConfortIndex === index ? 1 : 0,
                        transform: currentConfortIndex === index ? 'scale(1)' : 'scale(1.1)',
                      }}
                    />
                  ))}
                </div>
                
                {/* Indicateurs de carousel */}
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
                  {confortVehicles.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentConfortIndex(index)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        currentConfortIndex === index
                          ? 'bg-white w-6'
                          : 'bg-white/50 w-1.5 hover:bg-white/75'
                      }`}
                      aria-label={`Go to vehicle ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="p-6">
                <span className="inline-block bg-cyan-500 text-white px-4 py-2 rounded-full font-semibold text-sm mb-4">
                  SMARTCABB CONFORT
                </span>
                <h3 className="text-2xl font-bold mb-2">🚘 SmartCabb Confort</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {t(
                    'Confort premium avec connexion Data gratuit. Véhicules modernes pour 3 personnes.',
                    'Premium comfort with free Data connection. Modern vehicles for 3 people.'
                  )}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  {t(
                    'Véhicules: Toyota Marx, Toyota Crown, Mercedes C-Class, Harrier, Toyota Vanguard, Nissan Juke',
                    'Vehicles: Toyota Marx, Toyota Crown, Mercedes C-Class, Harrier, Toyota Vanguard, Nissan Juke'
                  )}
                </p>
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-cyan-500">👥</span>
                    <span>3 {t('places', 'seats')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-cyan-500">❄️</span>
                    <span>{t('Climatisé', 'AC')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-cyan-500">📶</span>
                    <span>Data {t('gratuit', 'free')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-cyan-500">🔒</span>
                    <span>{t('Sécurisé', 'Secure')}</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('Course/heure (jour)', 'Ride/hour (day)')}</span>
                    <span className="font-semibold">15$ / {formatCDF(15)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('Course/heure (nuit)', 'Ride/hour (night)')}</span>
                    <span className="font-semibold">17$ / {formatCDF(17)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('Location journalière', 'Daily rental')}</span>
                    <span className="font-semibold">80$ / {formatCDF(80)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('Aéroport A/R', 'Airport RT')}</span>
                    <span className="font-semibold">90$ / {formatCDF(90)}</span>
                  </div>
                </div>
                <Link to="/app/passenger" className="block w-full bg-cyan-500 text-white py-3 rounded-xl font-semibold text-center hover:bg-cyan-600 transition-colors">
                  {t('Demander maintenant', 'Request now')}
                </Link>
              </div>
            </div>

            {/* Smart Cabb Familia */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="relative">
                {/* Image du véhicule avec transition */}
                <div className="relative h-48 overflow-hidden">
                  {familiaVehicles.map((vehicle, index) => (
                    <ImageWithFallback
                      key={index}
                      src={vehicle.src}
                      fallbackSrc={vehicle.fallback}
                      alt={vehicle.alt}
                      className="absolute w-full h-full object-cover transition-all duration-1000 ease-in-out"
                      style={{
                        opacity: currentFamiliaIndex === index ? 1 : 0,
                        transform: currentFamiliaIndex === index ? 'scale(1)' : 'scale(1.1)',
                      }}
                    />
                  ))}
                </div>
                
                {/* Indicateurs de carousel */}
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
                  {familiaVehicles.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentFamiliaIndex(index)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        currentFamiliaIndex === index
                          ? 'bg-white w-6'
                          : 'bg-white/50 w-1.5 hover:bg-white/75'
                      }`}
                      aria-label={`Go to vehicle ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="p-6">
                <span className="inline-block bg-cyan-500 text-white px-4 py-2 rounded-full font-semibold text-sm mb-4">
                  SMARTCABB FAMILIA
                </span>
                <h3 className="text-2xl font-bold mb-2">✨ SmartCabb Familia</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {t(
                    '7 places avec connexion Data gratuit. Véhicules spacieux pour familles et groupes.',
                    '7 seats with free Data connection. Spacious vehicles for families and groups.'
                  )}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  {t(
                    'Véhicules: Noah, Alphard, Voxy',
                    'Vehicles: Noah, Alphard, Voxy'
                  )}
                </p>
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-cyan-500">👥</span>
                    <span>7 {t('places', 'seats')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-cyan-500">❄️</span>
                    <span>{t('Climatisé', 'AC')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-cyan-500">📶</span>
                    <span>Data {t('gratuit', 'free')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-cyan-500">🔒</span>
                    <span>{t('Sécurisé', 'Secure')}</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('Course/heure (jour)', 'Ride/hour (day)')}</span>
                    <span className="font-semibold">15$ / {formatCDF(15)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('Course/heure (nuit)', 'Ride/hour (night)')}</span>
                    <span className="font-semibold">20$ / {formatCDF(20)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('Location journalière', 'Daily rental')}</span>
                    <span className="font-semibold">100$ / {formatCDF(100)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('Aéroport A/R', 'Airport RT')}</span>
                    <span className="font-semibold">110$ / {formatCDF(110)}</span>
                  </div>
                </div>
                <Link to="/app/passenger" className="block w-full bg-cyan-500 text-white py-3 rounded-xl font-semibold text-center hover:bg-cyan-600 transition-colors">
                  {t('Demander maintenant', 'Request now')}
                </Link>
              </div>
            </div>

            {/* Smart Cabb Business */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="relative">
                {/* Image du véhicule avec transition */}
                <div className="relative h-48 overflow-hidden">
                  {businessVehicles.map((vehicle, index) => (
                    <ImageWithFallback
                      key={index}
                      src={vehicle.src}
                      fallbackSrc={vehicle.fallback}
                      alt={vehicle.alt}
                      className="absolute w-full h-full object-cover transition-all duration-1000 ease-in-out"
                      style={{
                        opacity: currentBusinessIndex === index ? 1 : 0,
                        transform: currentBusinessIndex === index ? 'scale(1)' : 'scale(1.1)',
                      }}
                    />
                  ))}
                </div>
                
                {/* Indicateurs de carousel */}
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
                  {businessVehicles.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentBusinessIndex(index)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        currentBusinessIndex === index
                          ? 'bg-white w-6'
                          : 'bg-white/50 w-1.5 hover:bg-white/75'
                      }`}
                      aria-label={`Go to vehicle ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="p-6">
                <span className="inline-block bg-amber-500 text-white px-4 py-2 rounded-full font-semibold text-sm mb-4">
                  SMARTCABB BUSINESS
                </span>
                <h3 className="text-2xl font-bold mb-2">👑 SmartCabb Business</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {t(
                    'Service VIP 4 places avec rafraîchissement et Data gratuit. Le summum du luxe.',
                    'VIP 4-seater service with refreshments and free Data. The ultimate luxury.'
                  )}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  {t(
                    'Véhicules: Prado, Fortuner',
                    'Vehicles: Prado, Fortuner'
                  )}
                </p>
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-amber-500">👥</span>
                    <span>4 {t('places', 'seats')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-amber-500">🥤</span>
                    <span>{t('Rafraîchissement', 'Refreshments')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-amber-500">📶</span>
                    <span>Data {t('gratuit', 'free')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-amber-500">🔒</span>
                    <span>{t('Sécurisé', 'Secure')}</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('Location journalière', 'Daily rental')}</span>
                    <span className="font-semibold">160$ / {formatCDF(160)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('Aéroport A/R', 'Airport RT')}</span>
                    <span className="font-semibold">200$ / {formatCDF(200)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('Heures extra (après 21h)', 'Extra hours (after 9pm)')}</span>
                    <span className="font-semibold">30$ / {formatCDF(30)}</span>
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                  <p className="text-xs text-amber-800">
                    ⚠️ {t('Location journalière et trajet aéroport uniquement', 'Daily rental and airport transfer only')}
                  </p>
                </div>
                <Link to="/app/passenger" className="block w-full bg-amber-500 text-white py-3 rounded-xl font-semibold text-center hover:bg-amber-600 transition-colors">
                  {t('Demander maintenant', 'Request now')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold mb-4">
              {t('Comparaison des services', 'Service Comparison')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('Trouvez le service qui correspond le mieux à vos besoins', 'Find the service that best suits your needs')}
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full bg-white shadow-lg rounded-2xl overflow-hidden">
              <thead className="bg-cyan-500 text-white">
                <tr>
                  <th className="py-4 px-6 text-left font-semibold">{t('Caractéristique', 'Feature')}</th>
                  <th className="py-4 px-6 text-left font-semibold">SmartCabb Standard</th>
                  <th className="py-4 px-6 text-left font-semibold">SmartCabb Confort</th>
                  <th className="py-4 px-6 text-left font-semibold">SmartCabb Familia</th>
                  <th className="py-4 px-6 text-left font-semibold">SmartCabb Business</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-4 px-6 font-bold">{t('Nombre de places', 'Number of seats')}</td>
                  <td className="py-4 px-6">3 {t('places', 'seats')}</td>
                  <td className="py-4 px-6">3 {t('places', 'seats')}</td>
                  <td className="py-4 px-6">7 {t('places', 'seats')}</td>
                  <td className="py-4 px-6">4 {t('places', 'seats')}</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-4 px-6 font-bold">{t('Véhicules', 'Vehicles')}</td>
                  <td className="py-4 px-6 text-sm">Toyota IST, Suzuki Swift, Vitz, Blade</td>
                  <td className="py-4 px-6 text-sm">Toyota Marx, Crown, Mercedes C-Class</td>
                  <td className="py-4 px-6 text-sm">Noah, Alphard, Voxy</td>
                  <td className="py-4 px-6 text-sm">Prado, Fortuner</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-4 px-6 font-bold">{t('Climatisation', 'Air conditioning')}</td>
                  <td className="py-4 px-6"><span className="text-cyan-500 text-xl font-bold">✓</span></td>
                  <td className="py-4 px-6"><span className="text-cyan-500 text-xl font-bold">✓</span></td>
                  <td className="py-4 px-6"><span className="text-cyan-500 text-xl font-bold">✓</span></td>
                  <td className="py-4 px-6"><span className="text-cyan-500 text-xl font-bold">✓</span></td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-4 px-6 font-bold">{t('Prix jour (06h-20h)', 'Day price (06h-20h)')}</td>
                  <td className="py-4 px-6">7$ / {formatCDF(7)}</td>
                  <td className="py-4 px-6">15$ / {formatCDF(15)}</td>
                  <td className="py-4 px-6">15$ / {formatCDF(15)}</td>
                  <td className="py-4 px-6">-</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-4 px-6 font-bold">{t('Prix nuit (21h-05h)', 'Night price (21h-05h)')}</td>
                  <td className="py-4 px-6">10$ / {formatCDF(10)}</td>
                  <td className="py-4 px-6">17$ / {formatCDF(17)}</td>
                  <td className="py-4 px-6">20$ / {formatCDF(20)}</td>
                  <td className="py-4 px-6">-</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-4 px-6 font-bold">{t('Location journalière', 'Daily rental')}</td>
                  <td className="py-4 px-6">60$ / {formatCDF(60)}</td>
                  <td className="py-4 px-6">80$ / {formatCDF(80)}</td>
                  <td className="py-4 px-6">100$ / {formatCDF(100)}</td>
                  <td className="py-4 px-6">160$ / {formatCDF(160)}</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-4 px-6 font-bold">{t('Aéroport Aller-Retour', 'Airport Round Trip')}</td>
                  <td className="py-4 px-6">70$ / {formatCDF(70)}</td>
                  <td className="py-4 px-6">90$ / {formatCDF(90)}</td>
                  <td className="py-4 px-6">110$ / {formatCDF(110)}</td>
                  <td className="py-4 px-6">200$ / {formatCDF(200)}</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-4 px-6 font-bold">{t('Connexion Data gratuit', 'Free Data connection')}</td>
                  <td className="py-4 px-6">-</td>
                  <td className="py-4 px-6"><span className="text-cyan-500 text-xl font-bold">✓</span></td>
                  <td className="py-4 px-6"><span className="text-cyan-500 text-xl font-bold">✓</span></td>
                  <td className="py-4 px-6"><span className="text-cyan-500 text-xl font-bold">✓</span></td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-4 px-6 font-bold">{t('Rafraîchissement', 'Refreshments')}</td>
                  <td className="py-4 px-6">-</td>
                  <td className="py-4 px-6">-</td>
                  <td className="py-4 px-6">-</td>
                  <td className="py-4 px-6"><span className="text-cyan-500 text-xl font-bold">✓</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold mb-4">
              {t('Témoignages', 'Testimonials')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('Ce que nos clients disent de nous', 'What our clients say about us')}
            </p>
          </div>
          
          <TestimonialsCarousel 
            testimonials={language === 'fr' ? [
              {
                id: 1,
                name: 'Marie-Claire Kabamba',
                role: 'Cliente régulière',
                location: 'Gombe, Kinshasa',
                rating: 5,
                text: 'J\'utilise SmartCabb tous les jours pour aller au bureau. Les chauffeurs sont toujours ponctuels, respectueux et les voitures sont propres. Je me sens en sécurité et le prix est très raisonnable comparé aux autres options.',
                avatar: 'MK',
                highlight: 'Service ponctuel et fiable chaque jour depuis 6 mois'
              },
              {
                id: 2,
                name: 'Patrick Lumumba',
                role: 'Entrepreneur',
                location: 'Ngaliema, Kinshasa',
                rating: 5,
                text: 'En tant qu\'entrepreneur, j\'ai besoin de me déplacer rapidement et de façon professionnelle. SmartCabb Plus est parfait pour mes déplacements avec mes associés. Le service est digne d\'une grande capitale.',
                avatar: 'PL',
                highlight: 'Application simple, véhicules confortables, chauffeurs professionnels'
              },
              {
                id: 3,
                name: 'Sylvie Mbuyi',
                role: 'Mother',
                location: 'Limete, Kinshasa',
                rating: 5,
                text: 'With my three children, the 7-seater SmartCabb Plus is ideal. I used the service to go to the airport last month - impeccable! The driver even helped with the luggage.',
                avatar: 'SM',
                highlight: 'Perfect for families - space, comfort and safety'
              },
              {
                id: 4,
                name: 'Christian Ngoy',
                role: 'Cadre d\'entreprise',
                location: 'Kintambo, Kinshasa',
                rating: 5,
                text: 'Le SmartCabb Business est mon choix pour les réunions importantes. Climatisation excellente, eau fraîche fournie, et Data gratuit pour travailler en route. C\'est comme avoir mon bureau mobile.',
                avatar: 'CN',
                highlight: '5 étoiles pour le professionnalisme et le confort premium'
              },
              {
                id: 5,
                name: 'Josephine Tshilombo',
                role: 'Étudiante',
                location: 'Lemba, Kinshasa',
                rating: 5,
                text: 'Le SmartCabb Standard est parfait pour mon budget d\'étudiante. Les tarifs sont clairs, pas de surprise. J\'adore la fonctionnalité de suivi en temps réel qui rassure mes parents.',
                avatar: 'JT',
                highlight: 'Tarifs abordables et transparents pour les étudiants'
              },
              {
                id: 6,
                name: 'Robert Mwamba',
                role: 'Voyageur fréquent',
                location: 'Masina, Kinshasa',
                rating: 5,
                text: 'Je voyage beaucoup et j\'ai testé plusieurs services. SmartCabb se démarque par sa fiabilité. L\'application est intuitive, le paiement mobile fonctionne parfaitement, et je reçois toujours une facture.',
                avatar: 'RM',
                highlight: 'Le meilleur service de transport à Kinshasa sans hésitation'
              }
            ] : [
              {
                id: 1,
                name: 'Marie-Claire Kabamba',
                role: 'Regular customer',
                location: 'Gombe, Kinshasa',
                rating: 5,
                text: 'I use SmartCabb every day to go to the office. The drivers are always punctual, respectful and the cars are clean. I feel safe and the price is very reasonable compared to other options.',
                avatar: 'MK',
                highlight: 'Punctual and reliable service every day for 6 months'
              },
              {
                id: 2,
                name: 'Patrick Lumumba',
                role: 'Entrepreneur',
                location: 'Ngaliema, Kinshasa',
                rating: 5,
                text: 'As an entrepreneur, I need to move quickly and professionally. SmartCabb Plus is perfect for my trips with my partners. The service is worthy of a major capital.',
                avatar: 'PL',
                highlight: 'Simple app, comfortable vehicles, professional drivers'
              },
              {
                id: 3,
                name: 'Sylvie Mbuyi',
                role: 'Mother',
                location: 'Limete, Kinshasa',
                rating: 5,
                text: 'With my three children, the 7-seater SmartCabb Plus is ideal. I used the service to go to the airport last month - impeccable! The driver even helped with the luggage.',
                avatar: 'SM',
                highlight: 'Perfect for families - space, comfort and safety'
              },
              {
                id: 4,
                name: 'Christian Ngoy',
                role: 'Corporate executive',
                location: 'Kintambo, Kinshasa',
                rating: 5,
                text: 'SmartCabb Business is my choice for important meetings. Excellent air conditioning, fresh water provided, and free Data to work on the go. It\'s like having my mobile office.',
                avatar: 'CN',
                highlight: '5 stars for professionalism and premium comfort'
              },
              {
                id: 5,
                name: 'Josephine Tshilombo',
                role: 'Student',
                location: 'Lemba, Kinshasa',
                rating: 5,
                text: 'SmartCabb Standard is perfect for my student budget. The rates are clear, no surprises. I love the real-time tracking feature that reassures my parents.',
                avatar: 'JT',
                highlight: 'Affordable and transparent rates for students'
              },
              {
                id: 6,
                name: 'Robert Mwamba',
                role: 'Frequent traveler',
                location: 'Masina, Kinshasa',
                rating: 5,
                text: 'I travel a lot and I\'ve tested several services. SmartCabb stands out for its reliability. The app is intuitive, mobile payment works perfectly, and I always receive an invoice.',
                avatar: 'RM',
                highlight: 'The best transport service in Kinshasa without hesitation'
              }
            ]}
            autoPlayInterval={6000}
            theme="green"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Logo & Description */}
            <div className="col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center text-white font-bold text-base">
                  SC
                </div>
                <span className="text-xl font-bold">
                  SMART<span className="text-cyan-500">CABB</span>
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                {t(
                  'Votre solution de transport moderne et sécurisée en République Démocratique du Congo.',
                  'Your modern and secure transport solution in the Democratic Republic of Congo.'
                )}
              </p>
            </div>

            {/* Services */}
            <div>
              <h3 className="font-bold mb-4 text-cyan-500">{t('Services', 'Services')}</h3>
              <div className="space-y-2">
                <Link to="/services" className="block text-gray-400 hover:text-cyan-500 transition-colors text-sm">SmartCabb Standard</Link>
                <Link to="/services" className="block text-gray-400 hover:text-cyan-500 transition-colors text-sm">SmartCabb Confort</Link>
                <Link to="/services" className="block text-gray-400 hover:text-cyan-500 transition-colors text-sm">SmartCabb Plus</Link>
                <Link to="/services" className="block text-gray-400 hover:text-cyan-500 transition-colors text-sm">SmartCabb Business</Link>
              </div>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-bold mb-4 text-cyan-500">{t('Entreprise', 'Company')}</h3>
              <div className="space-y-2">
                <Link to="/about" className="block text-gray-400 hover:text-cyan-500 transition-colors text-sm">{t('À propos', 'About')}</Link>
                <Link to="/drivers" className="block text-gray-400 hover:text-cyan-500 transition-colors text-sm">{t('Devenir chauffeur', 'Become a driver')}</Link>
                <Link to="/contact" className="block text-gray-400 hover:text-cyan-500 transition-colors text-sm">Contact</Link>
              </div>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-bold mb-4 text-cyan-500">Support</h3>
              <div className="space-y-2">
                <Link to="/contact" className="block text-gray-400 hover:text-cyan-500 transition-colors text-sm">{t("Centre d'aide", 'Help Center')}</Link>
                <Link to="/terms" className="block text-gray-400 hover:text-cyan-500 transition-colors text-sm">{t('CGU', 'Terms')}</Link>
                <Link to="/privacy" className="block text-gray-400 hover:text-cyan-500 transition-colors text-sm">{t('Confidentialité', 'Privacy')}</Link>
                <Link to="/legal" className="block text-gray-400 hover:text-cyan-500 transition-colors text-sm">{t('Mentions légales', 'Legal Notice')}</Link>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-500 text-sm">
              {t('© 2025 SmartCabb. Tous droits réservés.', '© 2025 SmartCabb. All rights reserved.')}
            </p>
          </div>
        </div>
      </footer>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}