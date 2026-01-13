import { toast } from '../../lib/toast';
import { useNavigate } from '../../lib/simple-router';
import { useState, useEffect } from 'react';
import { motion } from '../../lib/motion';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Mail, ArrowLeft, Check, AlertCircle } from '../../lib/icons';
import { supabase } from '../../lib/supabase';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // 🔧 Détecter si on a un token de réinitialisation dans l'URL et rediriger
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');

    console.log('🔍 ForgotPasswordPage - Vérification token dans hash');
    console.log('Token présent:', !!accessToken);
    console.log('Type:', type);

    // Si on a un token de recovery, rediriger vers la page de réinitialisation
    if (accessToken && type === 'recovery') {
      console.log('✅ Token détecté, redirection vers /auth/reset-password');
      navigate('/auth/reset-password' + window.location.hash, { replace: true });
    }
  }, [navigate]);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Veuillez entrer votre adresse email');
      return;
    }

    // Validation email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Adresse email invalide');
      return;
    }

    setLoading(true);

    try {
      console.log('🔄 Demande de réinitialisation pour:', email);

      // Demander la réinitialisation avec Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        console.error('❌ Erreur:', error);
        
        // Même s'il y a une erreur, on affiche le message de succès pour la sécurité
        // (ne pas révéler si l'email existe ou non)
        setSuccess(true);
      } else {
        console.log('✅ Email de réinitialisation envoyé');
        setSuccess(true);
      }

    } catch (error: any) {
      console.error('❌ Erreur réinitialisation:', error);
      // Pour la sécurité, on affiche quand même le message de succès
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Check className="w-10 h-10 text-green-600" />
            </motion.div>

            <h1 className="text-2xl text-center mb-4">Email envoyé !</h1>
            
            <div className="space-y-4 text-center text-gray-600">
              <p>
                Si un compte existe avec l'adresse <strong>{email}</strong>, 
                vous recevrez un email avec un lien pour réinitialiser votre mot de passe.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-left">
                <p className="mb-2">📧 <strong>Vérifiez votre boîte mail :</strong></p>
                <ul className="space-y-1 text-blue-800">
                  <li>• Vérifiez votre dossier spam/courrier indésirable</li>
                  <li>• Le lien est valide pendant 1 heure</li>
                  <li>• Cliquez sur le lien dans l'email pour réinitialiser</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-left">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-800">
                      <strong>Configuration requise :</strong>
                    </p>
                    <p className="text-yellow-700 mt-1">
                      Si le lien pointe vers localhost, veuillez configurer l'URL 
                      de redirection dans Supabase Dashboard → Authentication → URL Configuration
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <Button
                onClick={() => navigate('/login')}
                className="w-full"
                variant="outline"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à la connexion
              </Button>
              
              <Button
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                }}
                variant="link"
                className="w-full"
              >
                Envoyer à nouveau
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="p-8">
          {/* En-tête */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl mb-2">Mot de passe oublié ?</h1>
            <p className="text-gray-600">
              Entrez votre email pour recevoir un lien de réinitialisation
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleResetRequest} className="space-y-6">
            <div>
              <label className="block text-sm mb-2">Adresse email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Mail className="w-4 h-4" />
                  </motion.div>
                  <span>Envoi en cours...</span>
                </div>
              ) : (
                'Envoyer le lien de réinitialisation'
              )}
            </Button>
          </form>

          {/* Lien retour */}
          <div className="text-center mt-6">
            <Button
              variant="link"
              onClick={() => navigate('/login')}
              disabled={loading}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Retour à la connexion
            </Button>
          </div>

          {/* Option SMS */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg text-center">
            <p className="text-sm text-blue-800 mb-2">
              📱 Vous préférez recevoir un code par SMS ?
            </p>
            <Button
              variant="link"
              onClick={() => navigate('/auth/reset-password-by-phone')}
              disabled={loading}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Réinitialiser par téléphone
            </Button>
          </div>

          {/* Aide */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
            <p className="mb-2">💡 <strong>Besoin d'aide ?</strong></p>
            <p>Contactez l'administrateur si vous n'arrivez pas à réinitialiser votre mot de passe.</p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}