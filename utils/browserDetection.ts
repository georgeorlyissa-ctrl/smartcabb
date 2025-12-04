/**
 * Utilitaire de détection de navigateur mobile
 * Pour gérer les comportements spécifiques à chaque navigateur
 */

export interface BrowserInfo {
  name: string;
  version: string;
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isSafari: boolean;
  isChrome: boolean;
  isFirefox: boolean;
  isOpera: boolean;
  isSamsung: boolean;
  isEdge: boolean;
  isUC: boolean;
  supportsServiceWorker: boolean;
  supportsGeolocation: boolean;
  supportsPushNotifications: boolean;
}

/**
 * Détecte le navigateur et retourne les informations
 */
export function detectBrowser(): BrowserInfo {
  const userAgent = navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/.test(userAgent);
  const isAndroid = /Android/.test(userAgent);
  const isMobile = isIOS || isAndroid || /Mobile|Tablet/.test(userAgent);

  // Détection spécifique des navigateurs
  const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
  const isChrome = /Chrome/.test(userAgent) && !/Edg/.test(userAgent) && !/OPR/.test(userAgent);
  const isFirefox = /Firefox/.test(userAgent);
  const isOpera = /OPR/.test(userAgent) || /Opera/.test(userAgent);
  const isSamsung = /SamsungBrowser/.test(userAgent);
  const isEdge = /Edg/.test(userAgent);
  const isUC = /UCBrowser/.test(userAgent);

  // Extraction de la version
  let version = 'unknown';
  let name = 'unknown';

  if (isSafari) {
    name = 'Safari';
    const match = userAgent.match(/Version\/(\d+\.\d+)/);
    if (match) version = match[1];
  } else if (isChrome) {
    name = 'Chrome';
    const match = userAgent.match(/Chrome\/(\d+\.\d+)/);
    if (match) version = match[1];
  } else if (isFirefox) {
    name = 'Firefox';
    const match = userAgent.match(/Firefox\/(\d+\.\d+)/);
    if (match) version = match[1];
  } else if (isSamsung) {
    name = 'Samsung Internet';
    const match = userAgent.match(/SamsungBrowser\/(\d+\.\d+)/);
    if (match) version = match[1];
  } else if (isOpera) {
    name = 'Opera';
    const match = userAgent.match(/OPR\/(\d+\.\d+)/) || userAgent.match(/Opera\/(\d+\.\d+)/);
    if (match) version = match[1];
  } else if (isEdge) {
    name = 'Edge';
    const match = userAgent.match(/Edg\/(\d+\.\d+)/);
    if (match) version = match[1];
  } else if (isUC) {
    name = 'UC Browser';
    const match = userAgent.match(/UCBrowser\/(\d+\.\d+)/);
    if (match) version = match[1];
  }

  // Vérifier les fonctionnalités supportées
  const supportsServiceWorker = 'serviceWorker' in navigator;
  const supportsGeolocation = 'geolocation' in navigator;
  const supportsPushNotifications = 'PushManager' in window && 'Notification' in window;

  return {
    name,
    version,
    isMobile,
    isIOS,
    isAndroid,
    isSafari,
    isChrome,
    isFirefox,
    isOpera,
    isSamsung,
    isEdge,
    isUC,
    supportsServiceWorker,
    supportsGeolocation,
    supportsPushNotifications
  };
}

/**
 * Applique les optimisations spécifiques au navigateur
 */
