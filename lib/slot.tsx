/**
 * 🎯 SLOT STANDALONE - Implémentation locale sans Radix UI
 * 
 * Composant Slot simple qui permet de rendre un enfant comme composant racine
 * Compatible avec l'API @radix-ui/react-slot mais sans dépendance externe
 */

import * as React from 'react';

interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

/**
 * Slot component - Renders its child directly with merged props
 * Simpler implementation without Radix dependency
 */
export const Slot = React.forwardRef<HTMLElement, SlotProps>(
  (props, forwardedRef) => {
    const { children, ...slotProps } = props;

    if (!React.isValidElement(children)) {
      return <>{children}</>;
    }

    // Merge props from Slot with props from children
    return React.cloneElement(children, {
      ...slotProps,
      ...children.props,
      ref: forwardedRef,
      // Merge className
      className: [slotProps.className, children.props.className]
        .filter(Boolean)
        .join(' '),
      // Merge style
      style: {
        ...slotProps.style,
        ...children.props.style,
      },
    } as any);
  }
);

Slot.displayName = 'Slot';
