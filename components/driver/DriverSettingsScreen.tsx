import { useState, useEffect } from 'react';
import {
  Settings,
  Bell,
  Shield,
  Globe,
  DollarSign,
  Navigation,
  Save,
  RefreshCw,
  ArrowLeft,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  MapPin,
  Clock
} from '../../lib/icons';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { useAppState } from '../../hooks/useAppState';
// Removed duplicate imports - using imports from line 2-17

export function DriverSettingsScreen() {
  const { setCurrentScreen, state, setCurrentDriver, setCurrentView } = useAppState();
  const [settings, setSettings] = useState({
    notifications: {
      newRides: true,
      payments: true,
      promotions: false,
      system: true
    },
    privacy: {
      shareLocation: true,
      showProfile: true,
      allowDirectContact: false
    },
    preferences: {
      darkMode: false,
      soundEffects: true,
      autoAcceptRadius: 5,
      workHours: {
        start: '06:00',
        end: '22:00'
      }
    }
  });

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const settingSections = [
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        {
          key: 'newRides',
          label: 'Nouvelles demandes de course',
          description: 'Recevoir des notifications pour les nouvelles courses',
          type: 'switch',
          category: 'notifications'
        },
        {
          key: 'payments',
          label: 'Paiements reçus',
          description: 'Notifications de confirmation de paiement',
          type: 'switch',
          category: 'notifications'
        },
        {
          key: 'promotions',
          label: 'Promotions et offres',
          description: 'Recevoir des informations sur les promotions',
          type: 'switch',
          category: 'notifications'
        },
        {
          key: 'system',
          label: 'Mises à jour système',
          description: 'Notifications importantes du système',
          type: 'switch',
          category: 'notifications'
        }
      ]
    },
    {
      title: 'Confidentialité',
      icon: Shield,
      items: [
        {
          key: 'shareLocation',
          label: 'Partager ma position',
          description: 'Permettre aux clients de voir votre position',
          type: 'switch',
          category: 'privacy'
        },
        {
          key: 'showProfile',
          label: 'Profil visible',
          description: 'Afficher votre profil aux clients',
          type: 'switch',
          category: 'privacy'
        },
        {
          key: 'allowDirectContact',
          label: 'Contact direct',
          description: 'Permettre aux clients de vous contacter directement',
          type: 'switch',
          category: 'privacy'
        }
      ]
    },
    {
      title: 'Préférences',
      icon: Settings,
      items: [
        {
          key: 'darkMode',
          label: 'Mode sombre',
          description: 'Utiliser le thème sombre de l\'application',
          type: 'switch',
          category: 'preferences'
        },
        {
          key: 'soundEffects',
          label: 'Effets sonores',
          description: 'Activer les sons de notification',
          type: 'switch',
          category: 'preferences'
        }
      ]
    }
  ];

  const quickActions = [
    {
      title: 'Zone de travail',
      description: 'Définir votre zone de service préférée',
      icon: MapPin,
      action: () => {
        // Navigate to zone settings
      }
    },
    {
      title: 'Informations véhicule',
      description: 'Modifier les détails de votre véhicule',
      icon: Car,
      action: () => {
        // Navigate to vehicle settings
      }
    },
    {
      title: 'Paramètres de gain',
      description: 'Configuration des revenus et bonus',
      icon: DollarSign,
      action: () => {
        // Navigate to earnings settings
      }
    },
    {
      title: 'Navigation',
      description: 'Préférences de navigation GPS',
      icon: Navigation,
      action: () => {
        // Navigate to navigation settings
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentScreen('driver-dashboard')}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl">Paramètres</h1>
              <p className="text-sm text-gray-600">Configuration de votre compte chauffeur</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Profil rapide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                {state.currentDriver?.photo ? (
                  <img 
                    src={state.currentDriver.photo} 
                    alt={state.currentDriver.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-blue-600" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{state.currentDriver?.name}</h2>
                <p className="text-gray-600">
                  {state.currentDriver?.vehicleInfo 
                    ? `${state.currentDriver.vehicleInfo.make} ${state.currentDriver.vehicleInfo.model}`
                    : 'Véhicule non configuré'
                  }
                </p>
                <div className="flex items-center space-x-4 mt-2 text-sm">
                  <span className="text-green-600">● En ligne</span>
                  <span className="text-gray-600">Note: {state.currentDriver?.rating}/5</span>
                  <span className="text-gray-600">{state.currentDriver?.totalRides} courses</span>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setCurrentScreen('driver-profile')}>
                Modifier profil
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Actions rapides */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Actions rapides</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.div
                    key={action.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                  >
                    <Button
                      variant="outline"
                      className="w-full h-auto p-4 justify-start"
                      onClick={action.action}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-medium">{action.title}</h4>
                          <p className="text-sm text-gray-600">{action.description}</p>
                        </div>
                      </div>
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* Paramètres détaillés */}
        {settingSections.map((section, sectionIndex) => {
          const SectionIcon = section.icon;
          return (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + sectionIndex * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <SectionIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold">{section.title}</h3>
                </div>
                
                <div className="space-y-4">
                  {section.items.map((item, itemIndex) => (
                    <motion.div
                      key={item.key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + sectionIndex * 0.1 + itemIndex * 0.05 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <Label htmlFor={item.key} className="text-sm font-medium">
                          {item.label}
                        </Label>
                        <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                      </div>
                      
                      {item.type === 'switch' && (
                        <Switch
                          id={item.key}
                          checked={settings[item.category as keyof typeof settings][item.key as keyof any]}
                          onCheckedChange={(checked) => 
                            updateSetting(item.category, item.key, checked)
                          }
                        />
                      )}
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          );
        })}

        {/* Paramètres avancés */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Paramètres avancés</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Rayon d'acceptation automatique</Label>
                  <p className="text-xs text-gray-600">Distance maximale pour accepter automatiquement les courses</p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={settings.preferences.autoAcceptRadius}
                    onChange={(e) => updateSetting('preferences', 'autoAcceptRadius', parseInt(e.target.value))}
                    className="w-20"
                  />
                  <span className="text-sm font-medium">{settings.preferences.autoAcceptRadius}km</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Heures de travail</Label>
                  <p className="text-xs text-gray-600">Définir vos heures de disponibilité préférées</p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="time"
                    value={settings.preferences.workHours.start}
                    onChange={(e) => updateSetting('preferences', 'workHours', {
                      ...settings.preferences.workHours,
                      start: e.target.value
                    })}
                    className="px-2 py-1 border rounded text-sm"
                  />
                  <span className="text-xs">à</span>
                  <input
                    type="time"
                    value={settings.preferences.workHours.end}
                    onChange={(e) => updateSetting('preferences', 'workHours', {
                      ...settings.preferences.workHours,
                      end: e.target.value
                    })}
                    className="px-2 py-1 border rounded text-sm"
                  />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Actions système */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Support et aide</h3>
            
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <HelpCircle className="w-5 h-5 mr-3" />
                Centre d'aide
              </Button>
              
              <a href="tel:+243990666661" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <Smartphone className="w-5 h-5 mr-3" />
                  Contacter le support (+243 990 666 661)
                </Button>
              </a>
              
              <Button 
                variant="outline" 
                className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => {
                  console.log('🚪 Déconnexion du conducteur');
                  setCurrentDriver(null);
                  // Pas besoin de changer currentView, juste l'écran
                  setCurrentScreen('landing');
                }}
              >
                <LogOut className="w-5 h-5 mr-3" />
                Se déconnecter
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}