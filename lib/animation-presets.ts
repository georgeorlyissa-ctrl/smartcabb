/**
 * PRÉSETS D'ANIMATIONS OPTIMISÉES
 * v1.0 - 13 janvier 2026
 * 
 * Animations fluides et performantes pour Motion (Framer Motion)
 * Optimisé pour mobile avec 60fps garantis
 */

import type { Variants, Transition } from './motion';

/**
 * Transitions par défaut optimisées
 */
export const transitions = {
  // Rapide et nerveux (pour petits éléments, boutons)
  quick: {
    type: 'spring',
    stiffness: 400,
    damping: 30,
    mass: 0.5
  } as Transition,

  // Fluide et naturel (pour cartes, modales)
  smooth: {
    type: 'spring',
    stiffness: 300,
    damping: 25,
    mass: 0.8
  } as Transition,

  // Doux et élégant (pour grandes surfaces)
  gentle: {
    type: 'spring',
    stiffness: 200,
    damping: 20,
    mass: 1
  } as Transition,

  // Rebond (pour notifications, succès)
  bounce: {
    type: 'spring',
    stiffness: 500,
    damping: 15,
    mass: 0.5
  } as Transition,

  // Ease (pour transitions simples)
  ease: {
    type: 'tween',
    duration: 0.3,
    ease: 'easeInOut'
  } as Transition,

  // Slow (pour grandes transitions)
  slow: {
    type: 'tween',
    duration: 0.5,
    ease: 'easeInOut'
  } as Transition
};

/**
 * Animation: Fade In/Out
 */
export const fadeVariants: Variants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: transitions.ease
  },
  exit: {
    opacity: 0,
    transition: transitions.quick
  }
};

/**
 * Animation: Slide from bottom (pour modales, sheets)
 */
export const slideUpVariants: Variants = {
  hidden: {
    y: '100%',
    opacity: 0
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: transitions.smooth
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: transitions.quick
  }
};

/**
 * Animation: Slide from top (pour notifications)
 */
export const slideDownVariants: Variants = {
  hidden: {
    y: '-100%',
    opacity: 0
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: transitions.smooth
  },
  exit: {
    y: '-100%',
    opacity: 0,
    transition: transitions.quick
  }
};

/**
 * Animation: Slide from right (pour pages, drawers)
 */
export const slideRightVariants: Variants = {
  hidden: {
    x: '100%',
    opacity: 0
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: transitions.smooth
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: transitions.quick
  }
};

/**
 * Animation: Slide from left (retour arrière)
 */
export const slideLeftVariants: Variants = {
  hidden: {
    x: '-100%',
    opacity: 0
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: transitions.smooth
  },
  exit: {
    x: '-100%',
    opacity: 0,
    transition: transitions.quick
  }
};

/**
 * Animation: Scale (zoom in/out)
 */
export const scaleVariants: Variants = {
  hidden: {
    scale: 0.8,
    opacity: 0
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: transitions.bounce
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    transition: transitions.quick
  }
};

/**
 * Animation: Scale up (pour succès, achievements)
 */
export const scaleUpVariants: Variants = {
  hidden: {
    scale: 0
  },
  visible: {
    scale: 1,
    transition: transitions.bounce
  },
  exit: {
    scale: 0,
    transition: transitions.quick
  }
};

/**
 * Animation: Rotation + Scale (pour loaders, spinners)
 */
export const spinVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

/**
 * Animation: Pulse (pour attirer l'attention)
 */
export const pulseVariants: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

/**
 * Animation: Shake (pour erreurs)
 */
export const shakeVariants: Variants = {
  shake: {
    x: [-10, 10, -10, 10, 0],
    transition: {
      duration: 0.4,
      ease: 'easeInOut'
    }
  }
};

/**
 * Animation: Success check (coche qui apparaît)
 */
export const successCheckVariants: Variants = {
  hidden: {
    pathLength: 0,
    opacity: 0
  },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.5, ease: 'easeInOut' },
      opacity: { duration: 0.2 }
    }
  }
};

/**
 * Animation: List items (stagger effect)
 */
export const listContainerVariants: Variants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

export const listItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.smooth
  }
};

/**
 * Animation: Card hover (pour interactions)
 */
export const cardHoverVariants = {
  rest: {
    scale: 1,
    boxShadow: '0px 0px 0px rgba(0,0,0,0)'
  },
  hover: {
    scale: 1.02,
    boxShadow: '0px 8px 20px rgba(0,0,0,0.1)',
    transition: transitions.quick
  },
  tap: {
    scale: 0.98,
    transition: transitions.quick
  }
};

/**
 * Animation: Button press (feedback tactile)
 */
export const buttonPressVariants = {
  rest: {
    scale: 1
  },
  tap: {
    scale: 0.95,
    transition: transitions.quick
  }
};

/**
 * Animation: Swipe indicator (pour drawer, modales)
 */
export const swipeIndicatorVariants: Variants = {
  animate: {
    x: [0, 10, 0],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

/**
 * Animation: Page transition (slide horizontal)
 */
export const pageTransitionVariants: Variants = {
  enter: {
    x: '100%',
    opacity: 0
  },
  center: {
    x: 0,
    opacity: 1,
    transition: transitions.smooth
  },
  exit: {
    x: '-100%',
    opacity: 0,
    transition: transitions.quick
  }
};

/**
 * Animation: Bottom sheet (pour mobile)
 */
export const bottomSheetVariants: Variants = {
  closed: {
    y: '100%',
    transition: transitions.quick
  },
  open: {
    y: 0,
    transition: transitions.smooth
  }
};

/**
 * Animation: Skeleton loader (shimmer effect)
 */
export const skeletonVariants: Variants = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

/**
 * Animation: Notification badge (pop)
 */
export const badgeVariants: Variants = {
  hidden: {
    scale: 0,
    opacity: 0
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: transitions.bounce
  }
};

/**
 * Animation: Progress bar (fill)
 */
export const progressBarVariants = (progress: number): Variants => ({
  initial: {
    width: '0%'
  },
  animate: {
    width: `${progress}%`,
    transition: transitions.ease
  }
});

/**
 * Helper: Créer une animation stagger personnalisée
 */
export function createStaggerAnimation(
  delayBetween: number = 0.1,
  initialDelay: number = 0
): Variants {
  return {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: delayBetween,
        delayChildren: initialDelay
      }
    }
  };
}

/**
 * Helper: Créer une animation de typing effect
 */
export function createTypingAnimation(duration: number = 0.5): Variants {
  return {
    hidden: {
      width: 0,
      opacity: 0
    },
    visible: {
      width: 'auto',
      opacity: 1,
      transition: {
        width: { duration, ease: 'easeInOut' },
        opacity: { duration: 0.1 }
      }
    }
  };
}

/**
 * Configuration pour réduire les animations si préférence utilisateur
 */
export function shouldReduceMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Wrapper conditionnel pour animations (respecte prefers-reduced-motion)
 */
export function getResponsiveVariants(variants: Variants): Variants {
  if (shouldReduceMotion()) {
    // Retourner des variants simplifiés sans animation
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0 } },
      exit: { opacity: 0, transition: { duration: 0 } }
    };
  }
  return variants;
}