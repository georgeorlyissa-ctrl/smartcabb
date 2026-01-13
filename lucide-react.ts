/**
 * 🎯 LUCIDE-REACT SHIM - Redirection vers nos icônes locales
 * 
 * Ce fichier remplace COMPLÈTEMENT la librairie lucide-react
 * Tous les imports de 'lucide-react' seront redirigés vers ce fichier
 * qui réexporte nos icônes depuis /lib/icons.tsx
 */

// Réexporter TOUT depuis notre fichier d'icônes local
export * from './lib/icons';

// Export par défaut pour compatibilité
import * as icons from './lib/icons';
export default icons;
