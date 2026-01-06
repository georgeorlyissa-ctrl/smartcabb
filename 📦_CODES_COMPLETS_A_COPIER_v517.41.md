# 📦 CODES COMPLETS À COPIER - v517.41

## 🎯 INSTRUCTIONS

Copiez le contenu de chaque fichier ci-dessous et collez-le dans GitHub.

---

## 📁 FICHIER 1/5 : `components/passenger/RegisterScreen.tsx`

**Chemin complet** : `/components/passenger/RegisterScreen.tsx`

```tsx
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { useNavigate } from '../../lib/simple-router';
import { useAppState } from '../../hooks/useAppState';
import { useState, useEffect } from 'react';
import { signUp } from '../../lib/auth-service';
import { sendSMS } from '../../lib/sms-service';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { PhoneInput } from '../PhoneInput';
import { PolicyModal } from '../PolicyModal';
import { ArrowLeft, AlertCircle } from '../../lib/icons';

export function RegisterScreen() {
  const { setCurrentScreen, setCurrentUser, setCurrentView } = useAppState();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Nettoyer les messages d'erreur au montage et démontage du composant
  useEffect(() => {
    setErrorMsg('');
    setSuccessMsg('');
    
    return () => {
      setErrorMsg('');
      setSuccessMsg('');
    };
  }, []);

  const handleRegister = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    
    // Validation: nom, téléphone et mot de passe obligatoires
    if (!formData.name || !formData.phone || !formData.password) {
      setErrorMsg('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Vérifier que le téléphone a 9 ou 10 chiffres (sans compter +243)
    const phoneDigits = formData.phone.replace(/\D/g, '');
    // Retirer le préfixe 243 si présent pour obtenir les 9-10 chiffres
    const phoneWithoutPrefix = phoneDigits.startsWith('243') ? phoneDigits.substring(3) : phoneDigits;
    if (phoneWithoutPrefix.length < 9 || phoneWithoutPrefix.length > 10) {
      setErrorMsg('Le numéro de téléphone doit contenir 9 ou 10 chiffres');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Les mots de passe ne correspondent pas');
      return;
    }

    if (!termsAccepted) {
      setErrorMsg('Veuillez accepter les conditions d\'utilisation');
      return;
    }

    setLoading(true);
    
    try {
      // 🧹 NETTOYER LES UTILISATEURS ORPHELINS AVANT L'INSCRIPTION
      try {
        const cleanupResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/delete-user-by-phone`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`
            },
            body: JSON.stringify({ phone: formData.phone })
          }
        );
        
        const cleanupResult = await cleanupResponse.json();
        if (cleanupResult.deletedAuth || cleanupResult.deletedProfile) {
          console.log('✅ Utilisateur orphelin nettoyé avant inscription');
        }
      } catch (cleanupError) {
        console.log('⚠️ Nettoyage préalable ignoré:', cleanupError);
        // Continuer même si le nettoyage échoue
      }
      
      // Inscription avec Supabase
      const result = await signUp({
        email: formData.email || undefined, // ✅ Passer l'email s'il est fourni
        phone: formData.phone,
        password: formData.password,
        fullName: formData.name,
        role: 'passenger'
      });
      
      if (result.success && result.profile) {
        setCurrentUser({
          id: result.profile.id,
          name: result.profile.full_name,
          email: result.profile.email,
          phone: result.profile.phone || formData.phone
        });
        
        setSuccessMsg(`Bienvenue ${result.profile.full_name}!`);
        
        // 📱 Envoyer SMS de bienvenue au nouveau passager
        const phone = result.profile.phone || formData.phone;
        if (phone) {
          try {
            await sendSMS({
              to: phone,
              message: `SmartCabb: Bienvenue ${result.profile.full_name}! Votre compte passager a ete cree avec succes. Reservez votre premiere course des maintenant!`,
              type: 'account_validated',
            });
            console.log('✅ SMS de bienvenue envoyé au nouveau passager');
          } catch (error) {
            console.error('❌ Erreur envoi SMS de bienvenue:', error);
          }
        }
        
        setTimeout(() => {
          setCurrentScreen('map');
        }, 500);
      } else {
        // 🔍 Détecter si l'utilisateur existe déjà
        const errorMessage = result.error || 'Erreur lors de l\'inscription';
        
        if (errorMessage.toLowerCase().includes('already been registered') || 
            errorMessage.toLowerCase().includes('déjà enregistré') ||
            errorMessage.toLowerCase().includes('already exists')) {
          setErrorMsg('Ce numéro de téléphone est déjà inscrit. Connectez-vous plutôt.');
          
          // Rediriger automatiquement vers l'écran de connexion après 3 secondes
          setTimeout(() => {
            setCurrentScreen('login');
          }, 3000);
        } else {
          setErrorMsg(errorMessage);
        }
      }
    } catch (error) {
      console.error('❌ Erreur inattendue lors de l\'inscription:', error);
      setErrorMsg('Erreur lors de l\'inscription. Vérifiez votre connexion Internet.');
    }
    
    setLoading(false);
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div 
      className="min-h-screen bg-white flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            console.log('⬅️ Retour vers la page d\'accueil');
            setCurrentView(null);
            setCurrentScreen('landing');
            navigate('/');
          }}
          className="w-10 h-10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl">Inscription</h1>
        <div className="w-10" />
      </div>

      {/* Form */}
      <div className="flex-1 px-6 py-8 overflow-y-auto">
        <div
          className="space-y-6"
        >
          <p className="text-gray-600 mb-8 text-center">
            Créez votre compte SmartCabb
          </p>

          {/* Messages de succès et d'erreur */}
          {successMsg && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-800 font-medium">{successMsg}</p>
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-800 font-medium">{errorMsg}</p>
              </div>
              
              {/* Si c'est une erreur "déjà inscrit", afficher un bouton de connexion */}
              {(errorMsg.includes('déjà inscrit') || errorMsg.includes('already registered')) && (
                <Button
                  onClick={() => setCurrentScreen('login')}
                  className="w-full mt-3 bg-cyan-500 hover:bg-cyan-600 text-white"
                >
                  Aller à la connexion
                </Button>
              )}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <Label htmlFor="name">Nom complet</Label>
              <div className="mt-2">
                <Input
                  id="register-name"
                  type="text"
                  placeholder="Ex: Jean Mulamba"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  className="px-4 h-12 bg-gray-50 border-0 rounded-xl text-base"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="words"
                  spellCheck="false"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <div className="mt-2">
                <Input
                  id="register-email"
                  type="email"
                  placeholder="exemple@email.com"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  className="px-4 h-12 bg-gray-50 border-0 rounded-xl text-base"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">
                Téléphone <span className="text-red-500">*</span>
              </Label>
              <div className="mt-2">
                <PhoneInput
                  id="register-phone"
                  value={formData.phone}
                  onChange={(value) => updateFormData('phone', value)}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Format: +243 XX XXX XXXX (9 chiffres)</p>
            </div>

            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <div className="mt-2">
                <Input
                  id="register-password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => updateFormData('password', e.target.value)}
                  className="px-4 h-12 bg-gray-50 border-0 rounded-xl text-base"
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <div className="mt-2">
                <Input
                  id="register-confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                  className="px-4 h-12 bg-gray-50 border-0 rounded-xl text-base"
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div
        className="px-6"
      >
        <div className="flex items-start space-x-2 mb-4">
          <Checkbox
            id="terms"
            checked={termsAccepted}
            onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
            className="mt-1"
          />
          <label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
            J'accepte les{' '}
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setShowTermsModal(true);
              }}
              className="text-green-500 hover:underline"
            >
              conditions d'utilisation
            </button>{' '}
            et la{' '}
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setShowTermsModal(true);
              }}
              className="text-green-500 hover:underline"
            >
              politique de confidentialité
            </button>{' '}
            de SmartCabb.
          </label>
        </div>
      </div>

      {/* Actions */}
      <div
        className="px-6 pb-8 space-y-4"
      >
        <Button
          onClick={handleRegister}
          disabled={loading || !termsAccepted}
          className="w-full h-14 bg-green-500 hover:bg-green-600 text-white rounded-xl disabled:opacity-50"
        >
          {loading ? 'Inscription...' : 'Valider'}
        </Button>
        
        <p className="text-center text-gray-600">
          Déjà un compte ?{' '}
          <button
            onClick={() => setCurrentScreen('login')}
            className="text-green-500 hover:underline"
          >
            Se connecter
          </button>
        </p>
      </div>

      {/* Terms Modal */}
      <PolicyModal
        isOpen={showTermsModal}
        onAccept={() => setShowTermsModal(false)}
        showCloseButton={true}
      />
    </div>
  );
}
```

