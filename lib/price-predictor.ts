/**
 * PRÉDICTEUR DE PRIX INTELLIGENT
 * v1.0 - 13 janvier 2026
 * 
 * Prédit le prix d'une course basé sur :
 * - Historique des courses
 * - Heure de la journée
 * - Jour de la semaine
 * - Conditions de trafic
 * - Demande estimée
 */

import { logger } from '../utils/logger';

export interface PriceFactors {
  distance: number; // en km
  vehicleType: string;
  dayOfWeek: number; // 0-6
  hourOfDay: number; // 0-23
  trafficCondition?: 'light' | 'moderate' | 'heavy';
}

export interface PricePrediction {
  estimatedPrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  confidence: number; // 0-1
  factors: {
    basePrice: number;
    timeMultiplier: number; // 1.0 = normal, 1.5 = +50%
    trafficMultiplier: number;
    demandMultiplier: number;
  };
  recommendation: string;
}

export interface HistoricalTrip {
  distance: number;
  price: number;
  vehicleType: string;
  timestamp: number;
  dayOfWeek: number;
  hourOfDay: number;
}

/**
 * Prédicteur de prix intelligent
 */
class PricePredictor {
  private history: HistoricalTrip[] = [];
  private readonly STORAGE_KEY = 'smartcabb_price_history';
  private readonly MAX_HISTORY = 200;

  // Prix de base par km par type de véhicule (CDF)
  private readonly BASE_RATES = {
    smart_standard: 1250,
    smart_confort: 1500,
    smart_plus: 1750,
    smart_business: 2000
  };

  constructor() {
    this.load();
  }

