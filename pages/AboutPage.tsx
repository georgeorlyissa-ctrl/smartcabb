import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { ChatWidget } from '../components/ChatWidget';

export function AboutPage() {
  const [language, setLanguage] = useState('fr');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  const values = [
    {
      icon: '⚡',
      title: { fr: 'Innovation', en: 'Innovation' },
      description: {
        fr: 'Nous utilisons les dernières technologies pour offrir une expérience de transport fluide et moderne, avec géolocalisation en temps réel et paiements sécurisés.',
        en: 'We use the latest technologies to provide a smooth and modern transport experience, with real-time geolocation and secure payments.'
      }
    },
    {
      icon: '🛡️',
      title: { fr: 'Fiabilité', en: 'Reliability' },
      description: {
        fr: 'Chauffeurs vérifiés et formés, véhicules contrôlés régulièrement, assistance 24/7. Votre sécurité et votre satisfaction sont nos priorités absolues.',
        en: 'Verified and trained drivers, regularly inspected vehicles, 24/7 support. Your safety and satisfaction are our absolute priorities.'
      }
    },
    {
      icon: '⭐',
      title: { fr: 'Satisfaction', en: 'Satisfaction' },
      description: {
        fr: 'Service client réactif, tarifs transparents, système de notation équitable. Nous nous engageons à dépasser vos attentes à chaque trajet.',
        en: 'Responsive customer service, transparent pricing, fair rating system. We are committed to exceeding your expectations on every trip.'
      }
    }
  ];

  const stats = [
    {
      number: '10,000+',
      label: { fr: 'Passagers inscrits', en: 'Registered passengers' }
    },
    {
      number: '500+',
      label: { fr: 'Chauffeurs', en: 'Drivers' }
    },
    {
      number: '5,000+',
      label: { fr: 'Courses complétées', en: 'Completed rides' }
    },
    {
      number: '24/7',
      label: { fr: 'Support', en: 'Support' }
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        
        body {
          font-family: 'Poppins', sans-serif;
        }

        .value-card {
          transition: all 0.3s ease;
        }

        .value-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
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
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center text-white font-bold text-base">
                SC
              </div>
              <span className="text-xl font-bold">
                SMART<span className="text-cyan-500">CABB</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="font-medium text-gray-700 hover:text-cyan-500 transition-colors">
                {language === 'fr' ? 'Accueil' : 'Home'}
              </Link>
              <Link to="/services" className="font-medium text-gray-700 hover:text-cyan-500 transition-colors">
                Services
              </Link>
              <Link to="/drivers" className="font-medium text-gray-700 hover:text-cyan-500 transition-colors">
                {language === 'fr' ? 'Chauffeurs' : 'Drivers'}
              </Link>
              <Link to="/contact" className="font-medium text-gray-700 hover:text-cyan-500 transition-colors">
                Contact
              </Link>
              <Link to="/about" className="font-medium text-cyan-500">
                {language === 'fr' ? 'À Propos' : 'About'}
              </Link>
              
              <Link to="/app">
                <button className="border-2 border-cyan-500 text-cyan-500 px-6 py-2 rounded-full font-semibold hover:bg-cyan-500 hover:text-white transition-all">
                  {language === 'fr' ? 'Connexion' : 'Login'}
                </button>
              </Link>

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
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl font-extrabold mb-6"
          >
            {language === 'fr' ? 'À propos de nous' : 'About us'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl md:text-2xl text-white/90"
          >
            {language === 'fr' 
              ? 'Notre mission : Transformer la mobilité à Kinshasa.'
              : 'Our mission: Transform mobility in Kinshasa.'
            }
          </motion.p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-6">
                {language === 'fr' ? 'Notre mission : Transformer la mobilité à Kinshasa.' : 'Our mission: Transform mobility in Kinshasa.'}
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  {language === 'fr' 
                    ? 'Nous sommes une entreprise congolaise passionnée par la technologie et la mobilité urbaine. Face aux défis de transport à Kinshasa, nous avons créé SMART CAB pour offrir une alternative moderne, sûre et accessible. Notre mission est de connecter les passagers et les chauffeurs de manière efficace, contribuant ainsi à l\'essor économique et social de notre ville. Nous sommes fiers de bâtir une plateforme qui non seulement facilite la vie de nos utilisateurs, mais crée également des opportunités d\'emploi pour nos chauffeurs partenaires.'
                    : 'We are a Congolese company passionate about technology and urban mobility. Facing transportation challenges in Kinshasa, we created SMART CAB to offer a modern, safe and accessible alternative. Our mission is to connect passengers and drivers efficiently, contributing to the economic and social development of our city. We are proud to build a platform that not only makes life easier for our users, but also creates employment opportunities for our partner drivers.'
                  }
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img 
                src="https://images.unsplash.com/photo-1675140267995-8096bdf130d5?w=800" 
                alt="Kinshasa"
                className="rounded-2xl shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              {language === 'fr' ? 'Nos valeurs' : 'Our values'}
            </h2>
            <p className="text-xl text-gray-600">
              {language === 'fr' ? 'Ce qui nous anime au quotidien' : 'What drives us every day'}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="value-card bg-white p-8 rounded-2xl text-center shadow-lg"
              >
                <div className="text-6xl mb-4">{value.icon}</div>
                <h3 className="text-2xl font-bold mb-4">{value.title[language as 'fr' | 'en']}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description[language as 'fr' | 'en']}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {language === 'fr' ? 'SMARTCABB en chiffres' : 'SMARTCABB in numbers'}
            </h2>
            <p className="text-xl text-white/90">
              {language === 'fr' 
                ? 'Notre impact sur la mobilité urbaine à Kinshasa'
                : 'Our impact on urban mobility in Kinshasa'
              }
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="text-5xl md:text-6xl font-extrabold text-yellow-300 mb-3">
                  {stat.number}
                </div>
                <div className="text-lg text-white/90">
                  {stat.label[language as 'fr' | 'en']}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center text-white font-bold">
                  SC
                </div>
                <span className="text-xl font-bold">SMARTCABB</span>
              </div>
              <p className="text-gray-400 text-sm">
                {language === 'fr' 
                  ? 'Votre solution de transport moderne et sécurisée en République Démocratique du Congo.'
                  : 'Your modern and secure transport solution in the Democratic Republic of Congo.'
                }
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-4">Services</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/services" className="hover:text-cyan-500 transition">Smart Flex</Link></li>
                <li><Link to="/services" className="hover:text-cyan-500 transition">Smart Confort</Link></li>
                <li><Link to="/services" className="hover:text-cyan-500 transition">Smart Plus</Link></li>
                <li><Link to="/services" className="hover:text-cyan-500 transition">Smart Familial</Link></li>
                <li><Link to="/services" className="hover:text-cyan-500 transition">Smart VIP</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">{language === 'fr' ? 'Entreprise' : 'Company'}</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/about" className="hover:text-cyan-500 transition">{language === 'fr' ? 'À propos' : 'About'}</Link></li>
                <li><Link to="/drivers" className="hover:text-cyan-500 transition">{language === 'fr' ? 'Devenir chauffeur' : 'Become a driver'}</Link></li>
                <li><Link to="/contact" className="hover:text-cyan-500 transition">Contact</Link></li>
                <li><Link to="/" className="hover:text-cyan-500 transition">{language === 'fr' ? 'Accueil' : 'Home'}</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/contact" className="hover:text-cyan-500 transition">{language === 'fr' ? 'Centre d\'aide' : 'Help center'}</Link></li>
                <li><Link to="/contact" className="hover:text-cyan-500 transition">Contact</Link></li>
                <li><Link to="/terms" className="hover:text-cyan-500 transition">CGU</Link></li>
                <li><Link to="/privacy" className="hover:text-cyan-500 transition">{language === 'fr' ? 'Confidentialité' : 'Privacy'}</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 SmartCabb. {language === 'fr' ? 'Tous droits réservés.' : 'All rights reserved.'}</p>
          </div>
        </div>
      </footer>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}