/**
 * Wrapper compatible Safari pour sonner toast
 * Réexporte toast sans version spécifique pour éviter les problèmes de compatibilité
 */

// Import sans version spécifique pour compatibilité Safari/iOS
import { toast as sonnerToast } from 'sonner';

// Réexporter tous les types et fonctions de sonner
export const toast = sonnerToast;

// Types pour TypeScript
export type { ExternalToast as ToastOptions } from 'sonner';