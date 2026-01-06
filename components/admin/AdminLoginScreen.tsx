import { useState } from 'react';
import { toast } from '../../lib/toast';
import { useNavigate } from '../../lib/simple-router';
import { useAppState } from '../../hooks/useAppState';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ArrowLeft, Shield, Eye, EyeOff } from '../../lib/icons';

export function AdminLoginScreen() {
  const { setCurrentScreen, setCurrentView, setIsAdmin, setCurrentUser } = useAppState();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ❌ SUPPRIMÉ : Pas de vérification automatique de session
  // L'admin DOIT toujours saisir son mot de passe pour se connecter (sécurité)

  const handleLogin = async () => {
    // Validation simple
    if (!email || !password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);

    try {
      console.log('👑 Connexion admin...', email);
      
      // ✅ CONNEXION avec Supabase Auth (pour créer la session persistante)
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError || !authData.session) {
        console.error('❌ Erreur authentification:', authError);
        toast.error('Email ou mot de passe incorrect');
        setLoading(false);
        return;
      }

      console.log('✅ Session Supabase créée, vérification du profil...');

      // Vérifier le profil via l'API
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/auth/session`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authData.session.access_token}`
          }
        }
      );

      const result = await response.json();

      if (!result.success) {
        console.error('❌ Erreur récupération profil:', result.error);
        toast.error('Erreur lors de la récupération du profil');
        setLoading(false);
        return;
      }

      console.log('✅ Profil récupéré, vérification du rôle admin...');

      // Vérifier que c'est bien un admin
      if (result.profile.role !== 'admin') {
        console.error('❌ Pas un compte admin');
        toast.error('Ce compte n\'a pas les droits d\'administration');
        // Déconnecter l'utilisateur
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      console.log('✅ Mise à jour des états admin...');

      // Créer l'objet utilisateur admin
      const adminUser = {
        id: result.profile.id,
        name: result.profile.full_name || 'Admin',
        email: result.profile.email,
        phone: result.profile.phone || '',
        role: 'admin'
      };

      // Mettre à jour les états
      setCurrentUser(adminUser);
      setIsAdmin(true);
      setCurrentView('admin');
      
      console.log('✅ États admin définis, redirection...');
      
      // Message de succès personnalisé
      const adminName = result.profile.full_name?.split(' ')[0] || email.split('@')[0];
      toast.success(`Bienvenue ${adminName} ! 👋`);
      
      // Redirection directe vers le dashboard admin
      setCurrentScreen('admin-dashboard');
      
      console.log('✅ Redirection effectuée vers admin-dashboard');

    } catch (error) {
      console.error('❌ Erreur:', error);
      toast.error('Erreur de connexion. Vérifiez votre connexion Internet.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8"
      >
        {/* Header */}
        <div className="text-center mb-8 relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsAdmin(false);
              setCurrentView('passenger');
              setCurrentScreen('landing');
              navigate('/');
            }}
            className="absolute -top-2 -left-2 w-10 h-10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Administration</h1>
          <p className="text-gray-600">SmartCabb Dashboard</p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <div>
            <Label htmlFor="email">Email</Label>
            <div className="mt-2">
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@smartcabb.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-4 h-12 text-base"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                disabled={loading}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password">Mot de passe</Label>
            <div className="relative mt-2">
              <Input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="px-4 pr-12 h-12 text-base"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
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
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white text-lg"
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
              onClick={() => setCurrentScreen('forgot-password-admin')}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
              disabled={loading}
            >
              Mot de passe oublié ?
            </button>
          </div>

          <div className="text-center">
            <p className="text-gray-600">
              Pas de compte admin ?{' '}
              <button 
                onClick={() => setCurrentScreen('admin-register')}
                className="text-purple-600 hover:text-purple-700 font-semibold"
                disabled={loading}
              >
                Créer un compte
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}