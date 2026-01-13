/**
 * LOGGER CONDITIONNEL POUR PRODUCTION
 * v1.0 - 13 janvier 2026
 * 
 * Désactive automatiquement les logs en production (smartcabb.com)
 * Garde les logs en développement (localhost, figma.com)
 */

// Détecter l'environnement
const isProduction = () => {
  if (typeof window === 'undefined') return false;
  
  const hostname = window.location.hostname;
  
  // Production : smartcabb.com et ses sous-domaines
  return hostname.includes('smartcabb.com') || 
         hostname.includes('vercel.app');
};

// Détecter si on est en mode debug forcé (via localStorage)
const isDebugMode = () => {
  if (typeof window === 'undefined') return false;
  
  try {
    return localStorage.getItem('smartcabb_debug') === 'true';
  } catch {
    return false;
  }
};

// Fonction helper pour activer le mode debug
export const enableDebug = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('smartcabb_debug', 'true');
    console.log('🐛 Mode debug activé. Rechargez la page.');
  }
};

// Fonction helper pour désactiver le mode debug
export const disableDebug = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('smartcabb_debug');
    console.log('✅ Mode debug désactivé. Rechargez la page.');
  }
};

/**
 * Logger intelligent qui :
 * - Affiche les logs en développement (localhost)
 * - Cache les logs en production (smartcabb.com)
 * - Sauf si mode debug activé manuellement
 */
class Logger {
  private enabled: boolean;

  constructor() {
    // Activer les logs si :
    // - On est en développement (pas production)
    // - OU mode debug forcé
    this.enabled = !isProduction() || isDebugMode();
  }

  log(...args: any[]) {
    if (this.enabled) {
      console.log(...args);
    }
  }

  info(...args: any[]) {
    if (this.enabled) {
      console.info(...args);
    }
  }

  warn(...args: any[]) {
    // ⚠️ Les warnings sont TOUJOURS affichés (même en prod)
    console.warn(...args);
  }

  error(...args: any[]) {
    // ❌ Les erreurs sont TOUJOURS affichées (même en prod)
    console.error(...args);
  }

  debug(...args: any[]) {
    // 🐛 Debug uniquement si mode debug activé
    if (isDebugMode()) {
      console.log('🐛', ...args);
    }
  }

  // Méthode spéciale pour les logs de build
  build(...args: any[]) {
    // Les logs de build s'affichent uniquement au premier chargement
    // et seulement en dev ou mode debug
    if (this.enabled) {
      console.log(...args);
    }
  }
}

// Export singleton
export const logger = new Logger();

// Export helper pour afficher l'état du logger
export const loggerStatus = () => {
  const prod = isProduction();
  const debug = isDebugMode();
  
  console.log('📊 LOGGER STATUS:');
  console.log('  Production:', prod ? '✅ (logs désactivés)' : '❌ (dev mode)');
  console.log('  Debug mode:', debug ? '✅ (forcé)' : '❌');
  console.log('  Logs actifs:', !prod || debug ? '✅' : '❌');
  console.log('');
  console.log('💡 Pour activer le debug en production:');
  console.log('   import { enableDebug } from "./utils/logger"');
  console.log('   enableDebug()');
};

// Message au chargement (uniquement si mode debug)
if (isDebugMode()) {
  console.log('🐛 SmartCabb - Mode DEBUG activé');
  console.log('💡 Pour désactiver: disableDebug()');
}
