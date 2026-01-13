/**
 * 🎯 TOAST SYSTEM - Remplacement de Sonner
 * 
 * System de notifications toast standalone sans dépendance externe
 * Compatible avec l'API Sonner pour faciliter la migration
 */

import * as React from "react";
import { createPortal } from "react-dom";
import { CheckCircle2Icon, XCircleIcon, AlertCircleIcon, InfoIcon, XIcon } from "../../lib/icons";

// Types
type ToastType = "success" | "error" | "warning" | "info" | "default";

interface Toast {
  id: string;
  message: string | React.ReactNode;
  type: ToastType;
  duration?: number;
  description?: string;
}

interface ToastContextType {
  toasts: Toast[];
  toast: (message: string | React.ReactNode, options?: Partial<Omit<Toast, "id" | "message">>) => void;
  success: (message: string | React.ReactNode, options?: Partial<Omit<Toast, "id" | "message" | "type">>) => void;
  error: (message: string | React.ReactNode, options?: Partial<Omit<Toast, "id" | "message" | "type">>) => void;
  warning: (message: string | React.ReactNode, options?: Partial<Omit<Toast, "id" | "message" | "type">>) => void;
  info: (message: string | React.ReactNode, options?: Partial<Omit<Toast, "id" | "message" | "type">>) => void;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    
    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss après duration
    const duration = toast.duration ?? 4000;
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  // Écouter les événements toast globaux
  React.useEffect(() => {
    const handleToastEvent = (event: CustomEvent) => {
      const { message, type, ...options } = event.detail;
      addToast({ message, type, ...options });
    };

    window.addEventListener("toast" as any, handleToastEvent);
    return () => window.removeEventListener("toast" as any, handleToastEvent);
  }, [addToast]);

  const toast = React.useCallback((message: string | React.ReactNode, options?: Partial<Omit<Toast, "id" | "message">>) => {
    addToast({ message, type: "default", ...options });
  }, [addToast]);

  const success = React.useCallback((message: string | React.ReactNode, options?: Partial<Omit<Toast, "id" | "message" | "type">>) => {
    addToast({ message, type: "success", ...options });
  }, [addToast]);

  const error = React.useCallback((message: string | React.ReactNode, options?: Partial<Omit<Toast, "id" | "message" | "type">>) => {
    addToast({ message, type: "error", ...options });
  }, [addToast]);

  const warning = React.useCallback((message: string | React.ReactNode, options?: Partial<Omit<Toast, "id" | "message" | "type">>) => {
    addToast({ message, type: "warning", ...options });
  }, [addToast]);

  const info = React.useCallback((message: string | React.ReactNode, options?: Partial<Omit<Toast, "id" | "message" | "type">>) => {
    addToast({ message, type: "info", ...options });
  }, [addToast]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, success, error, warning, info, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px] pointer-events-none gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>,
    document.body
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [isExiting, setIsExiting] = React.useState(false);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(toast.id), 200);
  };

  const getIcon = () => {
    const iconClass = "size-5 shrink-0";
    switch (toast.type) {
      case "success":
        return <CheckCircle2Icon className={`${iconClass} text-green-500`} />;
      case "error":
        return <XCircleIcon className={`${iconClass} text-red-500`} />;
      case "warning":
        return <AlertCircleIcon className={`${iconClass} text-yellow-500`} />;
      case "info":
        return <InfoIcon className={`${iconClass} text-blue-500`} />;
      default:
        return null;
    }
  };

  const getBgColor = () => {
    switch (toast.type) {
      case "success":
        return "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800";
      case "error":
        return "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800";
      case "info":
        return "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800";
      default:
        return "bg-background border-border";
    }
  };

  return (
    <div
      className={`
        group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all
        ${getBgColor()}
        ${isExiting ? "animate-out fade-out-80 slide-out-to-right-full" : "animate-in fade-in-0 slide-in-from-top-full sm:slide-in-from-bottom-full"}
      `}
    >
      <div className="flex items-start gap-3 flex-1">
        {getIcon()}
        <div className="flex-1 grid gap-1">
          <div className="text-sm font-semibold">{toast.message}</div>
          {toast.description && (
            <div className="text-sm opacity-90">{toast.description}</div>
          )}
        </div>
      </div>
      <button
        onClick={handleDismiss}
        className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
      >
        <XIcon className="size-4" />
      </button>
    </div>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

// Export compatible avec l'API Sonner
export const toast = {
  success: (message: string, options?: any) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("toast", { detail: { message, type: "success", ...options } }));
    }
  },
  error: (message: string, options?: any) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("toast", { detail: { message, type: "error", ...options } }));
    }
  },
  warning: (message: string, options?: any) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("toast", { detail: { message, type: "warning", ...options } }));
    }
  },
  info: (message: string, options?: any) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("toast", { detail: { message, type: "info", ...options } }));
    }
  },
  message: (message: string, options?: any) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("toast", { detail: { message, type: "default", ...options } }));
    }
  },
};