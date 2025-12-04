/**
 * 💰 CONFIGURATION DES TARIFS SMARTCABB
 * Grille tarifaire officielle pour toutes les catégories de véhicules
 * 
 * Mise à jour : Décembre 2024
 * Source : Grille tarifaire SmartCabb RDC
 */

export type VehicleCategory = 
  | 'smart_standard' 
  | 'smart_confort' 
  | 'smart_plus' 
  | 'smart_plus_plus' 
  | 'smart_business';

export type ServiceType = 
  | 'course_heure'      // Course par heure
  | 'location_jour'     // Location journalière
  | 'trajet_aeroport';  // Trajet aéroport

export type TimeOfDay = 'jour' | 'nuit';

/**
 * 🔥 Fonction pour obtenir le taux de change dynamiquement
 * Utilise le taux configuré dans le panel admin
 */
function getExchangeRate(): number {
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
  return 2800; // Valeur par défaut
}

/**
 * Taux de change USD vers CDF (DEPRECATED - utilisez getExchangeRate())
 * Conservé pour compatibilité
 */
export const USD_TO_CDF = 2800;

/**
 * Configuration complète des tarifs par catégorie
 */
export const PRICING_CONFIG = {
  smart_standard: {
    name: 'Smart Cabb Standard',
    vehicles: ['IST', 'SUZUKI SWIFT', 'VITZ'],
    capacity: 3,
    features: ['Climatisé', 'Sécurisé'],
    pricing: {
      course_heure: {
        jour: { usd: 7, hours: '06:00-20:59' },
        nuit: { usd: 10, hours: '21:00-05:59' }
      },
      location_jour: {
        usd: 60,
        hours: '07:00-21:00',
        notes: 'Le carburant consommé est à charge du client'
      },
      trajet_aeroport: {
        aller: { usd: 35 },
        aller_retour: { usd: 70 },
        notes: 'Le frais de Parking est à la charge du client'
      }
    },
    rules: {
      zone_lointaine: 'Toute course qui débute ou s\'achève vers la Zone Lointaine, est facturée doublement à la 1ère heure',
      tolerance: '10 minutes de tolérance',
      attente_aeroport: '1 heure après l\'atterrissage'
    }
  },

  smart_confort: {
    name: 'Smart Cabb Confort',
    vehicles: ['BLADE', 'RACTIS', 'NISSAN JUKE', 'TERRIOS', 'RUNX'],
    capacity: 3,
    features: ['Climatisé', 'Sécurisé', 'Connexion Data gratuit'],
    pricing: {
      course_heure: {
        jour: { usd: 9, hours: '06:00-20:59' },
        nuit: { usd: 15, hours: '21:00-05:59' }
      },
      location_jour: {
        usd: 70,
        hours: '07:00-21:00',
        notes: 'Le carburant consommé est à charge du client'
      },
      trajet_aeroport: {
        aller: { usd: 40 },
        aller_retour: { usd: 80 },
        notes: 'Le frais de Parking est à la charge du client'
      }
    },
    rules: {
      zone_lointaine: 'Toute course qui débute ou s\'achève vers la Zone Lointaine, est facturée doublement à la 1ère heure',
      tolerance: '10 minutes de tolérance',
      attente_aeroport: '1 heure après l\'atterrissage'
    }
  },

  smart_plus: {
    name: 'Smart Cabb Plus',
    vehicles: ['TOYOTA MARX', 'TOYOTA CROWN', 'MERCEDES C CLASS', 'HARRIER', 'VANGUARD'],
    capacity: 3,
    features: ['Climatisé', 'Sécurisé', 'Connexion Data gratuit'],
    pricing: {
      course_heure: {
        jour: { usd: 15, hours: '06:00-20:59' },
        nuit: { usd: 17, hours: '21:00-05:59' }
      },
      location_jour: {
        usd: 80,
        hours: '07:00-21:00',
        notes: 'Le carburant consommé est à charge du client'
      },
      trajet_aeroport: {
        aller: { usd: 50 },
        aller_retour: { usd: 90 },
        notes: 'Le frais de Parking est à la charge du client'
      }
    },
    rules: {
      zone_lointaine: 'Toute course qui débute ou s\'achève vers la Zone Lointaine, est facturée doublement à la 1ère heure',
      tolerance: '10 minutes de tolérance',
      attente_aeroport: '1 heure après l\'atterrissage'
    }
  },

  smart_plus_plus: {
    name: 'Smart Cabb Plus Plus',
    vehicles: ['NOAH', 'ALPHARD', 'VOXY'],
    capacity: 7,
    features: ['Climatisé', 'Sécurisé', 'Connexion Data gratuit'],
    pricing: {
      course_heure: {
        jour: { usd: 15, hours: '06:00-20:59' },
        nuit: { usd: 20, hours: '21:00-05:59' }
      },
      location_jour: {
        usd: 100,
        hours: '07:00-21:00',
        notes: 'Le carburant consommé est à charge du client'
      },
      trajet_aeroport: {
        aller: { usd: 60 },
        aller_retour: { usd: 110 },
        notes: 'Le frais de Parking est à la charge du client'
      }
    },
    rules: {
      zone_lointaine: 'Toute course qui débute ou s\'achève vers la Zone Lointaine, est facturée doublement à la 1ère heure',
      tolerance: '10 minutes de tolérance',
      attente_aeroport: '1 heure après l\'atterrissage'
    }
  },

  smart_business: {
    name: 'Smart Cabb Business',
    vehicles: ['PRADO', 'FORTUNER'],
    capacity: 4,
    features: ['Climatisé', 'Sécurisé', 'Rafraichissement', 'Connexion Data gratuit'],
    pricing: {
      course_heure: {
        jour: { usd: 30, hours: '07:00-21:00' },
        nuit: { usd: 30, hours: '21:00-05:59' }
      },
      location_jour: {
        usd: 160,
        hours: '07:00-21:00',
        notes: 'Le carburant consommé est à charge du client. Après 21h00, heures supplémentaires à 30$/heure'
      },
      trajet_aeroport: {
        aller: { usd: 100 },
        aller_retour: { usd: 200 },
        notes: 'Le frais de Parking est à la charge du client'
      }
    },
    rules: {
      tolerance: '10 minutes de tolérance',
      attente_aeroport: '1 heure après l\'atterrissage',
      heures_supplementaires: '30$ par heure après 21h00'
    }
  }
};

