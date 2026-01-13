/**
 * 🎯 LUCIDE-REACT SHIM (.tsx) - Redirection vers nos icônes locales
 * 
 * Ce fichier remplace COMPLÈTEMENT la librairie lucide-react
 * Version .tsx pour compatibilité avec imports TypeScript
 */

// Réexporter TOUT depuis notre fichier d'icônes local
export * from './lib/icons';

// Export par défaut pour compatibilité
import * as icons from './lib/icons';
export default icons;
