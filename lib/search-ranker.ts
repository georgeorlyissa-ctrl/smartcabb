/**
 * 🧠 ALGORITHME DE RANKING INTELLIGENT - COMME UBER/YANGO
 * 
 * Classe les suggestions selon plusieurs critères :
 * - Distance (plus proche = meilleur)
 * - Popularité (terminaux, marchés = boost)
 * - Contexte temporel (heure de la journée)
 * - Historique utilisateur (récent/fréquent)
 * - Usage global (lieux populaires)
 */

export interface SearchResult {
  id: string;
  name: string;
  description: string;
  coordinates: { lat: number; lng: number };
  placeType?: string;
  distance?: number;
  source?: string;
  
  // Métadonnées de ranking
  score?: number;
  popularityScore?: number;
  contextScore?: number;
  historyScore?: number;
  usageScore?: number;
}

export interface RankingContext {
  userLocation?: { lat: number; lng: number };
  currentHour?: number; // 0-23
  recentSearches?: string[]; // IDs des recherches récentes
  favoriteLocations?: string[]; // IDs des favoris
  globalUsage?: Record<string, number>; // placeId → nombre d'utilisations
}

/**
 * 🎯 RANKER PRINCIPAL
 * 
 * Classe les résultats selon un scoring multi-critères
 */
export class SearchRanker {
  
  /**
   * 🏆 RANK - Fonction principale
   * 
   * Calcule un score pour chaque résultat et les trie
   */
  static rank(
    results: SearchResult[],
    context: RankingContext = {}
  ): SearchResult[] {
    
    // 1. Calculer les scores pour chaque résultat
    const scored = results.map(result => {
      const score = this.calculateScore(result, context);
      
      return {
        ...result,
        score,
        popularityScore: this.getPopularityScore(result),
        contextScore: this.getContextScore(result, context.currentHour),
        historyScore: this.getHistoryScore(result, context),
        usageScore: this.getUsageScore(result, context.globalUsage)
      };
    });
    
    // 2. Trier par score décroissant (meilleur en premier)
    scored.sort((a, b) => (b.score || 0) - (a.score || 0));
    
    return scored;
  }
  
  /**
   * 🧮 CALCULER LE SCORE TOTAL
   * 
   * Combine tous les critères avec des pondérations
   */
  private static calculateScore(
    result: SearchResult,
    context: RankingContext
  ): number {
    let score = 0;
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📏 DISTANCE (40% du score) - CRITÈRE LE PLUS IMPORTANT
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const distanceScore = this.getDistanceScore(result.distance);
    score += distanceScore * 0.40;
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ⭐ POPULARITÉ (25% du score)
    // Terminaux, marchés, hôtels = boost
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const popularityScore = this.getPopularityScore(result);
    score += popularityScore * 0.25;
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🕐 CONTEXTE TEMPOREL (15% du score)
    // Heure de la journée influence les suggestions
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const contextScore = this.getContextScore(result, context.currentHour);
    score += contextScore * 0.15;
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📚 HISTORIQUE UTILISATEUR (10% du score)
    // Lieux récemment visités ou favoris
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const historyScore = this.getHistoryScore(result, context);
    score += historyScore * 0.10;
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🌍 USAGE GLOBAL (10% du score)
    // Lieux populaires auprès de tous les utilisateurs
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const usageScore = this.getUsageScore(result, context.globalUsage);
    score += usageScore * 0.10;
    
    return score;
  }
  
  /**
   * 📏 SCORE DE DISTANCE
   * 
   * Plus proche = meilleur score
   * 0-1km    = 100 points
   * 1-2km    = 80 points
   * 2-3km    = 60 points
   * 3-5km    = 40 points
   * 5km+     = 20 points
   */
  private static getDistanceScore(distance?: number): number {
    if (!distance) return 50; // Score moyen si pas de distance
    
    if (distance <= 1) return 100;
    if (distance <= 2) return 80;
    if (distance <= 3) return 60;
    if (distance <= 5) return 40;
    return 20;
  }
  
  /**
   * ⭐ SCORE DE POPULARITÉ
   * 
   * Certains types de lieux sont plus importants
   */
  private static getPopularityScore(result: SearchResult): number {
    const type = result.placeType?.toLowerCase() || '';
    const name = result.name.toLowerCase();
    
    // Lieux TRÈS populaires (score max)
    if (type === 'terminal') return 100;
    if (type === 'station') return 95;
    if (type === 'airport') return 95;
    if (name.includes('terminus')) return 100;
    if (name.includes('terminal')) return 100;
    if (name.includes('aéroport')) return 95;
    if (name.includes('gare')) return 90;
    
    // Lieux populaires
    if (type === 'market') return 85;
    if (type === 'mall') return 80;
    if (type === 'hospital') return 80;
    if (type === 'school') return 75;
    if (type === 'hotel') return 75;
    if (type === 'restaurant') return 70;
    if (type === 'bank') return 70;
    if (type === 'church') return 65;
    
    // Lieux moyennement populaires
    if (type === 'office') return 60;
    if (type === 'park') return 55;
    if (type === 'neighborhood') return 50;
    
    // Lieux standards
    if (type === 'address') return 40;
    
    // Défaut
    return 50;
  }
  
