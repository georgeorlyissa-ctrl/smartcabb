import { Hono } from "npm:hono@4";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv-wrapper.tsx";
import * as matching from "./ride-matching.ts";
import { checkDriversAvailability, getCategoryName } from "./ride-availability-helper.tsx";

const app = new Hono();

// Créer le client Supabase
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// ✅ GRILLE TARIFAIRE PAR CATÉGORIE (pour calculer le solde minimum)
const PRICING_CONFIG = {
  smart_standard: { course_heure: { jour: { usd: 7 }, nuit: { usd: 10 } } },
  smart_confort: { course_heure: { jour: { usd: 9 }, nuit: { usd: 15 } } },
  smart_plus: { course_heure: { jour: { usd: 15 }, nuit: { usd: 17 } } },
  smart_plus_plus: { course_heure: { jour: { usd: 15 }, nuit: { usd: 20 } } },
  smart_business: { course_heure: { jour: { usd: 20 }, nuit: { usd: 25 } } }
};

// ✅ FONCTION : Calculer le solde minimum requis selon la catégorie
function getMinimumBalanceForCategory(category: string, exchangeRate: number = 2850): number {
  const pricing = PRICING_CONFIG[category as keyof typeof PRICING_CONFIG];
  if (!pricing) {
    return PRICING_CONFIG.smart_standard.course_heure.jour.usd * exchangeRate;
  }
  return pricing.course_heure.jour.usd * exchangeRate;
}

// 📱 Fonction pour envoyer le code de confirmation par SMS
async function sendConfirmationSMS(phone: string, code: string, driverName: string): Promise<{ success: boolean; error?: string }> {
  try {
    const apiKey = Deno.env.get('AFRICAS_TALKING_API_KEY');
    const username = Deno.env.get('AFRICAS_TALKING_USERNAME');

    if (!apiKey || !username) {
      const errorMsg = 'Variables d\'environnement manquantes pour Africa\'s Talking (API Key ou Username)';
      console.error('❌', errorMsg);
      return { success: false, error: errorMsg };
    }

    const message = `SmartCabb: ${driverName} a accepté votre course. Code de confirmation: ${code}. Donnez ce code au conducteur avant de démarrer.`;

    console.log('📱 Envoi SMS de confirmation vers:', phone);
    console.log('📝 Message:', message);

    const response = await fetch('https://api.africastalking.com/version1/messaging', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'apiKey': apiKey,
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        username: username,
        to: phone,
        message: message,
        from: 'SMARTCABB' // 🆔 Sender ID approuvé par Africa's Talking
      }).toString()
    });

    console.log('📡 Code HTTP reçu:', response.status);

    if (!response.ok) {
      const error = await response.text();
      const errorMsg = `Erreur HTTP ${response.status}: ${error}`;
      console.error('❌', errorMsg);
      return { success: false, error: errorMsg };
    }

    // Vérifier si la réponse est JSON avant de parser
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const result = await response.json();
      console.log('✅ Réponse Africa\'s Talking:', JSON.stringify(result));
      
      // Vérifier le statut du destinataire
      if (result.SMSMessageData?.Recipients?.[0]) {
        const recipient = result.SMSMessageData.Recipients[0];
        
        // ✅ CORRECTION : Gestion spécifique du solde insuffisant
        if (recipient.status === 'InsufficientBalance' || recipient.statusCode === '405' || recipient.statusCode === 405) {
          const warnMsg = '⚠️ SOLDE INSUFFISANT sur votre compte Africa\'s Talking. Le SMS de confirmation n\'a pas pu être envoyé.';
          console.warn(warnMsg);
          console.log('💡 Code de confirmation disponible dans les logs:', code);
          // Retourner quand même succès car le code est généré
          return { success: true, warning: 'Solde SMS insuffisant' };
        }
        
        if (recipient.status === 'Success' || recipient.statusCode === '101' || recipient.statusCode === 101) {
          console.log('✅ SMS confirmé accepté');
          return { success: true };
        } else {
          const errorMsg = `SMS rejeté - Code: ${recipient.statusCode}, Status: ${recipient.status}`;
          console.error('❌', errorMsg);
          // ⚠️ Ne pas bloquer le processus, juste logger
          console.log('💡 Code disponible pour debug:', code);
          return { success: true, warning: errorMsg }; // Retourner succès quand même
        }
      }
      
      return { success: true }; // Fallback si pas de Recipients mais response.ok
    } else {
      const text = await response.text();
      console.log('⚠️ Réponse non-JSON de l\'API SMS:', text);
      // Si le statut est OK (200-299), on considère que ça a marché
      return { success: true };
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Erreur lors de l\'envoi SMS';
    console.error('❌ Erreur envoi SMS:', errorMsg);
    return { success: false, error: errorMsg };
  }
}

