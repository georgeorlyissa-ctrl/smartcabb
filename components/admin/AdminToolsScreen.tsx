import { useState } from 'react';
import {
  RefreshCw,
  Trash2,
  Database,
  AlertTriangle,
  ArrowLeft,
  Download,
  Upload,
  Settings,
  CheckCircle
} from '../../lib/icons';
import { toast } from '../../lib/toast';
import { motion } from '../../lib/motion';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useAppState } from '../../hooks/useAppState';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

export function AdminToolsScreen() {
  const { setCurrentScreen } = useAppState();
  const [cleaning, setCleaning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncUserId, setSyncUserId] = useState('');
  const [syncResult, setSyncResult] = useState<any>(null);

  const handleCleanupAuthUsers = async () => {
    if (!confirm('⚠️ ATTENTION : Cette action va supprimer TOUS les utilisateurs auth (sauf les admins). Continuer ?')) {
      return;
    }

    setCleaning(true);
    setResult(null);
    
    try {
      console.log('🧹 Nettoyage des auth users orphelins...');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/cleanup-auth-users`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors du nettoyage');
      }

      console.log('✅ Résultat:', data);
      setResult(data);

      toast.success(data.message, {
        description: `${data.details.deleted} utilisateurs supprimés, ${data.details.kept} admins conservés.`
      });

    } catch (error) {
      console.error('❌ Erreur lors du nettoyage:', error);
      toast.error('Erreur lors du nettoyage des auth users');
    } finally {
      setCleaning(false);
    }
  };

  const handleSyncWallet = async () => {
    if (!syncUserId.trim()) {
      toast.error('Veuillez entrer un ID utilisateur');
      return;
    }

    setSyncing(true);
    setSyncResult(null);
    
    try {
      console.log('🔄 Synchronisation wallet KV -> Supabase pour:', syncUserId);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/wallet/sync-kv-to-supabase/${syncUserId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la synchronisation');
      }

      console.log('✅ Résultat:', data);
      setSyncResult(data);

      toast.success(data.message, {
        description: data.migrated ? 
          `Solde mis à jour: ${data.oldBalance} CDF → ${data.newBalance} CDF` :
          'Le solde était déjà synchronisé'
      });

    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la synchronisation');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setCurrentScreen('admin-dashboard')}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-2xl">Outils d'administration</h1>
              <p className="text-sm text-gray-600">Maintenance et nettoyage</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Warning Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900">⚠️ Attention</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Ces outils sont réservés aux administrateurs expérimentés. 
                  Certaines actions sont irréversibles.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Cleanup Auth Users Tool */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl mb-2">Nettoyer les utilisateurs auth orphelins</h2>
                <p className="text-gray-600 text-sm mb-4">
                  Cet outil supprime tous les utilisateurs de Supabase Auth qui n'ont pas de profil admin dans le KV store. 
                  Utile après une suppression manuelle de données ou pour résoudre des problèmes d'inscription.
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Cette action va :</h4>
                  <ul className="space-y-1 text-sm text-blue-700">
                    <li>✓ Lister tous les utilisateurs auth</li>
                    <li>✓ Identifier les administrateurs à conserver</li>
                    <li>✓ Supprimer tous les autres utilisateurs</li>
                    <li>✓ Permettre aux utilisateurs de se réinscrire avec leurs anciens identifiants</li>
                  </ul>
                </div>

                <Button
                  onClick={handleCleanupAuthUsers}
                  disabled={cleaning}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {cleaning ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Nettoyage en cours...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Trash2 className="w-4 h-4" />
                      <span>Nettoyer maintenant</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>

            {/* Result Display */}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-900 mb-2">Nettoyage terminé avec succès !</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Total</p>
                        <p className="text-lg font-semibold text-gray-900">{result.details.total}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Supprimés</p>
                        <p className="text-lg font-semibold text-red-600">{result.details.deleted}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Conservés</p>
                        <p className="text-lg font-semibold text-green-600">{result.details.kept}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </Card>
        </motion.div>

        {/* Sync Wallet Tool */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-6"
        >
          <Card className="p-6">
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <RefreshCw className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl mb-2">Synchroniser Wallet KV Store → Supabase</h2>
                <p className="text-gray-600 text-sm mb-4">
                  Cet outil synchronise le solde du wallet d'un utilisateur depuis le KV store vers la table Supabase profiles. 
                  Utile pour résoudre les problèmes de solde manquant sur d'autres appareils.
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Cette action va :</h4>
                  <ul className="space-y-1 text-sm text-blue-700">
                    <li>✓ Récupérer le solde du passager dans le KV store</li>
                    <li>✓ Récupérer le solde dans Supabase profiles</li>
                    <li>✓ Mettre à jour Supabase avec le solde du KV store</li>
                    <li>✓ Permettre la synchronisation multi-device</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID Utilisateur (User ID)
                    </label>
                    <input
                      type="text"
                      value={syncUserId}
                      onChange={(e) => setSyncUserId(e.target.value)}
                      placeholder="Exemple: 1234abcd-5678-90ef-ghij-klmnopqrstuv"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <Button
                    onClick={handleSyncWallet}
                    disabled={syncing || !syncUserId.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {syncing ? (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Synchronisation en cours...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        <span>Synchroniser maintenant</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Result Display */}
            {syncResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-900 mb-2">Synchronisation terminée avec succès !</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Ancien solde (Supabase)</p>
                        <p className="text-lg font-semibold text-gray-900">{syncResult.oldBalance} CDF</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Nouveau solde</p>
                        <p className="text-lg font-semibold text-green-600">{syncResult.newBalance} CDF</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Statut</p>
                        <p className="text-lg font-semibold text-blue-600">
                          {syncResult.migrated ? '🔄 Migré' : '✓ Déjà sync'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </Card>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <Card className="p-6">
            <h3 className="font-semibold mb-3">ℹ️ Quand utiliser cet outil ?</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                <span>Lorsqu'un utilisateur ne peut pas s'inscrire car "le téléphone existe déjà" alors que le compte a été supprimé</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                <span>Après avoir supprimé manuellement des données du KV store</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                <span>Pour nettoyer complètement la base avant des tests</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                <span>Lorsque des utilisateurs orphelins causent des problèmes d'authentification</span>
              </li>
            </ul>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}