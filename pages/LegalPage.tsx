import { motion } from 'motion/react';
import { Link } from '../lib/simple-router';
import { useState } from 'react';

export function LegalPage() {
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
            {language === 'fr' ? 'Mentions légales' : 'Legal Notice'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-white/90"
          >
            {language === 'fr' 
              ? 'Dernière mise à jour : 7 janvier 2026'
              : 'Last updated: January 7, 2026'
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
                <h2>1. Informations sur l'entreprise</h2>
                <p>
                  <strong>Nom de l'entreprise :</strong> SmartCabb<br />
                  <strong>Forme juridique :</strong> SARL (Société à Responsabilité Limitée)<br />
                  <strong>Siège social :</strong> Rép Dem Congo<br />
                  <strong>Téléphone :</strong> +243 990 666 661<br />
                  <strong>Email :</strong> contact@smartcabb.com
                </p>

                <h2>2. Directeur de la publication</h2>
                <p>
                  Le directeur de la publication est le représentant légal de SmartCabb.
                </p>

                <h2>3. Hébergement</h2>
                <p>
                  Le site web et les applications SmartCabb sont hébergés sur des serveurs sécurisés 
                  respectant les normes internationales de protection des données.
                </p>

                <h2>4. Propriété intellectuelle</h2>
                <p>
                  L'ensemble du contenu présent sur les plateformes SmartCabb (textes, images, logos, marques, etc.) 
                  est la propriété exclusive de SmartCabb et est protégé par les lois relatives à la propriété intellectuelle.
                </p>
                <p>
                  Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments 
                  du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de SmartCabb.
                </p>

                <h2>5. Responsabilité</h2>
                <p>
                  SmartCabb met tout en œuvre pour offrir des informations fiables et à jour. Toutefois, 
                  nous ne pouvons garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition.
                </p>
                <p>
                  SmartCabb ne saurait être tenue responsable des dommages directs ou indirects résultant de l'utilisation 
                  de son site web ou de ses applications mobiles.
                </p>

                <h2>6. Données personnelles</h2>
                <p>
                  Conformément à notre <Link to="/privacy" className="text-cyan-500 hover:underline">Politique de confidentialité</Link>, 
                  nous collectons et traitons vos données personnelles dans le respect de la législation applicable.
                </p>

                <h2>7. Cookies</h2>
                <p>
                  Notre site utilise des cookies pour améliorer l'expérience utilisateur. En continuant à naviguer sur notre site, 
                  vous acceptez l'utilisation de ces cookies.
                </p>

                <h2>8. Liens hypertextes</h2>
                <p>
                  Notre site peut contenir des liens vers d'autres sites web. SmartCabb n'exerce aucun contrôle sur ces sites 
                  et décline toute responsabilité quant à leur contenu.
                </p>

                <h2>9. Applicable Law</h2>
                <p>
                  These legal notices are governed by Congolese law. Any dispute relating to the use \n                  of our services will be subject to the exclusive jurisdiction of the courts of the DRC.
                </p>

                <h2>10. Contact</h2>
                <p>
                  Pour toute question concernant ces mentions légales, contactez-nous à :<br />
                  📞 +243 990 666 661<br />
                  ✉️ contact@smartcabb.com
                </p>
              </>
            ) : (
              <>
                <h2>1. Company Information</h2>
                <p>
                  <strong>Company name:</strong> SmartCabb<br />
                  <strong>Legal form:</strong> Limited Liability Company<br />
                  <strong>Head office:</strong> DRC<br />
                  <strong>Phone:</strong> +243 990 666 661<br />
                  <strong>Email:</strong> contact@smartcabb.com
                </p>

                <h2>2. Publication Director</h2>
                <p>
                  The publication director is the legal representative of SmartCabb.
                </p>

                <h2>3. Hosting</h2>
                <p>
                  The SmartCabb website and applications are hosted on secure servers 
                  complying with international data protection standards.
                </p>

                <h2>4. Intellectual Property</h2>
                <p>
                  All content present on SmartCabb platforms (texts, images, logos, trademarks, etc.) 
                  is the exclusive property of SmartCabb and is protected by intellectual property laws.
                </p>
                <p>
                  Any reproduction, representation, modification, publication, adaptation of all or part of the site elements, 
                  whatever the means or process used, is prohibited, except with prior written authorization from SmartCabb.
                </p>

                <h2>5. Liability</h2>
                <p>
                  SmartCabb makes every effort to provide reliable and up-to-date information. However, 
                  we cannot guarantee the accuracy, precision or completeness of the information made available.
                </p>
                <p>
                  SmartCabb cannot be held responsible for direct or indirect damages resulting from the use 
                  of its website or mobile applications.
                </p>

                <h2>6. Personal Data</h2>
                <p>
                  In accordance with our <Link to="/privacy" className="text-cyan-500 hover:underline">Privacy Policy</Link>, 
                  we collect and process your personal data in compliance with applicable legislation.
                </p>

                <h2>7. Cookies</h2>
                <p>
                  Our site uses cookies to improve user experience. By continuing to browse our site, 
                  you accept the use of these cookies.
                </p>

                <h2>8. Hyperlinks</h2>
                <p>
                  Our site may contain links to other websites. SmartCabb has no control over these sites 
                  and disclaims all responsibility regarding their content.
                </p>

                <h2>9. Applicable Law</h2>
                <p>
                  These legal notices are governed by Congolese law. Any dispute relating to the use 
                  of our services will be subject to the exclusive jurisdiction of the courts of the DRC.
                </p>

                <h2>10. Contact</h2>
                <p>
                  For any questions regarding these legal notices, contact us at:<br />
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
            <p>&copy; 2026 SmartCabb. {language === 'fr' ? 'Tous droits réservés.' : 'All rights reserved.'}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
