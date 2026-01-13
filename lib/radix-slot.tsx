/**
 * RADIX SLOT STUB
 * Remplacement standalone pour @radix-ui/react-slot
 */

import * as React from 'react';

interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

/**
 * Slot component - Fusionne les props avec l'enfant direct
 */
export const Slot = React.forwardRef<HTMLElement, SlotProps>(
  ({ children, ...props }, forwardedRef) => {
    if (!React.isValidElement(children)) {
      return null;
    }

    // Fusionner les props du Slot avec les props de l'enfant
    return React.cloneElement(children as React.ReactElement<any>, {
      ...props,
      ...children.props,
      ref: forwardedRef,
      // Fusionner les className
      className: props.className
        ? `${props.className} ${(children.props as any).className || ''}`
        : (children.props as any).className,
      // Fusionner les style
      style: {
        ...props.style,
        ...(children.props as any).style
      },
      // Fusionner les onClick et autres handlers
      onClick: (e: React.MouseEvent) => {
        props.onClick?.(e);
        (children.props as any).onClick?.(e);
      }
    });
  }
);

Slot.displayName = 'Slot';
