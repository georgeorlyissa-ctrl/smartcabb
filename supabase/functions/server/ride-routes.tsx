import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Créer le client Supabase
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// ============================================
// CRÉER UNE DEMANDE DE COURSE (PASSAGER)
// ============================================
app.post('/create', async (c) => {
  try {
    const body = await c.req.json();
    const { 
      passengerId, 
      passengerName,
      passengerPhone,
      pickup, 
      destination, 
      pickupInstructions,
      vehicleType, 
      estimatedPrice, 
      estimatedDuration,
      distance,
      passengerCount
    } = body;

    console.log('🚕 Création demande de course:', { passengerId, pickup, destination });

    // Validation
    if (!passengerId || !pickup || !destination || !estimatedPrice) {
      return c.json({ 
        success: false, 
        error: 'Données manquantes' 
      }, 400);
    }

    // Générer un ID unique pour la course
    const rideId = `ride_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Créer la demande de course dans le KV store
    const rideRequest = {
      id: rideId,
      passengerId,
      passengerName: passengerName || 'Passager',
      passengerPhone: passengerPhone || '',
      pickup,
      destination,
      pickupInstructions: pickupInstructions || '',
      vehicleType: vehicleType || 'smart_standard',
      estimatedPrice,
      estimatedDuration: estimatedDuration || 15,
      distance: distance || 0,
      passengerCount: passengerCount || 1,
      status: 'pending', // En attente d'un conducteur
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString() // Expire dans 5 minutes
    };

    // Sauvegarder dans le KV store avec la clé `ride_request_{rideId}`
    await kv.set(`ride_request_${rideId}`, rideRequest);
    
    // Ajouter aussi dans une liste globale des demandes en attente
    await kv.set(`ride_pending_${rideId}`, rideId);

    console.log('✅ Demande de course créée:', rideId);

    return c.json({
      success: true,
      rideId,
      message: 'Demande de course créée avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur création demande:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur serveur' 
    }, 500);
  }
});

// ============================================
// RÉCUPÉRER LES DEMANDES EN ATTENTE (CONDUCTEUR)
// ============================================
app.get('/pending/:driverId', async (c) => {
  try {
    const driverId = c.req.param('driverId');
    console.log('🔍 Recherche de demandes en attente pour:', driverId);

    // Récupérer les infos du conducteur pour connaître sa catégorie de véhicule
    const driver = await kv.get(`driver:${driverId}`);
    
    if (!driver) {
      console.error('❌ Conducteur introuvable:', driverId);
      return c.json({
        success: false,
        error: 'Conducteur introuvable'
      }, 404);
    }

    // ✅ CORRECTION : Utiliser vehicle.category au lieu de vehicleInfo.type
    let driverVehicleCategory = driver.vehicle?.category || driver.vehicle_category || 'standard';
    
    // Normaliser la catégorie (enlever le préfixe "smart_" si présent)
    if (driverVehicleCategory.startsWith('smart_')) {
      driverVehicleCategory = driverVehicleCategory.replace('smart_', '');
    }
    
    console.log('🚗 Catégorie du conducteur:', driverVehicleCategory);

    // Récupérer toutes les demandes en attente (clés commençant par `ride_request_`)
    const pendingKeys = await kv.getByPrefix('ride_request_');
    
    if (!pendingKeys || pendingKeys.length === 0) {
      console.log('ℹ️ Aucune demande en attente');
      return c.json({
        success: true,
        ride: null,
        message: 'Aucune demande en attente'
      });
    }

    console.log(`📋 ${pendingKeys.length} demande(s) trouvée(s)`);

    // ⏰ VALIDATION STRICTE : Filtrer les demandes RÉCENTES et VALIDES
    const now = new Date();
    const TWO_MINUTES_AGO = new Date(now.getTime() - 2 * 60 * 1000); // 2 minutes
    
    const validRequests = pendingKeys.filter(req => {
      if (!req) return false;
      
      // Vérifier que la demande a une date de création
      if (!req.createdAt) {
        console.log('⚠️ Demande sans date de création:', req.id);
        return false;
      }
      
      const createdAt = new Date(req.createdAt);
      const expiresAt = new Date(req.expiresAt);
      
      // ✅ La demande doit être :
      // 1. En statut "pending"
      // 2. Non expirée
      // 3. Créée il y a moins de 2 minutes (demande ACTIVE)
      const isValid = req.status === 'pending' 
        && expiresAt > now 
        && createdAt > TWO_MINUTES_AGO;
      
      if (!isValid) {
        console.log(`🗑️ Demande ${req.id} ignorée:`, {
          status: req.status,
          expiréeDepuis: expiresAt < now ? `${Math.floor((now.getTime() - expiresAt.getTime()) / 1000)}s` : 'non',
          crééeIlYa: `${Math.floor((now.getTime() - createdAt.getTime()) / 1000)}s`,
          raison: createdAt <= TWO_MINUTES_AGO ? 'Trop ancienne (>2min)' : 'Expirée ou acceptée'
        });
      }
      
      return isValid;
    });

    if (validRequests.length === 0) {
      console.log('ℹ️ Aucune demande valide et récente');
      
      // 🧹 Nettoyer les demandes expirées ou anciennes
      const deletedCount = await cleanupOldRequests(pendingKeys, now);
      console.log(`🧹 ${deletedCount} demande(s) nettoyée(s)`);
      
      return c.json({
        success: true,
        ride: null,
        message: 'Aucune demande valide'
      });
    }

    // ✅ RÉCUPÉRER LE SOLDE DU CONDUCTEUR (pour info uniquement)
    const balanceKey = `driver:${driverId}:balance`;
    const balanceData = await kv.get(balanceKey);
    const driverBalance = balanceData?.balance || 0;
    console.log('💰 Solde du conducteur:', driverBalance, 'CDF');

    // 🎯 FILTRER PAR CATÉGORIE DE VÉHICULE DU CONDUCTEUR
    // Seules les demandes correspondant à la catégorie du conducteur sont affichées
    // SAUF si la demande a le flag "acceptAlternative" (proposition alternative)
    const matchingRequests = validRequests.filter(req => {
      // Normaliser la catégorie de la demande (enlever le préfixe "smart_" si présent)
      let requestCategory = req.vehicleType || 'standard';
      if (requestCategory.startsWith('smart_')) {
        requestCategory = requestCategory.replace('smart_', '');
      }
      
      console.log(`🔍 Comparaison: conducteur=${driverVehicleCategory}, demande=${requestCategory} (original: ${req.vehicleType})`);
      
      // Si la demande accepte une alternative et que le conducteur a une catégorie supérieure
      if (req.acceptAlternative) {
        return req.alternativeCategories?.includes(driverVehicleCategory) || 
               req.alternativeCategories?.includes(`smart_${driverVehicleCategory}`);
      }
      
      // Sinon, correspondance exacte (après normalisation)
      return requestCategory === driverVehicleCategory;
    });

    // 💰 ⚠️ IMPORTANT : On N'EXIGE PLUS de solde minimum pour RECEVOIR une course
    // Le solde est déduit APRÈS la course (commission), pas AVANT
    // Cette logique est commentée mais gardée pour référence
    /*
    const affordableRequests = matchingRequests.filter(req => {
      const estimatedCost = req.estimatedPrice || req.baseCost || 0;
      const canAfford = driverBalance >= estimatedCost;
      
      if (!canAfford) {
        console.log(`💸 Course ${req.id} ignorée : coût ${estimatedCost} CDF > solde ${driverBalance} CDF`);
      }
      
      return canAfford;
    });
    */

    if (matchingRequests.length === 0) {
      console.log(`ℹ️ Aucune demande pour la catégorie ${driverVehicleCategory}`);
      return c.json({
        success: true,
        ride: null,
        message: `Aucune demande pour votre catégorie de véhicule`
      });
    }

    // Prendre la première demande correspondante et abordable
    const rideRequest = matchingRequests[0];
    
    console.log('✅ Demande trouvée pour catégorie', driverVehicleCategory, ':', rideRequest.id);

    return c.json({
      success: true,
      ride: rideRequest
    });

  } catch (error) {
    console.error('❌ Erreur récupération demandes:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur serveur' 
    }, 500);
  }
});

// 🧹 Fonction utilitaire pour nettoyer les anciennes demandes
async function cleanupOldRequests(requests: any[], now: Date) {
  let deletedCount = 0;
  const TWO_MINUTES_AGO = new Date(now.getTime() - 2 * 60 * 1000);
  
  for (const req of requests) {
    if (!req || !req.id) continue;
    
    const createdAt = req.createdAt ? new Date(req.createdAt) : null;
    const expiresAt = req.expiresAt ? new Date(req.expiresAt) : null;
    
    // Supprimer si :
    // - Expirée
    // - Acceptée
    // - Créée il y a plus de 2 minutes
    const shouldDelete = 
      !createdAt || 
      !expiresAt ||
      expiresAt < now || 
      req.status !== 'pending' ||
      createdAt <= TWO_MINUTES_AGO;
    
    if (shouldDelete) {
      await kv.del(`ride_request_${req.id}`);
      await kv.del(`ride_pending_${req.id}`);
      deletedCount++;
    }
  }
  
  return deletedCount;
}

// ============================================
// ACCEPTER UNE COURSE (CONDUCTEUR)
// ============================================
app.post('/accept', async (c) => {
  try {
    const body = await c.req.json();
    const { rideId, driverId, driverName, driverPhone, vehicleInfo } = body;

    console.log('✅ Acceptation de course:', { rideId, driverId });

    // Validation
    if (!rideId || !driverId) {
      return c.json({ 
        success: false, 
        error: 'Données manquantes' 
      }, 400);
    }

    // Récupérer la demande
    const rideRequest = await kv.get(`ride_request_${rideId}`);
    
    if (!rideRequest) {
      return c.json({ 
        success: false, 
        error: 'Demande de course introuvable' 
      }, 404);
    }

    if (rideRequest.status !== 'pending') {
      return c.json({ 
        success: false, 
        error: 'Cette course a déjà été acceptée' 
      }, 400);
    }

    // Générer un code de confirmation
    const confirmationCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Mettre à jour la demande avec les infos du conducteur
    const acceptedRide = {
      ...rideRequest,
      driverId,
      driverName: driverName || 'Conducteur',
      driverPhone: driverPhone || '',
      vehicleInfo: vehicleInfo || {},
      confirmationCode,
      status: 'accepted',
      acceptedAt: new Date().toISOString()
    };

    // Sauvegarder la course acceptée
    await kv.set(`ride_request_${rideId}`, acceptedRide);
    await kv.set(`ride_active_${rideId}`, acceptedRide);
    
    // Supprimer de la liste des courses en attente
    await kv.del(`ride_pending_${rideId}`);

    console.log('✅ Course acceptée par le conducteur:', driverId);

    return c.json({
      success: true,
      ride: acceptedRide,
      confirmationCode,
      message: 'Course acceptée avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur acceptation course:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur serveur' 
    }, 500);
  }
});

// ============================================
// REFUSER UNE COURSE (CONDUCTEUR)
// ============================================
app.post('/decline', async (c) => {
  try {
    const body = await c.req.json();
    const { rideId, driverId } = body;

    console.log('❌ Refus de course:', { rideId, driverId });

    if (!rideId || !driverId) {
      return c.json({ 
        success: false, 
        error: 'Données manquantes' 
      }, 400);
    }

    // La demande reste en attente pour d'autres conducteurs
    console.log('ℹ️ Course refusée, reste disponible pour autres conducteurs');

    return c.json({
      success: true,
      message: 'Course refusée'
    });

  } catch (error) {
    console.error('❌ Erreur refus course:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur serveur' 
    }, 500);
  }
});

// ============================================
// RÉCUPÉRER LE STATUT D'UNE COURSE (PASSAGER)
// ============================================
app.get('/status/:rideId', async (c) => {
  try {
    const rideId = c.req.param('rideId');
    console.log('🔍 Vérification statut course:', rideId);

    const ride = await kv.get(`ride_request_${rideId}`);
    
    if (!ride) {
      // Ne pas logger comme erreur, c'est normal si la course n'existe pas encore
      console.debug('📭 Course non trouvée (peut-être pas encore créée):', rideId);
      return c.json({ 
        success: false, 
        error: 'Course introuvable',
        ride: null
      }, 404);
    }

    return c.json({
      success: true,
      ride
    });

  } catch (error) {
    // Logger en debug pour ne pas polluer les logs avec des erreurs normales
    console.debug('🔍 Erreur vérification statut:', error instanceof Error ? error.message : 'erreur');
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur serveur',
      ride: null
    }, 500);
  }
});

// ============================================
// TERMINER UNE COURSE
// ============================================
app.post('/complete', async (c) => {
  try {
    const body = await c.req.json();
    const { rideId, finalPrice, duration, rating, feedback } = body;

    console.log('🏁 Fin de course:', rideId);

    const ride = await kv.get(`ride_request_${rideId}`);
    
    if (!ride) {
      return c.json({ 
        success: false, 
        error: 'Course introuvable' 
      }, 404);
    }

    // ✅ CALCUL AUTOMATIQUE DE LA COMMISSION
    const rideFinalPrice = finalPrice || ride.estimatedPrice;
    
    // 🔥 Lire le taux de commission depuis les paramètres système
    let commissionPercentage = 15; // Valeur par défaut
    try {
      const systemSettings = await kv.get('system_settings');
      if (systemSettings && typeof systemSettings.postpaidInterestRate === 'number') {
        commissionPercentage = systemSettings.postpaidInterestRate;
      }
    } catch (error) {
      console.warn('⚠️ Erreur lecture taux commission, utilisation valeur par défaut:', error);
    }
    
    const commissionAmount = Math.round(rideFinalPrice * (commissionPercentage / 100));
    const driverEarnings = rideFinalPrice - commissionAmount; // Ce que le conducteur gagne

    console.log('💰 Détails financiers:', {
      prixTotal: rideFinalPrice,
      commission: `${commissionPercentage}% = ${commissionAmount} CDF`,
      gainConducteur: `${driverEarnings} CDF`
    });

    // ✅ DÉDUIRE LE COÛT DE LA COURSE DU SOLDE DU CONDUCTEUR
    const driverId = ride.assignedDriverId;
    if (driverId) {
      const balanceKey = `driver:${driverId}:balance`;
      const currentBalance = await kv.get(balanceKey) || { balance: 0 };
      const currentBalanceValue = typeof currentBalance === 'number' 
        ? currentBalance 
        : (currentBalance.balance || 0);

      // Déduire la commission (le coût pour le conducteur)
      const newBalance = currentBalanceValue - commissionAmount;
      
      await kv.set(balanceKey, { 
        balance: newBalance,
        updated_at: new Date().toISOString()
      });

      console.log(`💳 Solde conducteur mis à jour: ${currentBalanceValue} - ${commissionAmount} = ${newBalance} CDF`);

      // ✅ ENREGISTRER LA TRANSACTION DANS L'HISTORIQUE
      const transactionKey = `transaction:${Date.now()}:${rideId}`;
      await kv.set(transactionKey, {
        type: 'ride_commission',
        rideId: rideId,
        driverId: driverId,
        passengerId: ride.userId,
        amount: rideFinalPrice,
        commission: commissionAmount,
        driverEarnings: driverEarnings,
        previousBalance: currentBalanceValue,
        newBalance: newBalance,
        vehicleCategory: ride.vehicleType,
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0], // Format YYYY-MM-DD pour analytics
      });

      // ✅ METTRE À JOUR LES STATISTIQUES DU CONDUCTEUR
      const statsKey = `driver:${driverId}:stats`;
      const currentStats = await kv.get(statsKey) || {
        totalRides: 0,
        totalEarnings: 0,
        totalCommissions: 0,
        averageRating: 0,
        ratings: []
      };

      const updatedRatings = [...(currentStats.ratings || []), rating || 0];
      const averageRating = updatedRatings.reduce((a, b) => a + b, 0) / updatedRatings.length;

      await kv.set(statsKey, {
        totalRides: (currentStats.totalRides || 0) + 1,
        totalEarnings: (currentStats.totalEarnings || 0) + driverEarnings,
        totalCommissions: (currentStats.totalCommissions || 0) + commissionAmount,
        averageRating: averageRating,
        ratings: updatedRatings,
        lastRideAt: new Date().toISOString()
      });

      console.log(`📊 Stats conducteur mises à jour: ${currentStats.totalRides + 1} courses, moyenne ${averageRating.toFixed(1)}/5`);

      // ✅ ENREGISTRER DANS L'HISTORIQUE JOURNALIER (pour analytics admin)
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const dailyStatsKey = `stats:daily:${today}`;
      const dailyStats = await kv.get(dailyStatsKey) || {
        date: today,
        totalRides: 0,
        totalRevenue: 0,
        totalCommissions: 0,
        totalDriverEarnings: 0,
        ridesByCategory: {},
        activeDrivers: new Set(),
        activePassengers: new Set()
      };

      await kv.set(dailyStatsKey, {
        date: today,
        totalRides: (dailyStats.totalRides || 0) + 1,
        totalRevenue: (dailyStats.totalRevenue || 0) + rideFinalPrice,
        totalCommissions: (dailyStats.totalCommissions || 0) + commissionAmount,
        totalDriverEarnings: (dailyStats.totalDriverEarnings || 0) + driverEarnings,
        ridesByCategory: {
          ...(dailyStats.ridesByCategory || {}),
          [ride.vehicleType]: ((dailyStats.ridesByCategory || {})[ride.vehicleType] || 0) + 1
        },
        activeDrivers: Array.from(new Set([...(dailyStats.activeDrivers || []), driverId])),
        activePassengers: Array.from(new Set([...(dailyStats.activePassengers || []), ride.userId]))
      });

      console.log(`📈 Stats journalières mises à jour: ${(dailyStats.totalRides || 0) + 1} courses aujourd'hui`);
    }

    // Mettre à jour la course
    const completedRide = {
      ...ride,
      status: 'completed',
      finalPrice: rideFinalPrice,
      commission: commissionAmount,
      driverEarnings: driverEarnings,
      commissionPercentage: commissionPercentage,
      duration: duration || 0,
      rating: rating || 0,
      feedback: feedback || '',
      completedAt: new Date().toISOString()
    };

    await kv.set(`ride_request_${rideId}`, completedRide);
    await kv.set(`ride_completed_${rideId}`, completedRide);
    await kv.del(`ride_active_${rideId}`);

    console.log('✅ Course terminée:', rideId);

    return c.json({
      success: true,
      ride: completedRide
    });

  } catch (error) {
    console.error('❌ Erreur fin de course:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur serveur' 
    }, 500);
  }
});

