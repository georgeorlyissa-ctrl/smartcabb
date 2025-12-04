import { useState, createContext, useContext, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { AppState, User, Driver, Ride, Location, PromoCode, MarketingCampaign } from '../types';
import { supabase } from '../lib/supabase';
import { useSupabaseData, type EnrichedDriver, type EnrichedRide } from './useSupabaseData';
import { useSettings, type AppSettings } from './useSettings';
import { notifyConfirmationCode } from '../lib/sms-service';

// ✅ Les données sont chargées depuis Supabase via useSupabaseData

const initialState: AppState = {
  currentUser: null,
  currentDriver: null,
  currentRide: null,
  isAdmin: false,
  currentView: null, // ✅ NULL par défaut - affichera LandingScreen
  currentScreen: '', // ✅ Vide par défaut - sera initialisé par chaque App
  policyAccepted: false,
  language: 'fr',
  systemSettings: {
    exchangeRate: 2850,
    postpaidInterestRate: 15,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true
  }
};

interface AppContextType {
  state: AppState;
  setCurrentUser: (user: User | null) => void;
  updateUser?: (user: User | null) => void; // ✅ Alias pour mettre à jour l'utilisateur
  setCurrentDriver: (driver: Driver | null) => void;
  setCurrentRide: (ride: Ride | null) => void;
  setCurrentView: (view: 'passenger' | 'driver' | 'admin' | null) => void; // ✅ Accepte null
  setCurrentScreen: (screen: string) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  setPolicyAccepted: (accepted: boolean) => void;
  setLanguage: (language: 'fr' | 'en') => void;
  setPickup?: (pickup: Location | null) => void;
  setDestination?: (destination: Location | null) => void;
  setPickupInstructions?: (instructions: string) => void; // 🆕
  drivers: Driver[];
  rides: Ride[];
  passengers: User[];
  promoCodes: PromoCode[];
  campaigns: MarketingCampaign[];
  updateDriver: (driverId: string, updates: Partial<Driver>) => void;
  addDriver: (driver: Omit<Driver, 'id'>) => string;
  createRide: (ride: Omit<Ride, 'id' | 'createdAt'>) => void;
  updateRide: (rideId: string, updates: Partial<Ride>) => void;
  clearCurrentRide?: () => void;
  generateConfirmationCode?: () => string;
  getHourlyRate?: (vehicleType: 'smart_standard' | 'smart_confort' | 'smart_plus') => number;
  addNotification?: (type: 'driver_cancel' | 'driver_refuse', driverId: string, rideId: string) => void;
  validatePromoCode?: (code: string, rideAmount: number) => PromoCode | null;
  addPromoCode?: (promoCode: Omit<PromoCode, 'id' | 'usedCount'>) => string;
  updatePromoCode?: (promoId: string, updates: Partial<PromoCode>) => void;
  addCampaign?: (campaign: Omit<MarketingCampaign, 'id' | 'createdAt'>) => string;
  updateCampaign?: (campaignId: string, updates: Partial<MarketingCampaign>) => void;
  calculateDistance?: (pickup: Location, destination: Location) => number;
  updateSystemSettings?: (updates: Partial<AppState['systemSettings']>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // ⚡ DÉSACTIVÉ: Ne pas charger automatiquement les données Supabase au niveau global
  // Cela cause un écran blanc pendant 3 secondes au chargement de l'app
  // Les composants qui ont besoin des données appelleront useSupabaseData() directement
  // const supabaseData = useSupabaseData();
  
  const [state, setState] = useState<AppState>(() => {
    // Vérifier si la politique a déjà été acceptée
    let policyAccepted = false;
    let savedSettings = initialState.systemSettings;
    let savedUser = null;
    let savedDriver = null; // 🆕 Ajouter le conducteur
    let savedView = null;
    let savedScreen = '';
    
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        policyAccepted = localStorage.getItem('smartcab_policy_accepted') === 'true';
        
        // Charger les paramètres système depuis localStorage
        const savedSettingsStr = localStorage.getItem('smartcab_system_settings');
        if (savedSettingsStr) {
          savedSettings = JSON.parse(savedSettingsStr);
          console.log('✅ Paramètres système chargés depuis localStorage:', savedSettings);
        }
        
        // Charger l'utilisateur depuis localStorage
        const savedUserStr = localStorage.getItem('smartcab_current_user');
        if (savedUserStr) {
          savedUser = JSON.parse(savedUserStr);
          console.log('✅ Utilisateur chargé depuis localStorage:', savedUser);
        }
        
        // 🆕 Charger le conducteur depuis localStorage
        const savedDriverStr = localStorage.getItem('smartcab_current_driver');
        if (savedDriverStr) {
          savedDriver = JSON.parse(savedDriverStr);
          console.log('✅ Conducteur chargé depuis localStorage:', savedDriver);
        }
        
        // Charger currentView depuis localStorage
        const savedViewStr = localStorage.getItem('smartcab_current_view');
        if (savedViewStr) {
          savedView = savedViewStr as 'passenger' | 'driver' | 'admin';
          console.log('✅ Vue chargée depuis localStorage:', savedView);
        }
        
        // Charger currentScreen depuis localStorage
        const savedScreenStr = localStorage.getItem('smartcab_current_screen');
        if (savedScreenStr) {
          savedScreen = savedScreenStr;
          console.log('✅ Écran chargé depuis localStorage:', savedScreen);
        }
      }
    } catch (error) {
      console.warn('Impossible de lire localStorage:', error);
    }
    
    return {
      ...initialState,
      policyAccepted,
      systemSettings: savedSettings,
      currentUser: savedUser,
      currentDriver: savedDriver, // 🆕 Ajouter le conducteur au state initial
      currentView: savedView,
      currentScreen: savedScreen
    };
  });
  
  // ✅ Convertir les données Supabase au format attendu par les composants
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [rides, setRides] = useState<Ride[]>([]);
  const [passengers, setPassengers] = useState<User[]>([]);
  
  // ⚡ DÉSACTIVÉ: Synchronisation avec Supabase désactivée pour éviter l'écran blanc
  // Les composants qui ont besoin des données chargeront directement depuis useSupabaseData
  /*
  // ✅ Synchroniser les données Supabase avec le state local
  useEffect(() => {
    // Convertir EnrichedDriver vers Driver
    if (supabaseData.drivers && supabaseData.drivers.length > 0) {
      const convertedDrivers: Driver[] = supabaseData.drivers.map((d: EnrichedDriver) => ({
        id: d.id,
        name: d.full_name,
        email: d.email,
        phone: d.phone || '',
        isOnline: d.is_available || false,
        currentLocation: {
          lat: d.current_latitude || -4.3217,
          lng: d.current_longitude || 15.3125,
          address: 'Kinshasa'
        },
        rating: d.rating || 0,
        totalRides: d.total_rides || 0,
        earnings: d.total_earnings || 0,
        vehicleInfo: {
          make: d.vehicle_make || 'N/A',
          model: d.vehicle_model || 'N/A',
          plate: d.vehicle_plate || 'N/A',
          year: 2020,
          color: d.vehicle_color || 'N/A',
          type: (d.vehicle_category as any) || 'smart_standard'
        },
        documentsVerified: d.documents_verified || false,
        applicationStatus: d.status || 'pending'
      }));
      console.log('✅ Drivers chargés depuis Supabase:', convertedDrivers.length);
      setDrivers(convertedDrivers);
    }
    
    // Convertir profiles en User (passengers)
    if (supabaseData.profiles && supabaseData.profiles.length > 0) {
      const passengerProfiles = supabaseData.profiles.filter(p => p.role === 'passenger');
      const convertedPassengers: User[] = passengerProfiles.map(p => ({
        id: p.id,
        name: p.full_name || 'Utilisateur',
        email: p.email,
        phone: p.phone || '',
        address: 'Kinshasa',
        registeredAt: new Date(p.created_at),
        totalRides: 0,
        favoritePaymentMethod: 'mobile_money'
      }));
      console.log('✅ Passagers chargés depuis Supabase:', convertedPassengers.length);
      setPassengers(convertedPassengers);
    }
    
    // Convertir EnrichedRide vers Ride
    if (supabaseData.rides && supabaseData.rides.length > 0) {
      const convertedRides: Ride[] = supabaseData.rides.map((r: EnrichedRide) => ({
        id: r.id,
        passengerId: r.passengerId,
        driverId: r.driverId,
        pickup: r.pickup,
        destination: r.destination,
        estimatedPrice: r.estimatedPrice,
        actualPrice: r.total_amount,
        estimatedDuration: r.estimatedDuration,
        status: r.status,
        vehicleType: 'smart_standard' as any,
        confirmationCode: r.confirmation_code || '',
        createdAt: r.createdAt,
        rating: r.rating || 0,
        feedback: r.feedback || '',
        waitingTimeStart: r.waiting_started_at ? new Date(r.waiting_started_at) : undefined,
        rideStartTime: r.ride_started_at ? new Date(r.ride_started_at) : undefined,
        rideEndTime: r.completed_at ? new Date(r.completed_at) : undefined,
        totalBillableMinutes: r.duration_minutes || 0
      }));
      console.log('✅ Courses chargées depuis Supabase:', convertedRides.length);
      setRides(convertedRides);
    }
  }, [supabaseData.drivers, supabaseData.profiles, supabaseData.rides]);
  */
  
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'driver_cancel' | 'driver_refuse';
    driverId: string;
    rideId: string;
    timestamp: Date;
    message: string;
  }>>([]);

  const setCurrentUser = useCallback((user: User | null) => {
    setState(prev => ({ ...prev, currentUser: user }));
    // Sauvegarder dans localStorage avec les DEUX clés pour compatibilité
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (user) {
          // Clé globale pour la session actuelle
          localStorage.setItem('smartcab_current_user', JSON.stringify(user));
          
          // Clé individuelle pour le profil complet (utilisée par sync-service)
          if (user.id) {
            localStorage.setItem(`smartcabb_user_${user.id}`, JSON.stringify(user));
            console.log(`💾 Utilisateur sauvegardé dans localStorage: smartcabb_user_${user.id}`);
          }
        } else {
          localStorage.removeItem('smartcab_current_user');
        }
      }
    } catch (error) {
      console.warn('Impossible de sauvegarder currentUser dans localStorage:', error);
    }
  }, []);

  const setCurrentDriver = useCallback((driver: Driver | null) => {
    setState(prev => ({ ...prev, currentDriver: driver }));
    
    // 💾 Sauvegarder le conducteur dans localStorage
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (driver) {
          localStorage.setItem('smartcab_current_driver', JSON.stringify(driver));
          console.log('💾 Conducteur sauvegardé dans localStorage:', driver);
        } else {
          localStorage.removeItem('smartcab_current_driver');
          console.log('🗑️ Conducteur supprimé du localStorage');
        }
      }
    } catch (error) {
      console.warn('Impossible de sauvegarder currentDriver dans localStorage:', error);
    }
  }, []);

  const setCurrentRide = useCallback((ride: Ride | null) => {
    setState(prev => ({ ...prev, currentRide: ride }));
  }, []);

  const setCurrentView = useCallback((view: 'passenger' | 'driver' | 'admin' | null) => {
    console.log('🔄 setCurrentView appelé avec:', view);
    
    // Sauvegarder IMMÉDIATEMENT dans localStorage (synchrone)
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (view) {
          localStorage.setItem('smartcab_current_view', view);
          console.log('💾 currentView sauvegardé dans localStorage:', view);
        } else {
          localStorage.removeItem('smartcab_current_view');
          console.log('🗑️ currentView supprimé de localStorage');
        }
      }
    } catch (error) {
      console.warn('⚠️ Impossible de sauvegarder currentView dans localStorage:', error);
    }
    
    // Mise à jour du state React
    setState(prev => {
      console.log('📊 Mise à jour state - currentView:', prev.currentView, '->', view);
      return { ...prev, currentView: view };
    });
  }, []);

  const setCurrentScreen = useCallback((screen: string) => {
    console.log('🔄 setCurrentScreen appelé avec:', screen);
    
    // Sauvegarder IMMÉDIATEMENT dans localStorage (synchrone)
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('smartcab_current_screen', screen);
        console.log('💾 currentScreen sauvegardé dans localStorage:', screen);
      }
    } catch (error) {
      console.warn('⚠️ Impossible de sauvegarder currentScreen dans localStorage:', error);
    }
    
    // Mise à jour du state React
    setState(prev => {
      console.log('📊 Mise à jour state - currentScreen:', prev.currentScreen, '->', screen);
      return { ...prev, currentScreen: screen };
    });
  }, []);

  const setIsAdmin = useCallback((isAdmin: boolean) => {
    setState(prev => ({ ...prev, isAdmin: isAdmin }));
  }, []);

  const setLanguage = useCallback((language: 'fr' | 'en') => {
    setState(prev => ({ ...prev, language }));
  }, []);

  const setPolicyAccepted = useCallback((accepted: boolean) => {
    setState(prev => ({ ...prev, policyAccepted: accepted }));
    // Sauvegarder dans localStorage pour persister l'acceptation
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('smartcab_policy_accepted', accepted.toString());
      }
    } catch (error) {
      console.warn('Impossible de sauvegarder dans localStorage:', error);
    }
  }, []);

  const setPickup = useCallback((pickup: Location | null) => {
    console.log('📍 Position de départ définie:', pickup);
    setState(prev => ({ ...prev, pickup }));
  }, []);

  const setDestination = useCallback((destination: Location | null) => {
    console.log('🎯 Destination définie:', destination);
    setState(prev => ({ ...prev, destination }));
  }, []);

  const setPickupInstructions = useCallback((instructions: string) => {
    console.log('📝 Instructions de départ définies:', instructions);
    setState(prev => ({ ...prev, pickupInstructions: instructions }));
  }, []);

  const updateDriver = useCallback((driverId: string, updates: Partial<Driver>) => {
    setDrivers(prev => prev.map(driver => 
      driver.id === driverId ? { ...driver, ...updates } : driver
    ));
  }, []);

  const addDriver = useCallback((driverData: Omit<Driver, 'id'>) => {
    const newId = `driver_${Date.now()}`;
    const newDriver: Driver = {
      ...driverData,
      id: newId
    };
    setDrivers(prev => [...prev, newDriver]);
    return newId;
  }, []);

  const generateConfirmationCode = useCallback(() => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }, []);

  const getHourlyRate = useCallback((vehicleType: 'smart_standard' | 'smart_confort' | 'smart_plus') => {
    const rates = {
      'smart_standard': 7,
      'smart_confort': 9,
      'smart_plus': 10
    };
    return rates[vehicleType];
  }, []);

  const createRide = useCallback(async (rideData: Omit<Ride, 'id' | 'createdAt'>) => {
    console.log('Creating new ride with data:', rideData);
    const confirmationCode = generateConfirmationCode();
    const newRide: Ride = {
      ...rideData,
      id: `ride_${Date.now()}`,
      createdAt: new Date(),
      confirmationCode,
      hourlyRate: getHourlyRate(rideData.vehicleType || 'smart_standard')
    };
    console.log('New ride created:', newRide);
    setRides(prev => [...prev, newRide]);
    setCurrentRide(newRide);
    console.log('Current ride set successfully');
    
    // 📱 NOUVEAU: Envoyer le code de confirmation par SMS au passager
    if (state.currentUser?.phone) {
      console.log('📱 Envoi du code de confirmation par SMS:', confirmationCode);
      try {
        await notifyConfirmationCode(
          state.currentUser.phone,
          confirmationCode,
          'Conducteur' // Sera remplacé par le vrai nom du conducteur quand il accepte
        );
        console.log('✅ SMS code de confirmation envoyé avec succès');
      } catch (error) {
        console.error('❌ Erreur lors de l\'envoi du SMS code de confirmation:', error);
      }
    }
  }, [generateConfirmationCode, getHourlyRate, setCurrentRide, state.currentUser]);

  const updateRide = useCallback((rideId: string, updates: Partial<Ride>) => {
    setRides(prev => prev.map(ride => 
      ride.id === rideId ? { ...ride, ...updates } : ride
    ));
    if (state.currentRide?.id === rideId) {
      setCurrentRide({ ...state.currentRide, ...updates });
    }
  }, [state.currentRide, setCurrentRide]);

  const clearCurrentRide = useCallback(() => {
    console.log('Clearing current ride');
    setCurrentRide(null);
  }, [setCurrentRide]);

  const addNotification = useCallback((type: 'driver_cancel' | 'driver_refuse', driverId: string, rideId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    const message = type === 'driver_cancel' 
      ? `Le conducteur ${driver?.name} a annulé la course #${rideId}`
      : `Le conducteur ${driver?.name} a refusé la course #${rideId}`;
      
    const notification = {
      id: `notif_${Date.now()}`,
      type,
      driverId,
      rideId,
      timestamp: new Date(),
      message
    };
    
    setNotifications(prev => [...prev, notification]);
  }, [drivers]);

  const validatePromoCode = useCallback((code: string, rideAmount: number): PromoCode | null => {
    const promo = promoCodes.find(p => 
      p.code === code && 
      p.isActive && 
      new Date() >= p.validFrom && 
      new Date() <= p.validTo &&
      (!p.usageLimit || p.usedCount < p.usageLimit) &&
      (!p.minRideAmount || rideAmount >= p.minRideAmount)
    );
    return promo || null;
  }, [promoCodes]);

  const addPromoCode = useCallback((promoData: Omit<PromoCode, 'id' | 'usedCount'>): string => {
    const newId = `promo_${Date.now()}`;
    const newPromo: PromoCode = {
      ...promoData,
      id: newId,
      usedCount: 0
    };
    setPromoCodes(prev => [...prev, newPromo]);
    return newId;
  }, []);

  const updatePromoCode = useCallback((promoId: string, updates: Partial<PromoCode>) => {
    setPromoCodes(prev => prev.map(promo => 
      promo.id === promoId ? { ...promo, ...updates } : promo
    ));
  }, []);

  const addCampaign = useCallback((campaignData: Omit<MarketingCampaign, 'id' | 'createdAt'>): string => {
    const newId = `campaign_${Date.now()}`;
    const newCampaign: MarketingCampaign = {
      ...campaignData,
      id: newId,
      createdAt: new Date()
    };
    setCampaigns(prev => [...prev, newCampaign]);
    return newId;
  }, []);

  const updateCampaign = useCallback((campaignId: string, updates: Partial<MarketingCampaign>) => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === campaignId ? { ...campaign, ...updates } : campaign
    ));
  }, []);

  const calculateDistance = useCallback((pickup: Location, destination: Location): number => {
    // Formule de Haversine pour calculer la distance entre deux points
    const R = 6371; // Rayon de la Terre en km
    const dLat = (destination.lat - pickup.lat) * Math.PI / 180;
    const dLng = (destination.lng - pickup.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(pickup.lat * Math.PI / 180) * Math.cos(destination.lat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return Math.round(distance * 100) / 100; // Arrondir à 2 décimales
  }, []);

  const updateSystemSettings = useCallback((updates: Partial<AppState['systemSettings']>) => {
    const newSettings = {
      ...state.systemSettings,
      ...updates
    };
    
    setState(prev => ({
      ...prev,
      systemSettings: newSettings
    }));
    
    // Sauvegarder dans localStorage pour persister les paramètres
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('smartcab_system_settings', JSON.stringify(newSettings));
        console.log('✅ Paramètres système sauvegardés:', newSettings);
      }
    } catch (error) {
      console.warn('Impossible de sauvegarder dans localStorage:', error);
    }
  }, [state.systemSettings]);

  const value: AppContextType = useMemo(() => ({
    state,
    setCurrentUser,
    updateUser: setCurrentUser, // ✅ Alias pour mettre à jour l'utilisateur
    setCurrentDriver,
    setCurrentRide,
    setCurrentView,
    setCurrentScreen,
    setIsAdmin,
    setPolicyAccepted,
    setLanguage,
    setPickup,
    setDestination,
    setPickupInstructions,
    drivers,
    rides,
    passengers,
    promoCodes,
    campaigns,
    updateDriver,
    addDriver,
    createRide,
    updateRide,
    clearCurrentRide,
    generateConfirmationCode,
    getHourlyRate,
    addNotification,
    validatePromoCode,
    addPromoCode,
    updatePromoCode,
    addCampaign,
    updateCampaign,
    calculateDistance,
    updateSystemSettings,
  }), [
    state,
    drivers,
    rides,
    passengers,
    promoCodes,
    campaigns,
    setCurrentUser,
    setCurrentDriver,
    setCurrentRide,
    setCurrentView,
    setCurrentScreen,
    setIsAdmin,
    setPolicyAccepted,
    setLanguage,
    setPickup,
    setDestination,
    setPickupInstructions,
    updateDriver,
    addDriver,
    createRide,
    updateRide,
    clearCurrentRide,
    generateConfirmationCode,
    getHourlyRate,
    addNotification,
    validatePromoCode,
    addPromoCode,
    updatePromoCode,
    addCampaign,
    updateCampaign,
    calculateDistance,
    updateSystemSettings
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
}