  /**
   * 🕐 SCORE CONTEXTUEL (HEURE DE LA JOURNÉE)
   * 
   * Les suggestions changent selon l'heure
   */
  private static getContextScore(
    result: SearchResult,
    currentHour?: number
  ): number {
    if (currentHour === undefined) return 50; // Score neutre
    
    const type = result.placeType?.toLowerCase() || '';
    const name = result.name.toLowerCase();
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🌅 MATIN (6h - 9h) - Travail, école
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (currentHour >= 6 && currentHour < 9) {
      if (type === 'office') return 90;
      if (type === 'school') return 90;
      if (name.includes('bureau')) return 90;
      if (name.includes('école')) return 90;
      if (name.includes('lycée')) return 90;
      if (type === 'restaurant') return 40; // Moins pertinent
      if (type === 'hotel') return 30;
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ☀️ MIDI (12h - 14h) - Déjeuner
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (currentHour >= 12 && currentHour < 14) {
      if (type === 'restaurant') return 95;
      if (name.includes('restaurant')) return 95;
      if (name.includes('café')) return 90;
      if (type === 'market') return 80;
      if (type === 'mall') return 75;
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🌆 SOIR (17h - 20h) - Retour maison
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (currentHour >= 17 && currentHour < 20) {
      if (type === 'neighborhood') return 85;
      if (type === 'address') return 85;
      if (name.includes('quartier')) return 85;
      if (type === 'terminal') return 90; // Retour en bus
      if (type === 'station') return 90;
      if (type === 'market') return 80; // Courses
      if (type === 'office') return 30; // Moins pertinent
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🌙 NUIT (21h - 5h) - Sortie, hôtel
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (currentHour >= 21 || currentHour < 6) {
      if (type === 'hotel') return 95;
      if (type === 'restaurant') return 80; // Bars/restaurants
      if (name.includes('bar')) return 90;
      if (name.includes('hôtel')) return 95;
      if (type === 'hospital') return 85; // Urgences
      if (type === 'school') return 20; // Pas pertinent
      if (type === 'office') return 20;
    }
    
    // Neutre pour le reste
    return 50;
  }
  
  /**
   * 📚 SCORE D'HISTORIQUE
   * 
   * Lieux récemment cherchés ou favoris = boost
   */
  private static getHistoryScore(
    result: SearchResult,
    context: RankingContext
  ): number {
    let score = 0;
    
    // Favoris = gros boost
    if (context.favoriteLocations?.includes(result.id)) {
      score += 100;
    }
    
    // Récemment cherché = boost moyen
    if (context.recentSearches?.includes(result.id)) {
      score += 70;
    }
    
    // Nom similaire aux recherches récentes
    if (context.recentSearches) {
      for (const recentId of context.recentSearches) {
        if (result.name.toLowerCase().includes(recentId.toLowerCase())) {
          score += 30;
          break;
        }
      }
    }
    
    return Math.min(score, 100); // Max 100
  }
  
  /**
   * 🌍 SCORE D'USAGE GLOBAL
   * 
   * Lieux populaires auprès de tous les utilisateurs
   */
  private static getUsageScore(
    result: SearchResult,
    globalUsage?: Record<string, number>
  ): number {
    if (!globalUsage || !result.id) return 50;
    
    const usage = globalUsage[result.id] || 0;
    
    // Convertir le nombre d'utilisations en score
    if (usage >= 100) return 100; // Très populaire
    if (usage >= 50) return 90;
    if (usage >= 20) return 80;
    if (usage >= 10) return 70;
    if (usage >= 5) return 60;
    if (usage >= 1) return 55;
    
    return 50; // Jamais utilisé = score neutre
  }
}

/**
 * 🎯 HELPER : RANK RAPIDE
 * 
 * Fonction pratique pour ranking simple
 */
export function rankSearchResults(
  results: SearchResult[],
  userLocation?: { lat: number; lng: number },
  recentSearches?: string[],
  favoriteLocations?: string[]
): SearchResult[] {
  
  const currentHour = new Date().getHours();
  
  return SearchRanker.rank(results, {
    userLocation,
    currentHour,
    recentSearches,
    favoriteLocations
  });
}