export function applyBrowserOptimizations(): void {
  const browser = detectBrowser();
  
  console.log('🌐 Navigateur détecté:', browser.name, browser.version);
  console.log('📱 Mobile:', browser.isMobile);
  console.log('🍎 iOS:', browser.isIOS);
  console.log('🤖 Android:', browser.isAndroid);
  
  // iOS Safari - Fix viewport height
  if (browser.isIOS && browser.isSafari) {
    console.log('🍏 Optimisations iOS Safari activées');
    
    // Fix pour la hauteur de viewport sur iOS Safari
    const setIOSHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setIOSHeight();
    window.addEventListener('resize', setIOSHeight);
    window.addEventListener('orientationchange', setIOSHeight);
  }
  
  // Samsung Internet - Optimisations
  if (browser.isSamsung) {
    console.log('📱 Optimisations Samsung Internet activées');
    // Samsung Internet a des problèmes avec certaines animations
    document.documentElement.classList.add('samsung-browser');
  }
  
  // UC Browser - Optimisations
  if (browser.isUC) {
    console.log('🌐 Optimisations UC Browser activées');
    // UC Browser a des limitations avec certaines features
    document.documentElement.classList.add('uc-browser');
  }
  
  // Firefox Mobile - Optimisations
  if (browser.isFirefox && browser.isMobile) {
    console.log('🦊 Optimisations Firefox Mobile activées');
    document.documentElement.classList.add('firefox-mobile');
  }
  
  // Opera Mobile - Optimisations
  if (browser.isOpera && browser.isMobile) {
    console.log('🅾️ Optimisations Opera Mobile activées');
    document.documentElement.classList.add('opera-mobile');
  }
  
  // Désactiver les animations si le navigateur est ancien ou lent
  if (browser.version && parseFloat(browser.version) < 80) {
    console.log('⚠️ Navigateur ancien détecté - Animations réduites');
    document.documentElement.classList.add('reduce-animations');
  }
  
  // Ajouter une classe pour tous les mobiles
  if (browser.isMobile) {
    document.documentElement.classList.add('mobile-browser');
  }
  
  // Log des fonctionnalités
  console.log('✅ Service Worker:', browser.supportsServiceWorker);
  console.log('📍 Géolocalisation:', browser.supportsGeolocation);
  console.log('🔔 Push Notifications:', browser.supportsPushNotifications);
}

/**
 * Retourne les options optimales pour la géolocalisation selon le navigateur
 */
export function getGeolocationOptions(): PositionOptions {
  const browser = detectBrowser();
  
  // Options de base
  const baseOptions: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 20000,
    maximumAge: 30000
  };
  
  // iOS Safari - timeout plus court, cache plus long
  if (browser.isIOS && browser.isSafari) {
    return {
      enableHighAccuracy: false, // iOS Safari est plus rapide sans high accuracy
      timeout: 15000,
      maximumAge: 60000 // Cache plus long sur iOS
    };
  }
  
  // Samsung Internet - options conservatrices
  if (browser.isSamsung) {
    return {
      enableHighAccuracy: true,
      timeout: 25000, // Plus de temps pour Samsung
      maximumAge: 20000
    };
  }
  
  // UC Browser - très conservatif
  if (browser.isUC) {
    return {
      enableHighAccuracy: false,
      timeout: 30000,
      maximumAge: 60000
    };
  }
  
  // Firefox Mobile - optimisé
  if (browser.isFirefox && browser.isMobile) {
    return {
      enableHighAccuracy: true,
      timeout: 18000,
      maximumAge: 25000
    };
  }
  
  return baseOptions;
}

/**
 * Vérifie si le navigateur peut utiliser watchPosition de manière efficace
 */
export function canUseWatchPosition(): boolean {
  const browser = detectBrowser();
  
  // Désactiver watchPosition sur iOS Safari (problèmes de batterie)
  if (browser.isIOS && browser.isSafari) {
    return false;
  }
  
  // Désactiver sur UC Browser (performance)
  if (browser.isUC) {
    return false;
  }
  
  // Désactiver sur Samsung Internet vieux (< v12)
  if (browser.isSamsung && parseFloat(browser.version) < 12) {
    return false;
  }
  
  return true;
}

/**
 * Retourne la stratégie de cache optimale selon le navigateur
 */
export function getCacheStrategy(): 'aggressive' | 'moderate' | 'minimal' {
  const browser = detectBrowser();
  
  // iOS - cache agressif (mémoire limitée)
  if (browser.isIOS) {
    return 'aggressive';
  }
  
  // UC Browser - cache minimal
  if (browser.isUC) {
    return 'minimal';
  }
  
  // Android avec beaucoup de mémoire - modéré
  if (browser.isAndroid) {
    return 'moderate';
  }
  
  return 'moderate';
}

/**
 * Vérifie si le navigateur supporte les PWA complètes
 */
export function supportsPWA(): boolean {
  const browser = detectBrowser();
  
  return browser.supportsServiceWorker && 
         (browser.isChrome || browser.isFirefox || browser.isSafari || browser.isEdge);
}

/**
 * Retourne le délai optimal pour les animations selon le navigateur
 */
export function getAnimationDuration(): number {
  const browser = detectBrowser();
  
  // UC Browser - animations plus lentes
  if (browser.isUC) {
    return 400;
  }
  
  // Samsung Internet ancien - animations plus lentes
  if (browser.isSamsung && parseFloat(browser.version) < 12) {
    return 400;
  }
  
  // iOS Safari - animations rapides
  if (browser.isIOS && browser.isSafari) {
    return 250;
  }
  
  // Standard
  return 300;
}
