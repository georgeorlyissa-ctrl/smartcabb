import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useAppState } from '../../hooks/useAppState';
import { useTranslation } from '../../hooks/useTranslation';
import { usePayment } from '../../hooks/usePayment';
import { supabase } from '../../lib/supabase';
import { PaymentSuccessDialog } from '../PaymentSuccessDialog';
import { 
  ArrowLeft, 
  CreditCard, 
  Smartphone, 
  Banknote,
  Check,
  Shield,
  Clock,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { toast } from '../../lib/toast';
import { notifyPaymentReceived } from '../../lib/sms-service';

export function PaymentScreen() {
  const { t } = useTranslation();
  const { setCurrentScreen, state, updateRide, currentUser, drivers } = useAppState();
  const { initiatePayment, loading: paymentLoading } = usePayment();
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [waitingDriverConfirmation, setWaitingDriverConfirmation] = useState(false);

  const paymentMethod = state.currentRide?.paymentMethod;
  
  const getPaymentMethodDetails = () => {
    switch (paymentMethod) {
      case 'mobile_money':
        return {
          title: 'Mobile Money',
          subtitle: 'Airtel Money, M-Pesa, Orange Money',
          icon: Smartphone,
          color: 'bg-green-500',
          description: 'Paiement sécurisé via votre portefeuille mobile'
        };
      case 'card':
        return {
          title: 'Carte bancaire',
          subtitle: 'Visa, Mastercard',
          icon: CreditCard,
          color: 'bg-blue-500',
          description: 'Paiement par carte bancaire'
        };
      case 'cash':
        return {
          title: 'Espèces',
          subtitle: 'Paiement en liquide',
          icon: Banknote,
          color: 'bg-orange-500',
          description: 'Paiement en espèces au chauffeur'
        };
      default:
        return {
          title: 'Mobile Money',
          subtitle: 'Airtel Money, M-Pesa, Orange Money',
          icon: Smartphone,
          color: 'bg-green-500',
          description: 'Paiement sécurisé via votre portefeuille mobile'
        };
    }
  };

  const methodDetails = getPaymentMethodDetails();
  const Icon = methodDetails.icon;

  const handlePayment = async () => {
    if (!state.currentRide || !currentUser) {
      toast.error('Informations de course manquantes');
      return;
    }

    try {
      // Trouver le conducteur
      const driver = drivers.find(d => d.id === state.currentRide?.driverId);
      
      // Préparer les données de paiement
      const paymentData = {
        amount: totalAmount,
        currency: 'CDF' as const,
        rideId: state.currentRide.id,
        passengerId: currentUser.id,
        driverId: driver?.id || '',
        method: paymentMethod || 'cash',
        customerEmail: currentUser.email,
        customerPhone: currentUser.phone || '+243000000000',
        customerName: currentUser.name,
      };

      console.log('💳 Démarrage paiement:', paymentData);

      // ========== FLUX ESPÈCES ==========
      if (paymentMethod === 'cash') {
        console.log('💵 Paiement en espèces - Attente validation chauffeur');
        
        // Mettre à jour le statut de la course
        updateRide(state.currentRide.id, {
          status: 'completed',
          actualPrice: totalAmount,
          paymentStatus: 'pending_driver_confirmation'
        });
        
        // Activer l'écran d'attente
        setWaitingDriverConfirmation(true);
        toast.info('En attente de confirmation du chauffeur');
        
        // ✅ Écouter la confirmation du backend (polling toutes les 2 secondes)
        const checkPaymentConfirmation = setInterval(async () => {
          try {
            const response = await fetch(`https://${supabase.supabaseUrl.replace('https://', '')}/functions/v1/make-server-2eb02e52/rides/${state.currentRide!.id}`, {
              headers: { 'Authorization': `Bearer ${supabase.supabaseKey}` }
            });
            const data = await response.json();
            
            if (data.ride?.paymentStatus === 'paid') {
              clearInterval(checkPaymentConfirmation);
              console.log('✅ Chauffeur a confirmé le paiement');
              updateRide(state.currentRide!.id, { paymentStatus: 'paid' });
              setWaitingDriverConfirmation(false);
              setPaymentCompleted(true);
              setShowSuccessDialog(true);
              toast.success('Paiement reçu par le chauffeur !');
            }
          } catch (error) {
            console.error('Erreur vérification paiement:', error);
          }
        }, 2000);
        
        // Timeout après 5 minutes
        setTimeout(() => {
          clearInterval(checkPaymentConfirmation);
          if (waitingDriverConfirmation) {
            setWaitingDriverConfirmation(false);
            toast.error('Délai d\'attente dépassé. Contactez le chauffeur.');
          }
        }, 300000);
        
        return;
      }

      // ========== FLUX MOBILE MONEY / CARTE ==========
      const result = await initiatePayment(paymentData);

      if (result.success) {
        // Si c'est Flutterwave et qu'il y a une URL de redirection
        if (result.redirectUrl) {
          console.log('🔗 Redirection vers Flutterwave:', result.redirectUrl);
          
          // ✅ REDIRECTION DIRECTE vers Flutterwave
          window.location.href = result.redirectUrl;
          
          // Note: Le retour sera géré par le callback URL configuré dans Flutterwave
          // Pour l'instant on ne fait rien ici car l'utilisateur quitte la page
          
        } else {
          // Paiement immédiat (cas improbable pour mobile money)
          setPaymentCompleted(true);
          setShowSuccessDialog(true);
          
          updateRide(state.currentRide.id, {
            status: 'completed',
            actualPrice: totalAmount,
            paymentStatus: 'paid'
          });
          
          // 📱 SMS: Notifier le conducteur du paiement reçu
          if (driver) {
            notifyPaymentReceived(
              driver.phone || '+243999999999',
              totalAmount,
              methodDetails.title
            ).catch(err => console.error('❌ Erreur envoi SMS paiement:', err));
          }
          
          toast.success('Paiement effectué avec succès !');
        }
      } else {
        toast.error(result.message || 'Erreur lors du paiement');
      }
    } catch (error: any) {
      console.error('❌ Erreur paiement:', error);
      toast.error(error.message || 'Erreur lors du paiement');
    }
  };

  const baseAmount = state.currentRide?.actualPrice || state.currentRide?.estimatedPrice || 0;
  const totalAmount = baseAmount;

  // Ne plus afficher l'écran de confirmation, utiliser le dialogue

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="min-h-screen bg-gray-50"
    >
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentScreen('map')}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl">Paiement</h1>
              <p className="text-sm text-gray-600">Finaliser le paiement de votre course</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* ========== ÉCRAN D'ATTENTE VALIDATION CHAUFFEUR (ESPÈCES) ========== */}
        <AnimatePresence>
          {waitingDriverConfirmation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-6"
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="mb-6"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                  <Banknote className="w-12 h-12 text-white" />
                </div>
              </motion.div>

              {/* Animation de cercles */}
              <div className="relative mb-8">
                <motion.div
                  className="absolute inset-0 w-32 h-32 -left-16 -top-16 rounded-full border-4 border-orange-300"
                  animate={{
                    scale: [1, 1.5, 2],
                    opacity: [0.6, 0.3, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut"
                  }}
                />
              </div>

              <div className="text-center space-y-4 max-w-md">
                <h2 className="text-2xl font-bold text-orange-800">
                  Paiement en cours de validation
                </h2>
                <p className="text-orange-700">
                  En attente de confirmation du chauffeur...
                </p>
                <p className="text-sm text-orange-600">
                  Le chauffeur confirmera la réception du paiement en espèces depuis son application.
                </p>

                {/* Montant */}
                <div className="bg-orange-50 rounded-2xl p-6 border-2 border-orange-200 mt-6">
                  <p className="text-sm text-orange-600 mb-2">Montant payé</p>
                  <p className="text-4xl font-bold text-orange-800">
                    {totalAmount.toLocaleString()} <span className="text-2xl">CDF</span>
                  </p>
                </div>

                {/* Loader */}
                <div className="flex items-center justify-center space-x-2 mt-6">
                  <motion.div
                    className="w-3 h-3 bg-orange-500 rounded-full"
                    animate={{ y: [-10, 0, -10] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="w-3 h-3 bg-orange-500 rounded-full"
                    animate={{ y: [-10, 0, -10] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div
                    className="w-3 h-3 bg-orange-500 rounded-full"
                    animate={{ y: [-10, 0, -10] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Résumé de la course */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-4 mb-6">
            <h2 className="font-semibold mb-4">Résumé de la course</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Montant de base</span>
                <span className="font-semibold">
                  {baseAmount.toLocaleString()} CDF
                </span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="font-semibold">Montant total</span>
                <span className="text-2xl font-bold text-green-600">
                  {totalAmount.toLocaleString()} CDF
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Durée de la course</span>
                <span className="font-semibold">
                  {state.currentRide?.estimatedDuration || 15} min
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Distance</span>
                <span className="font-semibold">
                  {state.currentRide?.distanceKm?.toFixed(1) || '5.2'} km
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type de véhicule</span>
                <span className="font-semibold capitalize">
                  {(state.currentRide?.vehicleType || 'smart_standard').replace('_', ' ')}
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Méthode de paiement sélectionnée */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4 mb-6">
            <h3 className="font-semibold mb-4">Méthode de paiement</h3>
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 ${methodDetails.color} rounded-full flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">{methodDetails.title}</h4>
                <p className="text-sm text-gray-600">{methodDetails.subtitle}</p>
                <p className="text-sm text-gray-700 mt-1">{methodDetails.description}</p>
              </div>
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Instructions spécifiques selon le mode de paiement */}
        {paymentMethod === 'cash' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-4 mb-6 bg-orange-50 border-orange-200">
              <div className="flex items-start space-x-3">
                <Banknote className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-orange-800 mb-1">Paiement en espèces</h3>
                  <p className="text-sm text-orange-700">
                    Assurez-vous d'avoir payé le montant exact au chauffeur avant de confirmer le paiement.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Informations de sécurité */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
            <div className="flex items-start space-x-3">
              <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-800 mb-1">Transaction sécurisée</h3>
                <p className="text-sm text-blue-700">
                  Votre paiement est protégé et crypté. SmartCabb garantit la sécurité de vos transactions.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Bouton de paiement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button 
            onClick={handlePayment}
            disabled={paymentLoading || paymentCompleted}
            className="w-full py-3"
            size="lg"
          >
            {paymentLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Traitement en cours...
              </div>
            ) : paymentCompleted ? (
              <div className="flex items-center justify-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Paiement effectué
              </div>
            ) : (
              paymentMethod === 'cash' 
                ? 'Confirmer le paiement en espèces'
                : `Payer ${totalAmount.toLocaleString()} CDF`
            )}
          </Button>
        </motion.div>
      </div>

      {/* Payment Success Dialog */}
      {state.currentRide && (
        <PaymentSuccessDialog
          isOpen={showSuccessDialog}
          onClose={() => setShowSuccessDialog(false)}
          ride={state.currentRide}
          onRateDriver={() => setCurrentScreen('rating')}
        />
      )}
    </motion.div>
  );
}