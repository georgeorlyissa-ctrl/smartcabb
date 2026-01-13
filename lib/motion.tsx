/**
 * 🎯 MOTION MINIMAL - Remplacement standalone pour framer-motion
 * 
 * Implémentation minimale de motion qui utilise uniquement du CSS
 * sans aucune dépendance externe
 */

import * as React from 'react';

type MotionProps = {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  initial?: any;
  animate?: any;
  exit?: any;
  transition?: any;
  whileHover?: any;
  whileTap?: any;
  variants?: any;
  layout?: boolean | string;
  layoutId?: string;
  drag?: boolean | 'x' | 'y';
  dragConstraints?: any;
  dragElastic?: number;
  dragMomentum?: boolean;
  onDragEnd?: (event: any, info: any) => void;
  onClick?: (event: React.MouseEvent) => void;
  onMouseEnter?: (event: React.MouseEvent) => void;
  onMouseLeave?: (event: React.MouseEvent) => void;
  [key: string]: any;
};

// Fonction helper pour convertir les props motion en styles CSS
function convertMotionToStyles(props: MotionProps): React.CSSProperties {
  const styles: React.CSSProperties = { ...props.style };
  
  // Appliquer initial comme style par défaut
  if (props.initial) {
    if (typeof props.initial.opacity !== 'undefined') {
      styles.opacity = props.initial.opacity;
    }
    if (typeof props.initial.scale !== 'undefined') {
      styles.transform = `scale(${props.initial.scale})`;
    }
    if (typeof props.initial.x !== 'undefined' || typeof props.initial.y !== 'undefined') {
      const x = props.initial.x || 0;
      const y = props.initial.y || 0;
      styles.transform = `translate(${x}px, ${y}px)`;
    }
  }
  
  // Transition CSS
  const duration = props.transition?.duration || 0.3;
  styles.transition = `all ${duration}s ease-in-out`;
  
  return styles;
}

// Composant Motion générique
function createMotionComponent(tag: keyof JSX.IntrinsicElements) {
  return React.forwardRef<HTMLElement, MotionProps>((props, ref) => {
    const {
      children,
      className,
      initial,
      animate,
      exit,
      transition,
      whileHover,
      whileTap,
      variants,
      layout,
      layoutId,
      drag,
      dragConstraints,
      dragElastic,
      dragMomentum,
      onDragEnd,
      style: customStyle,
      ...rest
    } = props;

    const [isHovered, setIsHovered] = React.useState(false);
    const [isTapped, setIsTapped] = React.useState(false);
    const [currentStyle, setCurrentStyle] = React.useState<React.CSSProperties>({});

    // Calculer le style initial
    React.useEffect(() => {
      const baseStyle = convertMotionToStyles(props);
      setCurrentStyle(baseStyle);
      
      // Animer vers l'état final après un tick
      const timer = setTimeout(() => {
        const animatedStyle: React.CSSProperties = { ...baseStyle };
        
        if (animate) {
          if (typeof animate.opacity !== 'undefined') {
            animatedStyle.opacity = animate.opacity;
          }
          if (typeof animate.scale !== 'undefined') {
            animatedStyle.transform = `scale(${animate.scale})`;
          }
          if (typeof animate.x !== 'undefined' || typeof animate.y !== 'undefined') {
            const x = animate.x || 0;
            const y = animate.y || 0;
            animatedStyle.transform = `translate(${x}px, ${y}px)`;
          }
          if (typeof animate.rotate !== 'undefined') {
            animatedStyle.transform = `rotate(${animate.rotate}deg)`;
          }
        }
        
        setCurrentStyle(animatedStyle);
      }, 10);
      
      return () => clearTimeout(timer);
    }, [animate, initial]);

    // Gérer hover
    const handleMouseEnter = (e: React.MouseEvent) => {
      setIsHovered(true);
      if (props.onMouseEnter) props.onMouseEnter(e);
    };

    const handleMouseLeave = (e: React.MouseEvent) => {
      setIsHovered(false);
      if (props.onMouseLeave) props.onMouseLeave(e);
    };

    // Gérer tap
    const handleMouseDown = () => {
      setIsTapped(true);
    };

    const handleMouseUp = () => {
      setIsTapped(false);
    };

    // Calculer le style final avec hover/tap
    const finalStyle: React.CSSProperties = { ...currentStyle, ...customStyle };
    
    if (isHovered && whileHover) {
      if (typeof whileHover.scale !== 'undefined') {
        finalStyle.transform = `scale(${whileHover.scale})`;
      }
    }
    
    if (isTapped && whileTap) {
      if (typeof whileTap.scale !== 'undefined') {
        finalStyle.transform = `scale(${whileTap.scale})`;
      }
    }

    return React.createElement(
      tag,
      {
        ref,
        className,
        style: finalStyle,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        onMouseDown: handleMouseDown,
        onMouseUp: handleMouseUp,
        ...rest,
      },
      children
    );
  });
}

// Export des composants motion
export const motion = {
  div: createMotionComponent('div'),
  span: createMotionComponent('span'),
  p: createMotionComponent('p'),
  button: createMotionComponent('button'),
  a: createMotionComponent('a'),
  img: createMotionComponent('img'),
  h1: createMotionComponent('h1'),
  h2: createMotionComponent('h2'),
  h3: createMotionComponent('h3'),
  h4: createMotionComponent('h4'),
  h5: createMotionComponent('h5'),
  h6: createMotionComponent('h6'),
  ul: createMotionComponent('ul'),
  ol: createMotionComponent('ol'),
  li: createMotionComponent('li'),
  section: createMotionComponent('section'),
  article: createMotionComponent('article'),
  header: createMotionComponent('header'),
  footer: createMotionComponent('footer'),
  nav: createMotionComponent('nav'),
  main: createMotionComponent('main'),
  aside: createMotionComponent('aside'),
  form: createMotionComponent('form'),
  input: createMotionComponent('input'),
  textarea: createMotionComponent('textarea'),
  select: createMotionComponent('select'),
  label: createMotionComponent('label'),
  table: createMotionComponent('table'),
  thead: createMotionComponent('thead'),
  tbody: createMotionComponent('tbody'),
  tr: createMotionComponent('tr'),
  td: createMotionComponent('td'),
  th: createMotionComponent('th'),
};

// AnimatePresence - version simplifiée
export const AnimatePresence: React.FC<{
  children: React.ReactNode;
  mode?: 'wait' | 'sync' | 'popLayout';
  initial?: boolean;
}> = ({ children }) => {
  return <>{children}</>;
};

// Hook useAnimation
export function useAnimation() {
  return {
    start: () => {},
    set: () => {},
    stop: () => {},
  };
}

// Types exports
export type Variants = Record<string, any>;
export type Transition = {
  duration?: number;
  delay?: number;
  ease?: string | number[];
  type?: string;
  stiffness?: number;
  damping?: number;
  repeat?: number;
};
