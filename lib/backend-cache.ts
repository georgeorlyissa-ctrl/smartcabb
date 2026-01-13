/**
 * SYSTÈME DE CACHE BACKEND INTELLIGENT
 * v1.0 - 13 janvier 2026
 * 
 * Optimise les appels API en mettant en cache les résultats fréquents
 * Réduit la charge serveur et améliore les temps de réponse
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number; // en millisecondes
}

interface CacheConfig {
  maxSize?: number; // Nombre max d'entrées (défaut: 100)
  defaultTTL?: number; // TTL par défaut en ms (défaut: 5 minutes)
}

/**
 * Cache intelligent avec expiration automatique et limite de taille
 */
class BackendCache {
  private cache: Map<string, CacheEntry<any>>;
  private maxSize: number;
  private defaultTTL: number;
  private hits: number = 0;
  private misses: number = 0;

  constructor(config: CacheConfig = {}) {
    this.cache = new Map();
    this.maxSize = config.maxSize || 100;
    this.defaultTTL = config.defaultTTL || 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Générer une clé de cache à partir des paramètres
   */
  private generateKey(endpoint: string, params?: Record<string, any>): string {
    const paramsStr = params ? JSON.stringify(params) : '';
    return `${endpoint}::${paramsStr}`;
  }

  /**
   * Vérifier si une entrée est expirée
   */
  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.expiresIn;
  }

  /**
   * Nettoyer les entrées expirées
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (this.isExpired(entry)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Ajouter une entrée au cache (avec gestion de la taille)
   */
  set<T>(
    endpoint: string,
    data: T,
    params?: Record<string, any>,
    customTTL?: number
  ): void {
    // Nettoyer les entrées expirées avant d'ajouter
    this.cleanup();

    // Si le cache est plein, supprimer l'entrée la plus ancienne
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    const key = this.generateKey(endpoint, params);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresIn: customTTL || this.defaultTTL
    };

    this.cache.set(key, entry);
  }

  /**
   * Récupérer une entrée du cache
   */
  get<T>(endpoint: string, params?: Record<string, any>): T | null {
    const key = this.generateKey(endpoint, params);
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry.data as T;
  }

  /**
   * Invalider une entrée spécifique
   */
  invalidate(endpoint: string, params?: Record<string, any>): void {
    const key = this.generateKey(endpoint, params);
    this.cache.delete(key);
  }

  /**
   * Invalider toutes les entrées d'un endpoint
   */
  invalidateEndpoint(endpoint: string): void {
    const keysToDelete: string[] = [];

    this.cache.forEach((_, key) => {
      if (key.startsWith(`${endpoint}::`)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Vider tout le cache
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Obtenir les statistiques du cache
   */
  getStats() {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? (this.hits / total) * 100 : 0;

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: hitRate.toFixed(2) + '%',
      total
    };
  }
}

// Export singleton
export const backendCache = new BackendCache({
  maxSize: 100,
  defaultTTL: 5 * 60 * 1000 // 5 minutes
});

/**
 * Helper pour wrapper un appel API avec cache
 */
export async function cachedFetch<T>(
  endpoint: string,
  fetchFn: () => Promise<T>,
  options: {
    params?: Record<string, any>;
    ttl?: number; // en millisecondes
    skipCache?: boolean;
  } = {}
): Promise<T> {
  // Si skipCache, appeler directement
  if (options.skipCache) {
    return await fetchFn();
  }

  // Vérifier le cache
  const cached = backendCache.get<T>(endpoint, options.params);
  if (cached !== null) {
    return cached;
  }

  // Appeler l'API et mettre en cache
  const data = await fetchFn();
  backendCache.set(endpoint, data, options.params, options.ttl);

  return data;
}

/**
 * Configuration des TTL par endpoint (en millisecondes)
 */
export const CACHE_TTL = {
  // Données qui changent rarement
  EXCHANGE_RATE: 30 * 60 * 1000, // 30 minutes
  PRICING_CONFIG: 60 * 60 * 1000, // 1 heure
  VEHICLE_TYPES: 60 * 60 * 1000, // 1 heure
  
  // Données modérément dynamiques
  ONLINE_DRIVERS: 30 * 1000, // 30 secondes
  DRIVER_PROFILE: 5 * 60 * 1000, // 5 minutes
  USER_PROFILE: 5 * 60 * 1000, // 5 minutes
  
  // Données très dynamiques (cache court)
  ACTIVE_RIDES: 10 * 1000, // 10 secondes
  DRIVER_LOCATION: 5 * 1000, // 5 secondes
  
  // Pas de cache (données en temps réel)
  NO_CACHE: 0
};

/**
 * Helper pour afficher les stats du cache
 */
export function logCacheStats() {
  const stats = backendCache.getStats();
  console.log('📊 BACKEND CACHE STATS:');
  console.log(`  Taille: ${stats.size}/${stats.maxSize}`);
  console.log(`  Hits: ${stats.hits}`);
  console.log(`  Misses: ${stats.misses}`);
  console.log(`  Hit Rate: ${stats.hitRate}`);
  console.log(`  Total requêtes: ${stats.total}`);
}

// Auto-nettoyage toutes les 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    const sizeBefore = backendCache.getStats().size;
    backendCache['cleanup']();
    const sizeAfter = backendCache.getStats().size;
    
    if (sizeBefore !== sizeAfter) {
      console.log(`🧹 Cache cleanup: ${sizeBefore - sizeAfter} entrées expirées supprimées`);
    }
  }, 5 * 60 * 1000); // Toutes les 5 minutes
}
