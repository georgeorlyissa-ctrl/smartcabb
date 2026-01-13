/**
 * 🎯 SONNER SHIM (.tsx) - Implémentation standalone qui remplace complètement sonner
 * 
 * Version .tsx pour compatibilité avec imports TypeScript
 */

import * as React from 'react';

// Types pour compatibilité
export interface ToasterProps {
  theme?: 'light' | 'dark' | 'system';
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  className?: string;
  toastOptions?: {
    style?: React.CSSProperties;
    className?: string;
  };
}

// Implémentation directe du toast sans dépendances externes
export const toast = {
  success: (message: string | React.ReactNode, options?: any) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("toast", { 
        detail: { message, type: "success", ...options } 
      }));
    }
  },
  error: (message: string | React.ReactNode, options?: any) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("toast", { 
        detail: { message, type: "error", ...options } 
      }));
    }
  },
  warning: (message: string | React.ReactNode, options?: any) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("toast", { 
        detail: { message, type: "warning", ...options } 
      }));
    }
  },
  info: (message: string | React.ReactNode, options?: any) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("toast", { 
        detail: { message, type: "info", ...options } 
      }));
    }
  },
  message: (message: string | React.ReactNode, options?: any) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("toast", { 
        detail: { message, type: "default", ...options } 
      }));
    }
  },
  promise: (promise: Promise<any>, options: any) => {
    if (options.loading) {
      toast.info(options.loading);
    }
    return promise
      .then((data) => {
        if (options.success) {
          toast.success(typeof options.success === 'function' ? options.success(data) : options.success);
        }
        return data;
      })
      .catch((error) => {
        if (options.error) {
          toast.error(typeof options.error === 'function' ? options.error(error) : options.error);
        }
        throw error;
      });
  },
};

// Hook vide pour compatibilité
export function useToast() {
  return {
    toast,
    toasts: [],
    dismiss: () => {},
  };
}

// Provider vide pour compatibilité - rendu des enfants uniquement
export function ToastProvider({ children }: { children: React.ReactNode }) {
  return children;
}

// Toaster vide pour compatibilité
export function Toaster(props?: ToasterProps) {
  return null;
}

// Export par défaut
export default toast;