---

## 📁 FICHIER 2/5 : `components/passenger/LoginScreen.tsx`

**Chemin complet** : `/components/passenger/LoginScreen.tsx`

**⚠️ CHANGEMENT PRINCIPAL** : Ligne 5 - Import des icônes depuis `../../lib/icons` au lieu de `lucide-react`

```tsx
import { EmailPhoneInput } from '../EmailPhoneInput';
import { useNavigate } from '../../lib/simple-router';
import { signIn } from '../../lib/auth-service';
import { profileService } from '../../lib/supabase-services';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, AlertCircle } from '../../lib/icons';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { syncUserProfile } from '../../lib/sync-service';
import { useAppState } from '../../hooks/useAppState';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useState } from 'react';

export function LoginScreen() {
  console.log('🔐 LoginScreen - Début du render');
  
  const navigate = useNavigate();
  
  let hookData;
  try {
    hookData = useAppState();
    console.log('✅ useAppState OK');
  } catch (error) {
    console.error('❌ CRASH useAppState:', error);
    return (
      <div className="min-h-screen bg-red-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur useAppState</h1>
          <p className="text-gray-700">{String(error)}</p>
        </div>
      </div>
    );
  }

  const { setCurrentScreen, setCurrentUser, setCurrentView } = hookData;
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  console.log('✅ LoginScreen - States initialisés');

  const doLogin = async () => {
    console.log('🔐 DÉBUT LOGIN - Vraie connexion Supabase');
    
    setErrorMsg('');
    setSuccessMsg('');
    
    if (!identifier || !password) {
      setErrorMsg('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    console.log('⏳ Loading = true');

    try {
      // ✅ VRAIE CONNEXION avec Supabase Auth
      console.log('🔐 Tentative de connexion avec:', identifier);
      const result = await signIn({ identifier, password });

      if (!result.success) {
        console.error('❌ Erreur de connexion:', result.error);
        
        // 🆕 CAS SPÉCIAL : Profil orphelin détecté
        if (result.error === 'ORPHAN_PROFILE' && (result as any).orphanProfile) {
          const orphanProfile = (result as any).orphanProfile;
          console.log('⚠️ Profil orphelin détecté:', orphanProfile);
          
          setErrorMsg('');
          
          toast.error(
            <div className="space-y-2">
              <p className="font-semibold">Compte incomplet détecté</p>
              <p className="text-sm">Votre profil existe mais votre compte d'authentification n'a pas été créé.</p>
              <button
                onClick={() => {
                  window.location.href = '/auth/create-auth-from-profile';
                }}
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 w-full"
              >
                Activer mon compte maintenant
              </button>
            </div>,
            {
              duration: 10000, // 10 secondes
              position: 'top-center'
            }
          );
          
          setLoading(false);
          return;
        }
        
        setErrorMsg(result.error || 'Erreur de connexion');
        toast.error(result.error || 'Erreur de connexion');
        setLoading(false);
        return;
      }

      console.log('✅ Connexion réussie, récupération du profil...');

      // Récupérer le profil depuis Supabase
      const profile = await profileService.getProfile(result.user.id);
      
      if (!profile) {
        console.error('❌ Profil introuvable');
        setErrorMsg('Profil introuvable');
        toast.error('Profil introuvable');
        setLoading(false);
        return;
      }

      console.log('✅ Profil récupéré:', profile);

      // 🔒 VÉRIFICATION DE SÉCURITÉ : Seuls les passagers peuvent se connecter ici
      if (profile.role !== 'passenger') {
        console.error('❌ Tentative de connexion avec un compte non-passager:', profile.role);
        let errorMessage = '';
        if (profile.role === 'driver') {
          errorMessage = 'Ce compte est un compte conducteur. Veuillez utiliser l\'application conducteur.';
        } else if (profile.role === 'admin') {
          errorMessage = 'Ce compte est un compte administrateur. Veuillez utiliser le panel admin.';
        } else {
          errorMessage = 'Type de compte non autorisé pour cette application.';
        }
        setErrorMsg(errorMessage);
        toast.error(errorMessage);
        setLoading(false);
        return;
      }

      // Créer l'objet utilisateur avec les vraies données Supabase
      const user: any = {
        id: profile.id,
        name: profile.full_name || 'Utilisateur',
        email: profile.email,
        phone: profile.phone || '',
        walletBalance: profile.wallet_balance || 0,
        walletTransactions: [] // Seront chargées depuis la base si nécessaire
      };

      // 💾 CHARGER LES DONNÉES DE LOCALSTORAGE (override Supabase si disponible)
      try {
        const userKey = `smartcabb_user_${profile.id}`;
        const localData = localStorage.getItem(userKey);
        if (localData) {
          const parsedLocalData = JSON.parse(localData);
          console.log('✅ Données locales trouvées:', parsedLocalData);
          // Merger avec les données Supabase (localStorage a priorité pour name, email, phone, address)
          user.name = parsedLocalData.name || user.name;
          user.email = parsedLocalData.email || user.email;
          user.phone = parsedLocalData.phone || user.phone;
          if (parsedLocalData.address) {
            user.address = parsedLocalData.address;
          }
          console.log('✅ Données mergées avec localStorage:', user);
        }
      } catch (e) {
        console.warn('⚠️ Impossible de charger localStorage:', e);
      }

      console.log('✅ User créé avec vraies données:', user);
      
      setCurrentUser(user);
      console.log('✅ setCurrentUser appelé avec vraies données');
      
      const passengerName = user.name?.split(' ')[0] || user.email?.split('@')[0] || 'Passager';
      setSuccessMsg(`Bienvenue ${passengerName} ! 👋`);
      toast.success(`Bienvenue ${passengerName} ! 👋`);
      console.log('✅ Message de succès affiché');
      
      // Attendre un peu avant de naviguer
      setTimeout(() => {
        setCurrentScreen('map');
        console.log('✅ setCurrentScreen(map) appelé');
      }, 500);
      
      setLoading(false);
      console.log('✅ Loading = false');
      console.log('🎉 LOGIN TERMINÉ');
    } catch (error) {
      console.error('❌ Erreur pendant le login:', error);
      setLoading(false);
      setErrorMsg('Erreur lors de la connexion');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      doLogin();
    }
  };

  console.log('✅ LoginScreen - doLogin défini, début du JSX');

  try {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-cyan-500 to-cyan-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-in fade-in duration-300">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">SC</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Connexion</h1>
            <p className="text-gray-600">Bienvenue sur SmartCabb</p>
          </div>

          {/* Messages de succès et d'erreur */}
          {successMsg && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-800 font-medium">{successMsg}</p>
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-800 font-medium">{errorMsg}</p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <EmailPhoneInput
                id="passenger-identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                onKeyPress={handleKeyPress}
                className="px-4 h-12 text-base"
                disabled={loading}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                label="Email ou Téléphone"
              />
            </div>

            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative mt-2">
                <Input
                  id="passenger-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="px-4 pr-12 h-12 text-base"
                  disabled={loading}
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                doLogin();
              }}
              disabled={loading}
              className="w-full h-12 bg-cyan-500 hover:bg-cyan-600 text-white text-lg transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Connexion...</span>
                </div>
              ) : (
                'Se connecter'
              )}
            </Button>

            <div className="text-center">
              <button 
                type="button"
                onClick={() => setCurrentScreen('forgot-password')}
                className="text-sm text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
                disabled={loading}
              >
                Mot de passe oublié ?
              </button>
            </div>

            <div className="text-center">
              <p className="text-gray-600">
                Pas de compte ?{' '}
                <button 
                  type="button"
                  onClick={() => setCurrentScreen('register')}
                  className="text-cyan-500 hover:text-cyan-600 font-semibold transition-colors"
                  disabled={loading}
                >
                  S'inscrire
                </button>
              </p>
            </div>

            <div className="text-center">
              <button 
                type="button"
                onClick={() => {
                  console.log('⬅️ Retour vers la page d\'accueil');
                  setCurrentView(null);
                  setCurrentScreen('landing');
                  navigate('/');
                }}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                disabled={loading}
              >
                ← Retour
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('❌ CRASH dans le JSX du LoginScreen:', error);
    return (
      <div className="min-h-screen bg-red-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur de rendu</h1>
          <p className="text-gray-700">{String(error)}</p>
        </div>
      </div>
    );
  }
}
```

