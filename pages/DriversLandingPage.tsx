import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ChatWidget } from '../components/ChatWidget';
import { TestimonialsCarousel } from '../components/TestimonialsCarousel';

export function DriversLandingPage() {
  const [language, setLanguage] = useState('fr');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  // Récupérer la langue depuis localStorage au chargement
  useEffect(() => {
    const savedLang = localStorage.getItem('smartcabb_lang') || 'fr';
    setLanguage(savedLang);
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

      {/* Navigation - MÊME DESIGN QUE LANDING PAGE */}
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
              <Link to="/services" className="font-medium text-gray-700 hover:text-cyan-500 transition-colors">
                Services
              </Link>
              <Link to="/drivers" className="font-medium text-cyan-500 transition-colors">
                {language === 'fr' ? 'Chauffeurs' : 'Drivers'}
              </Link>
              <Link to="/contact" className="font-medium text-gray-700 hover:text-cyan-500 transition-colors">
                Contact
              </Link>
              <Link to="/about" className="font-medium text-gray-700 hover:text-cyan-500 transition-colors">
                {language === 'fr' ? 'À Propos' : 'About'}
              </Link>
              
              <Link 
                to="/driver"
                className="border-2 border-cyan-500 text-cyan-500 px-6 py-2 rounded-full font-semibold hover:bg-cyan-500 hover:text-white transition-all"
              >
                {language === 'fr' ? 'Se connecter' : 'Login'}
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

      {/* Hero Section - Design conforme */}
      <section 
        className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #00BFA5 0%, #00A890 100%)'
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-white">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
              {t('Rejoignez la famille SMARTCABB', 'Join the SMARTCABB family')}
            </h1>
            <p className="text-2xl md:text-3xl font-bold text-yellow-300 mb-4">
              💰 {t('Gagnez jusqu\'à 1500$ par mois', 'Earn up to $1500 per month')}
            </p>
            <p className="text-lg md:text-xl mb-8 opacity-90 max-w-3xl mx-auto">
              {t('Conduisez quand vous voulez avec des gains transparents et fiables', 'Drive when you want with transparent and reliable earnings')}
            </p>
            <Link 
              to="/driver"
              className="inline-block bg-white text-cyan-500 px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all"
            >
              {t('S\'inscrire maintenant', 'Sign up now')}
            </Link>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2"></div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
              {t('Pourquoi conduire avec nous ?', 'Why drive with us?')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('Découvrez les avantages d\'être chauffeur SmartCabb à Kinshasa', 'Discover the benefits of being a SmartCabb driver in Kinshasa')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Benefit 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-2 border-transparent hover:border-cyan-500">
              <div className="text-6xl mb-4">💰</div>
              <h3 className="text-xl font-bold mb-3">
                {t('Excellent revenu', 'Excellent income')}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t(
                  'Gagnez jusqu\'à 1500$ par mois avec une rémunération transparente et des bonus réguliers.',
                  'Earn up to $1500 per month with transparent compensation and regular bonuses.'
                )}
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-2 border-transparent hover:border-cyan-500">
              <div className="text-6xl mb-4">📱</div>
              <h3 className="text-xl font-bold mb-3">
                {t('Flexibilité totale', 'Total flexibility')}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t(
                  'Gérez votre emploi du temps librement. Travaillez à temps plein ou partiel selon vos besoins.',
                  'Manage your schedule freely. Work full-time or part-time according to your needs.'
                )}
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-2 border-transparent hover:border-cyan-500">
              <div className="text-6xl mb-4">🛡️</div>
              <h3 className="text-xl font-bold mb-3">
                {t('Support 24/7', '24/7 Support')}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t(
                  'Assistance technique et support client disponibles 24h/24 pour vous accompagner.',
                  'Technical assistance and customer support available 24/7 to help you.'
                )}
              </p>
            </div>

            {/* Benefit 4 */}
            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-2 border-transparent hover:border-cyan-500">
              <div className="text-6xl mb-4">⭐</div>
              <h3 className="text-xl font-bold mb-3">
                {t('Bonus et récompenses', 'Bonuses and rewards')}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t(
                  'Profitez de bonus hebdomadaires et mensuels basés sur vos performances et évaluations.',
                  'Enjoy weekly and monthly bonuses based on your performance and ratings.'
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
              {t('Nos conditions', 'Our requirements')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('Ce dont vous avez besoin pour commencer', 'What you need to get started')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Requirement 1 */}
            <div className="bg-gray-50 p-8 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-bold mb-3">
                {t('Permis de conduire valide', 'Valid driver\'s license')}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t(
                  'Permis de conduire valide en République Démocratique du Congo depuis au moins 2 ans.',
                  'Valid driver\'s license in the Democratic Republic of Congo for at least 2 years.'
                )}
              </p>
            </div>

            {/* Requirement 2 */}
            <div className="bg-gray-50 p-8 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="text-6xl mb-4">🚗</div>
              <h3 className="text-xl font-bold mb-3">
                {t('Véhicule OU Tout Bleu', 'Vehicle OR Tout Bleu')}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t(
                  'Véhicule propre et en bon état OU carte bleue (nous pouvons vous fournir un véhicule).',
                  'Clean vehicle in good condition OR blue card (we can provide you with a vehicle).'
                )}
              </p>
            </div>

            {/* Requirement 3 */}
            <div className="bg-gray-50 p-8 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-bold mb-3">
                {t('Pièce d\'identité', 'ID document')}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t(
                  'Carte d\'électeur, passeport ou autre document officiel d\'identification valide requis.',
                  'Voter card, passport or other valid official identification document required.'
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
              {t('Témoignages de chauffeurs', 'Driver testimonials')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('Ce que nos chauffeurs disent de leur expérience avec SmartCabb', 'What our drivers say about their experience with SmartCabb')}
            </p>
          </div>
          
          <TestimonialsCarousel 
            testimonials={language === 'fr' ? [
              {
                id: 1,
                name: 'Jean-Pierre Mukendi',
                role: 'Chauffeur SmartCabb depuis 2 ans',
                location: 'Gombe, Kinshasa',
                rating: 5,
                text: 'Avant SmartCabb, je conduisais un taxi ordinaire et gagnais à peine 200$ par mois. Aujourd\'hui, je fais facilement 650$ mensuellement ! L\'application est simple, les clients sont respectueux, et je gère mon temps comme je veux.',
                avatar: 'JP',
                highlight: 'Mon revenu a triplé depuis que j\'ai rejoint SmartCabb'
              },
              {
                id: 2,
                name: 'Josué Nzuzi',
                role: 'Chauffeur à temps partiel',
                location: 'Lemba, Kinshasa',
                rating: 5,
                text: 'J\'ai un emploi le matin, et je conduis pour SmartCabb l\'après-midi. En 4-5 heures de travail, je gagne entre 25$ et 40$ par jour. C\'est parfait pour compléter mon salaire et subvenir aux besoins de ma famille.',
                avatar: 'JN',
                highlight: '350$ de revenus supplémentaires chaque mois en travaillant à temps partiel'
              },
              {
                id: 3,
                name: 'Patrice Mbala',
                role: 'Chauffeur SmartCabb depuis 6 mois',
                location: 'Ngaliema, Kinshasa',
                rating: 5,
                text: 'Je n\'avais pas de véhicule au départ, juste mon "tout bleu". SmartCabb m\'a fourni une voiture et maintenant je travaille avec dignité. Les paiements sont toujours à temps et le support est disponible 24h/24.',
                avatar: 'PM',
                highlight: 'Ils m\'ont fourni un véhicule pour démarrer - opportunité incroyable !'
              },
              {
                id: 4,
                name: 'Emmanuel Kalala',
                role: 'Chauffeur SmartCabb depuis 1 an',
                location: 'Masina, Kinshasa',
                rating: 5,
                text: 'Ce qui me plaît le plus, c\'est la transparence. Je vois exactement combien je gagne sur chaque course. Les bonus hebdomadaires motivent vraiment. La semaine dernière, j\'ai reçu 50$ de bonus en plus de mes courses !',
                avatar: 'EK',
                highlight: 'Bonus de 200$ le mois dernier grâce à mes excellentes notes'
              },
              {
                id: 5,
                name: 'Daniel Tshikala',
                role: 'Chauffeur SmartCabb depuis 3 ans',
                location: 'Kintambo, Kinshasa',
                rating: 5,
                text: 'SmartCabb a changé ma vie. J\'ai pu inscrire mes enfants dans une bonne école et même acheter un terrain. Le respect des chauffeurs et la sécurité sont garantis. Je recommande à tous mes amis !',
                avatar: 'DT',
                highlight: 'J\'ai économisé assez pour acheter mon propre terrain en 2 ans'
              },
              {
                id: 6,
                name: 'François Kasongo',
                role: 'Chauffeur depuis 8 mois',
                location: 'Limete, Kinshasa',
                rating: 5,
                text: 'L\'assurance et le support technique sont exceptionnels. Quand j\'ai eu un problème avec ma voiture, SmartCabb m\'a aidé avec les réparations. C\'est rare de voir une entreprise qui prend soin de ses chauffeurs.',
                avatar: 'FK',
                highlight: 'Support technique et assistance médicale inclus - un vrai plus !'
              }
            ] : [
              {
                id: 1,
                name: 'Jean-Pierre Mukendi',
                role: 'SmartCabb Driver for 2 years',
                location: 'Gombe, Kinshasa',
                rating: 5,
                text: 'Before SmartCabb, I drove a regular taxi and barely earned $200 a month. Today, I easily make $650 monthly! The app is simple, customers are respectful, and I manage my time as I want.',
                avatar: 'JP',
                highlight: 'My income tripled since joining SmartCabb'
              },
              {
                id: 2,
                name: 'Josué Nzuzi',
                role: 'Part-time driver',
                location: 'Lemba, Kinshasa',
                rating: 5,
                text: 'I have a job in the morning, and I drive for SmartCabb in the afternoon. In 4-5 hours of work, I earn between $25 and $40 per day. It\'s perfect to supplement my salary and support my family.',
                avatar: 'JN',
                highlight: '$350 extra income each month working part-time'
              },
              {
                id: 3,
                name: 'Patrice Mbala',
                role: 'SmartCabb Driver for 6 months',
                location: 'Ngaliema, Kinshasa',
                rating: 5,
                text: 'I didn\'t have a vehicle at first, just my "tout bleu". SmartCabb provided me with a car and now I work with dignity. Payments are always on time and support is available 24/7.',
                avatar: 'PM',
                highlight: 'They provided me with a vehicle to start - incredible opportunity!'
              },
              {
                id: 4,
                name: 'Emmanuel Kalala',
                role: 'SmartCabb Driver for 1 year',
                location: 'Masina, Kinshasa',
                rating: 5,
                text: 'What I like most is the transparency. I see exactly how much I earn on each trip. The weekly bonuses really motivate. Last week, I received $50 bonus on top of my trips!',
                avatar: 'EK',
                highlight: '$200 bonus last month thanks to my excellent ratings'
              },
              {
                id: 5,
                name: 'Daniel Tshikala',
                role: 'SmartCabb Driver for 3 years',
                location: 'Kintambo, Kinshasa',
                rating: 5,
                text: 'SmartCabb changed my life. I was able to enroll my children in a good school and even buy land. Driver respect and safety are guaranteed. I recommend to all my friends!',
                avatar: 'DT',
                highlight: 'I saved enough to buy my own land in 2 years'
              },
              {
                id: 6,
                name: 'François Kasongo',
                role: 'Driver for 8 months',
                location: 'Limete, Kinshasa',
                rating: 5,
                text: 'Insurance and technical support are exceptional. When I had a problem with my car, SmartCabb helped me with repairs. It\'s rare to see a company that takes care of its drivers.',
                avatar: 'FK',
                highlight: 'Technical support and medical assistance included - a real plus!'
              }
            ]}
            autoPlayInterval={6000}
            theme="blue"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            {t('Prêt à commencer ?', 'Ready to start?')}
          </h2>
          <p className="text-xl mb-8 opacity-90">
            {t('Inscrivez-vous dès maintenant et commencez à gagner avec SmartCabb', 'Sign up now and start earning with SmartCabb')}
          </p>
          <Link 
            to="/driver"
            className="inline-block bg-white text-cyan-500 px-10 py-4 rounded-full font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all"
          >
            {t('S\'inscrire comme Chauffeur', 'Sign up as Driver')}
          </Link>
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
                <Link to="/services" className="block text-gray-400 hover:text-cyan-500 transition-colors text-sm">Smart Flex</Link>
                <Link to="/services" className="block text-gray-400 hover:text-cyan-500 transition-colors text-sm">Smart Confort</Link>
                <Link to="/services" className="block text-gray-400 hover:text-cyan-500 transition-colors text-sm">Smart Plus</Link>
                <Link to="/services" className="block text-gray-400 hover:text-cyan-500 transition-colors text-sm">Smart Familial</Link>
                <Link to="/services" className="block text-gray-400 hover:text-cyan-500 transition-colors text-sm">Smart VIP</Link>
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