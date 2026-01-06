import { useState, useEffect } from 'react';
import { motion } from '../../framer-motion';
import { Settings, DollarSign, Clock, MapPin, Percent, Globe, Bell } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import { useAppState } from '../../hooks/useAppState';
import { toast } from 'sonner';

export function GlobalSettingsScreen() {
  const { setCurrentScreen } = useAppState();
  const { settings, updateSetting, updateSettings, resetToDefaults, loading } = useSettings();
  
  // État local pour les modifications
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);

  // Mise à jour d'un paramètre local
  const handleChange = <K extends keyof typeof settings>(
    key: K,
    value: typeof settings[K]
  ) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // Sauvegarder tous les changements
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await updateSettings(localSettings);
      
      if (success) {
        toast.success('Paramètres mis à jour avec succès', {
          description: 'Les modifications seront appliquées partout dans l\'application',
        });
      } else {
        toast.error('Erreur lors de la mise à jour', {
          description: 'Certains paramètres n\'ont pas pu être sauvegardés',
        });
      }
    } catch (error) {
      toast.error('Erreur', {
        description: 'Impossible de sauvegarder les paramètres',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Réinitialiser aux valeurs par défaut
  const handleReset = async () => {
    if (confirm('Voulez-vous vraiment réinitialiser tous les paramètres aux valeurs par défaut ?')) {
      const success = await resetToDefaults();
      
      if (success) {
        setLocalSettings(settings);
        toast.success('Paramètres réinitialisés', {
          description: 'Tous les paramètres ont été restaurés aux valeurs par défaut',
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentScreen('admin-dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              <div>
                <h1 className="text-2xl">Paramètres Globaux</h1>
                <p className="text-sm text-gray-600">
                  Les modifications s'appliquent à toute l'application
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={isSaving}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Réinitialiser
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving || loading}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Commission */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Percent className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Commission</h3>
                  <p className="text-sm text-gray-600">Taux appliqué sur chaque course</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="commissionRate">Taux de commission (%)</Label>
                  <Input
                    id="commissionRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={localSettings.commissionRate}
                    onChange={(e) => handleChange('commissionRate', parseFloat(e.target.value))}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Actuellement : {localSettings.commissionRate}%
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Tarification */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Tarification</h3>
                  <p className="text-sm text-gray-600">Horaires et multiplicateurs</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nightTimeStart">Début nuit</Label>
                    <Input
                      id="nightTimeStart"
                      type="time"
                      value={localSettings.nightTimeStart}
                      onChange={(e) => handleChange('nightTimeStart', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nightTimeEnd">Fin nuit</Label>
                    <Input
                      id="nightTimeEnd"
                      type="time"
                      value={localSettings.nightTimeEnd}
                      onChange={(e) => handleChange('nightTimeEnd', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="freeWaitingMinutes">Minutes d'attente gratuites</Label>
                  <Input
                    id="freeWaitingMinutes"
                    type="number"
                    min="0"
                    max="60"
                    value={localSettings.freeWaitingMinutes}
                    onChange={(e) => handleChange('freeWaitingMinutes', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="distantZoneMultiplier">Multiplicateur zone lointaine (×)</Label>
                  <Input
                    id="distantZoneMultiplier"
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={localSettings.distantZoneMultiplier}
                    onChange={(e) => handleChange('distantZoneMultiplier', parseFloat(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Paiement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Paiement</h3>
                  <p className="text-sm text-gray-600">Options de paiement</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Post-paiement activé</Label>
                    <p className="text-xs text-gray-500">Permettre le paiement après la course</p>
                  </div>
                  <Switch
                    checked={localSettings.postpaidEnabled}
                    onCheckedChange={(checked) => handleChange('postpaidEnabled', checked)}
                  />
                </div>

                {localSettings.postpaidEnabled && (
                  <div>
                    <Label htmlFor="postpaidFee">Frais post-paiement (CDF)</Label>
                    <Input
                      id="postpaidFee"
                      type="number"
                      min="0"
                      step="100"
                      value={localSettings.postpaidFee}
                      onChange={(e) => handleChange('postpaidFee', parseInt(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Flutterwave activé</Label>
                    <p className="text-xs text-gray-500">Paiement par carte/mobile money</p>
                  </div>
                  <Switch
                    checked={localSettings.flutterwaveEnabled}
                    onCheckedChange={(checked) => handleChange('flutterwaveEnabled', checked)}
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* SMS & Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Bell className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Notifications</h3>
                  <p className="text-sm text-gray-600">SMS et alertes</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notifications activées</Label>
                    <p className="text-xs text-gray-500">Notifications push et email</p>
                  </div>
                  <Switch
                    checked={localSettings.notificationsEnabled}
                    onCheckedChange={(checked) => handleChange('notificationsEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>SMS activés</Label>
                    <p className="text-xs text-gray-500">Envoi de SMS aux utilisateurs</p>
                  </div>
                  <Switch
                    checked={localSettings.smsEnabled}
                    onCheckedChange={(checked) => handleChange('smsEnabled', checked)}
                  />
                </div>

                {localSettings.smsEnabled && (
                  <div>
                    <Label htmlFor="smsProvider">Fournisseur SMS</Label>
                    <select
                      id="smsProvider"
                      value={localSettings.smsProvider}
                      onChange={(e) => handleChange('smsProvider', e.target.value as any)}
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                    >
                      <option value="africas_talking">Africa's Talking</option>
                      <option value="twilio">Twilio</option>
                      <option value="disabled">Désactivé</option>
                    </select>
                  </div>
                )}

                {/* Bouton pour accéder aux paramètres SMS détaillés */}
                {localSettings.smsEnabled && (
                  <div className="pt-4 border-t">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setCurrentScreen('sms-settings')}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Configurer & Tester les SMS
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                      Accédez aux paramètres détaillés, testez l'envoi et consultez l'historique
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Système */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Settings className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Système</h3>
                  <p className="text-sm text-gray-600">Paramètres avancés</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="appVersion">Version de l'application</Label>
                  <Input
                    id="appVersion"
                    type="text"
                    value={localSettings.appVersion}
                    onChange={(e) => handleChange('appVersion', e.target.value)}
                    className="mt-1"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Version actuelle : {localSettings.appVersion}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mode maintenance</Label>
                    <p className="text-xs text-gray-500">Désactiver temporairement l'application</p>
                  </div>
                  <Switch
                    checked={localSettings.maintenanceMode}
                    onCheckedChange={(checked) => handleChange('maintenanceMode', checked)}
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Informations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6 bg-blue-50 border-blue-200">
              <div className="flex items-start space-x-3">
                <RefreshCw className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Propagation automatique
                  </h4>
                  <p className="text-sm text-blue-800">
                    Les modifications apportées ici seront automatiquement appliquées dans toute l'application :
                  </p>
                  <ul className="text-sm text-blue-800 mt-2 space-y-1 ml-4 list-disc">
                    <li>Page d'accueil</li>
                    <li>Interface passager</li>
                    <li>Interface conducteur</li>
                    <li>Panel administrateur</li>
                    <li>Calculs de prix</li>
                    <li>Notifications SMS</li>
                  </ul>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}