// ============================================
// VÉRIFIER LA DISPONIBILITÉ D'UNE CATÉGORIE
// ============================================
app.get('/check-availability/:rideId', async (c) => {
  try {
    const rideId = c.req.param('rideId');
    console.log('🔍 Vérification disponibilité pour:', rideId);

    const ride = await kv.get(`ride_request_${rideId}`);
    
    if (!ride) {
      return c.json({ 
        success: false, 
        error: 'Course introuvable' 
      }, 404);
    }

    // Vérifier si la course a été acceptée
    if (ride.status === 'accepted') {
      return c.json({
        success: true,
        available: true,
        accepted: true,
        ride
      });
    }

    // Vérifier s'il y a des conducteurs en ligne pour cette catégorie
    const allDrivers = await kv.getByPrefix('driver:');
    
    const requestedCategory = ride.vehicleType;
    const onlineDriversForCategory = allDrivers.filter(driver => {
      if (!driver) return false;
      const category = driver.vehicleInfo?.type || driver.vehicle_category || 'smart_standard';
      return driver.is_available === true && category === requestedCategory;
    });

    console.log(`📊 Conducteurs en ligne pour ${requestedCategory}:`, onlineDriversForCategory.length);

    // Si aucun conducteur disponible, proposer une alternative
    if (onlineDriversForCategory.length === 0) {
      // Hiérarchie des catégories (de base à premium)
      const categoryHierarchy = {
        'smart_standard': ['smart_confort', 'smart_plus', 'smart_business'],
        'smart_confort': ['smart_plus', 'smart_business'],
        'smart_plus': ['smart_business'],
        'smart_business': [] // Pas d'alternative supérieure
      };

      const alternatives = categoryHierarchy[requestedCategory] || [];
      
      // Trouver la première catégorie alternative avec des conducteurs disponibles
      let suggestedCategory = null;
      let availableDriversCount = 0;
      
      for (const altCategory of alternatives) {
        const driversForAlt = allDrivers.filter(driver => {
          if (!driver) return false;
          const category = driver.vehicleInfo?.type || driver.vehicle_category || 'smart_standard';
          return driver.is_available === true && category === altCategory;
        });
        
        if (driversForAlt.length > 0) {
          suggestedCategory = altCategory;
          availableDriversCount = driversForAlt.length;
          break;
        }
      }

      if (suggestedCategory) {
        console.log(`💡 Alternative trouvée: ${suggestedCategory} (${availableDriversCount} conducteurs)`);
        return c.json({
          success: true,
          available: false,
          alternative: {
            category: suggestedCategory,
            driversCount: availableDriversCount,
            originalCategory: requestedCategory
          }
        });
      } else {
        console.log('❌ Aucune alternative disponible');
        return c.json({
          success: true,
          available: false,
          alternative: null
        });
      }
    }

    // Des conducteurs sont disponibles pour la catégorie demandée
    return c.json({
      success: true,
      available: true,
      driversCount: onlineDriversForCategory.length
    });

  } catch (error) {
    // Logger en debug pour ne pas polluer les logs
    console.debug('🔍 Erreur vérification disponibilité:', error instanceof Error ? error.message : 'erreur');
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur serveur' 
    }, 500);
  }
});

