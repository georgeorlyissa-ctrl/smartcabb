import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useAppState } from '../../hooks/useAppState';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  Star,
  MapPin,
  Calendar,
  MessageCircle,
  Shield
} from 'lucide-react';

export function ClientInfoScreen() {
  const { setCurrentScreen, passengers } = useAppState();
  
  // Mock client data - in real app, this would come from current ride
  const client = passengers[0]; // Using first passenger as example

  const handleCallClient = () => {
    // In real app, would initiate call
    alert(`Appel vers ${client.phone}`);
  };

  const handleMessageClient = () => {
    // In real app, would open messaging
    alert(`Message vers ${client.name}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentScreen('navigation')}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl">Informations du client</h1>
              <p className="text-sm text-gray-600">Course en cours</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Profil principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold">{client.name}</h2>
                <p className="text-gray-600">Client SmartCabb</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">Compte vérifié</span>
                </div>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="flex space-x-3">
              <Button 
                onClick={handleCallClient}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                <Phone className="w-4 h-4 mr-2" />
                Appeler
              </Button>
              <Button 
                onClick={handleMessageClient}
                variant="outline"
                className="flex-1"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Informations de contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Informations de contact</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Téléphone</p>
                  <p className="font-medium">{client.phone}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{client.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Adresse</p>
                  <p className="font-medium">{client.address || 'Non renseignée'}</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Statistiques du client */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Historique du client</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">{client.totalRides || 0}</p>
                <p className="text-sm text-blue-600">Courses réalisées</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <p className="text-2xl font-bold text-green-600">4.8</p>
                </div>
                <p className="text-sm text-green-600">Note moyenne</p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {client.registeredAt 
                    ? new Date(client.registeredAt).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
                    : 'N/A'
                  }
                </p>
                <p className="text-sm text-purple-600">Membre depuis</p>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {client.favoritePaymentMethod === 'mobile_money' ? 'Mobile' :
                   client.favoritePaymentMethod === 'card' ? 'Carte' : 'Espèces'}
                </p>
                <p className="text-sm text-orange-600">Paiement préféré</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Notes importantes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Notes importantes</h3>
            
            <div className="space-y-3">
              <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
                <p className="text-sm">
                  <strong>Client régulier</strong> - Excellent historique de paiement
                </p>
              </div>
              
              <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-400">
                <p className="text-sm">
                  <strong>Communication</strong> - Toujours poli et respectueux
                </p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                <p className="text-sm">
                  <strong>Ponctualité</strong> - Généralement ponctuel aux points de rendez-vous
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Conseils de sécurité */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 bg-blue-50 border-blue-200">
            <div className="flex items-start space-x-3">
              <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-800 mb-2">Conseils de sécurité</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Vérifiez toujours l'identité du passager avant de démarrer</li>
                  <li>• Confirmez la destination avant le départ</li>
                  <li>• En cas de problème, contactez immédiatement le support</li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}