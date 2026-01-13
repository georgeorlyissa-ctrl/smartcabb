/**
 * SYSTÈME DE GESTURES MOBILE
 * v1.0 - 13 janvier 2026
 * 
 * Détection intuitive des gestures tactiles pour une meilleure UX mobile
 * - Swipe (gauche, droite, haut, bas)
 * - Pull-to-refresh
 * - Long press
 * - Double tap
 */

export interface SwipeEvent {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  duration: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface GestureOptions {
  minSwipeDistance?: number; // Distance minimale pour considérer un swipe (px)
  maxSwipeTime?: number; // Temps maximum pour un swipe (ms)
  longPressDelay?: number; // Délai pour long press (ms)
  doubleTapDelay?: number; // Délai maximum entre 2 taps (ms)
}

const DEFAULT_OPTIONS: Required<GestureOptions> = {
  minSwipeDistance: 50,
  maxSwipeTime: 300,
  longPressDelay: 500,
  doubleTapDelay: 300
};

/**
 * Hook pour détecter les swipes
 */
export function useSwipeGesture(
  element: HTMLElement | null,
  onSwipe: (event: SwipeEvent) => void,
  options: GestureOptions = {}
): void {
  if (!element) return;

  const config = { ...DEFAULT_OPTIONS, ...options };
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
  };

  const handleTouchEnd = (e: TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const touchEndTime = Date.now();

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const duration = touchEndTime - touchStartTime;

    // Vérifier si c'est un swipe valide
    if (duration > config.maxSwipeTime) return;

    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Déterminer la direction dominante
    if (absDeltaX > absDeltaY && absDeltaX > config.minSwipeDistance) {
      // Swipe horizontal
      const direction = deltaX > 0 ? 'right' : 'left';
      onSwipe({
        direction,
        distance: absDeltaX,
        duration,
        startX: touchStartX,
        startY: touchStartY,
        endX: touchEndX,
        endY: touchEndY
      });
    } else if (absDeltaY > absDeltaX && absDeltaY > config.minSwipeDistance) {
      // Swipe vertical
      const direction = deltaY > 0 ? 'down' : 'up';
      onSwipe({
        direction,
        distance: absDeltaY,
        duration,
        startX: touchStartX,
        startY: touchStartY,
        endX: touchEndX,
        endY: touchEndY
      });
    }
  };

  element.addEventListener('touchstart', handleTouchStart, { passive: true });
  element.addEventListener('touchend', handleTouchEnd, { passive: true });

  // Cleanup
  return () => {
    element.removeEventListener('touchstart', handleTouchStart);
    element.removeEventListener('touchend', handleTouchEnd);
  };
}

/**
 * Hook pour pull-to-refresh
 */
