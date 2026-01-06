/**
 * 🌍 Configuration d'Environnement SmartCabb
 * 
 * Détecte automatiquement l'environnement (dev/production)
 * et fournit les bonnes URLs et configurations
 */

import { projectId as defaultProjectId, publicAnonKey } from './supabase/info';

/**
 * Détecte si on est en environnement de production
 */
export function isProductionEnvironment(): boolean {
  if (typeof window === 'undefined') {
    return false; // SSR ou Node.js
  }

  const hostname = window.location.hostname;
  
  return (
    hostname === 'smartcabb.com' ||
    hostname === 'www.smartcabb.com' ||
    hostname.endsWith('.vercel.app') ||
    hostname.endsWith('.vercel.com')
  );
}

/**
 * Retourne le Project ID Supabase correct pour l'environnement
 */
export function getProjectId(): string {
  // En production, utiliser le project ID de production
  if (isProductionEnvironment()) {
    // TODO: Remplacer par votre vrai project ID de production
    return process.env.VITE_SUPABASE_PROJECT_ID || 'smartcabb-prod';
  }
  
  // En développement, utiliser le project ID de Figma Make
  return defaultProjectId;
}

/**
 * Retourne l'URL de base Supabase
 */
export function getSupabaseUrl(): string {
  const prodUrl = process.env.VITE_SUPABASE_URL;
  
  if (isProductionEnvironment() && prodUrl) {
    return prodUrl;
  }
  
  return `https://${getProjectId()}.supabase.co`;
}

/**
 * Retourne l'URL complète pour les Edge Functions
 */
export function getEdgeFunctionUrl(functionName: string = 'make-server-2eb02e52'): string {
  return `${getSupabaseUrl()}/functions/v1/${functionName}`;
}

/**
 * Construit une URL d'API complète pour une route donnée
 * 
 * @param route - Route relative (ex: '/drivers/online-drivers')
 * @returns URL complète
 * 
 * @example
 * ```ts
 * // Développement
 * buildApiUrl('/drivers/online-drivers')
 * // → https://zaerjqchzqmcxqblkfkg.supabase.co/functions/v1/make-server-2eb02e52/drivers/online-drivers
 * 
 * // Production
 * buildApiUrl('/drivers/online-drivers')
 * // → https://smartcabb.supabase.co/functions/v1/make-server-2eb02e52/drivers/online-drivers
 * ```
 */
export function buildApiUrl(route: string): string {
  // Nettoyer la route
  const cleanRoute = route.startsWith('/') ? route : `/${route}`;
  
  return `${getEdgeFunctionUrl()}${cleanRoute}`;
}

/**
 * Headers standardisés pour les requêtes API
 * 
 * @param accessToken - Token d'accès optionnel
 * @returns Headers à inclure dans fetch()
 */
export function getApiHeaders(accessToken?: string): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  } else {
    headers['Authorization'] = `Bearer ${publicAnonKey}`;
  }
  
  return headers;
}

/**
 * Configuration complète de l'environnement
 */
export const ENV_CONFIG = {
  isProduction: isProductionEnvironment(),
  projectId: getProjectId(),
  supabaseUrl: getSupabaseUrl(),
  edgeFunctionUrl: getEdgeFunctionUrl(),
  publicAnonKey: publicAnonKey,
} as const;

/**
 * Affiche la configuration actuelle (debug uniquement)
 */
export function logEnvironmentConfig() {
  console.group('🌍 SmartCabb Environment Configuration');
  console.log('Environment:', ENV_CONFIG.isProduction ? 'PRODUCTION' : 'DEVELOPMENT');
  console.log('Hostname:', typeof window !== 'undefined' ? window.location.hostname : 'N/A');
  console.log('Project ID:', ENV_CONFIG.projectId);
  console.log('Supabase URL:', ENV_CONFIG.supabaseUrl);
  console.log('Edge Function URL:', ENV_CONFIG.edgeFunctionUrl);
  console.log('Example API Call:', buildApiUrl('/drivers/online-drivers'));
  console.groupEnd();
}

// Log au démarrage en développement uniquement
if (!isProductionEnvironment() && typeof window !== 'undefined') {
  logEnvironmentConfig();
}
