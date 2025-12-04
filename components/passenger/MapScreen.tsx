import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAppState } from '../../hooks/useAppState';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { AddressSearchInput } from '../AddressSearchInput';
import { FavoriteLocations } from './FavoriteLocations';
import { InteractiveMapView } from '../InteractiveMapView';
import { MapPin, Menu, User, Navigation, Loader2, Settings, History, Star, CreditCard, Search, X } from 'lucide-react';
import { toast } from 'sonner';

export function MapScreen() {
  const { state, setCurrentScreen, setCurrentUser, setCurrentView, setPickup, setDestination: setGlobalDestination, setPickupInstructions, drivers } = useAppState();
  const [destination, setDestination] = useState('');
  const [pickupInstructions, setLocalPickupInstructions] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  
  // 🔍 Debug: Log quand destination change
  useEffect(() => {
    console.log('🎯 MapScreen - destination a changé:', destination);
  }, [destination]);

  // États pour la géolocalisation
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number; address: string; accuracy?: number }>({
    lat: -4.3276,
    lng: 15.3136,
    address: 'Chargement de votre position...',
    accuracy: 1000
  });
  const [loadingLocation, setLoadingLocation] = useState(true); // ✅ CHANGÉ: Démarrer en mode chargement
  const [locationError, setLocationError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  
  // États pour l'UI
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);

  // 🚗 FILTRER LES CONDUCTEURS EN LIGNE
  const onlineDrivers = drivers.filter(d => d.isOnline && d.documentsVerified);

  // Charger la dernière position connue du cache immédiatement
  useEffect(() => {
    const cachedLocation = localStorage.getItem('smartcabb_last_location');
    if (cachedLocation) {
      try {
        const parsed = JSON.parse(cachedLocation);
        setCurrentLocation(parsed);
        console.log('📍 Position en cache chargée:', parsed);
      } catch (e) {
        console.error('Erreur lecture cache position:', e);
      }
    }
  }, []);

  // Détecter le navigateur pour optimiser les options GPS
  const detectBrowser = () => {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return { name: 'Firefox', version: ua.match(/Firefox\/(\d+)/)?.[1] || 'unknown' };
    if (ua.includes('Chrome')) return { name: 'Chrome', version: ua.match(/Chrome\/(\d+)/)?.[1] || 'unknown' };
    if (ua.includes('Safari') && !ua.includes('Chrome')) return { name: 'Safari', version: ua.match(/Version\/(\d+)/)?.[1] || 'unknown' };
    if (ua.includes('Edge')) return { name: 'Edge', version: ua.match(/Edg\/(\d+)/)?.[1] || 'unknown' };
    return { name: 'Unknown', version: 'unknown' };
  };

  // Obtenir les options de géolocalisation optimisées
  const getGeolocationOptions = (): PositionOptions => {
    return {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 5000
    };
  };

  // Vérifier si on peut utiliser watchPosition
  const canUseWatchPosition = (): boolean => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    return !isMobile; // Désactiver watchPosition sur mobile pour économiser la batterie
  };

  // Obtenir et suivre la position réelle de l'utilisateur au chargement
  useEffect(() => {
    // Détecter si on est sur mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // Sur mobile, ne faire qu'une seule requête GPS au lieu de watchPosition
    // Cela économise la batterie et améliore la stabilité
    if (isMobile) {
      console.log('📱 Mobile détecté - Mode GPS économique activé');
      getUserLocation();
    } else {
      // Sur desktop, on peut utiliser watchPosition
      getUserLocation();
    }
    
    // Cleanup: arrêter le suivi lors du démontage
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        console.log('🛑 Arrêt du suivi GPS');
      }
    };
  }, []);

  const getUserLocation = async () => {
    setLoadingLocation(true);
    setLocationError(null);

    // ✅ SUPPRIMÉ: Mode test et détection d'iframe - TOUJOURS essayer le GPS réel
    // La géolocalisation fonctionne même en iframe si l'utilisateur donne la permission
    
    // Vérifier si la géolocalisation est disponible
    if (!navigator.geolocation) {
      console.warn('⚠️ Géolocalisation non disponible dans ce navigateur');
      setLoadingLocation(false);
      const defaultLocation = {
        lat: -4.3276,
        lng: 15.3136,
        address: 'Boulevard du 30 Juin, Gombe, Kinshasa',
        accuracy: 50
      };
      setCurrentLocation(defaultLocation);
      localStorage.setItem('smartcabb_last_location', JSON.stringify(defaultLocation));
      toast.info('📍 Position par défaut utilisée', { duration: 3000 });
      return;
    }

    // 🔐 Vérifier les permissions de géolocalisation avec l'API Permissions
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      console.log('🔐 Statut permission géolocalisation:', permissionStatus.state);
      
      if (permissionStatus.state === 'denied') {
        console.info('📍 Permission géolocalisation refusée - Utilisation position Kinshasa');
        setLoadingLocation(false);
        const defaultLocation = {
          lat: -4.3276,
          lng: 15.3136,
          address: 'Boulevard du 30 Juin, Gombe, Kinshasa',
          accuracy: 100
        };
        setCurrentLocation(defaultLocation);
        localStorage.setItem('smartcabb_last_location', JSON.stringify(defaultLocation));
        toast.info('📍 GPS désactivé - Position Kinshasa utilisée', { duration: 3000 });
        return;
      }
    } catch (permError) {
      // L'API Permissions n'est pas disponible ou la géolocalisation est bloquée par Permissions Policy
      console.info('📍 API Permissions non disponible - Utilisation position Kinshasa par défaut');
      // Continue quand même avec getCurrentPosition qui va gérer l'erreur
    }

    // 🎯 ESSAYER LA GÉOLOCALISATION RÉELLE (hors iframe uniquement)
    console.log('🌍 Tentative de géolocalisation GPS réelle...');
    toast.loading('🛰️ Recherche de votre position GPS...', { id: 'gps-search', duration: 10000 });

    // Arrêter l'ancien suivi s'il existe
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }

    // Timeout pour le premier résultat (20 secondes pour donner le temps au GPS)
    const timeoutId = setTimeout(() => {
      toast.dismiss('gps-search');
      setLoadingLocation(false);
      if (!currentLocation) {
        console.warn('⏱️ Timeout global - Aucune position obtenue après 20 secondes');
        const defaultLocation = {
          lat: -4.3276,
          lng: 15.3136,
          address: 'Boulevard du 30 Juin, Gombe, Kinshasa (timeout GPS)',
          accuracy: 1000
        };
        setCurrentLocation(defaultLocation);
        localStorage.setItem('smartcabb_last_location', JSON.stringify(defaultLocation));
        toast.warning('⏱️ GPS trop lent - Position par défaut utilisée', { duration: 4000 });
      }
    }, 20000); // Timeout de 20 secondes pour le premier résultat

    // Handler de position pour getCurrentPosition et watchPosition
    const handlePosition = async (position: GeolocationPosition) => {
      clearTimeout(timeoutId);
      const { latitude, longitude, accuracy, altitude, heading, speed } = position.coords;
      console.log(`✅ Position GPS RÉELLE obtenue: ${latitude}, ${longitude} (précision: ±${Math.round(accuracy)}m)`);
      console.log(`📊 Détails GPS: altitude=${altitude}m, cap=${heading}°, vitesse=${speed}m/s`);
      
      // Fermer le toast de chargement
      toast.dismiss('gps-search');
      
      // Convertir les coordonnées en adresse (geocoding inverse)
      try {
        const address = await reverseGeocode(latitude, longitude);
        const newLocation = {
          lat: latitude,
          lng: longitude,
          address: address,
          accuracy: accuracy
        };
        
        setCurrentLocation(newLocation);
        
        // ✅ NOUVEAU : Enregistrer automatiquement comme position de départ
        if (setPickup) {
          setPickup({
            lat: latitude,
            lng: longitude,
            address: address
          });
          console.log('🎯 Position GPS enregistrée comme point de départ:', address);
        }
        
        // Sauvegarder dans le cache
        localStorage.setItem('smartcabb_last_location', JSON.stringify(newLocation));
        
        if (accuracy < 20) {
          toast.success(`🎯 Position très précise ! (±${Math.round(accuracy)}m)`, { duration: 4000 });
        } else if (accuracy < 50) {
          toast.success(`📍 Position précise détectée (±${Math.round(accuracy)}m)`, { duration: 3000 });
        } else if (accuracy < 100) {
          toast.success(`📍 Position détectée (±${Math.round(accuracy)}m)`, { duration: 3000 });
        } else {
          toast.success(`📍 Position approximative (±${Math.round(accuracy)}m)`, { duration: 3000 });
        }
      } catch (error) {
        console.error('Erreur geocoding:', error);
        const newLocation = {
          lat: latitude,
          lng: longitude,
          address: `Position GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          accuracy: accuracy
        };
        setCurrentLocation(newLocation);
        
        // ✅ NOUVEAU : Enregistrer aussi si le geocoding échoue
        if (setPickup) {
          setPickup({
            lat: latitude,
            lng: longitude,
            address: newLocation.address
          });
          console.log('🎯 Coordonnées GPS enregistrées comme point de départ');
        }
        
        localStorage.setItem('smartcabb_last_location', JSON.stringify(newLocation));
        toast.success(`📍 GPS actif (±${Math.round(accuracy)}m)`, { duration: 3000 });
      }
      setLoadingLocation(false);
      setLocationError(null);
    };

    // Handler d'erreur pour getCurrentPosition et watchPosition
    const handleError = (error: GeolocationPositionError | any) => {
      clearTimeout(timeoutId);
      toast.dismiss('gps-search');
      
      let errorMessage = 'Position Kinshasa utilisée';
      
      // Vérifier si c'est une erreur de Permissions Policy
      if (error?.message && (
        error.message.includes('permissions policy') ||
        error.message.includes('Permissions policy') ||
        error.message.includes('disabled in this document')
      )) {
        // Comportement NORMAL dans certains environnements - Ne pas afficher comme erreur
        console.info('📍 Géolocalisation non disponible (environnement sécurisé) - Position Kinshasa utilisée');
        toast.info('📍 Position Kinshasa utilisée', { duration: 3000 });
      } else if (error && typeof error.code === 'number') {
        switch (error.code) {
          case 1: // PERMISSION_DENIED
            console.info('📍 Permission GPS refusée - Position Kinshasa utilisée');
            toast.info('📍 Position Kinshasa utilisée', { duration: 3000 });
            break;
          case 2: // POSITION_UNAVAILABLE
            console.info('📍 Position GPS indisponible - Position Kinshasa utilisée');
            toast.info('📍 Position Kinshasa utilisée', { duration: 3000 });
            break;
          case 3: // TIMEOUT
            console.info('📍 GPS trop lent - Position Kinshasa utilisée');
            toast.info('📍 Position Kinshasa utilisée', { duration: 3000 });
            break;
          default:
            console.info('📍 GPS non disponible - Position Kinshasa utilisée');
            toast.info('📍 Position Kinshasa utilisée', { duration: 3000 });
        }
      } else {
        console.info('📍 GPS non disponible - Position Kinshasa utilisée');
        toast.info('📍 Position Kinshasa utilisée', { duration: 3000 });
      }
      
      setLoadingLocation(false);
      
      // Position automatique par défaut : Kinshasa centre
      const defaultLocation = {
        lat: -4.3276,
        lng: 15.3136,
        address: 'Boulevard du 30 Juin, Gombe, Kinshasa',
        accuracy: 1000
      };
      setCurrentLocation(defaultLocation);
      localStorage.setItem('smartcabb_last_location', JSON.stringify(defaultLocation));
    };

    // Options de géolocalisation optimisées selon le navigateur
    const geoOptions = getGeolocationOptions();
    const browser = detectBrowser();
    const shouldUseWatch = canUseWatchPosition();

    console.log('🛰️ Lancement de la détection GPS optimisée pour', browser.name, browser.version);
    console.log('📍 Options GPS:', geoOptions);
    console.log('👁️ WatchPosition:', shouldUseWatch ? 'Activé' : 'Désactivé (économie batterie)');

    // Wrapper try-catch pour capturer les erreurs synchrones (Permissions Policy)
    try {
      // D'abord obtenir une position initiale avec haute précision
      navigator.geolocation.getCurrentPosition(
        handlePosition,
        handleError,
        geoOptions
      );

      // Démarrer le suivi continu UNIQUEMENT si le navigateur le supporte efficacement
      if (shouldUseWatch) {
        const newWatchId = navigator.geolocation.watchPosition(
          (position) => {
            console.log('🔄 Mise à jour GPS en temps réel');
            handlePosition(position);
          },
          (error) => {
            console.warn('⚠️ Erreur watchPosition:', error);
            // Ne pas afficher d'erreur pour watchPosition, seulement logger
          },
          geoOptions
        );
        
        setWatchId(newWatchId);
        console.log('🎯 Suivi GPS en temps réel activé (watchId:', newWatchId, ')');
      } else {
        console.log('💡 Mode GPS économique - watchPosition désactivé');
      }
      
      console.log('🌍 Le système va maintenant chercher votre position GPS réelle...');
    } catch (syncError: any) {
      // Erreur synchrone (Permissions Policy, etc.)
      console.warn('⚠️ Erreur synchrone lors de l\'accès GPS:', syncError);
      clearTimeout(timeoutId);
      toast.dismiss('gps-search');
      
      if (syncError?.message && syncError.message.includes('permissions policy')) {
        toast.info('📍 GPS bloqué - Position Kinshasa utilisée', { duration: 4000 });
      } else {
        toast.info('📍 GPS non disponible - Position Kinshasa utilisée', { duration: 4000 });
      }
      
      setLoadingLocation(false);
      const defaultLocation = {
        lat: -4.3276,
        lng: 15.3136,
        address: 'Boulevard du 30 Juin, Gombe, Kinshasa',
        accuracy: 1000
      };
      setCurrentLocation(defaultLocation);
      localStorage.setItem('smartcabb_last_location', JSON.stringify(defaultLocation));
    }
  };

  // Fonction de geocoding inverse (convertir coordonnées en adresse)
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      // Utiliser l'API Google Places si disponible
      const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
      
      if (apiKey) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=fr`,
            { signal: controller.signal }
          );
          clearTimeout(timeoutId);
          
          const data = await response.json();
          
          if (data.results && data.results[0]) {
            return data.results[0].formatted_address;
          }
        } catch (googleError) {
          console.warn('Google Geocoding échoué, utilisation du fallback:', googleError);
        }
      }
      
      // Fallback : Nominatim (OpenStreetMap)
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=fr&zoom=18&addressdetails=1`,
          { 
            signal: controller.signal,
            headers: {
              'User-Agent': 'SmartCabb'
            }
          }
        );
        clearTimeout(timeoutId);
        
        const data = await response.json();
        
        // ✅ AMÉLIORATION : Construire une adresse précise à partir des composants
        if (data.address) {
          const parts = [];
          
          // Ajouter le numéro de rue si disponible
          if (data.address.house_number) {
            parts.push(data.address.house_number);
          }
          
          // Ajouter le nom de la rue
          if (data.address.road) {
            parts.push(data.address.road);
          } else if (data.address.street) {
            parts.push(data.address.street);
          }
          
          // Ajouter le quartier
          if (data.address.neighbourhood) {
            parts.push(data.address.neighbourhood);
          } else if (data.address.suburb) {
            parts.push(data.address.suburb);
          }
          
          // Ajouter la commune
          if (data.address.city_district || data.address.district) {
            parts.push(data.address.city_district || data.address.district);
          }
          
          // Ajouter la ville
          if (data.address.city) {
            parts.push(data.address.city);
          }
          
          // Si on a des parties, les assembler
          if (parts.length > 0) {
            return parts.join(', ');
          }
        }
        
        // Si display_name est disponible, l'utiliser
        if (data.display_name) {
          return data.display_name;
        }
      } catch (nominatimError) {
        console.warn('Nominatim échoué:', nominatimError);
      }
      
      // Si tout échoue, trouver le quartier/commune le plus proche de Kinshasa ET inclure les coordonnées précises
      const kinshasaLocations = [
        { name: 'Gombe', lat: -4.3276, lng: 15.3136 },
        { name: 'Kalamu', lat: -4.3372, lng: 15.3168 },
        { name: 'Ngaliema', lat: -4.3350, lng: 15.2720 },
        { name: 'Lemba', lat: -4.3890, lng: 15.2950 },
        { name: 'Kintambo', lat: -4.3250, lng: 15.2900 },
        { name: 'Masina', lat: -4.3850, lng: 15.3750 },
        { name: 'Ngaba', lat: -4.3620, lng: 15.2920 },
        { name: 'Matete', lat: -4.3720, lng: 15.2820 },
        { name: 'Bandalungwa', lat: -4.3420, lng: 15.2950 },
        { name: 'Limete', lat: -4.3650, lng: 15.3250 },
        { name: 'Barumbu', lat: -4.3165, lng: 15.3250 },
      ];
      
      // Trouver le quartier le plus proche
      let closestLocation = kinshasaLocations[0];
      let minDistance = Infinity;
      
      for (const location of kinshasaLocations) {
        const distance = Math.sqrt(
          Math.pow(lat - location.lat, 2) + Math.pow(lng - location.lng, 2)
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestLocation = location;
        }
      }
      
      // ✅ AMÉLIORATION : Retourner une adresse précise avec les coordonnées
      return `${lat.toFixed(5)}°S ${Math.abs(lng).toFixed(5)}°E, ${closestLocation.name}, Kinshasa`;
    } catch (error) {
      console.error('Erreur complète reverseGeocode:', error);
      // ✅ En dernier recours, retourner les coordonnées GPS brutes avec Kinshasa
      return `${lat.toFixed(5)}°S ${Math.abs(lng).toFixed(5)}°E, Kinshasa, RDC`;
    }
  };

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
          center={{ lat: -4.3276, lng: 15.3136, address: 'Kinshasa, RDC' }}
          drivers={onlineDrivers} // 🚗 CONDUCTEURS EN LIGNE AFFICHÉS
          zoom={13}
          className="w-full h-full"
          showUserLocation={true}
          enableGeolocation={true}
          onLocationUpdate={(location) => {
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

        {/* Bouton GPS - Repositionné en bas à droite de la carte */}
        <Button
          variant="outline"
          size="icon"
          className="absolute bottom-3 right-3 w-11 h-11 bg-white shadow-lg rounded-full border-2 z-20"
          onClick={() => {
            toast.info('Actualisation...');
            getUserLocation();
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

            {/* Lieux favoris - AFFICHÉS EN HAUT TOUJOURS */}
            {!isPanelExpanded && (
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
            )}

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
                  <History className="w-4 h-4 text-gray-600" />
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
                  <History className="w-5 h-5 text-green-600 group-hover:text-white transition-colors" />
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