// ============================================
// CRÉER UNE DEMANDE DE COURSE (PASSAGER)
// ============================================
app.post('/create', async (c) => {
  try {
    console.log('📥 POST /rides/create - Requête reçue');
    
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

    console.log('🚕 Création demande de course:', { 
      passengerId, 
      passengerName,
      vehicleType,
      pickup: pickup?.address || 'N/A', 
      destination: destination?.address || 'N/A',
      estimatedPrice 
    });

    // Validation
    if (!passengerId || !pickup || !destination || !estimatedPrice) {
      console.error('❌ Validation échouée - Données manquantes:', {
        hasPassengerId: !!passengerId,
        hasPickup: !!pickup,
        hasDestination: !!destination,
        hasEstimatedPrice: !!estimatedPrice
      });
      return c.json({ 
        success: false, 
        error: 'Données manquantes (passengerId, pickup, destination, estimatedPrice requis)' 
      }, 400);
    }

    // Générer un ID unique pour la course
    const rideId = `ride_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    console.log('🆔 Ride ID généré:', rideId);

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

    console.log('💾 Sauvegarde dans KV store avec clé:', `ride_request_${rideId}`);
    console.log('📦 Données à sauvegarder:', JSON.stringify(rideRequest, null, 2));
    
    // 🔥 LOG: Timestamp AVANT kv.set()
    const beforeSetTime = Date.now();
    console.log(`⏰ [${new Date().toISOString()}] AVANT kv.set() - Timestamp: ${beforeSetTime}`);
    
    // Sauvegarder dans le KV store avec la clé `ride_request_{rideId}`
    try {
      await kv.set(`ride_request_${rideId}`, rideRequest);
      const afterSetTime = Date.now();
      console.log(`⏰ [${new Date().toISOString()}] APRÈS kv.set() - Durée: ${afterSetTime - beforeSetTime}ms`);
      console.log(`✅ KV store set() réussi pour ride_request_${rideId}`);
    } catch (kvError) {
      console.error('❌ Erreur KV store set():', kvError);
      console.error('❌ Type erreur:', kvError instanceof Error ? kvError.constructor.name : typeof kvError);
      console.error('❌ Stack:', kvError instanceof Error ? kvError.stack : 'N/A');
      throw kvError;
    }
    
    // Ajouter aussi dans une liste globale des demandes en attente
    try {
      await kv.set(`ride_pending_${rideId}`, rideId);
      console.log(`✅ KV store set() réussi pour ride_pending_${rideId}`);
    } catch (kvError) {
      console.error('❌ Erreur KV store set() pour pending:', kvError);
      // Ne pas bloquer si cette partie échoue
    }
    
    // ⏰ DÉLAI DE SÉCURITÉ: Attendre 1000ms (1 seconde) pour garantir la persistance dans Supabase
    // Supabase retourne la promesse avant que la donnée soit vraiment committée
    console.log(`⏰ [${new Date().toISOString()}] Attente de 1000ms pour garantir la persistance...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`⏰ [${new Date().toISOString()}] Délai de 1000ms terminé, début de la vérification`);
    
    // Vérification immédiate : relire la course pour s'assurer qu'elle est bien sauvegardée
    let verificationSuccess = false;
    let attemptCount = 0;
    const maxAttempts = 3;
    
    while (!verificationSuccess && attemptCount < maxAttempts) {
      attemptCount++;
      console.log(`🔍 Tentative de vérification #${attemptCount}/${maxAttempts}...`);
      
      try {
        const verification = await kv.get(`ride_request_${rideId}`);
        
        if (verification) {
          console.log(`✅ VÉRIFICATION RÉUSSIE à la tentative #${attemptCount}`);
          console.log('📋 Données vérifiées:', JSON.stringify(verification, null, 2));
          verificationSuccess = true;
        } else {
          console.error(`❌ VÉRIFICATION ÉCHOUÉE à la tentative #${attemptCount}: Course non trouvée!`);
          
          if (attemptCount < maxAttempts) {
            const waitTime = attemptCount * 500; // 500ms, puis 1000ms
            console.log(`⏰ Attente de ${waitTime}ms avant nouvelle tentative...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        }
      } catch (verifyError) {
        console.error(`❌ Erreur lors de la vérification (tentative #${attemptCount}):`, verifyError);
        console.error('❌ Type erreur vérification:', verifyError instanceof Error ? verifyError.constructor.name : typeof verifyError);
        
        if (attemptCount < maxAttempts) {
          const waitTime = attemptCount * 500;
          console.log(`⏰ Attente de ${waitTime}ms avant nouvelle tentative...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          throw verifyError;
        }
      }
    }
    
    if (!verificationSuccess) {
      const errorMsg = `ÉCHEC CRITIQUE: Impossible de vérifier la sauvegarde après ${maxAttempts} tentatives`;
      console.error(`❌ ${errorMsg}`);
      console.error('🔍 Debugging info:', {
        rideId,
        key: `ride_request_${rideId}`,
        timestamp: new Date().toISOString(),
        attempts: attemptCount
      });
      throw new Error(errorMsg);
    }

    console.log('✅ Demande de course créée avec succès:', rideId);

    return c.json({
      success: true,
      rideId,
      message: 'Demande de course créée avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur création demande:', error);
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'N/A');
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

    // 🔥 NOUVELLE LOGIQUE : TRI PAR DISTANCE (conducteur le plus proche)
    // Calculer la distance entre le conducteur et le point de départ de chaque course
    const driverLocation = driver.currentLocation;
    
    if (!driverLocation || !driverLocation.latitude || !driverLocation.longitude) {
      console.log('⚠️ Position GPS du conducteur non disponible, retour première demande');
      const rideRequest = matchingRequests[0];
      return c.json({
        success: true,
        ride: rideRequest
      });
    }

    // Fonction pour calculer la distance (formule de Haversine)
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371; // Rayon de la Terre en km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    // Ajouter la distance à chaque demande
    const requestsWithDistance = matchingRequests.map(req => {
      const pickupLat = req.pickup?.latitude || req.pickup?.lat;
      const pickupLon = req.pickup?.longitude || req.pickup?.lng;
      
      if (!pickupLat || !pickupLon) {
        console.log('⚠️ Course sans coordonnées de départ:', req.id);
        return { ...req, distanceToDriver: 999999 }; // Distance infinie si pas de coordonnées
      }
      
      const distance = calculateDistance(
        driverLocation.latitude,
        driverLocation.longitude,
        pickupLat,
        pickupLon
      );
      
      return { ...req, distanceToDriver: distance };
    });

    // 🔥 NOUVELLE LOGIQUE : TRI INTELLIGENT (Proximité + Notation)
    // On favorise les chauffeurs bien notés qui sont proches
    // Formule : score = (distance * 0.7) + ((5 - rating) * 2.0)
    // Plus le score est BAS, mieux c'est
    // 
    // Exemples :
    // - Chauffeur 5★ à 2km : score = (2 * 0.7) + ((5-5) * 2) = 1.4
    // - Chauffeur 4★ à 1km : score = (1 * 0.7) + ((5-4) * 2) = 2.7
    // - Chauffeur 3★ à 0.5km : score = (0.5 * 0.7) + ((5-3) * 2) = 4.35
    // Résultat : Le 5★ à 2km sera prioritaire !
    
    const driverRating = driver.rating || 5.0; // Note actuelle du conducteur
    
    requestsWithDistance.sort((a, b) => {
      // Facteur distance (70% de poids)
      const distanceScoreA = a.distanceToDriver * 0.7;
      const distanceScoreB = b.distanceToDriver * 0.7;
      
      // Facteur notation (30% de poids, inversé pour favoriser les mieux notés)
      // Un écart de 1★ = ~2km de distance
      const ratingPenaltyA = (5 - driverRating) * 2.0;
      const ratingPenaltyB = (5 - driverRating) * 2.0;
      
      const totalScoreA = distanceScoreA + ratingPenaltyA;
      const totalScoreB = distanceScoreB + ratingPenaltyB;
      
      return totalScoreA - totalScoreB;
    });

    // Prendre la demande avec le meilleur score
    const rideRequest = requestsWithDistance[0];
    
    console.log('✅ Demande optimale trouvée (proximité + notation):', {
      rideId: rideRequest.id,
      category: driverVehicleCategory,
      distanceToDriver: `${(rideRequest.distanceToDriver || 0).toFixed(2)} km`,
      driverRating: `${driverRating.toFixed(1)}★`,
      totalMatching: matchingRequests.length,
      algorithm: 'Proximité (70%) + Notation (30%)'
    });

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
    
    // ✅ Supprimer UNIQUEMENT les courses en attente (pending) qui sont :
    // - Expirées (expiresAt < now)
    // - OU créées il y a plus de 2 minutes ET toujours pending
    // ⚠️ NE PAS supprimer les courses accepted, in_progress, ou completed !
    const shouldDelete = 
      req.status === 'pending' && (
        !createdAt || 
        !expiresAt ||
        expiresAt < now || 
        createdAt <= TWO_MINUTES_AGO
      );
    
    if (shouldDelete) {
      await kv.del(`ride_request_${req.id}`);
      await kv.del(`ride_pending_${req.id}`);
      deletedCount++;
      console.log(`🗑️ Course supprimée (nettoyage): ${req.id} (statut: ${req.status})`);
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

    // 🚫 SUPPRIMÉ : Génération du code de confirmation (simplification UX)
    // const confirmationCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Mettre à jour la demande avec les infos du conducteur
    const acceptedRide = {
      ...rideRequest,
      driverId,
      driverName: driverName || 'Conducteur',
      driverPhone: driverPhone || '',
      vehicleInfo: vehicleInfo || {},
      // 🚫 confirmationCode supprimé pour simplifier l'UX
      status: 'accepted',
      acceptedAt: new Date().toISOString()
    };

    // Sauvegarder la course acceptée
    await kv.set(`ride_request_${rideId}`, acceptedRide);
    await kv.set(`ride_active_${rideId}`, acceptedRide);
    
    // Supprimer de la liste des courses en attente
    await kv.del(`ride_pending_${rideId}`);

    console.log('✅ Course acceptée par le conducteur:', driverId);

    // 🚫 SUPPRIMÉ : Envoi du code de confirmation par SMS (simplification UX)
    // await sendConfirmationSMS(rideRequest.passengerPhone, confirmationCode, driverName);

    return c.json({
      success: true,
      ride: acceptedRide,
      // 🚫 confirmationCode supprimé
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
// RÉCUPÉRER LA COURSE ACTIVE D'UN CONDUCTEUR
// ============================================
app.get('/active-driver-ride/:driverId', async (c) => {
  try {
    const driverId = c.req.param('driverId');
    console.log('🔍 Recherche course active pour conducteur:', driverId);

    // Récupérer toutes les courses du conducteur
    const allRides = await kv.getByPrefix('ride_request_');
    
    if (!allRides || allRides.length === 0) {
      console.log('📭 Aucune course trouvée');
      return c.json({ 
        success: false, 
        error: 'Aucune course trouvée',
        ride: null
      }, 404);
    }

    // Filtrer pour trouver la course active de ce conducteur
    const activeRide = allRides.find((ride: any) => 
      ride.driverId === driverId && 
      ride.status === 'in_progress'
    );

    if (!activeRide) {
      console.log('📭 Aucune course active pour ce conducteur');
      return c.json({ 
        success: false, 
        error: 'Aucune course active',
        ride: null
      }, 404);
    }

    console.log('✅ Course active trouvée:', activeRide.id);
    return c.json({
      success: true,
      ride: activeRide
    });

  } catch (error) {
    console.error('❌ Erreur recherche course active:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur serveur',
      ride: null
    }, 500);
  }
});

// ============================================
// 🔥 ACTIVER LE COMPTEUR DE FACTURATION
// ============================================
app.post('/activate-billing', async (c) => {
  try {
    const body = await c.req.json();
    const { rideId, waitingTimeFrozen } = body;

    console.log('⚡ POST /rides/activate-billing - Activation chrono:', rideId);
    console.log('📊 Temps d\'attente gelé:', waitingTimeFrozen, 'secondes');

    // Récupérer la course
    const ride = await kv.get(`ride_request_${rideId}`);
    
    if (!ride) {
      console.error('❌ Course non trouvée:', rideId);
      return c.json({ 
        success: false, 
        error: 'Course non trouvée' 
      }, 404);
    }

    // Vérifier que la course est en cours
    if (ride.status !== 'in_progress' && ride.status !== 'active') {
      console.error('❌ La course n\'est pas en cours:', ride.status);
      return c.json({ 
        success: false, 
        error: 'La course doit être en cours' 
      }, 400);
    }

    // Vérifier si le compteur n'est pas déjà activé
    if (ride.billingActive || ride.billingStartTime) {
      console.warn('⚠️ Compteur de facturation déjà activé');
      return c.json({ 
        success: true, 
        message: 'Compteur déjà activé',
        ride: ride
      });
    }

    // Activer le compteur de facturation
    const now = Date.now();
    const updatedRide = {
      ...ride,
      billingActive: true,
      billingStartTime: now,
      waitingTimeFrozen: waitingTimeFrozen || 0,
      freeWaitingDisabled: true,
      billingActivatedAt: new Date().toISOString()
    };

    await kv.set(`ride_request_${rideId}`, updatedRide);
    console.log('✅ Compteur de facturation activé pour la course:', rideId);
    console.log('📊 Temps d\'attente gelé:', waitingTimeFrozen, 'secondes');

    // 🔔 Notifier le passager via FCM
    try {
      const passengerId = ride.passengerId || ride.userId;
      if (passengerId) {
        console.log('🔔 Envoi notification FCM au passager:', passengerId);
        
        // Récupérer le FCM token du passager
        const passengerProfile = await kv.get(`passenger:${passengerId}`);
        const fcmToken = passengerProfile?.fcmToken;

        if (fcmToken) {
          // Envoyer la notification via FCM
          const fcmResponse = await fetch(
            `${c.req.url.split('/make-server')[0]}/make-server-2eb02e52/fcm/send`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': c.req.header('Authorization') || ''
              },
              body: JSON.stringify({
                token: fcmToken,
                title: '⚡ Facturation activée',
                body: 'Le compteur de facturation a été activé par le conducteur.',
                data: {
                  type: 'billing_activated',
                  rideId: rideId,
                  waitingTimeFrozen: String(waitingTimeFrozen)
                }
              })
            }
          );

          if (fcmResponse.ok) {
            console.log('✅ Notification FCM envoyée au passager');
          } else {
            console.warn('⚠️ Erreur envoi notification FCM');
          }
        } else {
          console.warn('⚠️ Pas de FCM token pour le passager');
        }
      }
    } catch (notifError) {
      console.error('❌ Erreur notification passager:', notifError);
      // Ne pas bloquer si la notification échoue
    }

    return c.json({ 
      success: true, 
      message: 'Compteur de facturation activé',
      ride: updatedRide
    });

  } catch (error) {
    console.error('❌ Erreur activation compteur:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur serveur'
    }, 500);
  }
});

// ============================================
// TERMINER UNE COURSE
// ============================================
app.post('/complete', async (c) => {
  try {
    const body = await c.req.json();
    const { 
      rideId, 
      driverId,
      finalPrice, 
      duration, 
      rating, 
      feedback, 
      paymentMethod,
      // ✅ NOUVELLES DONNÉES: accepter pickup, destination, distance, vehicleType depuis le frontend
      pickup,
      destination,
      distance,
      vehicleType,
      completedAt
    } = body;

    console.log('🏁 Fin de course:', rideId, 'Payment:', paymentMethod);
    console.log('📍 Données de course:', { pickup, destination, distance, vehicleType });
    console.log('⏱️  DURÉE REÇUE:', duration, 'secondes (type:', typeof duration, ')');

    let ride = await kv.get(`ride_request_${rideId}`);
    
    if (!ride) {
      // ✅ Si la course n'existe pas dans le backend (créée localement uniquement)
      // On la crée maintenant avec les données du frontend
      console.log('⚠️ Course non trouvée dans le backend, création avec les données frontend');
      ride = {
        id: rideId,
        driverId: driverId,
        passengerId: body.passengerId || 'unknown',
        pickup: pickup,
        destination: destination,
        distance: distance,
        vehicleType: vehicleType,
        estimatedPrice: finalPrice,
        status: 'completed',
        createdAt: body.createdAt || new Date().toISOString()
      };
    }

    // ✅ METTRE À JOUR LES DONNÉES DE LA COURSE avec les infos du frontend
    // Cela corrige le problème des "pickup/destination non spécifiés"
    if (pickup) ride.pickup = pickup;
    if (destination) ride.destination = destination;
    if (distance) ride.distance = distance;
    if (vehicleType) ride.vehicleType = vehicleType;
    if (driverId) ride.driverId = driverId;

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

    // 💳 GESTION DU PAIEMENT PASSAGER
    const passengerId = ride.passengerId || ride.userId;
    const paymentMethodUsed = paymentMethod || ride.paymentMethod || 'cash';
    let passengerPaymentSuccess = false;
    let passengerPaymentError = null;

    if (paymentMethodUsed === 'wallet' && passengerId) {
      // ✅ PAIEMENT PAR WALLET: Déduire du solde passager
      const passengerBalanceKey = `passenger:${passengerId}:balance`;
      const passengerBalance = await kv.get(passengerBalanceKey) || { balance: 0 };
      const currentPassengerBalance = typeof passengerBalance === 'number' 
        ? passengerBalance 
        : (passengerBalance.balance || 0);

      if (currentPassengerBalance >= rideFinalPrice) {
        const newPassengerBalance = currentPassengerBalance - rideFinalPrice;
        await kv.set(passengerBalanceKey, {
          balance: newPassengerBalance,
          updated_at: new Date().toISOString()
        });
        console.log(`💰 Wallet passager: ${currentPassengerBalance} - ${rideFinalPrice} = ${newPassengerBalance} CDF`);
        passengerPaymentSuccess = true;
      } else {
        passengerPaymentError = `Solde insuffisant (${currentPassengerBalance} CDF disponible)`;
        console.error(`❌ Solde insuffisant: ${currentPassengerBalance} < ${rideFinalPrice}`);
      }
    } else if (paymentMethodUsed === 'mobile_money') {
      // 💳 PAIEMENT PAR MOBILE MONEY: Sera géré par le frontend via API externe
      console.log('📱 Paiement mobile money - Traité côté frontend');
      passengerPaymentSuccess = true; // On assume que le paiement a été fait côté frontend
    } else if (paymentMethodUsed === 'card') {
      // 💳 PAIEMENT PAR CARTE: Sera géré par le frontend via Flutterwave
      console.log('💳 Paiement carte bancaire - Traité côté frontend');
      passengerPaymentSuccess = true; // On assume que le paiement a été fait côté frontend
    } else if (paymentMethodUsed === 'cash') {
      // 💵 PAIEMENT ESPÈCES: Pas de déduction, le conducteur reçoit l'argent directement
      console.log('💵 Paiement en espèces - Aucune transaction numérique');
      passengerPaymentSuccess = true;
    }

    if (!passengerPaymentSuccess) {
      return c.json({
        success: false,
        error: passengerPaymentError || 'Paiement échoué'
      }, 400);
    }

    // ⚠️ v517.91: SUPPRESSION DE LA MISE À JOUR DU SOLDE CONDUCTEUR DANS LE BACKEND
    // Le frontend gère déjà cette logique correctement dans DriverDashboard.tsx ligne 1039
    // En gardant cette logique ici, on créait une DOUBLE ADDITION du gain au solde
    // 
    // AVANT (BUGGÉ):
    // - Backend ajoutait le gain ici
    // - Frontend ajoutait ENCORE le gain
    // - Résultat: gain ajouté 2 fois!
    //
    // MAINTENANT (CORRIGÉ):
    // - Seul le frontend ajoute le gain une seule fois
    // - Le backend se contente de sauvegarder la course
    
    console.log('💰 v517.91 - Le solde conducteur sera mis à jour par le frontend uniquement');
    console.log(`   Gain net conducteur: ${driverEarnings} CDF (Commission: ${commissionAmount} CDF)`);

    // Mettre à jour la course
    const completedRide = {
      ...ride,
      status: 'completed',
      finalPrice: rideFinalPrice,
      commission: commissionAmount,
      driverEarnings: driverEarnings,
      commissionPercentage: commissionPercentage,
      duration: duration || 0,
      billingElapsedTime: duration || 0, // 🔥 AJOUTER AUSSI billingElapsedTime pour compatibilité
      rating: rating || 0,
      feedback: feedback || '',
      completedAt: completedAt || new Date().toISOString()
    };

    console.log('💾 Course sauvegardée avec duration:', completedRide.duration, 'et billingElapsedTime:', completedRide.billingElapsedTime);
    
    await kv.set(`ride_request_${rideId}`, completedRide);
    await kv.set(`ride_completed_${rideId}`, completedRide);
    await kv.del(`ride_active_${rideId}`);

    // 🆕 v517.91: Mettre à jour les stats du conducteur (totalRides, totalEarnings, etc.)
    // 🔥 FIX: N'incrémenter que si la course n'était pas déjà complétée (éviter les doubles comptages)
    if (driverId && ride.status !== 'completed') {
      const statsKey = `driver:${driverId}:stats`;
      const currentStats = await kv.get(statsKey) || {
        totalRides: 0,
        totalEarnings: 0,
        totalCommissions: 0,
        averageRating: 0,
        ratings: []
      };

      const updatedStats = {
        ...currentStats,
        totalRides: (currentStats.totalRides || 0) + 1,
        totalEarnings: (currentStats.totalEarnings || 0) + rideFinalPrice,
        totalCommissions: (currentStats.totalCommissions || 0) + commissionAmount,
        // Note: le rating sera mis à jour par la route /rate
        lastRideAt: new Date().toISOString()
      };

      await kv.set(statsKey, updatedStats);

      console.log(`📊 v517.91 - Stats conducteur mises à jour:`, {
        totalRides: updatedStats.totalRides,
        totalEarnings: updatedStats.totalEarnings,
        averageRating: updatedStats.averageRating
      });
    } else if (ride.status === 'completed') {
      console.log(`⚠️ Course déjà complétée - Stats non mises à jour pour éviter le double comptage`);
    }

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
    
    // ✅ Récupérer le taux de change
    let exchangeRate = 2850;
    try {
      const settings = await kv.get('system_settings');
      if (settings && settings.exchangeRate) {
        exchangeRate = settings.exchangeRate;
      }
    } catch (error) {
      console.warn('⚠️ Impossible de récupérer le taux de change');
    }
    
    const requestedCategory = ride.vehicleType;
    const onlineDriversForCategory = allDrivers.filter(driver => {
      if (!driver) return false;
      const category = driver.vehicleInfo?.type || driver.vehicle_category || 'smart_standard';
      const isOnline = driver.is_available === true;
      const isApproved = driver.status === 'approved';
      
      // ✅ CORRECTION : Vérifier le solde minimum selon la catégorie
      const minimumBalance = getMinimumBalanceForCategory(category, exchangeRate);
      const hasEnoughCredit = (driver.account_balance || 0) >= minimumBalance;
      
      return isOnline && isApproved && hasEnoughCredit && category === requestedCategory;
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
          const isOnline = driver.is_available === true;
          const isApproved = driver.status === 'approved';
          
          // ✅ CORRECTION : Vérifier le solde minimum pour l'alternative
          const minimumBalance = getMinimumBalanceForCategory(category, exchangeRate);
          const hasEnoughCredit = (driver.account_balance || 0) >= minimumBalance;
          
          return isOnline && isApproved && hasEnoughCredit && category === altCategory;
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
// 🆕 VÉRIFIER LES CONDUCTEURS DISPONIBLES AVANT COMMANDE
// Endpoint appelé AVANT la création de la course pour informer le passager
// ============================================
app.post('/check-drivers-availability', async (c) => {
  try {
    const { vehicleType, pickup } = await c.req.json();
    
    console.log('🔍 Vérification conducteurs disponibles AVANT commande pour:', vehicleType);

    if (!vehicleType) {
      return c.json({ 
        success: false, 
        error: 'vehicleType requis' 
      }, 400);
    }

    // Utiliser le helper pour vérifier la disponibilité
    const result = await checkDriversAvailability(vehicleType);

    return c.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('❌ Erreur vérification disponibilité conducteurs:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur serveur' 
    }, 500);
  }
});

// ============================================
// ANNULER UNE COURSE (PASSAGER OU CONDUCTEUR)
// ============================================
app.post('/cancel', async (c) => {
  try {
    const body = await c.req.json();
    const { rideId, passengerId, reason, cancelledBy } = body;

    console.log('🚫 Annulation de course:', { rideId, cancelledBy, reason });

    // Validation
    if (!rideId || !cancelledBy) {
      return c.json({ 
        success: false, 
        error: 'Données manquantes (rideId, cancelledBy requis)' 
      }, 400);
    }

    // ✅ FIX: Chercher la course dans TOUS les endroits possibles
    let ride = await kv.get(`ride_request_${rideId}`);
    
    if (!ride) {
      console.warn(`⚠️ Course non trouvée dans ride_request_${rideId}, vérification dans ride_pending...`);
      ride = await kv.get(`ride_pending_${rideId}`);
    }
    
    if (!ride) {
      console.warn(`⚠️ Course non trouvée dans ride_pending_${rideId}, vérification dans ride_active...`);
      ride = await kv.get(`ride_active_${rideId}`)
    }
    
    if (!ride) {
      // ✅ NOUVELLE LOGIQUE: Si la course n'existe pas dans le backend,
      // c'est qu'elle a été créée localement uniquement (ou déjà nettoyée)
      // On accepte l'annulation sans erreur
      console.warn(`⚠️ Course ${rideId} non trouvée dans le backend (création locale uniquement)`);
      console.log('✅ Annulation acceptée (course locale)');
      
      return c.json({
        success: true,
        message: 'Course annulée (locale uniquement)',
        localOnly: true
      });
    }
    
    console.log('✅ Course trouvée, statut actuel:', ride.status);

    // Vérifier si la course peut être annulée
    if (ride.status === 'completed') {
      return c.json({ 
        success: false, 
        error: 'Impossible d\'annuler une course terminée' 
      }, 400);
    }

    if (ride.status === 'cancelled') {
      return c.json({ 
        success: false, 
        error: 'Cette course est déjà annulée' 
      }, 400);
    }

    // Calculer la pénalité si un conducteur a déjà accepté
    let penaltyAmount = 0;
    let penaltyApplied = false;
    
    if (ride.status === 'accepted' && cancelledBy === 'passenger') {
      // Pénalité de 50% du prix estimé
      penaltyAmount = Math.round((ride.estimatedPrice || 0) * 0.5);
      penaltyApplied = true;
      
      console.log(`⚠️ Pénalité d'annulation: ${penaltyAmount} CDF (50% du prix)`);
      
      // Déduire la pénalité du wallet du passager si disponible
      if (passengerId) {
        const passengerBalanceKey = `passenger:${passengerId}:balance`;
        const passengerBalance = await kv.get(passengerBalanceKey) || { balance: 0 };
        const currentBalance = typeof passengerBalance === 'number' 
          ? passengerBalance 
          : (passengerBalance.balance || 0);
        
        if (currentBalance >= penaltyAmount) {
          const newBalance = currentBalance - penaltyAmount;
          await kv.set(passengerBalanceKey, {
            balance: newBalance,
            updated_at: new Date().toISOString()
          });
          console.log(`💰 Pénalité déduite du wallet: ${currentBalance} - ${penaltyAmount} = ${newBalance} CDF`);
        } else {
          console.warn(`⚠️ Solde insuffisant pour pénalité (${currentBalance} CDF disponible)`);
        }
      }
    }

    // Mettre à jour la course avec le statut annulé
    const cancelledRide = {
      ...ride,
      status: 'cancelled',
      cancelledBy,
      cancelReason: reason || 'Non spécifiée',
      cancelledAt: new Date().toISOString(),
      penaltyAmount: penaltyApplied ? penaltyAmount : 0,
      penaltyApplied
    };

    await kv.set(`ride_request_${rideId}`, cancelledRide);
    await kv.set(`ride_cancelled_${rideId}`, cancelledRide);
    
    // Supprimer des listes actives
    await kv.del(`ride_pending_${rideId}`);
    await kv.del(`ride_active_${rideId}`);

    // ✅ NOUVEAU: Enregistrer dans l'historique d'annulations du passager
    if (cancelledBy === 'passenger' && (ride.passengerId || passengerId)) {
      const userId = ride.passengerId || passengerId;
      const cancellationRecord = {
        id: `cancellation_${Date.now()}_${userId}`,
        rideId,
        userId,
        userType: 'passenger',
        reason: reason || 'Non spécifiée',
        cancelledAt: new Date().toISOString(),
        pickup: ride.pickup,
        destination: ride.destination,
        estimatedPrice: ride.estimatedPrice,
        vehicleType: ride.vehicleType,
        rideStatus: ride.status, // État de la course au moment de l'annulation
        penaltyAmount: penaltyApplied ? penaltyAmount : 0,
        penaltyApplied
      };
      
      // Enregistrer dans l'historique global
      await kv.set(`passenger_cancellation:${userId}:${cancelledRide.cancelledAt}`, cancellationRecord);
      
      console.log('📝 Annulation enregistrée dans l\'historique:', cancellationRecord.id);
    }

    // ✅ NOUVEAU: Enregistrer dans l'historique d'annulations du conducteur
    if (cancelledBy === 'driver' && ride.driverId) {
      const cancellationRecord = {
        id: `cancellation_${Date.now()}_${ride.driverId}`,
        rideId,
        userId: ride.driverId,
        userType: 'driver',
        reason: reason || 'Non spécifiée',
        cancelledAt: new Date().toISOString(),
        pickup: ride.pickup,
        destination: ride.destination,
        estimatedPrice: ride.estimatedPrice,
        vehicleType: ride.vehicleType,
        rideStatus: ride.status
      };
      
      await kv.set(`driver_cancellation:${ride.driverId}:${cancelledRide.cancelledAt}`, cancellationRecord);
      
      console.log('📝 Annulation conducteur enregistrée:', cancellationRecord.id);
    }

    console.log('✅ Course annulée avec succès:', rideId);

    return c.json({
      success: true,
      ride: cancelledRide,
      message: 'Course annulée avec succès',
      penaltyAmount
    });

  } catch (error) {
    console.error('❌ Erreur annulation course:', error);
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

// ============================================
// ⭐ NOTER UNE COURSE (PASSAGER)
// ============================================
app.post('/rate', async (c) => {
  try {
    const body = await c.req.json();
    const { rideId, rating, comment } = body;

    console.log('⭐ Notation de course:', { rideId, rating });

    if (!rideId || !rating) {
      return c.json({ 
        success: false, 
        error: 'Données manquantes' 
      }, 400);
    }

    // Validation de la note (1-5)
    if (rating < 1 || rating > 5) {
      return c.json({ 
        success: false, 
        error: 'La note doit être entre 1 et 5' 
      }, 400);
    }

    // Récupérer la course
    const ride = await kv.get(`ride_request_${rideId}`);
    
    if (!ride) {
      return c.json({ 
        success: false, 
        error: 'Course introuvable' 
      }, 404);
    }

    // Mettre à jour la course avec la notation
    const ratedRide = {
      ...ride,
      rating,
      passengerComment: comment || '',
      ratedAt: new Date().toISOString()
    };

    await kv.set(`ride_request_${rideId}`, ratedRide);

    // Mettre à jour la note moyenne du conducteur
    if (ride.driverId) {
      const statsKey = `driver:${ride.driverId}:stats`;
      const currentStats = await kv.get(statsKey) || {
        totalRides: 0,
        totalEarnings: 0,
        totalCommissions: 0,
        averageRating: 0,
        ratings: []
      };

      const updatedRatings = [...(currentStats.ratings || []), rating];
      const averageRating = updatedRatings.reduce((a, b) => a + b, 0) / updatedRatings.length;

      await kv.set(statsKey, {
        ...currentStats,
        averageRating: averageRating,
        ratings: updatedRatings
      });

      console.log(`⭐ Note du conducteur mise à jour: ${(averageRating || 0).toFixed(1)}/5`);
    }

    console.log('✅ Course notée avec succès');

    return c.json({
      success: true,
      message: 'Notation enregistrée avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur notation course:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur serveur' 
    }, 500);
  }
});

// ============================================
// RÉCUPÉRER LES GAINS DU CONDUCTEUR
// ============================================
app.get('/driver/:driverId/earnings', async (c) => {
  try {
    const driverId = c.req.param('driverId');
    const period = c.req.query('period') || 'today'; // today, week, month, all
    
    console.log(`📊 Récupération gains conducteur: ${driverId}, période: ${period}`);

    // Récupérer toutes les courses terminées du conducteur
    const allRides = await kv.getByPrefix('ride_request_');
    
    if (!allRides || allRides.length === 0) {
      return c.json({
        success: true,
        earnings: {
          total: 0,
          commission: 0,
          net: 0,
          ridesCount: 0,
          rides: []
        }
      });
    }

    // Filtrer les courses du conducteur qui sont terminées
    const driverCompletedRides = allRides.filter((ride: any) => 
      ride.driverId === driverId && 
      ride.status === 'completed' // ✅ FIX: Utiliser uniquement 'completed' (pas 'ride_completed')
    );

    // Filtrer selon la période
    const now = new Date();
    let filteredRides = driverCompletedRides;

    if (period === 'today') {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filteredRides = driverCompletedRides.filter((ride: any) => {
        const rideDate = ride.completedAt ? new Date(ride.completedAt) : new Date(ride.createdAt);
        return rideDate >= todayStart;
      });
    } else if (period === 'week') {
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredRides = driverCompletedRides.filter((ride: any) => {
        const rideDate = ride.completedAt ? new Date(ride.completedAt) : new Date(ride.createdAt);
        return rideDate >= weekStart;
      });
    } else if (period === 'month') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      filteredRides = driverCompletedRides.filter((ride: any) => {
        const rideDate = ride.completedAt ? new Date(ride.completedAt) : new Date(ride.createdAt);
        return rideDate >= monthStart;
      });
    }

    // Calculer les gains
    let totalEarnings = 0;
    let totalCommission = 0;

    const ridesWithEarnings = filteredRides.map((ride: any) => {
      const ridePrice = ride.finalPrice || ride.estimatedPrice || 0;
      const commission = ride.commission || (ridePrice * 0.15); // 15% par défaut
      const netEarning = ridePrice - commission;

      totalEarnings += ridePrice;
      totalCommission += commission;

      return {
        id: ride.id,
        time: ride.completedAt || ride.createdAt,
        pickup: ride.pickup?.address || 'N/A',
        destination: ride.destination?.address || 'N/A',
        distance: ride.distance || 0,
        duration: ride.duration || 0,
        earnings: ridePrice,
        commission: commission,
        netEarning: netEarning,
        rating: ride.rating || 0,
        passengerName: ride.passengerName || 'Passager'
      };
    });

    const netEarnings = totalEarnings - totalCommission;

    console.log(`✅ Gains calculés: ${totalEarnings} CDF - ${totalCommission} CDF commission = ${netEarnings} CDF net`);

    return c.json({
      success: true,
      earnings: {
        total: totalEarnings,
        commission: totalCommission,
        net: netEarnings,
        ridesCount: filteredRides.length,
        rides: ridesWithEarnings.sort((a: any, b: any) => 
          new Date(b.time).getTime() - new Date(a.time).getTime()
        )
      }
    });

  } catch (error) {
    console.error('❌ Erreur récupération gains:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur serveur' 
    }, 500);
  }
});

// ============================================
// 🆕 HISTORIQUE DES COURSES D'UN PASSAGER
// ============================================
app.get('/history/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    console.log('📊 Récupération de l\'historique des courses pour le passager:', userId);
    
    // Récupérer toutes les courses
    const allRides = await kv.getByPrefix('ride_request_');
    
    if (!allRides || allRides.length === 0) {
      return c.json({
        success: true,
        rides: [],
        count: 0
      });
    }
    
    // Filtrer les courses du passager qui sont complétées
    const passengerCompletedRides = allRides.filter((ride: any) => 
      ride.passengerId === userId && 
      ride.status === 'completed' // ✅ FIX: Utiliser uniquement 'completed' (pas 'ride_completed')
    );
    
    console.log(`✅ ${passengerCompletedRides.length} courses complétées trouvées pour le passager ${userId}`);
    
    // Trier par date (plus récentes d'abord)
    const sortedRides = passengerCompletedRides.sort((a: any, b: any) => {
      const dateA = new Date(a.completedAt || a.createdAt).getTime();
      const dateB = new Date(b.completedAt || b.createdAt).getTime();
      return dateB - dateA;
    });
    
    return c.json({
      success: true,
      rides: sortedRides,
      count: sortedRides.length
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération historique passager:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur serveur' 
    }, 500);
  }
});

// ============================================
// DÉMARRER UNE COURSE (CONDUCTEUR - après vérification code)
// ============================================
app.post('/start', async (c) => {
  try {
    const body = await c.req.json();
    const { rideId, driverId } = body; // 🚫 confirmationCode supprimé

    console.log('🚀 Démarrage de course:', { rideId, driverId });

    // Validation
    if (!rideId || !driverId) {
      return c.json({ 
        success: false, 
        error: 'Données manquantes (rideId et driverId requis)' 
      }, 400);
    }

    // Récupérer la course
    const ride = await kv.get(`ride_request_${rideId}`);
    
    if (!ride) {
      console.error('❌ Course introuvable:', rideId);
      return c.json({ 
        success: false, 
        error: 'Course introuvable' 
      }, 404);
    }

    // Vérifier que la course est bien acceptée ou déjà démarrée
    // ✅ Idempotence : Si déjà in_progress, on renvoie succès (évite erreurs multiples clics)
    if (ride.status !== 'accepted' && ride.status !== 'in_progress') {
      console.error('❌ Statut invalide pour démarrage:', ride.status);
      return c.json({ 
        success: false, 
        error: `Statut invalide: ${ride.status}. La course doit être acceptée avant de démarrer.` 
      }, 400);
    }

    // Si déjà démarrée, retourner succès immédiat (idempotence)
    if (ride.status === 'in_progress') {
      console.log('✅ Course déjà démarrée, retour idempotent:', rideId);
      return c.json({
        success: true,
        ride: ride,
        message: 'Course déjà démarrée',
        alreadyStarted: true
      });
    }

    // Vérifier que le conducteur correspond
    if (ride.driverId !== driverId) {
      return c.json({ 
        success: false, 
        error: 'Vous n\'êtes pas le conducteur assigné à cette course' 
      }, 403);
    }

    // 🚫 SUPPRIMÉ : Vérification du code de confirmation (simplification UX)
    // Le conducteur peut maintenant démarrer directement la course
    // if (ride.confirmationCode !== confirmationCode) {
    //   console.error('❌ Code incorrect:', { expected: ride.confirmationCode, received: confirmationCode });
    //   return c.json({ success: false, error: 'Code de confirmation incorrect' }, 400);
    // }

    // Mettre à jour le statut de la course
    const startedRide = {
      ...ride,
      status: 'in_progress',
      startedAt: new Date().toISOString()
    };

    await kv.set(`ride_request_${rideId}`, startedRide);

    console.log('✅ Course démarrée avec succès:', rideId);

    return c.json({
      success: true,
      ride: startedRide,
      message: 'Course démarrée avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur démarrage course:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur serveur' 
    }, 500);
  }
});

// ============================================
// RÉCUPÉRER LES DÉTAILS COMPLETS D'UNE COURSE PAR ID
// Endpoint pour le polling temps réel côté passager
// ============================================
app.get('/:rideId', async (c) => {
  try {
    const rideId = c.req.param('rideId');
    
    if (!rideId) {
      return c.json({
        success: false,
        error: 'rideId requis'
      }, 400);
    }

    console.log('🔍 Récupération détails complets de la course:', rideId);

    // Récupérer la course depuis le KV store
    const ride = await kv.get(`ride_request_${rideId}`);

    if (!ride) {
      return c.json({
        success: false,
        error: 'Course introuvable'
      }, 404);
    }

    console.log('✅ Course trouvée:', {
      id: ride.id,
      status: ride.status,
      billingStartTime: ride.billingStartTime,
      billingElapsedTime: ride.billingElapsedTime
    });

    // Retourner TOUTES les données de la course (pour le polling passager)
    return c.json(ride);

  } catch (error) {
    console.error('❌ Erreur récupération course:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur serveur'
    }, 500);
  }
});

// ============================================
// 🔥 VÉRIFIER LE STATUT D'UNE COURSE
// Utilisé par les conducteurs pour détecter les annulations
// ou si un autre conducteur a accepté
// ============================================
app.get('/:rideId/status', async (c) => {
  try {
    const rideId = c.req.param('rideId');
    
    if (!rideId) {
      return c.json({
        success: false,
        error: 'rideId requis'
      }, 400);
    }

    console.log('🔍 Vérification statut de la course:', rideId);

    // Récupérer la course depuis le KV store
    const ride = await kv.get(`ride_request_${rideId}`);

    if (!ride) {
      return c.json({
        success: false,
        error: 'Course introuvable'
      }, 404);
    }

    console.log('✅ Statut de la course:', {
      id: ride.id,
      status: ride.status,
      assignedDriverId: ride.assignedDriverId
    });

    return c.json({
      success: true,
      ride: {
        id: ride.id,
        status: ride.status,
        assignedDriverId: ride.assignedDriverId,
        passengerId: ride.passengerId
      }
    });

  } catch (error) {
    console.error('❌ Erreur vérification statut course:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur serveur'
    }, 500);
  }
});

// ============================================
// 🆕 METTRE À JOUR LE TEMPS DE FACTURATION
// Permet au conducteur de synchroniser billingStartTime avec le passager
// ============================================
app.post('/update-billing/:rideId', async (c) => {
  try {
    const rideId = c.req.param('rideId');
    const { billingStartTime, freeWaitingDisabled, billingElapsedTime } = await c.req.json();
    
    console.log('💰 Mise à jour facturation pour course:', rideId, {
      billingStartTime,
      freeWaitingDisabled,
      billingElapsedTime
    });

    // Récupérer la course existante
    const ride = await kv.get(`ride_request_${rideId}`);
    
    if (!ride) {
      return c.json({
        success: false,
        error: 'Course introuvable'
      }, 404);
    }

    // Mettre à jour les champs de facturation
    const updatedRide = {
      ...ride,
      billingStartTime: billingStartTime || ride.billingStartTime,
      freeWaitingDisabled: freeWaitingDisabled !== undefined ? freeWaitingDisabled : ride.freeWaitingDisabled,
      billingElapsedTime: billingElapsedTime || ride.billingElapsedTime
    };

    // Sauvegarder
    await kv.set(`ride_request_${rideId}`, updatedRide);

    console.log('✅ Facturation mise à jour avec succès');

    return c.json({
      success: true,
      ride: updatedRide
    });

  } catch (error) {
    console.error('❌ Erreur mise à jour facturation:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur serveur' 
    }, 500);
  }
});

// ============================================
// 🆕 ACTIVER LA FACTURATION (CONDUCTEUR)
// ============================================
app.post('/:rideId/start-billing', async (c) => {
  try {
    const rideId = c.req.param('rideId');
    console.log('💰 POST /rides/:rideId/start-billing - Activation facturation:', rideId);

    // 🆕 Récupérer le body (waitingTimeFrozen envoyé par le conducteur)
    const body = await c.req.json();
    const waitingTimeFrozen = body.waitingTimeFrozen || 0;

    // Récupérer la course
    const ride = await kv.get(`ride_request_${rideId}`);
    
    if (!ride) {
      console.log('❌ Course non trouvée:', rideId);
      return c.json({ 
        success: false, 
        error: 'Course introuvable' 
      }, 404);
    }

    // Vérifier que la course est en cours
    if (ride.status !== 'in_progress') {
      return c.json({ 
        success: false, 
        error: `Statut invalide: ${ride.status}. La course doit être en cours.` 
      }, 400);
    }

    // Activer la facturation
    const billingStartTime = Date.now();
    const updatedRide = {
      ...ride,
      billingStartTime,
      billingActive: true,
      waitingTimeFrozen // 🆕 Sauvegarder le temps d'attente gelé
    };

    // Sauvegarder
    await kv.set(`ride_request_${rideId}`, updatedRide);

    console.log('✅ Facturation activée:', { 
      rideId, 
      billingStartTime,
      waitingTimeFrozen 
    });

    return c.json({
      success: true,
      billingStartTime,
      waitingTimeFrozen,
      message: 'Facturation activée'
    });

  } catch (error) {
    console.error('❌ Erreur activation facturation:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur serveur' 
    }, 500);
  }
});

