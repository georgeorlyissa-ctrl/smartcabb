/**
 * 💰 MODULE PRINCIPAL DE PRICING SMARTCABB
 * 
 * Ce fichier centralise tous les exports liés au pricing pour maintenir
 * la rétrocompatibilité avec les imports existants dans l'application.
 * 
 * Mise à jour : Décembre 2024
 */

/**
 * 🔥 Récupère le taux de conversion depuis les paramètres système
 * Si non disponible, utilise la valeur par défaut
 */
export function getExchangeRate(): number {
  try {
    const settingsStr = localStorage.getItem('smartcab_system_settings');
    if (settingsStr) {
      const settings = JSON.parse(settingsStr);
      if (settings.exchangeRate && typeof settings.exchangeRate === 'number') {
        return settings.exchangeRate;
      }
    }
  } catch (error) {
    console.warn('⚠️ Erreur lecture taux de conversion, utilisation valeur par défaut:', error);
  }
  return 2800; // 1 USD = 2800 CDF (valeur par défaut)
}

/**
 * 🔥 Récupère le pourcentage de gain postpaid depuis les paramètres système
 * Si non disponible, utilise la valeur par défaut
 */
export function getPostpaidInterestRate(): number {
  try {
    const settingsStr = localStorage.getItem('smartcab_system_settings');
    if (settingsStr) {
      const settings = JSON.parse(settingsStr);
      if (settings.postpaidInterestRate && typeof settings.postpaidInterestRate === 'number') {
        return settings.postpaidInterestRate;
      }
    }
  } catch (error) {
    console.warn('⚠️ Erreur lecture taux postpaid, utilisation valeur par défaut:', error);
  }
  return 15; // 15% par défaut
}

/**
 * 🔥 Récupère le pourcentage de commission SmartCabb depuis les paramètres système
 * Alias de getPostpaidInterestRate pour la clarté du code
 */
export function getCommissionRate(): number {
  return getPostpaidInterestRate();
}

/**
 * Convertit USD en CDF
 */
export function convertUSDtoCDF(amountUSD: number, exchangeRate?: number): number {
  if (amountUSD === undefined || amountUSD === null || isNaN(amountUSD)) {
    return 0;
  }
  const rate = exchangeRate || getExchangeRate();
  return Math.round(amountUSD * rate);
}

/**
 * Convertit CDF en USD
 */
export function convertCDFtoUSD(amountCDF: number, exchangeRate?: number): number {
  if (amountCDF === undefined || amountCDF === null || isNaN(amountCDF)) {
    return 0;
  }
  const rate = exchangeRate || getExchangeRate();
  return Number((amountCDF / rate).toFixed(2));
}

/**
 * ✅ Calcule la commission SmartCabb sur un montant
 */
export function calculateCommission(totalAmount: number, commissionRate?: number): number {
  if (totalAmount === undefined || totalAmount === null || isNaN(totalAmount)) {
    return 0;
  }
  const rate = commissionRate !== undefined ? commissionRate : getCommissionRate();
  return Math.round(totalAmount * (rate / 100));
}

/**
 * ✅ Calcule le gain conducteur après commission
 */
export function calculateDriverEarnings(totalAmount: number, commissionRate?: number): number {
  const commission = calculateCommission(totalAmount, commissionRate);
  return totalAmount - commission;
}

/**
 * ✅ Ré-exports des fonctions de formatage depuis /utils/formatters.tsx
 * Pour maintenir la compatibilité avec les imports existants
 */
export { formatCDF, formatUSD, formatNumber } from '../utils/formatters';

/**
 * ✅ Ré-exports de pricing-config.ts
 */
export {
  VehicleCategory,
  ServiceType,
  TimeOfDay,
  PRICING_CONFIG,
  calculatePrice,
  getTimeOfDay,
  getCategoryInfo,
  getAllCategories,
  formatPriceCDF
} from './pricing-config';

/**
 * ✅ Alias pour la rétrocompatibilité
 * Certains fichiers importent VEHICLE_PRICING au lieu de PRICING_CONFIG
 */
export { PRICING_CONFIG as VEHICLE_PRICING } from './pricing-config';

/**
 * ✅ Constantes globales
 */
export const CONSTANTS = {
  get EXCHANGE_RATE() {
    return getExchangeRate(); // Utilise le taux dynamique au lieu d'une valeur fixe
  },
  get COMMISSION_RATE() {
    return getCommissionRate(); // Utilise le taux dynamique
  },
  WALLET_DISCOUNT_THRESHOLD: 20, // Seuil de 20$ USD pour réduction wallet
  WALLET_DISCOUNT_PERCENT: 5 // Réduction de 5%
};

/**
 * ✅ Fonction helper pour déterminer si c'est le jour (compatibilité)
 */
export function isDayTime(): boolean {
  const hour = new Date().getHours();
  // Jour: 06h00 à 20h59
  return hour >= 6 && hour < 21;
}

/**
 * ✅ Calcule le prix horaire en USD (compatibilité)
 */
export function calculateHourlyPrice(
  category: VehicleCategory,
  hours: number = 1,
  isNight: boolean = false
): number {
  const config = PRICING_CONFIG[category];
  if (!config) return 0;
  
  const timeOfDay = isNight ? 'nuit' : 'jour';
  const hourlyRate = config.pricing.course_heure[timeOfDay].usd;
  
  return hourlyRate * hours;
}

/**
 * ✅ Calcule le prix en CDF (compatibilité)
 */
export function calculatePriceCDF(priceUSD: number, exchangeRate?: number): number {
  const rate = exchangeRate || getExchangeRate();
  return Math.round(priceUSD * rate);
}

/**
 * Grille tarifaire officielle SmartCabb (types pour TypeScript)
 */
export interface VehiclePricing {
  id: string;
  name: string;
  displayName: string;
  capacity: number;
  vehicles: string[];
  features: string[];
  hourlyRateDay: number;
  hourlyRateNight: number;
  dailyRate: number;
  airportOneWay: number;
  airportRoundTrip: number;
  dayHours: string;
  nightHours: string;
  notes: string[];
}

// Importations depuis pricing-config.ts
import { PRICING_CONFIG, VehicleCategory } from './pricing-config';
