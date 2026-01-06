/**
 * BUILD VERSION v517.113 - FIX SONNER + RADIX UI DEPENDENCIES
 * 
 * CHANGEMENTS :
 * - package.json: Sonner fixé à exactement 2.0.3 (pas ^1.0.0)
 * - vite.config.ts: Configuration Figma Make optimisée
 * - Fix: Erreurs @radix-ui fetch resolved
 * - Fix: Sonner@2.0.7 → 2.0.3
 */

export const BUILD_VERSION = 'v517.113';
export const BUILD_DATE = '2026-01-06';
export const BUILD_TIMESTAMP = Date.now();
export const FORCE_REBUILD = true;
export const CACHE_BUST = 'fix-sonner-radix-deps-517-113';

console.log('🚀 BUILD v517.113 - FIX SONNER + RADIX UI DEPENDENCIES');
console.log('📦 Sonner: 2.0.3 (version exacte)');
console.log('🔧 Radix UI: Dépendances optimisées');
console.log('✅ Build errors resolved');