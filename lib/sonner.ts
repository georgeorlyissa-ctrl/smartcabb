/**
 * 🎯 SONNER SHIM pour /lib/ - Redirection vers implementation standalone
 * 
 * Ce fichier redirige les imports vers notre implementation standalone à la racine
 */

export * from '../sonner';
export { toast as default } from '../sonner';