---

## 📁 FICHIER 3/5 : `website/index-new-design.html`

**Chemin complet** : `/website/index-new-design.html`

**⚠️ CHANGEMENT** : Ligne 1076 - Le lien "Connexion" pointe maintenant vers `/app/passenger`

**🔍 CHERCHEZ LA LIGNE 1076** et remplacez-la par :

```html
                <a href="/app/passenger" class="btn-connexion" data-i18n="nav.login">Connexion</a>
```

**CONTEXTE (lignes 1071-1077)** :
```html
                <a href="/" class="nav-link active" data-i18n="nav.home">Accueil</a>
                <a href="/services" class="nav-link" data-i18n="nav.services">Services</a>
                <a href="/drivers" class="nav-link" data-i18n="nav.driver">Chauffeurs</a>
                <a href="/contact" class="nav-link" data-i18n="nav.contact">Contact</a>
                <a href="/about" class="nav-link" data-i18n="nav.about">À Propos</a>
                <a href="/app/passenger" class="btn-connexion" data-i18n="nav.login">Connexion</a>
                
```

---

## 📁 FICHIER 4/5 : `website/about-new-design.html`

**Chemin complet** : `/website/about-new-design.html`

**⚠️ CHANGEMENT** : Ligne 503 - Le lien "Connexion" pointe maintenant vers `/app/passenger`

