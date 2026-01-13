/**
 * VALIDATEURS DE SÉCURITÉ
 * v1.0 - 13 janvier 2026
 * 
 * Validation et sanitization des inputs utilisateur
 * Protection contre XSS, injection, et données malveillantes
 */

/**
 * Validation d'email
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  
  // Pattern RFC 5322 simplifié
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Vérifications supplémentaires
  if (email.length > 254) return false; // Max RFC
  if (email.includes('..')) return false; // Double points interdits
  if (email.startsWith('.') || email.endsWith('.')) return false;
  
  return emailRegex.test(email);
}

/**
 * Validation de téléphone (RDC)
 */
export function isValidPhoneRDC(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  
  // Nettoyer le numéro
  const cleaned = phone.replace(/[\s\-()]/g, '');
  
  // Formats acceptés:
  // - 9 chiffres: 812345678
  // - 10 chiffres: 0812345678
  // - 12 chiffres: 243812345678
  // - 13 chiffres: +243812345678 ou 2430812345678
  
  if (cleaned.length === 9) {
    return /^[0-9]{9}$/.test(cleaned);
  }
  
  if (cleaned.length === 10) {
    return /^0[0-9]{9}$/.test(cleaned);
  }
  
  if (cleaned.length === 12) {
    return /^243[0-9]{9}$/.test(cleaned);
  }
  
  if (cleaned.length === 13) {
    // Avec +
    const withoutPlus = cleaned.replace('+', '');
    return /^243[0-9]{9}$/.test(withoutPlus) || /^2430[0-9]{9}$/.test(cleaned);
  }
  
  return false;
}

/**
 * Normaliser le numéro de téléphone RDC au format 243XXXXXXXXX
 */
export function normalizePhoneRDC(phone: string): string | null {
  if (!isValidPhoneRDC(phone)) return null;
  
  const cleaned = phone.replace(/[\s\-+()]/g, '');
  
  // 9 chiffres → 243XXXXXXXXX
  if (cleaned.length === 9) {
    return `243${cleaned}`;
  }
  
  // 10 chiffres avec 0 → 243XXXXXXXXX
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    return `243${cleaned.substring(1)}`;
  }
  
  // 12 chiffres déjà bon
  if (cleaned.length === 12 && cleaned.startsWith('243')) {
    return cleaned;
  }
  
  // 13 chiffres avec 2430 → 243XXXXXXXXX
  if (cleaned.length === 13 && cleaned.startsWith('2430')) {
    return `243${cleaned.substring(4)}`;
  }
  
  return null;
}

/**
 * Validation de mot de passe fort
 */
export function isStrongPassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!password || typeof password !== 'string') {
    return { isValid: false, errors: ['Mot de passe requis'] };
  }
  
  // Longueur minimale
  if (password.length < 8) {
    errors.push('Minimum 8 caractères');
  }
  
  // Au moins une majuscule
  if (!/[A-Z]/.test(password)) {
    errors.push('Au moins une majuscule');
  }
  
  // Au moins une minuscule
  if (!/[a-z]/.test(password)) {
    errors.push('Au moins une minuscule');
  }
  
  // Au moins un chiffre
  if (!/[0-9]/.test(password)) {
    errors.push('Au moins un chiffre');
  }
  
  // Au moins un caractère spécial
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Au moins un caractère spécial');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize string (protection XSS)
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Validation de nom (pas de caractères spéciaux dangereux)
 */
export function isValidName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  
  // Longueur
  if (name.length < 2 || name.length > 100) return false;
  
  // Uniquement lettres, espaces, tirets, apostrophes
  const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
  
  return nameRegex.test(name);
}

/**
 * Validation de montant (prix, paiement)
 */
export function isValidAmount(amount: any): boolean {
  // Convertir en nombre
  const num = Number(amount);
  
  // Vérifier si c'est un nombre valide
  if (isNaN(num) || !isFinite(num)) return false;
  
  // Doit être positif
  if (num <= 0) return false;
  
  // Limite raisonnable (100 millions CDF)
  if (num > 100000000) return false;
  
  return true;
}