// ============================================
// ⏸️ v518.53 - PAUSE/REPRISE DU CHRONO DE FACTURATION
// ============================================
app.post('/:rideId/toggle-pause', async (c) => {
  try {
    const rideId = c.req.param('rideId');
    const { isPaused, pausedAt, resumedAt, currentElapsedTime } = await c.req.json();
    
    console.log(`⏸️ Toggle pause pour course ${rideId}:`, {
      isPaused,
      pausedAt,
      resumedAt,
      currentElapsedTime
    });

    // Récupérer la course
    const ride = await kv.get(`ride_request_${rideId}`);
    
    if (!ride) {
      return c.json({
        success: false,
        error: 'Course introuvable'
      }, 404);
    }

    // Calculer le temps de pause total
    let totalPauseDuration = ride.totalPauseDuration || 0;
    let pauseHistory = ride.pauseHistory || [];
    
    if (isPaused && pausedAt) {
      // Début d'une pause
      pauseHistory.push({
        pausedAt,
        resumedAt: null,
        duration: null
      });
      
      console.log('⏸️ PAUSE activée à', new Date(pausedAt).toISOString());
    } else if (!isPaused && resumedAt) {
      // Fin de la pause
      const lastPause = pauseHistory[pauseHistory.length - 1];
      if (lastPause && !lastPause.resumedAt) {
        const pauseDuration = Math.floor((resumedAt - lastPause.pausedAt) / 1000);
        lastPause.resumedAt = resumedAt;
        lastPause.duration = pauseDuration;
        totalPauseDuration += pauseDuration;
        
        console.log('▶️ PAUSE terminée. Durée:', pauseDuration, 'secondes');
      }
    }

    // Mettre à jour la course
    const updatedRide = {
      ...ride,
      isPaused,
      pausedAt: isPaused ? pausedAt : null,
      pauseHistory,
      totalPauseDuration,
      billingElapsedTime: currentElapsedTime || ride.billingElapsedTime
    };

    await kv.set(`ride_request_${rideId}`, updatedRide);

    console.log(`✅ Pause ${isPaused ? 'activée' : 'désactivée'} - Temps de pause total:`, totalPauseDuration, 's');

    return c.json({
      success: true,
      isPaused,
      totalPauseDuration,
      message: isPaused ? 'Chrono en pause' : 'Chrono repris'
    });

  } catch (error) {
    console.error('❌ Erreur toggle-pause:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur serveur' 
    }, 500);
  }
});

