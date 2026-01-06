import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useAppState } from '../../hooks/useAppState';
import { toast } from 'sonner';
import { PreciseGPSTracker, reverseGeocode, isMobileDevice } from '../../lib/precise-gps';

export function MapScreen() {
  const { state, setCurrentScreen, setCurrentUser, setCurrentView, setPickup, setDestination: setGlobalDestination, setPickupInstructions, drivers } = useAppState();
  const [destination, setDestination] = useState('');
  const [pickupInstructions, setLocalPickupInstructions] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  
  // 🔍 Debug: Log quand destination change
  useEffect(() => {
    console.log('🎯 MapScreen - destination a changé:', destination);
  }, [destination]);

  // ✅ NOUVEAU SYSTÈME GPS ULTRA-PRÉCIS
  const [gpsTracker] = useState(() => new PreciseGPSTracker());
  
  // États pour la géolocalisation
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number; address: string; accuracy?: number }>({
    lat: -4.3276,
    lng: 15.3136,
    address: '📍 Détection de votre position GPS...',
    accuracy: 1000
  });
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [positionLocked, setPositionLocked] = useState(false); // ✅ NOUVEAU : Position verrouillée ?
  
  // États pour l'UI
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);

  // 🚗 FILTRER LES CONDUCTEURS EN LIGNE
  const onlineDrivers = drivers.filter(d => d.isOnline && d.documentsVerified);

  // Charger la dernière position connue du cache immédiatement
  useEffect(() => {
    // ✅ v517.96: NE PLUS charger le cache au démarrage - toujours demander la vraie position GPS
    // Le cache sera utilisé UNIQUEMENT si le GPS échoue dans le callback onError
    console.log('🚀 v517.96: Démarrage sans cache - Position GPS réelle demandée');
    
    // Supprimer l'ancien cache pour forcer une nouvelle détection
    const cachedLocation = localStorage.getItem('smartcabb_last_location');
    if (cachedLocation) {
      try {
        const parsed = JSON.parse(cachedLocation);
        const cacheAge = Date.now() - (parsed.timestamp || 0);
        const isOldCache = cacheAge > 5 * 60 * 1000; // Plus de 5 minutes
        
        if (isOldCache) {
          console.log('🗑️ Cache trop ancien (>5min) - Suppression pour forcer GPS frais');
          localStorage.removeItem('smartcabb_last_location');
        }
      } catch (e) {
        console.error('Erreur lecture cache:', e);
        localStorage.removeItem('smartcabb_last_location');
      }
    }
  }, []);

  // Obtenir et suivre la position réelle de l'utilisateur au chargement
  useEffect(() => {
    console.log('🚀 Démarrage du système GPS ultra-précis...');
    
    // 🎯 NOUVEAU SYSTÈME GPS ULTRA-PRÉCIS
    gpsTracker.start({
      // Callback: Position mise à jour
      onPositionUpdate: async (position) => {
        console.log('📍 Position mise à jour:', {
          coords: `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`,
          accuracy: `±${Math.round(position.accuracy)}m`
        });
        
        // Convertir les coordonnées en adresse
        const address = await reverseGeocode(position.lat, position.lng);
        
        const newLocation = {
          lat: position.lat,
          lng: position.lng,
          address: address,
          accuracy: position.accuracy
        };
        
        setCurrentLocation(newLocation);
        
        // Mettre à jour le pickup global si pas encore défini
        if (setPickup) {
          setPickup({
            lat: position.lat,
            lng: position.lng,
            address: address
          });
        }
        
        // ✅ v517.96: Sauvegarder avec timestamp pour détecter cache ancien
        const locationWithTimestamp = {
          ...newLocation,
          timestamp: Date.now()
        };
        localStorage.setItem('smartcabb_last_location', JSON.stringify(locationWithTimestamp));
        
        // ✅ Première position obtenue : fermer le toast de chargement
        setLoadingLocation(false);
        toast.dismiss('gps-search');
      },
      
      // Callback: Précision cible atteinte
      onAccuracyReached: (position) => {
        console.log('🎯 Précision optimale atteinte !', {
          coords: `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`,
          accuracy: `±${Math.round(position.accuracy)}m`
        });
        
        setPositionLocked(true);
        
        // 🆕 v517.92: RETIRER le toast - Uber n'en a pas non plus !
        // toast.success('📍 Position GPS précise verrouillée !', {
        //   duration: 3000
        // });
      },
      
      // Callback: Erreur GPS
      onError: (error) => {
        console.error('❌ Erreur GPS:', error);
        setLoadingLocation(false);
        
        // Position par défaut Kinshasa
        const defaultLocation = {
          lat: -4.3276,
          lng: 15.3136,
          address: 'Boulevard du 30 Juin, Gombe, Kinshasa',
          accuracy: 1000
        };
        setCurrentLocation(defaultLocation);
        localStorage.setItem('smartcabb_last_location', JSON.stringify(defaultLocation));
        
        toast.dismiss('gps-search');
      },
      
      // 🆕 v517.91: DÉSACTIVER verrouillage auto pour garder position GPS en temps réel
      lockOnAccuracy: false,
      
      // 🆕 v517.92: MODE INSTANTANÉ (comme Uber/Yango)
      instantMode: true
    });
    
    // 🆕 v517.92: RETIRER le toast agaçant - Uber n'en a pas !
    // toast.loading('🛰️ Recherche de votre position GPS...', { id: 'gps-search', duration: 10000 });
    
    // Cleanup: arrêter le tracking lors du démontage
    return () => {
      gpsTracker.stop();
      console.log('🛑 Arrêt du suivi GPS');
    };
  }, []);

  const handleConfirmDestination = () => {
    if (!destination.trim()) return;
    
    // 🔍 VÉRIFICATION: S'assurer qu'on a une vraie position GPS, pas la position par défaut
    if (currentLocation && setPickup) {
      // ⚠️ Ne pas enregistrer les positions par défaut (Gombe) comme position réelle
      const isDefaultPosition = 
        currentLocation.address === 'Boulevard du 30 Juin, Gombe, Kinshasa' ||
        currentLocation.address === 'Boulevard du 30 Juin, Gombe, Kinshasa, RDC' ||
        (currentLocation.lat === -4.3276 && currentLocation.lng === 15.3136 && currentLocation.accuracy && currentLocation.accuracy >= 100);
      
      if (isDefaultPosition) {
        console.debug('⚠️ Position approximative utilisée - Le GPS n\'est peut-être pas activé');
        // Utiliser la position par défaut silencieusement
        setPickup({
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          address: currentLocation.address
        });
      } else {
        // Position GPS réelle détectée
        setPickup({
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          address: currentLocation.address
        });
        console.log('✅ Position GPS réelle utilisée:', currentLocation.address);
      }
    }
    
    // Enregistrer la destination dans l'état global
    if (setGlobalDestination) {
      // Générer des coordonnées approximatives si pas de coordonnées spécifiques
      const baseLatKinshasa = -4.3276;
      const baseLngKinshasa = 15.3136;
      const randomOffset = () => (Math.random() - 0.5) * 0.1; // ±5km environ
      
      setGlobalDestination({
        lat: baseLatKinshasa + randomOffset(),
        lng: baseLngKinshasa + randomOffset(),
        address: destination.trim()
      });
      console.log('🎯 Destination enregistrée:', destination.trim());
    }
    
    // Enregistrer les instructions de prise en charge
    if (setPickupInstructions) {
      setPickupInstructions(pickupInstructions);
      console.log('📍 Instructions enregistrées:', pickupInstructions);
    }
    
    setCurrentScreen('estimate');
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* Header moderne avec gradient */}
      <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 shadow-lg">
        <div className="flex items-center justify-between px-4 h-16">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowMenu(!showMenu)}
            className="w-10 h-10 text-white hover:bg-white/20 transition-all"
          >
            <Menu className="w-6 h-6" />
          </Button>
          
          <div className="flex flex-col items-center">
            <h1 className="text-xl font-bold text-white tracking-tight">
              SmartCabb
            </h1>
            <p className="text-xs text-white/80">
              Bonjour, {state.currentUser?.name?.split(' ')[0] || 'Voyageur'}
            </p>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentScreen('profile')}
            className="w-10 h-10 text-white hover:bg-white/20 transition-all"
          >
            <User className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Carte plein écran avec overlay subtil */}
      <div className="fixed top-16 left-0 right-0 z-10" style={{ height: '35vh' }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent pointer-events-none z-10" />
        
        {/* ✅ CARTE INTERACTIVE RÉACTIVÉE - Chargement rapide optimisé */}
        <InteractiveMapView
          center={currentLocation}
          drivers={onlineDrivers}
          zoom={13}
          className="w-full h-full"
          showUserLocation={true}
          enableGeolocation={true}
          onLocationUpdate={(location) => {
            setCurrentLocation(location);
            console.log('📍 Position mise à jour:', location);
          }}
        />
        
        {/* Pin central */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[5] pointer-events-none">
          <div className="relative">
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-black/20 rounded-full blur-sm" />
            <div className="relative">
              <MapPin className="w-10 h-10 text-green-500 filter drop-shadow-lg" fill="currentColor" />
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white rounded-full" />
            </div>
          </div>
        </div>

        {/* 📍 AFFICHAGE DE LA POSITION ACTUELLE */}
        <div className="absolute top-3 left-3 right-3 z-20 pointer-events-none">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg px-4 py-3 border border-gray-200">
            <div className="flex items-start gap-3">
              <div className="bg-green-500 p-2 rounded-full flex-shrink-0">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-0.5">Votre position actuelle</p>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {loadingLocation ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Localisation en cours...
                    </span>
                  ) : (
                    currentLocation.address
                  )}
                </p>
                {currentLocation.accuracy && currentLocation.accuracy < 100 && !loadingLocation && (
                  <p className="text-xs text-green-600 mt-0.5">
                    ✓ Précision: ±{Math.round(currentLocation.accuracy)}m
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bouton GPS - Repositionné en bas à droite de la carte */}
        <Button
          variant="outline"
          size="icon"
          className="absolute bottom-3 right-3 w-11 h-11 bg-white shadow-lg rounded-full border-2 z-20"
          onClick={() => {
            // ✅ Déverrouiller et relancer le GPS
            toast.info('🔄 Réinitialisation GPS...', { duration: 2000 });
            setLoadingLocation(true);
            setPositionLocked(false);
            gpsTracker.unlock(); // Déverrouiller la position
            
            // Supprimer le cache
            localStorage.removeItem('smartcabb_last_location');
            
            // Redémarrer le tracking
            gpsTracker.stop();
            setTimeout(() => {
              // Relancer après un court délai
              gpsTracker.start({
                onPositionUpdate: async (position) => {
                  const address = await reverseGeocode(position.lat, position.lng);
                  const newLocation = {
                    lat: position.lat,
                    lng: position.lng,
                    address: address,
                    accuracy: position.accuracy
                  };
                  setCurrentLocation(newLocation);
                  if (setPickup) {
                    setPickup({
                      lat: position.lat,
                      lng: position.lng,
                      address: address
                    });
                  }
                  localStorage.setItem('smartcabb_last_location', JSON.stringify(newLocation));
                },
                onAccuracyReached: (position) => {
                  setPositionLocked(true);
                  setLoadingLocation(false);
                  toast.dismiss('gps-search');
                  toast.success('📍 Position précise verrouillée !', {
                    description: `±${Math.round(position.accuracy)}m`,
                    duration: 3000
                  });
                },
                onError: (error) => {
                  setLoadingLocation(false);
                  const defaultLocation = {
                    lat: -4.3276,
                    lng: 15.3136,
                    address: 'Boulevard du 30 Juin, Gombe, Kinshasa',
                    accuracy: 1000
                  };
                  setCurrentLocation(defaultLocation);
                  localStorage.setItem('smartcabb_last_location', JSON.stringify(defaultLocation));
                  toast.dismiss('gps-search');
                },
                // 🆕 v517.91: DÉSACTIVER verrouillage auto
                lockOnAccuracy: false
              });
              toast.loading('🛰️ Recherche de votre position GPS...', { id: 'gps-search', duration: 10000 });
            }, 100);
          }}
          disabled={loadingLocation}
        >
          {loadingLocation ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Panneau flottant - Commence juste après la carte */}
      <motion.div
        initial={false}
        animate={{ 
          top: isPanelExpanded ? 'calc(35vh + 64px)' : 'calc(35vh + 64px)',
          height: isPanelExpanded ? 'calc(65vh - 64px)' : 'auto'
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="absolute left-0 right-0 bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.15)] z-30 flex flex-col"
      >
        {/* Barre de glissière */}
        <div 
          className="flex justify-center py-2 cursor-pointer active:bg-gray-50 flex-shrink-0"
          onClick={() => setIsPanelExpanded(!isPanelExpanded)}
        >
          <div className="w-10 h-1 bg-gray-400 rounded-full" />
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto px-4 pb-safe">
          {/* Destination compacte */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="bg-blue-500 p-2 rounded-full flex-shrink-0">
                <Search className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <AddressSearchInput
                  placeholder="Où allez-vous ?"
                  currentLocation={currentLocation} // 🆕 Passer la position actuelle pour filtrage contextuel
                  onAddressSelect={(address) => {
                    console.log('🎯 onAddressSelect MapScreen appelé - Adresse:', address.name);
                    
                    // ✅ Mettre à jour destination LOCALEMENT
                    setDestination(address.name);
                    
                    // ✅ Enregistrer les coordonnées dans l'état global
                    if (setGlobalDestination) {
                      setGlobalDestination({
                        lat: address.coordinates.lat,
                        lng: address.coordinates.lng,
                        address: address.name
                      });
                      console.log('✅ Coordonnées de destination enregistrées:', address.coordinates);
                    }
                    
                    // ✅ Afficher une confirmation visuelle
                    toast.success(`📍 Destination : ${address.name}`, { duration: 2000 });
                  }}
                />
              </div>
            </div>

            {/* 🆕 Champ d'instructions de prise en charge */}
            <div className="flex items-start gap-2">
              <div className="bg-green-500 p-2 rounded-full flex-shrink-0 mt-1">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="relative">
                  <Input
                    placeholder="Point de repère (ex: Devant Total...)"
                    value={pickupInstructions}
                    onChange={(e) => setLocalPickupInstructions(e.target.value)}
                    className="h-12 text-sm bg-white border-gray-200 rounded-xl shadow-sm pl-3 pr-3 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1.5 ml-1">
                  💡 Aidez le conducteur à vous trouver facilement
                </p>
              </div>
            </div>

            {/* 🆕 RACCOURCIS VERS FAVORIS - TOUJOURS VISIBLES */}
            <div className="space-y-2">
              <button
                onClick={() => setShowFavorites(!showFavorites)}
                className={`w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl transition-all ${
                  showFavorites 
                    ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400' 
                    : 'bg-white border-2 border-gray-200 hover:border-yellow-400 hover:bg-yellow-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    showFavorites ? 'bg-yellow-400' : 'bg-yellow-100'
                  }`}>
                    <Star className={`w-5 h-5 ${showFavorites ? 'text-white' : 'text-yellow-600'}`} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-800">Lieux favoris</p>
                    <p className="text-xs text-gray-500">Accès rapide à vos adresses</p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: showFavorites ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Star className={`w-5 h-5 ${showFavorites ? 'text-yellow-600 fill-yellow-600' : 'text-gray-400'}`} />
                </motion.div>
              </button>
              
              {showFavorites && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <FavoriteLocations
                    currentLocation={currentLocation}
                    onSelectLocation={(location) => {
                      setDestination(location.address);
                      // Enregistrer aussi les coordonnées de la destination
                      if (setGlobalDestination) {
                        setGlobalDestination({
                          lat: location.lat,
                          lng: location.lng,
                          address: location.address
                        });
                      }
                      setShowFavorites(false);
                      toast.success('✅ Destination sélectionnée depuis vos favoris !');
                    }}
                    className="py-2"
                  />
                </motion.div>
              )}
            </div>

            {/* Bouton Commander */}
            <Button
              onClick={handleConfirmDestination}
              disabled={!destination.trim()}
              className="w-full h-11 bg-green-500 hover:bg-green-600 text-white rounded-xl disabled:opacity-50 shadow-md"
            >
              <span className="font-semibold text-sm">Commander une course</span>
            </Button>
          </div>

          {/* Contenu étendu */}
          {isPanelExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="space-y-3 mt-3"
            >
              {/* Position actuelle */}
              {currentLocation && (
                <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="flex items-start gap-2">
                    <div className="bg-green-500 p-1.5 rounded-full flex-shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-green-700 mb-1">📍 Votre position</p>
                      {loadingLocation ? (
                        <div className="flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                          <span className="text-xs text-blue-600">Détection GPS...</span>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-green-900 font-medium">{currentLocation.address}</p>
                          <p className="text-xs text-green-600 mt-1">
                            🎯 Précision: ±{Math.round(currentLocation.accuracy || 0)}m
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Lieux favoris */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setShowFavorites(!showFavorites)}
                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <Star className="w-4 h-4" />
                    <span>Lieux favoris</span>
                  </button>
                </div>
                
                {showFavorites && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <FavoriteLocations
                      currentLocation={currentLocation}
                      onSelectLocation={(location) => {
                        setDestination(location.address);
                        // Enregistrer aussi les coordonnées de la destination
                        if (setGlobalDestination) {
                          setGlobalDestination({
                            lat: location.lat,
                            lng: location.lng,
                            address: location.address
                          });
                        }
                        setShowFavorites(false);
                        toast.success('Destination sélectionnée');
                      }}
                      className="py-2"
                    />
                  </motion.div>
                )}
              </div>

              {/* Navigation rapide */}
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentScreen('ride-history')}
                >
                  <HistoryIcon className="w-4 h-4 text-gray-600" />
                  <span className="text-xs text-gray-600">Historique</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentScreen('profile')}
                >
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-xs text-gray-600">Profil</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentScreen('passenger-settings')}
                >
                  <Settings className="w-4 h-4 text-gray-600" />
                  <span className="text-xs text-gray-600">Paramètres</span>
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Side Menu */}
      {showMenu && (
        <>
          {/* Overlay pour fermer le menu en cliquant à l'extérieur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMenu(false)}
            className="absolute inset-0 bg-black/40 z-40"
          />
          
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute top-0 left-0 bottom-0 w-80 bg-gradient-to-br from-white via-white to-gray-50 shadow-2xl z-50 flex flex-col"
          >
            {/* Header avec profil utilisateur - Design moderne */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 pb-8 relative overflow-hidden">
              {/* Décoration background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
              
              <div className="relative flex items-center space-x-4">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                  <User className="w-8 h-8 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-lg truncate">
                    {state.currentUser?.name || 'Utilisateur'}
                  </h3>
                  <p className="text-green-100 text-sm truncate">
                    {state.currentUser?.email || 'email@smartcabb.app'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Menu items - Design épuré et moderne */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {/* Mes trajets */}
              <button
                onClick={() => {
                  setShowMenu(false);
                  setCurrentScreen('ride-history');
                }}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-white hover:bg-green-50 transition-all duration-200 shadow-sm hover:shadow-md group"
              >
                <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center group-hover:bg-green-500 transition-colors">
                  <HistoryIcon className="w-5 h-5 text-green-600 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900">Mes trajets</p>
                  <p className="text-xs text-gray-500">Historique des courses</p>
                </div>
              </button>

              {/* Mon profil */}
              <button
                onClick={() => {
                  setShowMenu(false);
                  setCurrentScreen('profile');
                }}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-white hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md group"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                  <User className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900">Mon profil</p>
                  <p className="text-xs text-gray-500">Informations personnelles</p>
                </div>
              </button>

              {/* Paramètres */}
              <button
                onClick={() => {
                  setShowMenu(false);
                  setCurrentScreen('passenger-settings');
                }}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-white hover:bg-purple-50 transition-all duration-200 shadow-sm hover:shadow-md group"
              >
                <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                  <Settings className="w-5 h-5 text-purple-600 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900">Paramètres</p>
                  <p className="text-xs text-gray-500">Préférences de l'app</p>
                </div>
              </button>
            </div>
            
            {/* Footer avec déconnexion */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <button
                onClick={() => {
                  console.log('🚪 Déconnexion du passager depuis MapScreen');
                  setShowMenu(false);
                  setCurrentUser(null);
                  setCurrentScreen('landing');
                }}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-red-50 hover:bg-red-100 transition-all duration-200 shadow-sm hover:shadow-md group"
              >
                <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center group-hover:bg-red-500 transition-colors">
                  <X className="w-5 h-5 text-red-600 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900">Déconnexion</p>
                  <p className="text-xs text-gray-500">Se déconnecter de l'app</p>
                </div>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}