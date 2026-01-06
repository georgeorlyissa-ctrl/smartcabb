/**
 * Wrapper compatible Safari pour sonner toast
 * Réexporte toast sans version spécifique pour éviter les problèmes de compatibilité
 */

// Import sans version spécifique pour compatibilité Safari/iOS
import { toast as sonnerToast } from 'sonner';

export const toast = {
  success: (message: string) => sonnerToast.success(message),
  error: (message: string) => sonnerToast.error(message),
  info: (message: string) => sonnerToast.info(message),
  warning: (message: string) => sonnerToast.warning(message),
};

// Types pour TypeScript
export type { ExternalToast as ToastOptions } from 'sonner';