  /**
   * Charger l'historique
   */
  private load(): void {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        this.history = JSON.parse(data);
      }
    } catch (error) {
      logger.error('Erreur chargement historique prix:', error);
    }
  }

  /**
   * Sauvegarder l'historique
   */
  private save(): void {
    try {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(this.history.slice(-this.MAX_HISTORY))
      );
    } catch (error) {
      logger.error('Erreur sauvegarde historique prix:', error);
    }
  }

  /**
   * Enregistrer une course réelle
   */
  recordTrip(trip: {
    distance: number;
    price: number;
    vehicleType: string;
  }): void {
    const now = new Date();

    this.history.push({
      ...trip,
      timestamp: Date.now(),
      dayOfWeek: now.getDay(),
      hourOfDay: now.getHours()
    });

    this.save();
  }

  /**
   * Prédire le prix d'une course
   */
  predictPrice(factors: PriceFactors): PricePrediction {
    // 1. Prix de base
    const baseRate = this.BASE_RATES[factors.vehicleType as keyof typeof this.BASE_RATES] || this.BASE_RATES.smart_standard;
    const basePrice = baseRate * factors.distance;

    // 2. Multiplicateur temporel (heures de pointe)
    const timeMultiplier = this.getTimeMultiplier(factors.dayOfWeek, factors.hourOfDay);

    // 3. Multiplicateur trafic
    const trafficMultiplier = this.getTrafficMultiplier(factors.trafficCondition);

    // 4. Multiplicateur demande (basé sur historique)
    const demandMultiplier = this.getDemandMultiplier(factors);

    // 5. Calcul final
    const estimatedPrice = Math.round(
      basePrice * timeMultiplier * trafficMultiplier * demandMultiplier
    );

    // 6. Fourchette de prix (±15%)
    const priceRange = {
      min: Math.round(estimatedPrice * 0.85),
      max: Math.round(estimatedPrice * 1.15)
    };

    // 7. Confiance (basée sur historique)
    const confidence = this.calculateConfidence(factors);

    // 8. Recommandation
    const recommendation = this.getRecommendation(timeMultiplier, demandMultiplier);

    return {
      estimatedPrice,
      priceRange,
      confidence,
      factors: {
        basePrice,
        timeMultiplier,
        trafficMultiplier,
        demandMultiplier
      },
      recommendation
    };
  }

  /**
   * Multiplicateur basé sur l'heure
   */
  private getTimeMultiplier(dayOfWeek: number, hourOfDay: number): number {
    // Week-end
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // Vendredi/samedi soir
      if (hourOfDay >= 20 || hourOfDay <= 2) {
        return 1.3; // +30%
      }
      return 1.0;
    }

    // Jours ouvrables
    // Heures de pointe matin (6h-9h)
    if (hourOfDay >= 6 && hourOfDay <= 9) {
      return 1.4; // +40%
    }

    // Heures de pointe soir (16h-19h)
    if (hourOfDay >= 16 && hourOfDay <= 19) {
      return 1.5; // +50%
    }

    // Nuit (22h-5h)
    if (hourOfDay >= 22 || hourOfDay <= 5) {
      return 1.2; // +20% (surcharge nuit)
    }

    // Heures normales
    return 1.0;
  }

  /**
   * Multiplicateur basé sur le trafic
   */
  private getTrafficMultiplier(trafficCondition?: string): number {
    switch (trafficCondition) {
      case 'light':
        return 0.95; // -5% (route fluide)
      case 'moderate':
        return 1.0; // Normal
      case 'heavy':
        return 1.25; // +25% (embouteillages)
      default:
        return 1.0;
    }
  }

  /**
   * Multiplicateur basé sur la demande
   */
  private getDemandMultiplier(factors: PriceFactors): number {
    if (this.history.length < 10) {
      return 1.0; // Pas assez de données
    }

    // Filtrer les courses similaires (même heure, même jour de semaine, ±1h)
    const similarTrips = this.history.filter(trip => {
      return (
        trip.dayOfWeek === factors.dayOfWeek &&
        Math.abs(trip.hourOfDay - factors.hourOfDay) <= 1 &&
        trip.vehicleType === factors.vehicleType
      );
    });

    // Si beaucoup de courses à cette heure → forte demande
    if (similarTrips.length >= 20) {
      return 1.2; // +20%
    } else if (similarTrips.length >= 10) {
      return 1.1; // +10%
    }

    return 1.0;
  }

  /**
   * Calculer la confiance de la prédiction
   */
  private calculateConfidence(factors: PriceFactors): number {
    if (this.history.length === 0) {
      return 0.5; // Confiance faible sans historique
    }

    // Filtrer courses similaires
    const similarTrips = this.history.filter(trip => {
      const distanceDiff = Math.abs(trip.distance - factors.distance);
      return (
        trip.vehicleType === factors.vehicleType &&
        distanceDiff < 2 // ±2 km
      );
    });

    // Plus de données similaires = plus de confiance
    if (similarTrips.length >= 20) return 0.95;
    if (similarTrips.length >= 10) return 0.85;
    if (similarTrips.length >= 5) return 0.75;
    if (similarTrips.length >= 2) return 0.65;

    return 0.55;
  }

  /**
   * Générer une recommandation
   */
  private getRecommendation(timeMultiplier: number, demandMultiplier: number): string {
    const totalMultiplier = timeMultiplier * demandMultiplier;

    if (totalMultiplier >= 1.5) {
      return '🔴 Prix élevé (heure de pointe + forte demande). Attendre 1-2h pour économiser jusqu\'à 40%.';
    } else if (totalMultiplier >= 1.3) {
      return '🟠 Prix modéré (heure de pointe). Attendre peut vous faire économiser ~20%.';
    } else if (totalMultiplier >= 1.1) {
      return '🟡 Prix légèrement élevé. Bon moment pour réserver.';
    } else if (totalMultiplier <= 0.95) {
      return '🟢 Excellent prix ! C\'est le meilleur moment pour réserver.';
    } else {
      return '✅ Prix normal. Vous pouvez réserver maintenant.';
    }
  }

  /**
   * Obtenir l'évolution des prix sur 24h
   */
  getPriceEvolution24h(
    distance: number,
    vehicleType: string,
    dayOfWeek: number
  ): Array<{ hour: number; price: number; label: string }> {
    const evolution: Array<{ hour: number; price: number; label: string }> = [];

    for (let hour = 0; hour < 24; hour++) {
      const prediction = this.predictPrice({
        distance,
        vehicleType,
        dayOfWeek,
        hourOfDay: hour
      });

      let label = '';
      if (hour >= 6 && hour <= 9) label = 'Pointe matin';
      else if (hour >= 16 && hour <= 19) label = 'Pointe soir';
      else if (hour >= 22 || hour <= 5) label = 'Nuit';
      else label = 'Normal';

      evolution.push({
        hour,
        price: prediction.estimatedPrice,
        label
      });
    }

    return evolution;
  }

  /**
   * Trouver le meilleur moment pour réserver (24h)
   */
  getBestTimeToBook(
    distance: number,
    vehicleType: string,
    dayOfWeek: number
  ): { hour: number; price: number; savings: number } {
    const evolution = this.getPriceEvolution24h(distance, vehicleType, dayOfWeek);

    // Trouver prix min et max
    const minPrice = Math.min(...evolution.map(e => e.price));
    const maxPrice = Math.max(...evolution.map(e => e.price));
    const bestTime = evolution.find(e => e.price === minPrice)!;

    return {
      hour: bestTime.hour,
      price: minPrice,
      savings: maxPrice - minPrice
    };
  }

  /**
   * Comparer avec les prix historiques
   */
  compareToPastTrips(factors: PriceFactors): {
    averagePrice: number;
    currentEstimate: number;
    difference: number;
    percentageDifference: number;
  } {
    const prediction = this.predictPrice(factors);

    // Filtrer courses similaires
    const similarTrips = this.history.filter(trip => {
      const distanceDiff = Math.abs(trip.distance - factors.distance);
      return (
        trip.vehicleType === factors.vehicleType &&
        distanceDiff < 2
      );
    });

    if (similarTrips.length === 0) {
      return {
        averagePrice: prediction.estimatedPrice,
        currentEstimate: prediction.estimatedPrice,
        difference: 0,
        percentageDifference: 0
      };
    }

    const averagePrice = similarTrips.reduce((sum, trip) => sum + trip.price, 0) / similarTrips.length;
    const difference = prediction.estimatedPrice - averagePrice;
    const percentageDifference = (difference / averagePrice) * 100;

    return {
      averagePrice: Math.round(averagePrice),
      currentEstimate: prediction.estimatedPrice,
      difference: Math.round(difference),
      percentageDifference: Math.round(percentageDifference)
    };
  }

  /**
   * Obtenir statistiques
   */
  getStats() {
    if (this.history.length === 0) {
      return null;
    }

    const prices = this.history.map(t => t.price);
    const distances = this.history.map(t => t.distance);

    return {
      totalTrips: this.history.length,
      averagePrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      averageDistance: Math.round((distances.reduce((a, b) => a + b, 0) / distances.length) * 10) / 10,
      averagePricePerKm: Math.round(
        (prices.reduce((a, b) => a + b, 0) / distances.reduce((a, b) => a + b, 0))
      )
    };
  }
}

// Export singleton
export const pricePredictor = new PricePredictor();
