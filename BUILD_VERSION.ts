/**
 * Version actuelle du build SmartCabb
 * 
 * CHANGEMENTS :
 * - Version dynamique basée sur la date et l'environnement
 * - Affichage de la version et de la date dans la console
 * - Cache destroyer actif pour forcer le refresh
 */

export const BUILD_VERSION = 'v517.107';
export const BUILD_DATE = new Date().toISOString();
export const BUILD_ENV = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.MODE : 'production';

// Afficher la version dans la console
console.log(`🚀 SmartCabb ${BUILD_VERSION} - ${BUILD_ENV}`);
console.log(`📅 Build: ${BUILD_DATE}`);
console.log(`🔥 Cache destroyer actif - Hard refresh si nécessaire`);