/**
 * Calculer le prix d'une course selon la catégorie et le type de service
 */
export function calculatePrice(
  category: VehicleCategory,
  serviceType: ServiceType = 'course_heure',
  options?: {
    timeOfDay?: TimeOfDay;
    isAirportReturn?: boolean;
    zoneLointaine?: boolean;
  }
): number {
  const config = PRICING_CONFIG[category];
  
  if (!config) {
    console.error('Catégorie inconnue:', category);
    return 0;
  }

  let priceUSD = 0;

  switch (serviceType) {
    case 'course_heure':
      const timeOfDay = options?.timeOfDay || getTimeOfDay();
      priceUSD = config.pricing.course_heure[timeOfDay].usd;
      
      // Doublement si zone lointaine
      if (options?.zoneLointaine && config.rules.zone_lointaine) {
        priceUSD *= 2;
      }
      break;

    case 'location_jour':
      priceUSD = config.pricing.location_jour.usd;
      break;

    case 'trajet_aeroport':
      priceUSD = options?.isAirportReturn 
        ? config.pricing.trajet_aeroport.aller_retour.usd
        : config.pricing.trajet_aeroport.aller.usd;
      break;
  }

  // Conversion en CDF
  return Math.round(priceUSD * getExchangeRate());
}

/**
 * Obtenir le moment de la journée (jour/nuit)
 */
export function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  
  // Nuit: 21h00 à 05h59
  if (hour >= 21 || hour < 6) {
    return 'nuit';
  }
  
  // Jour: 06h00 à 20h59
  return 'jour';
}

/**
 * Obtenir les informations tarifaires pour une catégorie
 */
export function getCategoryInfo(category: VehicleCategory) {
  return PRICING_CONFIG[category];
}

/**
 * Obtenir toutes les catégories disponibles
 */
export function getAllCategories(): VehicleCategory[] {
  return Object.keys(PRICING_CONFIG) as VehicleCategory[];
}

/**
 * Formater un prix en CDF
 */
export function formatPriceCDF(priceUSD: number): string {
  const priceCDF = priceUSD * getExchangeRate();
  return `${Math.round(priceCDF).toLocaleString('fr-FR')} CDF`;
}

/**
 * Obtenir le tarif affiché pour l'utilisateur
 */
export function getDisplayPrice(
  category: VehicleCategory,
  serviceType: ServiceType = 'course_heure'
): string {
  const timeOfDay = getTimeOfDay();
  const priceCDF = calculatePrice(category, serviceType, { timeOfDay });
  
  return `${priceCDF.toLocaleString('fr-FR')} CDF`;
}