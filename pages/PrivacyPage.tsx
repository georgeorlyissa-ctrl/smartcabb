import { motion } from 'motion/react';
import { Link } from '../lib/simple-router';
import { useState } from 'react';

export function PrivacyPage() {
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
            {language === 'fr' ? 'Politique de confidentialité' : 'Privacy Policy'}
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
                <h2>1. Introduction</h2>
                <p>
                  SmartCabb s'engage à protéger la vie privée de ses utilisateurs. Cette politique de confidentialité 
                  explique comment nous collectons, utilisons, partageons et protégeons vos informations personnelles.
                </p>

                <h2>2. Informations collectées</h2>
                <p>Nous collectons les types d'informations suivants :</p>
                <ul>
                  <li><strong>Informations d'inscription :</strong> nom, prénom, numéro de téléphone, adresse email</li>
                  <li><strong>Informations de localisation :</strong> position GPS pour faciliter les trajets</li>
                  <li><strong>Informations de paiement :</strong> méthodes de paiement et historique des transactions</li>
                  <li><strong>Données d'utilisation :</strong> historique des courses, préférences, évaluations</li>
                  <li><strong>Informations de l'appareil :</strong> modèle, système d'exploitation, identifiant unique</li>
                </ul>

                <h2>3. Utilisation des informations</h2>
                <p>Nous utilisons vos informations pour :</p>
                <ul>
                  <li>Faciliter et améliorer nos services de transport</li>
                  <li>Traiter vos paiements et transactions</li>
                  <li>Vous envoyer des notifications concernant vos courses</li>
                  <li>Assurer la sécurité et prévenir les fraudes</li>
                  <li>Améliorer l'expérience utilisateur</li>
                  <li>Respecter nos obligations légales</li>
                </ul>

                <h2>4. Partage des informations</h2>
                <p>Nous partageons vos informations uniquement dans les cas suivants :</p>
                <ul>
                  <li><strong>Avec les chauffeurs :</strong> pour faciliter la prise en charge</li>
                  <li><strong>Prestataires de services :</strong> pour le traitement des paiements et l'hébergement</li>
                  <li><strong>Autorités légales :</strong> si requis par la loi</li>
                </ul>
                <p>Nous ne vendons jamais vos données personnelles à des tiers.</p>

                <h2>5. Sécurité des données</h2>
                <p>
                  Nous utilisons des mesures de sécurité techniques et organisationnelles pour protéger vos informations 
                  contre l'accès non autorisé, la perte, la divulgation ou la destruction.
                </p>

                <h2>6. Vos droits</h2>
                <p>Vous avez le droit de :</p>
                <ul>
                  <li>Accéder à vos données personnelles</li>
                  <li>Corriger ou mettre à jour vos informations</li>
                  <li>Supprimer votre compte et vos données</li>
                  <li>Vous opposer au traitement de vos données</li>
                  <li>Retirer votre consentement à tout moment</li>
                </ul>

                <h2>7. Conservation des données</h2>
                <p>
                  Nous conservons vos données personnelles aussi longtemps que nécessaire pour fournir nos services 
                  et respecter nos obligations légales.
                </p>

                <h2>8. Cookies et technologies similaires</h2>
                <p>
                  Nous utilisons des cookies et technologies similaires pour améliorer votre expérience, 
                  analyser l'utilisation de nos services et personnaliser le contenu.
                </p>

                <h2>9. Modifications de la politique</h2>
                <p>
                  Nous pouvons modifier cette politique de confidentialité à tout moment. Les modifications 
                  seront publiées sur cette page avec une date de mise à jour.
                </p>

                <h2>10. Contact</h2>
                <p>
                  Pour toute question concernant cette politique, contactez-nous à :<br />
                  📞 +243 990 666 661<br />
                  ✉️ contact@smartcabb.com
                </p>
              </>
            ) : (
              <>
                <h2>1. Introduction</h2>
                <p>
                  SmartCabb is committed to protecting the privacy of its users. This privacy policy 
                  explains how we collect, use, share and protect your personal information.
                </p>

                <h2>2. Information Collected</h2>
                <p>We collect the following types of information:</p>
                <ul>
                  <li><strong>Registration information:</strong> name, surname, phone number, email address</li>
                  <li><strong>Location information:</strong> GPS position to facilitate rides</li>
                  <li><strong>Payment information:</strong> payment methods and transaction history</li>
                  <li><strong>Usage data:</strong> ride history, preferences, ratings</li>
                  <li><strong>Device information:</strong> model, operating system, unique identifier</li>
                </ul>

                <h2>3. Use of Information</h2>
                <p>We use your information to:</p>
                <ul>
                  <li>Facilitate and improve our transport services</li>
                  <li>Process your payments and transactions</li>
                  <li>Send you notifications about your rides</li>
                  <li>Ensure security and prevent fraud</li>
                  <li>Improve user experience</li>
                  <li>Comply with our legal obligations</li>
                </ul>

                <h2>4. Information Sharing</h2>
                <p>We share your information only in the following cases:</p>
                <ul>
                  <li><strong>With drivers:</strong> to facilitate pickup</li>
                  <li><strong>Service providers:</strong> for payment processing and hosting</li>
                  <li><strong>Legal authorities:</strong> if required by law</li>
                </ul>
                <p>We never sell your personal data to third parties.</p>

                <h2>5. Data Security</h2>
                <p>
                  We use technical and organizational security measures to protect your information 
                  against unauthorized access, loss, disclosure or destruction.
                </p>

                <h2>6. Your Rights</h2>
                <p>You have the right to:</p>
                <ul>
                  <li>Access your personal data</li>
                  <li>Correct or update your information</li>
                  <li>Delete your account and data</li>
                  <li>Object to the processing of your data</li>
                  <li>Withdraw your consent at any time</li>
                </ul>

                <h2>7. Data Retention</h2>
                <p>
                  We retain your personal data for as long as necessary to provide our services 
                  and comply with our legal obligations.
                </p>

                <h2>8. Cookies and Similar Technologies</h2>
                <p>
                  We use cookies and similar technologies to improve your experience, 
                  analyze the use of our services and personalize content.
                </p>

                <h2>9. Policy Modifications</h2>
                <p>
                  We may modify this privacy policy at any time. Changes 
                  will be posted on this page with an update date.
                </p>

                <h2>10. Contact</h2>
                <p>
                  For any questions regarding this policy, contact us at:<br />
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