export function usePullToRefresh(
  element: HTMLElement | null,
  onRefresh: () => void | Promise<void>,
  options: { threshold?: number; resistance?: number } = {}
): void {
  if (!element) return;

  const threshold = options.threshold || 80;
  const resistance = options.resistance || 2.5;

  let touchStartY = 0;
  let pullDistance = 0;
  let isRefreshing = false;

  const handleTouchStart = (e: TouchEvent) => {
    // Seulement si on est en haut de la page
    if (element.scrollTop === 0) {
      touchStartY = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isRefreshing || touchStartY === 0) return;

    const touchY = e.touches[0].clientY;
    const delta = touchY - touchStartY;

    if (delta > 0 && element.scrollTop === 0) {
      pullDistance = delta / resistance;

      // Empêcher le scroll natif
      e.preventDefault();

      // Appliquer l'effet visuel
      element.style.transform = `translateY(${pullDistance}px)`;
      element.style.transition = 'none';

      // Indicateur visuel (optionnel, à styliser avec CSS)
      if (pullDistance > threshold) {
        element.classList.add('pull-to-refresh-ready');
      } else {
        element.classList.remove('pull-to-refresh-ready');
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > threshold && !isRefreshing) {
      isRefreshing = true;
      element.classList.add('pull-to-refresh-loading');

      try {
        await onRefresh();
      } finally {
        isRefreshing = false;
        element.classList.remove('pull-to-refresh-loading', 'pull-to-refresh-ready');
      }
    }

    // Réinitialiser
    element.style.transform = '';
    element.style.transition = 'transform 0.2s ease-out';
    touchStartY = 0;
    pullDistance = 0;
  };

  element.addEventListener('touchstart', handleTouchStart, { passive: true });
  element.addEventListener('touchmove', handleTouchMove, { passive: false });
  element.addEventListener('touchend', handleTouchEnd);

  // Cleanup
  return () => {
    element.removeEventListener('touchstart', handleTouchStart);
    element.removeEventListener('touchmove', handleTouchMove);
    element.removeEventListener('touchend', handleTouchEnd);
  };
}

/**
 * Hook pour long press
 */
export function useLongPress(
  element: HTMLElement | null,
  onLongPress: () => void,
  options: GestureOptions = {}
): void {
  if (!element) return;

  const config = { ...DEFAULT_OPTIONS, ...options };
  let pressTimer: NodeJS.Timeout | null = null;

  const handleTouchStart = () => {
    pressTimer = setTimeout(() => {
      onLongPress();
    }, config.longPressDelay);
  };

  const handleTouchEnd = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
  };

  element.addEventListener('touchstart', handleTouchStart);
  element.addEventListener('touchend', handleTouchEnd);
  element.addEventListener('touchmove', handleTouchEnd); // Annuler si mouvement

  // Cleanup
  return () => {
    if (pressTimer) clearTimeout(pressTimer);
    element.removeEventListener('touchstart', handleTouchStart);
    element.removeEventListener('touchend', handleTouchEnd);
    element.removeEventListener('touchmove', handleTouchEnd);
  };
}

/**
 * Hook pour double tap
 */
export function useDoubleTap(
  element: HTMLElement | null,
  onDoubleTap: () => void,
  options: GestureOptions = {}
): void {
  if (!element) return;

  const config = { ...DEFAULT_OPTIONS, ...options };
  let lastTapTime = 0;

  const handleTouchEnd = () => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapTime;

    if (timeSinceLastTap < config.doubleTapDelay && timeSinceLastTap > 0) {
      onDoubleTap();
      lastTapTime = 0; // Reset pour éviter triple tap
    } else {
      lastTapTime = now;
    }
  };

  element.addEventListener('touchend', handleTouchEnd);

  // Cleanup
  return () => {
    element.removeEventListener('touchend', handleTouchEnd);
  };
}

/**
 * Détecter si l'appareil supporte le touch
 */
export function isTouchDevice(): boolean {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore
    navigator.msMaxTouchPoints > 0
  );
}

/**
 * Détecter l'orientation de l'appareil
 */
export function getDeviceOrientation(): 'portrait' | 'landscape' {
  return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
}

/**
 * Hook pour détecter le changement d'orientation
 */
export function onOrientationChange(callback: (orientation: 'portrait' | 'landscape') => void): () => void {
  const handler = () => {
    callback(getDeviceOrientation());
  };

  window.addEventListener('orientationchange', handler);
  window.addEventListener('resize', handler);

  // Cleanup
  return () => {
    window.removeEventListener('orientationchange', handler);
    window.removeEventListener('resize', handler);
  };
}

/**
 * Empêcher le zoom sur double-tap (iOS Safari)
 */
export function preventDoubleTapZoom(): void {
  let lastTouchEnd = 0;

  document.addEventListener(
    'touchend',
    (event) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    },
    { passive: false }
  );
}

/**
 * Vibration feedback (si supporté)
 */
export function vibrate(pattern: number | number[] = 10): void {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}

/**
 * Haptic feedback léger (pour actions réussies)
 */
export function hapticSuccess(): void {
  vibrate(10); // Court et discret
}

/**
 * Haptic feedback moyen (pour notifications)
 */
export function hapticNotification(): void {
  vibrate([10, 50, 10]); // Double vibration
}

/**
 * Haptic feedback fort (pour erreurs/alertes)
 */
export function hapticError(): void {
  vibrate([50, 100, 50]); // Vibration plus longue
}
