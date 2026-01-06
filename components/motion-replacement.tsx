/**
 * 🎨 Remplacement de framer-motion par des animations CSS natives
 * Compatible avec esm.sh CDN de Figma Make
 */

import { HTMLAttributes, ReactNode } from 'react';

interface MotionProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  initial?: any;
  animate?: any;
  exit?: any;
  transition?: any;
  whileHover?: any;
  whileTap?: any;
  variants?: any;
  layout?: boolean;
}

/**
 * Composant motion.div de remplacement avec animations CSS
 */
export function motion({ 
  children, 
  className = '',
  initial,
  animate,
  exit,
  transition,
  whileHover,
  whileTap,
  ...props 
}: MotionProps) {
  // Ajouter les classes d'animation CSS automatiquement
  let animationClass = '';
  
  if (initial?.opacity === 0 || animate?.opacity === 1) {
    animationClass = 'animate-fade-in';
  }
  
  if (initial?.y || initial?.x) {
    animationClass = 'animate-slide-up';
  }

  return (
    <div 
      className={`${animationClass} ${className}`.trim()} 
      {...props}
    >
      {children}
    </div>
  );
}

// Sous-composants pour compatibilité
motion.div = motion;
motion.button = motion;
motion.h1 = motion;
motion.h2 = motion;
motion.p = motion;
motion.span = motion;
motion.section = motion;

/**
 * AnimatePresence - Version simplifiée
 */
export function AnimatePresence({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

// Styles CSS globaux pour les animations
export const motionStyles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from { 
      opacity: 0;
      transform: translateY(20px);
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideDown {
    from { 
      opacity: 0;
      transform: translateY(-20px);
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes scaleIn {
    from { 
      opacity: 0;
      transform: scale(0.9);
    }
    to { 
      opacity: 1;
      transform: scale(1);
    }
  }

  .animate-fade-in {
    animation: fadeIn 0.3s ease-out;
  }

  .animate-slide-up {
    animation: slideUp 0.4s ease-out;
  }

  .animate-slide-down {
    animation: slideDown 0.4s ease-out;
  }

  .animate-scale-in {
    animation: scaleIn 0.3s ease-out;
  }

  .transition-all {
    transition: all 0.3s ease;
  }
`;