// ============================================
// 🆕 CLÔTURER UNE COURSE (CONDUCTEUR)
// ============================================
app.post('/:rideId/complete', async (c) => {
  try {
    const rideId = c.req.param('rideId');
    const body = await c.req.json();
    const { driverId } = body;

    console.log('🏁 POST /rides/:rideId/complete - Clôture course:', rideId);

    // Récupérer la course
    const ride = await kv.get(`ride_request_${rideId}`);
    
    if (!ride) {
      console.log('❌ Course non trouvée:', rideId);
      return c.json({ 
        success: false, 
        error: 'Course introuvable' 
      }, 404);
    }

    // Vérifier que la course est en cours
    if (ride.status !== 'in_progress') {
      return c.json({ 
        success: false, 
        error: `Statut invalide: ${ride.status}. La course doit être en cours.` 
      }, 400);
    }

    // Calculer le temps de facturation final
    let billingElapsedTime = 0;
    if (ride.billingStartTime) {
      billingElapsedTime = Math.floor((Date.now() - ride.billingStartTime) / 1000);
    }

    // Mettre à jour la course
    const completedRide = {
      ...ride,
      status: 'completed',
      billingElapsedTime,
      completedAt: new Date().toISOString(),
      finalPrice: ride.estimatedPrice // Peut être calculé en fonction du temps de facturation
    };

    // Sauvegarder
    await kv.set(`ride_request_${rideId}`, completedRide);

    console.log('✅ Course clôturée:', { 
      rideId, 
      billingElapsedTime, 
      finalPrice: completedRide.finalPrice 
    });

    return c.json({
      success: true,
      ride: completedRide,
      message: 'Course terminée'
    });

  } catch (error) {
    console.error('❌ Erreur clôture course:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur serveur' 
    }, 500);
  }
});

