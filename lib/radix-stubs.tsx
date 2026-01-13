/**
 * 🎯 RADIX-UI STUBS - Composants vides pour compatibilité
 * 
 * Ces stubs permettent au code qui importe encore @radix-ui de ne pas crasher
 * Ils ne font rien mais maintiennent l'API de base
 */

import * as React from 'react';

// Stub générique qui rend les enfants
const GenericStub = React.forwardRef<HTMLElement, any>((props, ref) => {
  const { children, ...rest } = props;
  return React.createElement('div', { ref, ...rest }, children);
});

GenericStub.displayName = 'RadixStub';

// Export de tous les composants Radix comme stubs
export const Accordion = GenericStub;
export const AccordionItem = GenericStub;
export const AccordionTrigger = GenericStub;
export const AccordionContent = GenericStub;
export const AccordionHeader = GenericStub;

export const AspectRatio = GenericStub;

export const Avatar = GenericStub;
export const AvatarImage = GenericStub;
export const AvatarFallback = GenericStub;

export const Checkbox = GenericStub;
export const CheckboxIndicator = GenericStub;

export const Collapsible = GenericStub;
export const CollapsibleTrigger = GenericStub;
export const CollapsibleContent = GenericStub;

export const Label = GenericStub;

export const Progress = GenericStub;
export const ProgressIndicator = GenericStub;

export const RadioGroup = GenericStub;
export const RadioGroupItem = GenericStub;
export const RadioGroupIndicator = GenericStub;

export const ScrollArea = GenericStub;
export const ScrollAreaViewport = GenericStub;
export const ScrollAreaScrollbar = GenericStub;
export const ScrollAreaThumb = GenericStub;
export const ScrollAreaCorner = GenericStub;

export const Separator = GenericStub;

export const Slider = GenericStub;
export const SliderTrack = GenericStub;
export const SliderRange = GenericStub;
export const SliderThumb = GenericStub;

export const Switch = GenericStub;
export const SwitchThumb = GenericStub;

export const Tabs = GenericStub;
export const TabsList = GenericStub;
export const TabsTrigger = GenericStub;
export const TabsContent = GenericStub;

export const Toggle = GenericStub;
export const ToggleGroup = GenericStub;
export const ToggleGroupItem = GenericStub;

// Export pour * as Import
export const Root = GenericStub;
export const Item = GenericStub;
export const Trigger = GenericStub;
export const Content = GenericStub;
export const Header = GenericStub;
export const Image = GenericStub;
export const Fallback = GenericStub;
export const Indicator = GenericStub;
export const Viewport = GenericStub;
export const Scrollbar = GenericStub;
export const Thumb = GenericStub;
export const Corner = GenericStub;
export const Track = GenericStub;
export const Range = GenericStub;
export const List = GenericStub;