/**
 * Sanitize montant (convertir en nombre sûr)
 */
export function sanitizeAmount(amount: any): number {
  const num = Number(amount);
  
  if (!isValidAmount(num)) {
    return 0;
  }
  
  // Arrondir à 2 décimales
  return Math.round(num * 100) / 100;
}

/**
 * Validation d'URL
 */
export function isValidURL(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const parsed = new URL(url);
    
    // Uniquement HTTP/HTTPS
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Validation de code OTP (6 chiffres)
 */
export function isValidOTP(otp: string): boolean {
  if (!otp || typeof otp !== 'string') return false;
  
  // Exactement 6 chiffres
  return /^[0-9]{6}$/.test(otp);
}

/**
 * Validation de code promo
 */
export function isValidPromoCode(code: string): boolean {
  if (!code || typeof code !== 'string') return false;
  
  // 4-20 caractères alphanumériques
  if (code.length < 4 || code.length > 20) return false;
  
  // Uniquement lettres majuscules et chiffres
  return /^[A-Z0-9]+$/.test(code);
}

/**
 * Validation de coordonnées GPS (Kinshasa)
 */
export function isValidKinshasaCoordinates(lat: number, lng: number): boolean {
  // Kinshasa approximativement:
  // Latitude: -4.0 à -4.7
  // Longitude: 15.0 à 15.6
  
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  if (isNaN(lat) || isNaN(lng)) return false;
  
  // Limites Kinshasa (avec marge)
  const isInKinshasa = 
    lat >= -5.0 && lat <= -3.5 &&
    lng >= 14.5 && lng <= 16.0;
  
  return isInKinshasa;
}

/**
 * Rate limiting simple (client-side)
 */
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  /**
   * Vérifier si une action est rate-limited
   */
  check(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Filtrer les tentatives dans la fenêtre de temps
    const recentAttempts = attempts.filter(time => now - time < windowMs);
    
    // Vérifier si limite atteinte
    if (recentAttempts.length >= maxAttempts) {
      return false; // Rate limited
    }
    
    // Ajouter cette tentative
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    
    return true; // OK
  }
  
  /**
   * Réinitialiser le rate limit pour une clé
   */
  reset(key: string): void {
    this.attempts.delete(key);
  }
  
  /**
   * Nettoyer les anciennes entrées
   */
  cleanup(): void {
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 heure
    
    this.attempts.forEach((attempts, key) => {
      const recentAttempts = attempts.filter(time => now - time < maxAge);
      
      if (recentAttempts.length === 0) {
        this.attempts.delete(key);
      } else {
        this.attempts.set(key, recentAttempts);
      }
    });
  }
}

// Export singleton
export const rateLimiter = new RateLimiter();

// Auto-cleanup toutes les 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    rateLimiter.cleanup();
  }, 5 * 60 * 1000);
}

/**
 * Validation d'objet complet (combiner plusieurs validations)
 */
export interface ValidationRule {
  field: string;
  validator: (value: any) => boolean;
  message: string;
}

export function validateObject(
  data: Record<string, any>,
  rules: ValidationRule[]
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  
  rules.forEach(rule => {
    const value = data[rule.field];
    
    if (!rule.validator(value)) {
      errors[rule.field] = rule.message;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Protection contre les injections SQL (pour les requêtes backend)
 */
export function escapeSQLString(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/'/g, "''")
    .replace(/\\/g, '\\\\')
    .replace(/\0/g, '\\0')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\x1a/g, '\\Z');
}

/**
 * Génération de token sécurisé
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  
  // Utiliser crypto API si disponible (plus sécurisé)
  if (typeof window !== 'undefined' && window.crypto) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      token += chars[array[i] % chars.length];
    }
  } else {
    // Fallback (moins sécurisé)
    for (let i = 0; i < length; i++) {
      token += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  
  return token;
}

/**
 * Hash simple (pour fingerprinting, pas pour mots de passe!)
 */
export async function simpleHash(input: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }
  
  // Fallback simple (non cryptographique)
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16);
}
