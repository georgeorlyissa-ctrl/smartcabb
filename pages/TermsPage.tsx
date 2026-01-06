import { motion } from 'motion/react';
import { Link } from '../lib/simple-router';
import { useState } from 'react';

export function TermsPage() {
  const [language, setLanguage] = useState('fr');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        
        body {
          font-family: 'Poppins', sans-serif;
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
              <Link to="/about" className="font-medium text-gray-700 hover:text-cyan-500 transition-colors">
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
            {language === 'fr' ? 'Conditions d\'utilisation' : 'Terms of Service'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-white/90"
          >
            {language === 'fr' 
              ? 'Dernière mise à jour : 8 novembre 2025'
              : 'Last updated: November 8, 2025'
            }
          </motion.p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            {language === 'fr' ? (
              <>
                <h2 className="mt-8">1. Acceptation des conditions</h2>
                <p>
                  En utilisant les services SmartCabb, vous acceptez d'être lié par les présentes conditions d'utilisation. 
                  Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services.
                </p>

                <h2 className="mt-8">2. Description du service</h2>
                <p>
                  SmartCabb est une plateforme de transport qui connecte les passagers avec des chauffeurs professionnels 
                  en République Démocratique du Congo. Nous proposons 4 catégories de véhicules : SmartCabb Standard, SmartCabb Confort, SmartCabb Plus et SmartCabb Business.
                </p>

                <h2 className="mt-8">3. Inscription et compte utilisateur</h2>
                <p>
                  Pour utiliser SmartCabb, vous devez créer un compte en fournissant des informations exactes et complètes. 
                  Vous êtes responsable de la confidentialité de votre mot de passe et de toutes les activités effectuées sous votre compte.
                </p>

                <h2 className="mt-8">4. Règles d'utilisation</h2>
                <p>En utilisant SmartCabb, vous vous engagez à :</p>
                <ul>
                  <li>Respecter les chauffeurs et les autres passagers</li>
                  <li>Ne pas causer de dommages aux véhicules</li>
                  <li>Payer les courses conformément aux tarifs affichés</li>
                  <li>Fournir des informations exactes lors de vos réservations</li>
                  <li>Respecter les lois et règlements en vigueur</li>
                </ul>

                <h2 className="mt-8">5. Tarification et paiement</h2>
                <p>
                  Les tarifs sont calculés selon notre grille tarifaire officielle avec des prix différents pour les horaires 
                  de jour (06h-20h59) et de nuit (21h-05h59). Les paiements se font en Franc Congolais (CDF).
                </p>

                <h2 className="mt-8">6. Annulation et remboursement</h2>
                <p>
                  Les passagers peuvent annuler une course sans frais jusqu'à 5 minutes après la confirmation. 
                  Au-delà, des frais d'annulation peuvent s'appliquer.
                </p>

                <h2 className="mt-8">7. Responsabilité</h2>
                <p>
                  SmartCabb agit en tant qu'intermédiaire entre les passagers et les chauffeurs. Nous ne sommes pas responsables 
                  des dommages indirects résultant de l'utilisation de nos services.
                </p>

                <h2 className="mt-8">8. Modification des conditions</h2>
                <p>
                  Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications entreront en vigueur 
                  dès leur publication sur notre plateforme.
                </p>

                <h2 className="mt-8">9. Contact</h2>
                <p>
                  Pour toute question concernant ces conditions, contactez-nous à :<br />
                  📞 +243 990 666 661<br />
                  ✉️ contact@smartcabb.com
                </p>
              </>
            ) : (
              <>
                <h2 className="mt-8">1. Acceptance of Terms</h2>
                <p>
                  By using SmartCabb services, you agree to be bound by these terms of use. 
                  If you do not accept these terms, please do not use our services.
                </p>

                <h2 className="mt-8">2. Service Description</h2>
                <p>
                  SmartCabb is a transportation platform that connects passengers with professional drivers 
                  in the Democratic Republic of Congo. We offer 4 vehicle categories: SmartCabb Standard, SmartCabb Confort, SmartCabb Plus and SmartCabb Business.
                </p>

                <h2 className="mt-8">3. Registration and User Account</h2>
                <p>
                  To use SmartCabb, you must create an account by providing accurate and complete information. 
                  You are responsible for maintaining the confidentiality of your password and all activities under your account.
                </p>

                <h2 className="mt-8">4. Usage Rules</h2>
                <p>By using SmartCabb, you agree to:</p>
                <ul>
                  <li>Respect drivers and other passengers</li>
                  <li>Not cause damage to vehicles</li>
                  <li>Pay for rides according to displayed rates</li>
                  <li>Provide accurate information when booking</li>
                  <li>Comply with applicable laws and regulations</li>
                </ul>

                <h2 className="mt-8">5. Pricing and Payment</h2>
                <p>
                  Rates are calculated according to our official pricing grid with different prices for 
                  day hours (06:00-20:59) and night hours (21:00-05:59). Payments are made in Congolese Franc (CDF).
                </p>

                <h2 className="mt-8">6. Cancellation and Refund</h2>
                <p>
                  Passengers can cancel a ride without fees up to 5 minutes after confirmation. 
                  Beyond that, cancellation fees may apply.
                </p>

                <h2 className="mt-8">7. Liability</h2>
                <p>
                  SmartCabb acts as an intermediary between passengers and drivers. We are not responsible 
                  for indirect damages resulting from the use of our services.
                </p>

                <h2 className="mt-8">8. Modification of Terms</h2>
                <p>
                  We reserve the right to modify these terms at any time. Changes will take effect 
                  upon publication on our platform.
                </p>

                <h2 className="mt-8">9. Contact</h2>
                <p>
                  For any questions regarding these terms, contact us at:<br />
                  📞 +243 990 666 661<br />
                  ✉️ contact@smartcabb.com
                </p>
              </>
            )}
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
                  ? 'La solution de transport moderne en République Démocratique du Congo.'
                  : 'The modern transport solution in the Democratic Republic of Congo.'
                }
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-4">{language === 'fr' ? 'Liens rapides' : 'Quick links'}</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/" className="hover:text-cyan-500 transition">{language === 'fr' ? 'Accueil' : 'Home'}</Link></li>
                <li><Link to="/services" className="hover:text-cyan-500 transition">Services</Link></li>
                <li><Link to="/drivers" className="hover:text-cyan-500 transition">{language === 'fr' ? 'Chauffeurs' : 'Drivers'}</Link></li>
                <li><Link to="/contact" className="hover:text-cyan-500 transition">Contact</Link></li>
                <li><Link to="/about" className="hover:text-cyan-500 transition">{language === 'fr' ? 'À Propos' : 'About'}</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Applications</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/app" className="hover:text-cyan-500 transition">{language === 'fr' ? 'App Passagers' : 'Passenger App'}</Link></li>
                <li><Link to="/driver" className="hover:text-cyan-500 transition">{language === 'fr' ? 'App Conducteurs' : 'Driver App'}</Link></li>
                <li><Link to="/admin" className="hover:text-cyan-500 transition">{language === 'fr' ? 'Panel Admin' : 'Admin Panel'}</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">{language === 'fr' ? 'Légal' : 'Legal'}</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/terms" className="hover:text-cyan-500 transition">{language === 'fr' ? 'Conditions d\'utilisation' : 'Terms of service'}</Link></li>
                <li><Link to="/privacy" className="hover:text-cyan-500 transition">{language === 'fr' ? 'Politique de confidentialité' : 'Privacy policy'}</Link></li>
                <li><Link to="/legal" className="hover:text-cyan-500 transition">{language === 'fr' ? 'Mentions légales' : 'Legal notice'}</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 SmartCabb. {language === 'fr' ? 'Tous droits réservés.' : 'All rights reserved.'}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}