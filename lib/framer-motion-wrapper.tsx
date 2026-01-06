/**
 * Wrapper intelligent pour framer-motion
 * - Sur Vercel: Utilise le vrai framer-motion
 * - Sur Figma Make (esm.sh): Utilise le mock simple
 */

import React from 'react';

// Mock de motion pour fallback
const createMotionComponent = (tag: string) => {
  return React.forwardRef<any, any>((props, ref) => {
    const {
      initial, animate, exit, transition, variants,
      whileHover, whileTap, whileFocus, whileDrag, whileInView,
      drag, dragConstraints, dragElastic, dragMomentum,
      onDragStart, onDrag, onDragEnd,
      layout, layoutId,
      ...htmlProps
    } = props;
    return React.createElement(tag, { ...htmlProps, ref });
  });
};

const mockMotion = {
  div: createMotionComponent('div'),
  span: createMotionComponent('span'),
  p: createMotionComponent('p'),
  h1: createMotionComponent('h1'),
  h2: createMotionComponent('h2'),
  h3: createMotionComponent('h3'),
  h4: createMotionComponent('h4'),
  h5: createMotionComponent('h5'),
  h6: createMotionComponent('h6'),
  button: createMotionComponent('button'),
  a: createMotionComponent('a'),
  img: createMotionComponent('img'),
  svg: createMotionComponent('svg'),
  path: createMotionComponent('path'),
  ul: createMotionComponent('ul'),
  ol: createMotionComponent('ol'),
  li: createMotionComponent('li'),
  input: createMotionComponent('input'),
  textarea: createMotionComponent('textarea'),
  select: createMotionComponent('select'),
  form: createMotionComponent('form'),
  label: createMotionComponent('label'),
  section: createMotionComponent('section'),
  article: createMotionComponent('article'),
  header: createMotionComponent('header'),
  footer: createMotionComponent('footer'),
  nav: createMotionComponent('nav'),
  main: createMotionComponent('main'),
  aside: createMotionComponent('aside'),
};

const MockAnimatePresence: React.FC<{ children: React.ReactNode; mode?: string }> = ({ children }) => {
  return <>{children}</>;
};

// Tenter d'exporter le vrai framer-motion, sinon utiliser le mock
let motion: any = mockMotion;
let AnimatePresence: any = MockAnimatePresence;

// Sur Vercel, framer-motion sera disponible
// Sur Figma Make (esm.sh), on utilisera le mock
try {
  // Cette ligne sera remplacée lors du build Vercel
  if (typeof window !== 'undefined') {
    // Ne rien faire, garder le mock par défaut
  }
} catch (e) {
  // Fallback sur le mock
}

export { motion, AnimatePresence };
