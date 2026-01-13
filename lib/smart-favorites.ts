/**
 * SYSTÈME DE FAVORIS INTELLIGENTS
 * v1.0 - 13 janvier 2026
 * 
 * Apprend des habitudes de l'utilisateur pour suggérer automatiquement
 * les trajets fréquents et adapter les suggestions par contexte
 */

import { logger } from '../utils/logger';

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface FavoriteLocation extends Location {
  id: string;
  name: string; // "Maison", "Travail", "Salle de sport"
  icon?: string; // Emoji ou icône
  category?: 'home' | 'work' | 'leisure' | 'custom';
  visitCount: number;
  lastVisited: number;
  createdAt: number;
}

export interface Trip {
  pickup: Location;
  destination: Location;
  timestamp: number;
  price: number;
  vehicleType: string;
}

export interface SmartSuggestion {
  location: FavoriteLocation;
  score: number; // 0-100
  reason: string; // "Vous allez souvent ici le lundi matin"
  confidence: number; // 0-1
}

/**
 * Gestionnaire de favoris intelligents
 */
class SmartFavoritesManager {
  private favorites: FavoriteLocation[] = [];
  private tripHistory: Trip[] = [];
  private readonly STORAGE_KEY_FAVORITES = 'smartcabb_smart_favorites';
  private readonly STORAGE_KEY_TRIPS = 'smartcabb_trip_history';
  private readonly MAX_TRIP_HISTORY = 100;

  constructor() {
    this.load();
  }

  /**
   * Charger depuis localStorage
   */
  private load(): void {
    try {
      const favoritesData = localStorage.getItem(this.STORAGE_KEY_FAVORITES);
      const tripsData = localStorage.getItem(this.STORAGE_KEY_TRIPS);

      if (favoritesData) {
        this.favorites = JSON.parse(favoritesData);
      }

      if (tripsData) {
        this.tripHistory = JSON.parse(tripsData);
      }
    } catch (error) {
      logger.error('Erreur chargement favoris:', error);
    }
  }

  /**
   * Sauvegarder dans localStorage
   */
  private save(): void {
    try {
      localStorage.setItem(
        this.STORAGE_KEY_FAVORITES,
        JSON.stringify(this.favorites)
      );
      localStorage.setItem(
        this.STORAGE_KEY_TRIPS,
        JSON.stringify(this.tripHistory.slice(-this.MAX_TRIP_HISTORY))
      );
    } catch (error) {
      logger.error('Erreur sauvegarde favoris:', error);
    }
  }