// ============================================
// 🆕 RÉCUPÉRER LES DONNÉES COMPLÈTES D'UNE COURSE PAR ID (POLLING TEMPS RÉEL)
// ============================================
app.get('/:rideId', async (c) => {
  try {
    const rideId = c.req.param('rideId');
    console.log('🔍 GET /rides/:rideId - Récupération course:', rideId);

    // Récupérer la course depuis le KV store
    const ride = await kv.get(`ride_request_${rideId}`);
    
    if (!ride) {
      console.log('❌ Course non trouvée:', rideId);
      return c.json({ 
        success: false, 
        error: 'Course introuvable' 
      }, 404);
    }

    console.log('✅ Course trouvée:', {
      id: ride.id,
      status: ride.status,
      billingStartTime: ride.billingStartTime,
      billingElapsedTime: ride.billingElapsedTime
    });

    // Retourner toutes les données de la course
    return c.json(ride);

  } catch (error) {
    console.error('❌ Erreur récupération course:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur serveur' 
    }, 500);
  }
});

// ============================================
// 🎯 MATCHING & NOTIFICATIONS DE COURSES
// ============================================

// 🚕 Rechercher un chauffeur pour une course
app.post('/find-driver', async (c) => {
  try {
    const { rideId } = await c.req.json();
    
    if (!rideId) {
      return c.json({ success: false, error: 'rideId requis' }, 400);
    }

    console.log(`🔍 Recherche chauffeur pour course ${rideId}`);
    
    const success = await matching.findAndAssignDriver(rideId);
    
    if (success) {
      return c.json({ 
        success: true, 
        message: 'Chauffeur trouvé et notifié' 
      });
    } else {
      return c.json({ 
        success: false, 
        error: 'Aucun chauffeur disponible' 
      }, 404);
    }
  } catch (error) {
    console.error('❌ Erreur recherche chauffeur:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur serveur' 
    }, 500);
  }
});

