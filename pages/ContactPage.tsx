import { Link } from '../lib/simple-router';
import { useState } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { ChatWidget } from '../components/ChatWidget';

export function ContactPage() {
  const [language, setLanguage] = useState('fr');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/contact`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone || '',
            message: formData.message,
            language: language,
            source: 'website'
          })
        }
      );

      const result = await response.json();

      if (result.success) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', phone: '', message: '' });
        
        setTimeout(() => {
          setSubmitStatus('idle');
        }, 5000);
      } else {
        setSubmitStatus('error');
        console.error('Erreur envoi message:', result.error);
      }
    } catch (error) {
      console.error('Erreur inattendue:', error);
      setSubmitStatus('error');
    } finally {
      setLoading(false);
    }
  };

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
              <Link to="/contact" className="font-medium text-cyan-500">
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
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 animate-in fade-in slide-in-from-bottom duration-700">
            Contact
          </h1>
          <p className="text-xl md:text-2xl text-white/90 animate-in fade-in slide-in-from-bottom duration-700" style={{ animationDelay: '100ms' }}>
            {language === 'fr' ? 'Nous sommes là pour vous' : 'We are here for you'}
          </p>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Form Section */}
            <div className="bg-white p-8 rounded-2xl shadow-lg animate-in fade-in slide-in-from-left duration-700">
              <h2 className="text-3xl font-bold mb-2">
                {language === 'fr' ? 'Envoyez-nous un message' : 'Send us a message'}
              </h2>
              <p className="text-gray-600 mb-8">
                {language === 'fr' ? 'Remplissez le formulaire ci-dessous' : 'Fill out the form below'}
              </p>

              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-50 border-2 border-green-300 rounded-xl flex items-center space-x-3">
                  <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-green-700 font-medium">
                    {language === 'fr' 
                      ? 'Message envoyé avec succès ! Nous vous répondrons bientôt.' 
                      : 'Message sent successfully! We will respond soon.'
                    }
                  </p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-xl flex items-center space-x-3">
                  <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <p className="text-red-700 font-medium">
                    {language === 'fr' 
                      ? 'Erreur lors de l\'envoi. Veuillez réessayer.' 
                      : 'Error sending message. Please try again.'
                    }
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    {language === 'fr' ? 'Nom *' : 'Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    {language === 'fr' ? 'Email *' : 'Email *'}
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    {language === 'fr' ? 'Téléphone' : 'Phone'}
                  </label>
                  <input
                    type="tel"
                    placeholder="+243"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    {language === 'fr' ? 'Message *' : 'Message *'}
                  </label>
                  <textarea
                    required
                    rows={6}
                    placeholder={language === 'fr' ? 'Écrivez votre message ici...' : 'Write your message here...'}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none transition-colors"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold py-4 px-8 rounded-full hover:from-cyan-600 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.928l3-2.647z"></path>
                      </svg>
                      {language === 'fr' ? 'Envoi en cours...' : 'Sending...'}
                    </>
                  ) : (
                    language === 'fr' ? 'Envoyer le message' : 'Send message'
                  )}
                </button>
              </form>
            </div>

            {/* Info Section */}
            <div className="space-y-8 animate-in fade-in slide-in-from-right duration-700">
              <div>
                <h2 className="text-3xl font-bold mb-8">
                  {language === 'fr' ? 'Nos coordonnées' : 'Our contact information'}
                </h2>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">📧</div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      {language === 'fr' ? 'Support technique' : 'Technical Support'}
                    </h3>
                    <p className="text-gray-600">support@smartcabb.com</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">📧</div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      {language === 'fr' ? 'Informations générales' : 'General Information'}
                    </h3>
                    <p className="text-gray-600">info@smartcabb.com</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-semibold mb-2 text-cyan-500">
                  {language === 'fr' ? 'Notre bureau' : 'Our office'}
                </h3>
                <p className="text-gray-600">5D, Avenue du Tchad</p>
                <p className="text-gray-600">C/ Gombe, Rép Dem Congo</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold mb-4">
                  {language === 'fr' ? 'Suivez-nous' : 'Follow us'}
                </h3>
                <div className="flex gap-4">
                  <a 
                    href="https://facebook.com/smartcabb" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-[#1877F2] rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                    aria-label="Facebook"
                  >
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a 
                    href="https://twitter.com/smartcabb" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-[#1DA1F2] rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                    aria-label="Twitter"
                  >
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                  <a 
                    href="https://instagram.com/smartcabb" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                    aria-label="Instagram"
                  >
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a 
                    href="https://youtube.com/@smartcabb" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-[#FF0000] rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                    aria-label="YouTube"
                  >
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 animate-in fade-in duration-700">
            <h2 className="text-4xl font-bold mb-4">
              {language === 'fr' ? 'Notre localisation' : 'Our location'}
            </h2>
            <p className="text-xl text-gray-600">
              {language === 'fr' ? 'Retrouvez-nous en Rép Dem Congo' : 'Find us in the DRC'}
            </p>
          </div>

          <div className="bg-gray-200 rounded-2xl overflow-hidden shadow-lg h-96 flex items-center justify-center animate-in fade-in zoom-in duration-700">
            <div className="text-center">
              <div className="text-6xl mb-4">🗺️</div>
              <p className="text-xl text-gray-600">
                {language === 'fr' ? 'Carte interactive - Rép Dem Congo' : 'Interactive map - DRC'}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {language === 'fr' ? '5D, Avenue du Tchad, Commune de Gombe' : '5D, Avenue du Tchad, Gombe District'}
              </p>
            </div>
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
                  ? 'Votre solution de transport intelligente en République Démocratique du Congo.'
                  : 'Your smart transport solution in the Democratic Republic of Congo.'
                }
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-4">{language === 'fr' ? 'Liens rapides' : 'Quick links'}</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/" className="hover:text-cyan-500 transition">{language === 'fr' ? 'Accueil' : 'Home'}</Link></li>
                <li><Link to="/services" className="hover:text-cyan-500 transition">Services</Link></li>
                <li><Link to="/about" className="hover:text-cyan-500 transition">{language === 'fr' ? 'À propos' : 'About'}</Link></li>
                <li><Link to="/drivers" className="hover:text-cyan-500 transition">{language === 'fr' ? 'Devenir chauffeur' : 'Become a driver'}</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">{language === 'fr' ? 'Légal' : 'Legal'}</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/terms" className="hover:text-cyan-500 transition">{language === 'fr' ? 'Conditions d\'utilisation' : 'Terms of service'}</Link></li>
                <li><Link to="/privacy" className="hover:text-cyan-500 transition">{language === 'fr' ? 'Politique de confidentialité' : 'Privacy policy'}</Link></li>
                <li><Link to="/legal" className="hover:text-cyan-500 transition">{language === 'fr' ? 'Mentions légales' : 'Legal notices'}</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Contact</h3>
              <div className="text-gray-400 text-sm space-y-2">
                <p>📧 support@smartcabb.com</p>
                <p>📧 info@smartcabb.com</p>
              </div>
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