// ============================================
// ACCEPTER UNE ALTERNATIVE (PASSAGER)
// ============================================
app.post('/accept-alternative', async (c) => {
  try {
    const body = await c.req.json();
    const { rideId, alternativeCategory, newEstimatedPrice } = body;

    console.log('✅ Acceptation alternative:', { rideId, alternativeCategory });

    if (!rideId || !alternativeCategory) {
      return c.json({ 
        success: false, 
        error: 'Données manquantes' 
      }, 400);
    }

    const ride = await kv.get(`ride_request_${rideId}`);
    
    if (!ride) {
      return c.json({ 
        success: false, 
        error: 'Course introuvable' 
      }, 404);
    }

    // Hiérarchie des alternatives acceptables
    const categoryHierarchy = {
      'smart_standard': ['smart_confort', 'smart_plus', 'smart_business'],
      'smart_confort': ['smart_plus', 'smart_business'],
      'smart_plus': ['smart_business'],
      'smart_business': []
    };

    const allowedAlternatives = categoryHierarchy[ride.vehicleType] || [];

    // Mettre à jour la demande avec l'alternative acceptée
    const updatedRide = {
      ...ride,
      originalVehicleType: ride.vehicleType, // Sauvegarder la catégorie originale
      vehicleType: alternativeCategory, // Nouvelle catégorie acceptée
      estimatedPrice: newEstimatedPrice || ride.estimatedPrice,
      acceptAlternative: true,
      alternativeCategories: [alternativeCategory], // Accepter uniquement cette catégorie
      alternativeAcceptedAt: new Date().toISOString()
    };

    await kv.set(`ride_request_${rideId}`, updatedRide);

    console.log('✅ Alternative acceptée, demande mise à jour');

    return c.json({
      success: true,
      ride: updatedRide,
      message: 'Alternative acceptée'
    });

  } catch (error) {
    console.error('❌ Erreur acceptation alternative:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur serveur' 
    }, 500);
  }
});

// ============================================
// 🧹 NETTOYER TOUTES LES ANCIENNES DEMANDES
// ============================================
app.post('/cleanup', async (c) => {
  try {
    console.log('🧹 Nettoyage des anciennes demandes...');
    
    const allRequests = await kv.getByPrefix('ride_request_');
    const now = new Date();
    
    const deletedCount = await cleanupOldRequests(allRequests, now);
    
    console.log(`✅ Nettoyage terminé: ${deletedCount} demande(s) supprimée(s)`);
    
    return c.json({
      success: true,
      deletedCount,
      message: `${deletedCount} demande(s) nettoyée(s)`
    });
    
  } catch (error) {
    console.error('❌ Erreur nettoyage:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur serveur' 
    }, 500);
  }
});

export default app;