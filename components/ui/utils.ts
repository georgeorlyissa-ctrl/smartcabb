/**
 * 🎯 UTILITIES - IMPLEMENTATION STANDALONE
 * 
 * Utilitaires pour combiner des classes CSS sans dépendances externes
 */

type ClassValue = string | number | boolean | undefined | null | ClassValue[];
type ClassObject = Record<string, boolean | undefined | null>;

/**
 * Fonction cn - Combine et merge les classes Tailwind
 * Implémentation simplifiée sans clsx ni tailwind-merge
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
  
  // Merge des classes Tailwind (simplifié)
  // On garde la dernière occurrence de chaque classe de base
  const classMap = new Map<string, string>();
  
  for (const cls of classes) {
    const parts = cls.split(' ').filter(Boolean);
    
    for (const part of parts) {
      // Extraire la base de la classe (avant le modificateur)
      // Ex: "text-red-500" -> "text", "bg-blue-600" -> "bg"
      const baseMatch = part.match(/^([a-z-]+?)(?:-|$)/);
      const base = baseMatch ? baseMatch[1] : part;
      
      // Garder la dernière valeur pour chaque base
      classMap.set(base, part);
    }
  }
  
  return Array.from(classMap.values()).join(' ');
}
