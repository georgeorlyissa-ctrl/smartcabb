/**
 * Motion wrapper - Remplace framer-motion/motion pour compatibilité esm.sh
 * Toutes les balises motion.* sont maintenant de simples éléments HTML
 */

import React from 'react';

// Créer un proxy pour motion qui retourne des éléments HTML standards
const createMotionComponent = (tag: string) => {
  return React.forwardRef<any, any>((props, ref) => {
    // Supprimer les props spécifiques à motion
    const {
      initial,
      animate,
      exit,
      transition,
      variants,
      whileHover,
      whileTap,
      whileFocus,
      whileDrag,
      whileInView,
      drag,
      dragConstraints,
      dragElastic,
      dragMomentum,
      onDragStart,
      onDrag,
      onDragEnd,
      layout,
      layoutId,
      ...htmlProps
    } = props;

    return React.createElement(tag, { ...htmlProps, ref });
  });
};

// Exporter motion avec tous les éléments HTML
export const motion = {
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

// Exporter AnimatePresence comme composant vide
export const AnimatePresence: React.FC<{ children: React.ReactNode; mode?: string }> = ({ children }) => {
  return <>{children}</>;
};
