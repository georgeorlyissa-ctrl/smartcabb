import { Link } from '../lib/simple-router';
import { useState, useEffect } from 'react';
import { ChatWidget } from '../components/ChatWidget';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function DriversLandingPage() {
  const [language, setLanguage] = useState('fr');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [currentVehicleIndex, setCurrentVehicleIndex] = useState(0);

  const vehicles = [
    {
      src: '/vehicules/economique/Economique_1.png',
      fallbackSrc: 'https://images.unsplash.com/photo-1648197323414-4255ea82d86b?w=600',
      alt: 'SmartCabb Go - Économique',
      badge: 'SmartCabb Go'
    },
    {
      src: '/vehicules/confort/Confort_1.png',
      fallbackSrc: 'https://images.unsplash.com/photo-1757782630151-8012288407e1?w=600',
      alt: 'SmartCabb Confort',
      badge: 'SmartCabb Confort'
    },
    {
      src: '/vehicules/premium/Premium_1.png',
      fallbackSrc: 'https://images.unsplash.com/photo-1692970060626-8e96d7ee70d2?w=600',
      alt: 'SmartCabb Premium',
      badge: 'SmartCabb Premium'
    },
    {
      src: '/vehicules/famille/Familiale_1.png',
      fallbackSrc: 'https://images.unsplash.com/photo-1720545044233-d2ac77fa6030?w=600',
      alt: 'SmartCabb Familia',
      badge: 'SmartCabb Familia'
    }
  ];

  // Récupérer la langue depuis localStorage au chargement
  useEffect(() => {
    const savedLang = localStorage.getItem('smartcabb_lang') || 'fr';
    setLanguage(savedLang);
  }, []);

  // Carousel automatique des véhicules
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVehicleIndex((prevIndex) => (prevIndex + 1) % vehicles.length);
    }, 4000); // Change toutes les 4 secondes
    return () => clearInterval(interval);
  }, []);

  // Sauvegarder la langue dans localStorage quand elle change
  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('smartcabb_lang', lang);
    setShowLanguageDropdown(false);
  };

  const t = (fr: string, en: string) => language === 'fr' ? fr : en;

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

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white shadow-sm z-50">
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
                Accueil
              </Link>
              <Link to="/services" className="font-medium text-gray-700 hover:text-cyan-500 transition-colors">
                Services
              </Link>
              <Link to="/drivers" className="font-medium text-cyan-500 transition-colors">
                Chauffeurs
              </Link>
              <Link to="/contact" className="font-medium text-gray-700 hover:text-cyan-500 transition-colors">
                Contact
              </Link>
              <Link to="/about" className="font-medium text-gray-700 hover:text-cyan-500 transition-colors">
                À Propos
              </Link>
              
              <Link 
                to="/app/driver"
                className="border-2 border-cyan-500 text-cyan-500 px-6 py-2 rounded-full font-semibold hover:bg-cyan-500 hover:text-white transition-all"
              >
                Se connecter
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

      {/* Hero Section - Turquoise avec design de la capture */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-cyan-500 via-teal-500 to-cyan-600">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Rejoignez la famille SMARTCABB
          </h1>
          <p className="text-2xl md:text-3xl font-bold text-yellow-300 mb-3">
            💰 Gagnez jusqu'à 1500$ par mois
          </p>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Conduisez quand vous voulez, avec des gains transparents et fiables
          </p>
          <Link
            to="/app/driver"
            className="inline-block bg-white text-cyan-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-100 transition-all shadow-lg"
          >
            S&apos;inscrire maintenant
          </Link>
        </div>
      </section>

      {/* Section Flotte - Design de la capture */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Texte à gauche */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  SC
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    SMART<span className="text-cyan-500">CABB</span>
                  </div>
                  <div className="text-sm text-gray-500">Conduisez avec nous</div>
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-blue-900 mb-4">
                Une flotte moderne et diversifiée
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Rejoignez notre réseau de chauffeurs professionnels et conduisez des véhicules confortables et bien entretenus sur toute la Rép Dem Congo.
              </p>

              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2 text-cyan-600 font-semibold">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                  </svg>
                  <span>4 Catégories</span>
                </div>
                <div className="flex items-center gap-2 text-cyan-600 font-semibold">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                  </svg>
                  <span>Véhicules Récents</span>
                </div>
                <div className="flex items-center gap-2 text-cyan-600 font-semibold">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                  </svg>
                  <span>Entretien Inclus</span>
                </div>
              </div>
            </div>

            {/* Carousel de véhicules à droite */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl p-6 relative">
                {/* Badge Premium */}
                <div className="absolute top-4 right-4 z-10">
                  <span className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                    {vehicles[currentVehicleIndex].badge}
                  </span>
                </div>

                {/* Images avec transition */}
                <div className="relative h-80 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden">
                  {vehicles.map((vehicle, index) => (
                    <ImageWithFallback
                      key={index}
                      src={vehicle.src}
                      fallbackSrc={vehicle.fallbackSrc}
                      alt={vehicle.alt}
                      className="absolute inset-0 w-full h-full object-contain p-4 transition-all duration-1000 ease-in-out"
                      style={{
                        opacity: currentVehicleIndex === index ? 1 : 0,
                        transform: currentVehicleIndex === index ? 'scale(1)' : 'scale(0.9)',
                      }}
                    />
                  ))}
                </div>
                
                {/* Indicateurs de carousel */}
                <div className="flex justify-center gap-2 mt-6">
                  {vehicles.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentVehicleIndex(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        currentVehicleIndex === index
                          ? 'bg-cyan-500 w-8'
                          : 'bg-gray-300 w-2 hover:bg-gray-400'
                      }`}
                      aria-label={`Véhicule ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Pourquoi - Design de la capture */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-3">
              Pourquoi conduire avec nous ?
            </h2>
            <p className="text-gray-600 text-lg">
              Découvrez les avantages d&apos;être chauffeur SmartCabb en Rép Dem Congo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Carte 1 - Excellent revenu */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-cyan-500 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mb-4 text-3xl">
                💰
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">
                Excellent revenu
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Gagnez jusqu&apos;à 400$ par mois avec une commission comprise de 15 % sur chaque course et des bonus réguliers, une rémunération juste de 15.% pour maximiser vos gains.
              </p>
            </div>

            {/* Carte 2 - Flexibilité totale */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-cyan-500 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 text-3xl">
                📱
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">
                Flexibilité totale
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Gérez votre emploi du temps librement. Travaillez à temps plein ou partiel selon vos besoins.
              </p>
            </div>

            {/* Carte 3 - Support 24/7 */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-cyan-500 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mb-4 text-3xl">
                💡
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">
                Support 24/7
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Assistance technique et support client disponibles 24h/24 pour vous accompagner.
              </p>
            </div>

            {/* Carte 4 - Bonus et récompenses */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-cyan-500 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center mb-4 text-3xl">
                ⭐
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">
                Bonus et récompenses
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Profitez de bonus hebdomadaires et mensuels basés sur vos évaluations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Conditions - Design de la capture */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-3">
              Nos conditions
            </h2>
            <p className="text-gray-600 text-lg">
              Ce dont vous avez besoin pour commencer
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Condition 1 - Permis */}
            <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl">
                📋
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">
                Permis de conduire valide
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Permis de conduire valide en République Démocratique du Congo depuis au moins 2 ans.
              </p>
            </div>

            {/* Condition 2 - Véhicule */}
            <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl">
                🚗
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">
                Véhicule OU Taxi Bleu
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Véhicule propre et en bon état OU carte taxi bleu si vous n&apos;avez pas fourni un véhicule.
              </p>
            </div>

            {/* Condition 3 - Identité */}
            <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl">
                ✅
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">
                Pièce d&apos;identité
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Carte d&apos;identité, passeport ou autre document officiel d&apos;identification valide requis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-cyan-500 via-teal-500 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Prêt à commencer ?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Rejoignez SmartCabb aujourd&apos;hui et commencez à gagner dès demain
          </p>
          <Link
            to="/app/driver"
            className="inline-block bg-white text-cyan-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all shadow-xl hover:scale-105"
          >
            S&apos;inscrire maintenant
          </Link>
          <p className="mt-6 text-white/80 text-sm">
            Inscription gratuite • Aucun engagement • Commencez à conduire en 48h
          </p>
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
                Votre solution de transport moderne et sécurisée en République Démocratique du Congo.
              </p>
            </div>

            {/* Services */}
            <div>
              <h3 className="font-bold mb-4 text-cyan-500">Services</h3>
              <div className="space-y-2">
                <Link to="/services" className="block text-gray-400 hover:text-cyan-500 transition-colors text-sm">SmartCabb Standard</Link>
                <Link to="/services" className="block text-gray-400 hover:text-cyan-500 transition-colors text-sm">SmartCabb Confort</Link>
                <Link to="/services" className="block text-gray-400 hover:text-cyan-500 transition-colors text-sm">SmartCabb Plus</Link>
                <Link to="/services" className="block text-gray-400 hover:text-cyan-500 transition-colors text-sm">SmartCabb Business</Link>
              </div>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-bold mb-4 text-cyan-500">Entreprise</h3>
              <div className="space-y-2">
                <Link to="/about" className="block text-gray-400 hover:text-cyan-500 transition-colors text-sm">À propos</Link>
                <Link to="/drivers" className="block text-gray-400 hover:text-cyan-500 transition-colors text-sm">Devenir chauffeur</Link>
                <Link to="/contact" className="block text-gray-400 hover:text-cyan-500 transition-colors text-sm">Contact</Link>
              </div>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-bold mb-4 text-cyan-500">Support</h3>
              <div className="space-y-2">
                <Link to="/contact" className="block text-gray-400 hover:text-cyan-500 transition-colors text-sm">Centre d&apos;aide</Link>
                <Link to="/terms" className="block text-gray-400 hover:text-cyan-500 transition-colors text-sm">CGU</Link>
                <Link to="/privacy" className="block text-gray-400 hover:text-cyan-500 transition-colors text-sm">Confidentialité</Link>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-500 text-sm">
              © 2025 SmartCabb. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}