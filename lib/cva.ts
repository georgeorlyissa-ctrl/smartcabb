/**
 * 🎯 CLASS VARIANCE AUTHORITY (CVA) - IMPLEMENTATION STANDALONE
 * 
 * Implémentation simplifiée de CVA pour éviter les dépendances externes
 * Compatible avec notre système de composants UI
 */

type ClassValue = string | number | boolean | undefined | null | ClassValue[];
type ClassObject = Record<string, boolean | undefined | null>;

/**
 * Utilitaire pour combiner des classes (comme clsx)
 */
export function cn(...inputs: (ClassValue | ClassObject)[]): string {
  const classes: string[] = [];
  
  for (const input of inputs) {
    if (!input) continue;
    
    if (typeof input === 'string') {
      classes.push(input);
    } else if (typeof input === 'number') {
      classes.push(String(input));
    } else if (Array.isArray(input)) {
      const nested = cn(...input);
      if (nested) classes.push(nested);
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key);
      }
    }
  }
  
  return classes.join(' ');
}

/**
 * Type pour les variantes
 */
type VariantConfig<V extends Record<string, Record<string, string>>> = {
  variants: V;
  defaultVariants?: {
    [K in keyof V]?: keyof V[K];
  };
  compoundVariants?: Array<
    Partial<{ [K in keyof V]: keyof V[K] }> & {
      class: string;
    }
  >;
};

/**
 * Type pour extraire les props de variantes
 */
export type VariantProps<Component extends (...args: any) => any> = 
  Parameters<Component>[0];

/**
 * Fonction CVA principale
 */
export function cva<V extends Record<string, Record<string, string>>>(
  baseClass: string,
  config?: VariantConfig<V>
) {
  return (props?: {
    [K in keyof V]?: keyof V[K];
  } & { class?: string; className?: string }) => {
    if (!config) return cn(baseClass, props?.class, props?.className);
    
    const classes: string[] = [baseClass];
    
    // Appliquer les variantes
    if (config.variants && props) {
      for (const [variantName, variantValues] of Object.entries(config.variants)) {
        const selectedValue = props[variantName as keyof typeof props] ?? 
                            config.defaultVariants?.[variantName as keyof typeof config.defaultVariants];
        
        if (selectedValue && variantValues[selectedValue as string]) {
          classes.push(variantValues[selectedValue as string]);
        }
      }
    }
    
    // Appliquer les variantes composées
    if (config.compoundVariants && props) {
      for (const compound of config.compoundVariants) {
        const { class: compoundClass, ...conditions } = compound;
        
        const matches = Object.entries(conditions).every(([key, value]) => {
          return props[key as keyof typeof props] === value;
        });
        
        if (matches && compoundClass) {
          classes.push(compoundClass);
        }
      }
    }
    
    // Ajouter les classes personnalisées
    if (props?.class) classes.push(props.class);
    if (props?.className) classes.push(props.className);
    
    return cn(...classes);
  };
}