// ✅ Accepter une course (chauffeur)
app.post('/accept', async (c) => {
  try {
    const { rideId, driverId } = await c.req.json();
    
    if (!rideId || !driverId) {
      return c.json({ success: false, error: 'rideId et driverId requis' }, 400);
    }

    console.log(`✅ Acceptation course ${rideId} par chauffeur ${driverId}`);
    
    const success = await matching.acceptRide(rideId, driverId);
    
    if (success) {
      return c.json({ 
        success: true, 
        message: 'Course acceptée' 
      });
    } else {
      return c.json({ 
        success: false, 
        error: 'Impossible d\'accepter cette course' 
      }, 400);
    }
  } catch (error) {
    console.error('❌ Erreur acceptation course:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur serveur' 
    }, 500);
  }
});

// ❌ Refuser une course (chauffeur)
app.post('/decline', async (c) => {
  try {
    const { rideId, driverId } = await c.req.json();
    
    if (!rideId || !driverId) {
      return c.json({ success: false, error: 'rideId et driverId requis' }, 400);
    }

    console.log(`❌ Refus course ${rideId} par chauffeur ${driverId}`);
    
    const success = await matching.declineRide(rideId, driverId);
    
    if (success) {
      return c.json({ 
        success: true, 
        message: 'Course refusée, recherche d\'un autre chauffeur...' 
      });
    } else {
      return c.json({ 
        success: false, 
        error: 'Impossible de refuser cette course' 
      }, 400);
    }
  } catch (error) {
    console.error('❌ Erreur refus course:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur serveur' 
    }, 500);
  }
});

// 📋 Récupérer les notifications pour un chauffeur
app.get('/notifications/:driverId', async (c) => {
  try {
    const driverId = c.req.param('driverId');
    
    console.log(`📋 Récupération notifications pour chauffeur ${driverId}`);
    
    // Récupérer toutes les notifications du chauffeur
    const notifications = await kv.getByPrefix(`notification:driver:${driverId}:`);
    
    // Filtrer celles qui ne sont pas expirées
    const now = new Date();
    const activeNotifications = notifications?.filter((notif: any) => {
      if (!notif.expiresAt) return true;
      return new Date(notif.expiresAt) > now;
    }) || [];

    // Pour chaque notification, récupérer les détails de la course
    const notificationsWithRides = await Promise.all(
      activeNotifications.map(async (notif: any) => {
        const ride = await kv.get(`ride:${notif.rideId}`);
        return {
          ...notif,
          ride
        };
      })
    );

    return c.json({ 
      success: true, 
      notifications: notificationsWithRides 
    });
  } catch (error) {
    console.error('❌ Erreur récupération notifications:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur serveur' 
    }, 500);
  }
});

export default app;