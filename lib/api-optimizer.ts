/**
 * OPTIMISEUR D'APPELS API
 * v1.0 - 13 janvier 2026
 * 
 * Regroupe (batch) plusieurs appels API similaires en un seul
 * Évite les requêtes redondantes et réduit la charge serveur
 */

import { logger } from '../utils/logger';

interface BatchRequest {
  id: string;
  endpoint: string;
  params: any;
  resolve: (data: any) => void;
  reject: (error: any) => void;
  timestamp: number;
}

interface BatchConfig {
  maxBatchSize?: number; // Nombre max de requêtes par batch
  maxWaitTime?: number; // Temps max d'attente avant d'envoyer le batch (ms)
}

/**
 * Gestionnaire de batching pour les requêtes API
 */
class APIBatcher {
  private queues: Map<string, BatchRequest[]>;
  private timers: Map<string, NodeJS.Timeout>;
  private config: Required<BatchConfig>;

  constructor(config: BatchConfig = {}) {
    this.queues = new Map();
    this.timers = new Map();
    this.config = {
      maxBatchSize: config.maxBatchSize || 10,
      maxWaitTime: config.maxWaitTime || 50 // 50ms
    };
  }

  /**
   * Ajouter une requête à la queue de batching
   */
  async add<T>(
    endpoint: string,
    params: any,
    fetchFn: (batchParams: any[]) => Promise<T[]>
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      // Créer une queue pour cet endpoint si elle n'existe pas
      if (!this.queues.has(endpoint)) {
        this.queues.set(endpoint, []);
      }

      const queue = this.queues.get(endpoint)!;
      
      // Ajouter la requête à la queue
      const request: BatchRequest = {
        id: `${endpoint}_${Date.now()}_${Math.random()}`,
        endpoint,
        params,
        resolve,
        reject,
        timestamp: Date.now()
      };
      
      queue.push(request);

      // Si on atteint la taille max, envoyer immédiatement
      if (queue.length >= this.config.maxBatchSize) {
        this.flush(endpoint, fetchFn);
      } else {
        // Sinon, démarrer/redémarrer le timer
        this.resetTimer(endpoint, fetchFn);
      }
    });
  }

  /**
   * Réinitialiser le timer pour un endpoint
   */
  private resetTimer(endpoint: string, fetchFn: any): void {
    // Annuler le timer existant
    const existingTimer = this.timers.get(endpoint);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Créer un nouveau timer
    const timer = setTimeout(() => {
      this.flush(endpoint, fetchFn);
    }, this.config.maxWaitTime);

    this.timers.set(endpoint, timer);
  }

  /**
   * Envoyer toutes les requêtes en attente pour un endpoint
   */
  private async flush(endpoint: string, fetchFn: any): Promise<void> {
    const queue = this.queues.get(endpoint);
    if (!queue || queue.length === 0) return;

    // Annuler le timer
    const timer = this.timers.get(endpoint);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(endpoint);
    }

    // Récupérer et vider la queue
    const requests = [...queue];
    this.queues.set(endpoint, []);

    logger.debug(`📦 Batching ${requests.length} requêtes pour ${endpoint}`);

    try {
      // Extraire les paramètres de toutes les requêtes
      const batchParams = requests.map(r => r.params);

      // Appeler la fonction de batch
      const results = await fetchFn(batchParams);

      // Résoudre chaque promesse avec son résultat
      requests.forEach((request, index) => {
        request.resolve(results[index]);
      });
    } catch (error) {
      // En cas d'erreur, rejeter toutes les promesses
      requests.forEach(request => {
        request.reject(error);
      });
    }
  }

  /**
   * Vider toutes les queues
   */
  async flushAll(): Promise<void> {
    const endpoints = Array.from(this.queues.keys());
    await Promise.all(
      endpoints.map(endpoint => this.flush(endpoint, () => Promise.resolve([])))
    );
  }
}

// Export singleton
export const apiBatcher = new APIBatcher({
  maxBatchSize: 10,
  maxWaitTime: 50
});

/**
 * DEBOUNCE - Limite la fréquence d'appel d'une fonction
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);
  };
}

/**
 * THROTTLE - Garantit qu'une fonction ne s'exécute pas plus d'une fois par intervalle
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * DEDUPLICATE - Évite les appels identiques simultanés
 */
class RequestDeduplicator {
  private pending: Map<string, Promise<any>>;

  constructor() {
    this.pending = new Map();
  }

  /**
   * Générer une clé unique pour une requête
   */
  private generateKey(endpoint: string, params?: any): string {
    return `${endpoint}::${JSON.stringify(params || {})}`;
  }

  /**
   * Exécuter une requête avec déduplication
   */
  async execute<T>(
    endpoint: string,
    fetchFn: () => Promise<T>,
    params?: any
  ): Promise<T> {
    const key = this.generateKey(endpoint, params);

    // Si une requête identique est en cours, retourner la même promesse
    if (this.pending.has(key)) {
      logger.debug(`🔄 Déduplication: Réutilisation de la requête en cours pour ${endpoint}`);
      return this.pending.get(key)!;
    }

    // Créer et stocker la nouvelle promesse
    const promise = fetchFn()
      .finally(() => {
        // Nettoyer après exécution
        this.pending.delete(key);
      });

    this.pending.set(key, promise);

    return promise;
  }

  /**
   * Annuler toutes les requêtes en attente
   */
  clear(): void {
    this.pending.clear();
  }

  /**
   * Obtenir le nombre de requêtes en cours
   */
  getPendingCount(): number {
    return this.pending.size;
  }
}

// Export singleton
export const requestDeduplicator = new RequestDeduplicator();

/**
 * Helper combiné: Cache + Déduplication + Debounce
 */
export function createOptimizedFetch<T>(
  endpoint: string,
  fetchFn: () => Promise<T>,
  options: {
    cache?: boolean;
    cacheTTL?: number;
    deduplicate?: boolean;
    debounce?: number;
  } = {}
): () => Promise<T> {
  let debouncedFn = fetchFn;

  // Appliquer le debounce si demandé
  if (options.debounce) {
    let timeoutId: NodeJS.Timeout | null = null;
    let pendingPromise: Promise<T> | null = null;

    debouncedFn = () => {
      if (pendingPromise) return pendingPromise;

      pendingPromise = new Promise((resolve, reject) => {
        if (timeoutId) clearTimeout(timeoutId);

        timeoutId = setTimeout(async () => {
          try {
            const result = await fetchFn();
            resolve(result);
          } catch (error) {
            reject(error);
          } finally {
            pendingPromise = null;
            timeoutId = null;
          }
        }, options.debounce);
      });

      return pendingPromise;
    };
  }

  // Wrapper final
  return async () => {
    if (options.deduplicate) {
      return requestDeduplicator.execute(endpoint, debouncedFn);
    }
    return debouncedFn();
  };
}

/**
 * Statistiques globales
 */
export function getOptimizerStats() {
  return {
    pendingRequests: requestDeduplicator.getPendingCount()
  };
}