**🔍 CHERCHEZ LA LIGNE 503** et remplacez-la par :

```html
                <a href="/app/passenger" class="btn-primary" style="text-decoration: none; display: inline-block;" data-i18n="nav.login">Connexion</a>
```

**CONTEXTE (lignes 501-505)** :
```html
                <a href="/contact" class="nav-link" data-i18n="nav.contact">Contact</a>
                <a href="/about" class="nav-link active" data-i18n="nav.about">À Propos</a>
                <a href="/app/passenger" class="btn-primary" style="text-decoration: none; display: inline-block;" data-i18n="nav.login">Connexion</a>
                
                <!-- Sélecteur de langue DROPDOWN -->
```

---

## 📁 FICHIER 5/5 : `website/contact-new-design.html`

**Chemin complet** : `/website/contact-new-design.html`

**⚠️ CHANGEMENT** : Ligne 558 - Le lien "Se connecter" pointe maintenant vers `/app/passenger`

**🔍 CHERCHEZ LA LIGNE 558** et remplacez-la par :

```html
                <a href="/app/passenger" class="btn-primary" style="text-decoration: none; display: inline-block;" data-i18n="nav.login">Se connecter</a>
```

**CONTEXTE (lignes 556-560)** :
```html
                <a href="/drivers" class="nav-link" data-i18n="nav.driver">Chauffeurs</a>
                <a href="/contact" class="nav-link" data-i18n="nav.contact">Contact</a>
                <a href="/app/passenger" class="btn-primary" style="text-decoration: none; display: inline-block;" data-i18n="nav.login">Se connecter</a>
                
                <!-- Sélecteur de langue DROPDOWN -->
```

---

## 🎯 RÉCAPITULATIF DES MODIFICATIONS

| Fichier | Ligne(s) | Modification |
|---------|----------|--------------|
| `RegisterScreen.tsx` | 1-13 | ✅ Ajout de tous les imports manquants |
| `LoginScreen.tsx` | 5 | ✅ Import des icônes depuis `lib/icons` |
| `index-new-design.html` | 1076 | ✅ Lien `/app/passenger` au lieu de `/` |
| `about-new-design.html` | 503 | ✅ Lien `/app/passenger` au lieu de `/?mode=passenger` |
| `contact-new-design.html` | 558 | ✅ Lien `/app/passenger` au lieu de `/?mode=passenger` |

---

## 🚀 APRÈS AVOIR COPIÉ TOUS LES FICHIERS

```bash
git add .
git commit -m "fix: Correction erreur useAppState et navigation passager v517.41"
git push origin main
```

**Attendez 2-3 minutes puis testez sur smartcabb.com** ✅