  /**
   * Ajouter un favori manuellement
   */
  addFavorite(
    location: Location,
    name: string,
    category?: FavoriteLocation['category']
  ): FavoriteLocation {
    const favorite: FavoriteLocation = {
      ...location,
      id: `fav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      category: category || 'custom',
      visitCount: 0,
      lastVisited: Date.now(),
      createdAt: Date.now()
    };

    this.favorites.push(favorite);
    this.save();

    return favorite;
  }

  /**
   * Supprimer un favori
   */
  removeFavorite(id: string): boolean {
    const index = this.favorites.findIndex(f => f.id === id);
    
    if (index !== -1) {
      this.favorites.splice(index, 1);
      this.save();
      return true;
    }

    return false;
  }

  /**
   * Mettre à jour un favori
   */
  updateFavorite(id: string, updates: Partial<FavoriteLocation>): boolean {
    const favorite = this.favorites.find(f => f.id === id);
    
    if (favorite) {
      Object.assign(favorite, updates);
      this.save();
      return true;
    }

    return false;
  }

  /**
   * Obtenir tous les favoris
   */
  getFavorites(): FavoriteLocation[] {
    return [...this.favorites].sort((a, b) => b.visitCount - a.visitCount);
  }

  /**
   * Obtenir les favoris par catégorie
   */
  getFavoritesByCategory(category: FavoriteLocation['category']): FavoriteLocation[] {
    return this.favorites
      .filter(f => f.category === category)
      .sort((a, b) => b.visitCount - a.visitCount);
  }

  /**
   * Enregistrer un trajet (pour apprentissage)
   */
  recordTrip(trip: Trip): void {
    this.tripHistory.push({
      ...trip,
      timestamp: Date.now()
    });

    // Mettre à jour les favoris existants
    this.updateFavoritesFromTrip(trip);

    // Apprendre de nouveaux favoris si pattern détecté
    this.learnFromTrips();

    this.save();
  }

  /**
   * Mettre à jour les favoris basés sur un trajet
   */
  private updateFavoritesFromTrip(trip: Trip): void {
    // Vérifier si la destination correspond à un favori existant
    const matchingFavorite = this.findMatchingFavorite(trip.destination);
    
    if (matchingFavorite) {
      matchingFavorite.visitCount++;
      matchingFavorite.lastVisited = Date.now();
    }
  }

  /**
   * Trouver un favori qui correspond à une localisation
   */
  private findMatchingFavorite(location: Location): FavoriteLocation | null {
    const DISTANCE_THRESHOLD = 0.1; // ~100 mètres

    return this.favorites.find(fav => {
      const distance = this.calculateDistance(
        fav.lat,
        fav.lng,
        location.lat,
        location.lng
      );
      return distance < DISTANCE_THRESHOLD;
    }) || null;
  }

  /**
   * Calculer distance (Haversine)
   */
  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Rayon terre en km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Apprendre automatiquement de nouveaux favoris
   */
  private learnFromTrips(): void {
    // Analyser les destinations fréquentes
    const destinationFrequency = new Map<string, { location: Location; count: number }>();

    this.tripHistory.forEach(trip => {
      const key = `${trip.destination.lat.toFixed(4)},${trip.destination.lng.toFixed(4)}`;
      const existing = destinationFrequency.get(key);

      if (existing) {
        existing.count++;
      } else {
        destinationFrequency.set(key, {
          location: trip.destination,
          count: 1
        });
      }
    });

    // Si une destination apparaît 3+ fois et n'est pas déjà un favori, suggérer
    destinationFrequency.forEach((data, key) => {
      if (data.count >= 3) {
        const matchingFavorite = this.findMatchingFavorite(data.location);
        
        if (!matchingFavorite) {
          // Suggérer d'ajouter comme favori (pourrait être affiché dans l'UI)
          logger.debug('Nouveau lieu fréquent détecté:', data.location.address);
        }
      }
    });
  }

  /**
   * Obtenir des suggestions intelligentes basées sur le contexte
   */
  getSmartSuggestions(context?: {
    currentLocation?: Location;
    dayOfWeek?: number; // 0-6
    hourOfDay?: number; // 0-23
  }): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = [];
    const now = new Date();
    const dayOfWeek = context?.dayOfWeek ?? now.getDay();
    const hourOfDay = context?.hourOfDay ?? now.getHours();

    this.favorites.forEach(favorite => {
      let score = 0;
      const reasons: string[] = [];

      // Score basé sur fréquence de visite
      score += Math.min(favorite.visitCount * 5, 40);

      // Score basé sur récence
      const daysSinceVisit = (Date.now() - favorite.lastVisited) / (1000 * 60 * 60 * 24);
      if (daysSinceVisit < 7) {
        score += 20;
        reasons.push('visité récemment');
      }

      // Score basé sur catégorie et contexte temporel
      if (favorite.category === 'work') {
        // Jours ouvrables, matin
        if (dayOfWeek >= 1 && dayOfWeek <= 5 && hourOfDay >= 6 && hourOfDay <= 10) {
          score += 30;
          reasons.push('heure de travail');
        }
        // Jours ouvrables, soir
        if (dayOfWeek >= 1 && dayOfWeek <= 5 && hourOfDay >= 16 && hourOfDay <= 20) {
          score += 20;
          reasons.push('fin de journée');
        }
      }

      if (favorite.category === 'home') {
        // Tard le soir
        if (hourOfDay >= 18 || hourOfDay <= 6) {
          score += 25;
          reasons.push('heure de retour');
        }
      }

      if (favorite.category === 'leisure') {
        // Week-end
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          score += 20;
          reasons.push('week-end');
        }
      }

      // Score basé sur proximité (si position actuelle fournie)
      if (context?.currentLocation) {
        const distance = this.calculateDistance(
          context.currentLocation.lat,
          context.currentLocation.lng,
          favorite.lat,
          favorite.lng
        );

        // Pénalité si trop proche (déjà là)
        if (distance < 0.5) {
          score -= 30;
        }
        // Bonus si distance raisonnable (3-15 km)
        else if (distance >= 3 && distance <= 15) {
          score += 15;
        }
      }

      // Analyser patterns temporels dans l'historique
      const tripsToThisLocation = this.tripHistory.filter(trip => {
        const distance = this.calculateDistance(
          trip.destination.lat,
          trip.destination.lng,
          favorite.lat,
          favorite.lng
        );
        return distance < 0.1;
      });

      // Si pattern temporel détecté (même jour/heure)
      const sameDayTimeTrips = tripsToThisLocation.filter(trip => {
        const tripDate = new Date(trip.timestamp);
        return (
          tripDate.getDay() === dayOfWeek &&
          Math.abs(tripDate.getHours() - hourOfDay) <= 1
        );
      });

      if (sameDayTimeTrips.length >= 2) {
        score += 25;
        reasons.push('habituel pour ce moment');
      }

      // Créer la suggestion si score > 0
      if (score > 0) {
        suggestions.push({
          location: favorite,
          score: Math.min(score, 100),
          reason: reasons.join(', ') || 'destination fréquente',
          confidence: Math.min(score / 100, 1)
        });
      }
    });

    // Trier par score
    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Top 5
  }

  /**
   * Obtenir statistiques
   */
  getStats() {
    return {
      favoritesCount: this.favorites.length,
      tripsCount: this.tripHistory.length,
      mostVisited: this.favorites.sort((a, b) => b.visitCount - a.visitCount)[0],
      categoriesDistribution: {
        home: this.favorites.filter(f => f.category === 'home').length,
        work: this.favorites.filter(f => f.category === 'work').length,
        leisure: this.favorites.filter(f => f.category === 'leisure').length,
        custom: this.favorites.filter(f => f.category === 'custom').length
      }
    };
  }
}

// Export singleton
export const smartFavorites = new SmartFavoritesManager();
