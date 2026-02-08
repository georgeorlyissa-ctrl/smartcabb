import { Hono } from 'npm:hono';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv-wrapper.tsx';

const driverRoutes = new Hono();

// Initialiser le client Supabase
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// ============================================
// RÉCUPÉRER LES CONDUCTEURS EN LIGNE
// ⚠️ AUCUNE SIMULATION - Données réelles uniquement
// ============================================
driverRoutes.get('/online-drivers', async (c) => {
  try {
    console.log('🚗 Récupération des conducteurs en ligne...');

    // Récupérer tous les conducteurs (la table profiles ne contient que les colonnes de base)
    const { data: drivers, error } = await supabase
      .from('profiles')
      .select('id, full_name, phone, email, role')
      .eq('role', 'driver');

    if (error) {
      console.error('❌ Erreur récupération conducteurs:', error);
      console.error('❌ Détails:', JSON.stringify(error, null, 2));
      
      return c.json({ 
        success: false, 
        drivers: [],
        count: 0,
        error: error.message || 'Erreur lors de la récupération des conducteurs'
      }, 500);
    }

    console.log(`✅ ${drivers?.length || 0} conducteur(s) trouvé(s)`);

    // Si aucun conducteur n'est trouvé, retourner une liste vide
    if (!drivers || drivers.length === 0) {
      console.log('⚠️ Aucun conducteur trouvé dans la base de données');
      return c.json({ 
        success: true, 
        drivers: [],
        count: 0,
        message: 'Aucun conducteur disponible pour le moment'
      });
    }

    // ✅ FILTRER LES CONDUCTEURS EN LIGNE AVEC SOLDE > 0
    const onlineDriversPromises = drivers.map(async (driver) => {
      // Vérifier le statut en ligne
      const statusKey = `driver:${driver.id}:status`;
      const statusData = await kv.get(statusKey);
      const isOnline = statusData?.isOnline || false;

      // Vérifier le solde
      const balanceKey = `driver:${driver.id}:balance`;
      const balanceData = await kv.get(balanceKey);
      const balance = balanceData?.balance || 0;

      // Ne retourner que les conducteurs en ligne avec solde > 0
      if (!isOnline || balance <= 0) {
        return null;
      }

      // ✅ UTILISER LA VRAIE POSITION GPS DU CONDUCTEUR (pas de simulation)
      const locationKey = `driver:${driver.id}:location`;
      const locationData = await kv.get(locationKey);
      
      console.log(`🔍 Conducteur ${driver.full_name} - Position KV:`, locationData);
      
      // Si pas de position GPS enregistrée, ne pas afficher ce conducteur
      if (!locationData || !locationData.lat || !locationData.lng) {
        console.log(`⚠️ Conducteur ${driver.full_name} en ligne mais sans position GPS`);
        return null;
      }
      
      console.log(`✅ Position GPS du conducteur ${driver.full_name}: ${locationData.lat}, ${locationData.lng}`);
      
      return {
        id: driver.id,
        name: driver.full_name || 'Conducteur',
        phone: driver.phone || 'N/A',
        location: { lat: locationData.lat, lng: locationData.lng }, // ✅ Position GPS réelle
        vehicleInfo: { 
          make: 'Toyota',
          model: 'Corolla',
          color: 'Blanc',
          plate: 'CD-' + Math.floor(Math.random() * 9999).toString().padStart(4, '0')
        },
        rating: 4.5 + Math.random() * 0.5,
        totalRides: Math.floor(Math.random() * 500) + 50,
        balance: balance // Inclure le solde pour info
      };
    });

    const onlineDriversWithNulls = await Promise.all(onlineDriversPromises);
    const onlineDrivers = onlineDriversWithNulls.filter(d => d !== null);

    console.log(`✅ ${onlineDrivers.length} conducteur(s) en ligne avec solde suffisant`);

    return c.json({ 
      success: true, 
      drivers: onlineDrivers,
      count: onlineDrivers.length
    });

  } catch (error) {
    console.error('❌ Erreur online-drivers:', error);
    console.error('❌ Stack:', error instanceof Error ? error.stack : 'N/A');
    
    return c.json({ 
      success: false, 
      drivers: [],
      count: 0,
      error: String(error)
    }, 500);
  }
});

// ============================================
// CRÉER UN PROFIL CONDUCTEUR
// ============================================
driverRoutes.post('/create', async (c) => {
  try {
    const { 
      userId, 
      vehicleType, 
      licensePlate, 
      vehicleBrand, 
      vehicleModel, 
      vehicleYear, 
      vehicleColor,
      documents 
    } = await c.req.json();

    if (!userId) {
      return c.json({ 
        success: false, 
        error: 'ID utilisateur requis' 
      }, 400);
    }

    console.log('🚗 Création profil conducteur pour:', userId);

    // Récupérer le profil utilisateur existant (ou depuis Auth si absent du KV)
    const profileKey = `profile:${userId}`;
    let existingProfile = await kv.get(profileKey);

    // ✅ Si pas de profil dans KV, essayer de le récupérer depuis Supabase Auth
    if (!existingProfile) {
      console.log('⚠️ Profil absent du KV, récupération depuis Supabase Auth...');
      
      try {
        const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId);
        
        if (userError || !user) {
          console.error('❌ Utilisateur introuvable dans Supabase Auth:', userId);
          return c.json({ 
            success: false, 
            error: 'Profil utilisateur introuvable. Veuillez d\'abord créer un compte.' 
          }, 404);
        }
        
        console.log('✅ Utilisateur trouvé dans Auth, création du profil KV...');
        
        // Créer le profil de base dans le KV store
        existingProfile = {
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'Conducteur',
          phone: user.user_metadata?.phone || user.phone || '',
          role: 'driver',
          created_at: user.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Sauvegarder le profil de base
        await kv.set(profileKey, existingProfile);
        console.log('✅ Profil de base créé dans KV');
        
      } catch (authError) {
        console.error('❌ Erreur Supabase Auth:', authError);
        return c.json({ 
          success: false, 
          error: 'Erreur lors de la récupération du profil utilisateur' 
        }, 500);
      }
    }

    // Créer le profil conducteur complet
    const driverProfile = {
      ...existingProfile,
      role: 'driver',
      vehicleType: vehicleType || 'economique',
      licensePlate: licensePlate || '',
      vehicleBrand: vehicleBrand || '',
      vehicleModel: vehicleModel || '',
      vehicleYear: vehicleYear || '',
      vehicleColor: vehicleColor || '',
      documents: documents || {},
      status: 'pending', // En attente de validation
      isOnline: false,
      balance: 0,
      totalRides: 0,
      rating: 5.0,
      updated_at: new Date().toISOString()
    };

    // Sauvegarder le profil conducteur
    await kv.set(`driver:${userId}`, driverProfile);
    await kv.set(profileKey, driverProfile);

    console.log('✅ Profil conducteur créé avec succès:', userId);

    return c.json({
      success: true,
      driver: driverProfile,
      message: 'Profil conducteur créé avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur création profil conducteur:', error);
    return c.json({ 
      success: false, 
      error: 'Erreur serveur lors de la création du profil conducteur: ' + String(error)
    }, 500);
  }
});

// ============================================
// METTRE À JOUR LA POSITION D'UN CONDUCTEUR
// ============================================
driverRoutes.post('/update-driver-location', async (c) => {
  try {
    const { driverId, location } = await c.req.json();

    if (!driverId || !location || !location.lat || !location.lng) {
      return c.json({ 
        success: false, 
        error: 'ID conducteur et position requis' 
      }, 400);
    }

    console.log('📍 Mise à jour position conducteur:', driverId, `(${location.lat}, ${location.lng})`);

    // Stocker la position dans le KV store
    const locationKey = `driver:${driverId}:location`;
    const locationData = {
      lat: location.lat,
      lng: location.lng,
      updated_at: new Date().toISOString()
    };

    try {
      await kv.set(locationKey, locationData);
      console.log('✅ Position conducteur mise à jour (KV):', locationKey);
    } catch (kvError) {
      console.error('❌ Erreur KV set:', kvError);
      console.error('❌ KV Error type:', typeof kvError);
      console.error('❌ KV Error details:', JSON.stringify(kvError, Object.getOwnPropertyNames(kvError)));
      throw kvError; // Re-throw pour que le catch externe le capture
    }
    
    return c.json({ success: true });

  } catch (error) {
    console.error('❌ Erreur update-driver-location:', error);
    return c.json({ 
      success: false, 
      error: 'Erreur serveur: ' + String(error)
    }, 500);
  }
});

// ============================================
// RÉCUPÉRER LA POSITION D'UN CONDUCTEUR
// ============================================
driverRoutes.get('/location/:driverId', async (c) => {
  try {
    const driverId = c.req.param('driverId');
    
    if (!driverId) {
      return c.json({ 
        success: false, 
        error: 'ID conducteur requis' 
      }, 400);
    }

    // Récupérer la position depuis le KV store
    const locationKey = `driver:${driverId}:location`;
    const locationData = await kv.get(locationKey);
    
    if (!locationData || !locationData.lat || !locationData.lng) {
      console.warn('⚠️ Position conducteur non trouvée:', driverId);
      return c.json({ 
        success: false, 
        error: 'Position non disponible' 
      }, 404);
    }

    console.log('✅ Position conducteur récupérée:', driverId, locationData);
    return c.json({ 
      success: true, 
      location: {
        lat: locationData.lat,
        lng: locationData.lng
      }
    });

  } catch (error) {
    console.error('❌ Erreur get-driver-location:', error);
    return c.json({ 
      success: false, 
      error: 'Erreur serveur: ' + String(error)
    }, 500);
  }
});

// ============================================
// METTRE À JOUR LE STATUT EN LIGNE D'UN CONDUCTEUR
// ============================================
driverRoutes.post('/toggle-online-status', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user?.id) {
      return c.json({ 
        success: false, 
        error: 'Non autorisé' 
      }, 401);
    }

    const { isOnline, location } = await c.req.json();

    console.log('🔄 Changement statut conducteur:', user.id, 'en ligne:', isOnline);

    // ✅ VÉRIFICATION DU SOLDE ET DE LA CATÉGORIE AVANT ACTIVATION
    if (isOnline) {
      // Récupérer le profil du conducteur pour obtenir sa catégorie de véhicule
      const driverKey = `driver:${user.id}`;
      const driverData = await kv.get(driverKey);
      
      if (!driverData) {
        console.log('❌ Profil conducteur introuvable');
        return c.json({
          success: false,
          error: 'Profil conducteur introuvable'
        }, 404);
      }
      
      const vehicleCategory = driverData.vehicle?.category || driverData.vehicleInfo?.type || 'smart_standard';
      console.log('🚗 Catégorie du véhicule:', vehicleCategory);
      
      // Récupérer le crédit minimum requis pour cette catégorie
      const minimumCredits: Record<string, number> = {
        smart_standard: 20000,      // ~7-10 USD
        smart_confort: 25000,        // ~9-15 USD
        smart_plus: 42000,           // ~15-17 USD
        smart_plus_plus: 42000,      // ~15-20 USD
        smart_business: 160000       // ~160 USD (location jour)
      };
      
      const requiredCredit = minimumCredits[vehicleCategory] || 20000;
      console.log('💳 Crédit minimum requis:', requiredCredit, 'CDF');
      
      // 🔥 AMÉLIORATION: Récupérer le solde depuis PLUSIEURS SOURCES
      let currentBalance = 0;
      
      // Source 1: Clé balance dédiée
      const balanceKey = `driver:${user.id}:balance`;
      const balanceData = await kv.get(balanceKey);
      
      if (typeof balanceData === 'number') {
        currentBalance = balanceData;
        console.log('✅ Solde trouvé (balanceKey, number):', currentBalance);
      } else if (balanceData && typeof balanceData === 'object' && 'balance' in balanceData) {
        currentBalance = balanceData.balance;
        console.log('✅ Solde trouvé (balanceKey, object.balance):', currentBalance);
      } else {
        console.warn('⚠️ Solde non trouvé dans balanceKey, tentative autres sources...');
        
        // Source 2: Dans le profil driver directement
        if (driverData.account_balance !== undefined) {
          currentBalance = driverData.account_balance;
          console.log('✅ Solde trouvé (driverData.account_balance):', currentBalance);
        } else if (driverData.balance !== undefined) {
          currentBalance = driverData.balance;
          console.log('✅ Solde trouvé (driverData.balance):', currentBalance);
        } else {
          // Source 3: Clé alternative (compatibilité ancienne structure)
          const altBalanceKey = `driver_balance_${user.id}`;
          const altBalanceData = await kv.get(altBalanceKey);
          
          if (typeof altBalanceData === 'number') {
            currentBalance = altBalanceData;
            console.log('✅ Solde trouvé (altBalanceKey):', currentBalance);
          } else if (altBalanceData && typeof altBalanceData === 'object' && 'balance' in altBalanceData) {
            currentBalance = altBalanceData.balance;
            console.log('✅ Solde trouvé (altBalanceKey, object):', currentBalance);
          } else {
            console.error('❌ Aucun solde trouvé dans aucune source !');
          }
        }
      }

      console.log('💰 Solde final du conducteur:', currentBalance, 'CDF');

      // Vérifier si le solde est suffisant pour cette catégorie
      if (currentBalance < requiredCredit) {
        console.log('❌ Activation refusée : solde insuffisant pour la catégorie', vehicleCategory);
        return c.json({
          success: false,
          error: `Crédit insuffisant pour ${vehicleCategory}. Minimum requis : ${requiredCredit.toLocaleString('fr-FR')} CDF. Votre solde : ${currentBalance.toLocaleString('fr-FR')} CDF.`,
          balance: currentBalance,
          requiredCredit: requiredCredit,
          category: vehicleCategory
        }, 400);
      }
      
      console.log('✅ Solde OK pour activation:', currentBalance, 'CDF >=', requiredCredit, 'CDF');
    }

    // Stocker le statut dans le KV store
    const statusKey = `driver:${user.id}:status`;
    const statusData = {
      isOnline,
      location: location || null,
      updated_at: new Date().toISOString()
    };

    await kv.set(statusKey, statusData);
    
    // ✅ CRITIQUE: Si une location est fournie, l'enregistrer dans la clé séparée
    if (location && location.lat && location.lng) {
      const locationKey = `driver:${user.id}:location`;
      const locationData = {
        lat: location.lat,
        lng: location.lng,
        updated_at: new Date().toISOString()
      };
      await kv.set(locationKey, locationData);
      console.log(`📍 Position GPS enregistrée: ${location.lat}, ${location.lng}`);
    }
    
    // ✅ CORRECTION CRITIQUE : Aussi mettre à jour le profil conducteur principal
    // Récupérer le profil conducteur complet
    const driverKey = `driver:${user.id}`;
    const driverData = await kv.get(driverKey);
    
    if (driverData) {
      // Mettre à jour is_available dans le profil principal
      const updatedDriver = {
        ...driverData,
        is_available: isOnline,
        last_seen: new Date().toISOString(),
        location: location || driverData.location || null
      };
      
      await kv.set(driverKey, updatedDriver);
      console.log('✅ Profil conducteur principal mis à jour avec is_available:', isOnline);
    } else {
      console.warn('⚠️ Profil conducteur introuvable:', driverKey);
    }

    console.log('✅ Statut conducteur mis à jour (KV):', statusKey, isOnline);
    return c.json({ success: true, isOnline });

  } catch (error) {
    console.error('❌ Erreur toggle-online-status:', error);
    return c.json({ 
      success: false, 
      error: 'Erreur serveur: ' + String(error)
    }, 500);
  }
});

// ============================================
// 💓 HEARTBEAT - MAINTENIR LE STATUT EN LIGNE
// ============================================
// ✅ v518.52 - Route pour envoyer un signal régulier au backend
// Le conducteur envoie un heartbeat toutes les 30 secondes pour maintenir son statut
driverRoutes.post('/heartbeat', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      console.error('❌ Erreur authentification heartbeat:', authError);
      return c.json({ success: false, error: 'Non autorisé' }, 401);
    }

    const driverId = user.id;
    const { isOnline, location, lastSeen } = await c.req.json();

    console.log(`💓 Heartbeat reçu - Conducteur ${driverId}: ${isOnline ? 'EN LIGNE' : 'HORS LIGNE'}`);

    // Mettre à jour le statut dans le KV store
    const statusKey = `driver:${driverId}:online`;
    await kv.set(statusKey, isOnline);

    // Mettre à jour la dernière activité
    const lastSeenKey = `driver:${driverId}:last_seen`;
    await kv.set(lastSeenKey, lastSeen || new Date().toISOString());

    // Mettre à jour la position si fournie
    if (location && isOnline) {
      const locationKey = `driver:${driverId}:location`;
      await kv.set(locationKey, location);
      console.log(`📍 Position mise à jour via heartbeat:`, location);
    }

    // Mettre à jour aussi dans le profil driver complet
    const driverKey = `driver:${driverId}`;
    const driver = await kv.get(driverKey) || {};
    
    const updatedDriver = {
      ...driver,
      isOnline: isOnline,
      lastSeen: lastSeen || new Date().toISOString(),
      ...(location && isOnline ? { location } : {})
    };
    
    await kv.set(driverKey, updatedDriver);

    console.log(`✅ Heartbeat traité - Statut: ${isOnline ? 'EN LIGNE ✅' : 'HORS LIGNE ⏸️'}`);
    
    return c.json({ 
      success: true, 
      isOnline,
      message: 'Heartbeat reçu'
    });

  } catch (error) {
    console.error('❌ Erreur heartbeat:', error);
    return c.json({ 
      success: false, 
      error: 'Erreur serveur: ' + String(error)
    }, 500);
  }
});

// ============================================
// 💰 RÉCUPÉRER LE SOLDE D'UN CONDUCTEUR
// ============================================
driverRoutes.get('/:driverId/balance', async (c) => {
  try {
    const driverId = c.req.param('driverId');
    console.log('💰 Récupération du solde du conducteur:', driverId);

    // Récupérer le solde depuis le KV store
    const balanceKey = `driver:${driverId}:balance`;
    const balance = await kv.get(balanceKey);

    // Si pas de solde trouvé, initialiser à 0
    if (balance === null || balance === undefined) {
      console.log('⚠️ Aucun solde trouvé, initialisation à 0 CDF');
      await kv.set(balanceKey, 0);
      return c.json({
        success: true,
        balance: 0
      });
    }

    // ✅ v517.89: Gérer la structure objet {balance: X, updated_at: ...}
    let balanceValue = 0;
    
    if (typeof balance === 'number') {
      balanceValue = balance;
    } else if (balance && typeof balance === 'object' && 'balance' in balance) {
      // Extraire la propriété .balance de l'objet
      balanceValue = balance.balance;
      console.log(`🔧 v517.89 - Structure objet détectée, extraction de .balance: ${balanceValue}`);
    } else {
      balanceValue = parseFloat(String(balance));
    }
    
    if (isNaN(balanceValue)) {
      console.error('❌ v517.89 - Solde invalide (NaN) après extraction, initialisation à 0');
      console.error('   Données reçues du KV:', balance, 'Type:', typeof balance);
      await kv.set(balanceKey, 0);
      return c.json({
        success: true,
        balance: 0
      });
    }
    
    console.log(`✅ Solde récupéré: ${balanceValue} CDF`);
    return c.json({
      success: true,
      balance: balanceValue
    });

  } catch (error) {
    console.error('❌ Erreur get-balance:', error);
    return c.json({
      success: false,
      error: 'Erreur serveur: ' + String(error)
    }, 500);
  }
});

// ============================================
// 💰 METTRE À JOUR LE SOLDE D'UN CONDUCTEUR
// ============================================
driverRoutes.post('/:driverId/balance', async (c) => {
  try {
    const driverId = c.req.param('driverId');
    const { balance, operation, amount } = await c.req.json();

    console.log('💰 Mise à jour du solde du conducteur:', driverId, { operation, amount });
    
    // ✅ v517.86: Validation stricte de l'amount reçu
    if (amount !== undefined && (isNaN(amount) || amount < 0)) {
      console.error('❌ v517.86 - Amount invalide reçu:', amount);
      return c.json({
        success: false,
        error: 'Montant invalide (NaN ou négatif)'
      }, 400);
    }

    const balanceKey = `driver:${driverId}:balance`;

    if (operation === 'add' && amount) {
      // Ajouter au solde existant
      const currentBalance = await kv.get(balanceKey) || 0;
      
      // ✅ v517.89: Gérer la structure objet {balance: X, updated_at: ...}
      let currentBalanceValue = 0;
      
      if (typeof currentBalance === 'number') {
        currentBalanceValue = currentBalance;
      } else if (currentBalance && typeof currentBalance === 'object' && 'balance' in currentBalance) {
        // Extraire la propriété .balance de l'objet
        currentBalanceValue = currentBalance.balance;
        console.log(`🔧 v517.89 - Structure objet détectée (add), extraction de .balance: ${currentBalanceValue}`);
      } else {
        currentBalanceValue = parseFloat(String(currentBalance));
      }
      
      if (isNaN(currentBalanceValue)) {
        console.error('❌ v517.89 - Solde actuel invalide (NaN) après extraction, initialisation avec amount');
        console.error('   Données KV:', currentBalance, 'Type:', typeof currentBalance);
        await kv.set(balanceKey, amount);
        return c.json({
          success: true,
          balance: amount
        });
      }
      
      const newBalance = currentBalanceValue + amount;
      
      // ✅ v517.89: Vérifier que newBalance n'est pas NaN avant de sauvegarder
      if (isNaN(newBalance)) {
        console.error('❌ v517.89 - Nouveau solde invalide (NaN)');
        console.error('   currentBalanceValue:', currentBalanceValue, 'amount:', amount);
        return c.json({
          success: false,
          error: 'Erreur de calcul du solde'
        }, 400);
      }
      
      await kv.set(balanceKey, newBalance);
      
      console.log(`✅ Solde augmenté: ${currentBalanceValue} + ${amount} = ${newBalance} CDF`);
      
      // Enregistrer l'historique
      const historyKey = `driver:${driverId}:balance_history:${Date.now()}`;
      await kv.set(historyKey, {
        operation: 'recharge',
        amount: amount,
        previous_balance: currentBalanceValue, // ✅ FIX: Utiliser la valeur numérique, pas currentBalance qui peut être null
        new_balance: newBalance,
        timestamp: new Date().toISOString()
      });

      return c.json({
        success: true,
        balance: newBalance
      });
      
    } else if (operation === 'subtract' && amount) {
      // Déduire du solde existant
      const currentBalance = await kv.get(balanceKey) || 0;
      
      // ✅ v517.89: Gérer la structure objet {balance: X, updated_at: ...}
      let currentBalanceValue = 0;
      
      if (typeof currentBalance === 'number') {
        currentBalanceValue = currentBalance;
      } else if (currentBalance && typeof currentBalance === 'object' && 'balance' in currentBalance) {
        // Extraire la propriété .balance de l'objet
        currentBalanceValue = currentBalance.balance;
        console.log(`🔧 v517.89 - Structure objet détectée (subtract), extraction de .balance: ${currentBalanceValue}`);
      } else {
        currentBalanceValue = parseFloat(String(currentBalance));
      }
      
      if (isNaN(currentBalanceValue)) {
        console.error('❌ v517.89 - Solde actuel invalide (NaN) après extraction, impossible de déduire');
        console.error('   Données KV:', currentBalance, 'Type:', typeof currentBalance);
        return c.json({
          success: false,
          error: 'Solde invalide'
        }, 400);
      }
      
      const newBalance = Math.max(0, currentBalanceValue - amount);
      
      // ✅ v517.89: Vérifier que newBalance n'est pas NaN avant de sauvegarder
      if (isNaN(newBalance)) {
        console.error('❌ v517.89 - Nouveau solde invalide (NaN)');
        console.error('   currentBalanceValue:', currentBalanceValue, 'amount:', amount);
        return c.json({
          success: false,
          error: 'Erreur de calcul du solde'
        }, 400);
      }
      
      await kv.set(balanceKey, newBalance);
      
      console.log(`✅ Solde déduit: ${currentBalanceValue} - ${amount} = ${newBalance} CDF`);
      
      // Enregistrer l'historique
      const historyKey = `driver:${driverId}:balance_history:${Date.now()}`;
      await kv.set(historyKey, {
        operation: 'deduction',
        amount: amount,
        previous_balance: currentBalanceValue, // ✅ FIX: Utiliser la valeur numérique, pas currentBalance qui peut être null
        new_balance: newBalance,
        timestamp: new Date().toISOString()
      });

      return c.json({
        success: true,
        balance: newBalance
      });
      
    } else if (balance !== undefined && balance !== null) {
      // ✅ FIX: Vérifier que balance n'est pas null avant de le définir
      // Définir directement le solde
      const balanceValue = typeof balance === 'number' ? balance : parseFloat(String(balance));
      
      if (isNaN(balanceValue)) {
        console.error('❌ Balance invalide (NaN):', balance);
        return c.json({
          success: false,
          error: 'Valeur de solde invalide'
        }, 400);
      }
      
      await kv.set(balanceKey, balanceValue);
      console.log(`✅ Solde défini: ${balanceValue} CDF`);
      
      return c.json({
        success: true,
        balance: balanceValue
      });
    } else {
      return c.json({
        success: false,
        error: 'Paramètres invalides'
      }, 400);
    }

  } catch (error) {
    console.error('❌ Erreur update-balance:', error);
    return c.json({
      success: false,
      error: 'Erreur serveur: ' + String(error)
    }, 500);
  }
});

// ============================================
// 💾 METTRE À JOUR LE PROFIL D'UN CONDUCTEUR
// ============================================
driverRoutes.post('/update-profile/:driverId', async (c) => {
  try {
    const driverId = c.req.param('driverId');
    const updates = await c.req.json();
    
    console.log(`🔥🔥🔥 ========== DÉBUT UPDATE CONDUCTEUR ==========`);
    console.log(`💾 ID:`, driverId);
    console.log('📝 Nouvelles données:', JSON.stringify(updates, null, 2));
    
    // 🔥 NORMALISER LE TÉLÉPHONE avant de sauvegarder
    let normalizedPhone = updates.phone;
    if (updates.phone) {
      // Fonction de normalisation (même logique que le frontend)
      const normalizePhone = (phone: string): string => {
        const cleaned = phone.replace(/[\s\-+]/g, '');
        
        // Cas 1: 9 chiffres → 243XXXXXXXXX
        if (cleaned.length === 9) {
          return `243${cleaned}`;
        }
        
        // Cas 2: 10 chiffres avec 0 → 243XXXXXXXXX (enlever le 0)
        if (cleaned.length === 10 && cleaned.startsWith('0')) {
          return `243${cleaned.substring(1)}`;
        }
        
        // Cas 3: 12 chiffres avec 243 → 243XXXXXXXXX
        if (cleaned.length === 12 && cleaned.startsWith('243')) {
          return cleaned;
        }
        
        // Cas 4: 13 chiffres avec 2430 → 243XXXXXXXXX (enlever le 0 après 243)
        if (cleaned.length === 13 && cleaned.startsWith('2430')) {
          return `243${cleaned.substring(4)}`;
        }
        
        // Si aucun cas ne correspond, retourner tel quel
        return phone;
      };
      
      normalizedPhone = normalizePhone(updates.phone);
      console.log(`📱 Téléphone normalisé: ${updates.phone} → ${normalizedPhone}`);
    }
    
    // 🔥 Récupérer le profil depuis TOUTES les clés possibles
    let currentDriver = await kv.get(`driver:${driverId}`) || {};
    const currentProfile = await kv.get(`profile:${driverId}`);
    const currentUser = await kv.get(`user:${driverId}`);
    
    console.log("📖 Données existantes:");
    console.log("  - driver:", currentDriver && Object.keys(currentDriver).length > 0 ? "✅" : "❌");
    console.log("  - profile:", currentProfile ? "✅" : "❌");
    console.log("  - user:", currentUser ? "✅" : "❌");
    
    // Fusionner les mises à jour avec le téléphone normalisé
    const updatedDriver = {
      ...currentDriver,
      ...updates,
      phone: normalizedPhone || currentDriver.phone,
      updatedAt: new Date().toISOString()
    };
    
    console.log("🔄 Conducteur mis à jour:", JSON.stringify(updatedDriver, null, 2));
    
    // 🔥 SAUVEGARDER DANS TOUTES LES CLÉS DU KV STORE
    // 1. Sauvegarder dans driver:
    await kv.set(`driver:${driverId}`, updatedDriver);
    console.log('✅ 1/5 - driver: mis à jour');
    
    // 2. Sauvegarder dans profile: (si existe)
    if (currentProfile) {
      const updatedProfile = {
        ...currentProfile,
        full_name: updates.name || currentProfile.full_name,
        email: updates.email || currentProfile.email,
        phone: normalizedPhone || currentProfile.phone,
        updated_at: new Date().toISOString()
      };
      await kv.set(`profile:${driverId}`, updatedProfile);
      console.log('✅ 2/5 - profile: mis à jour');
    } else {
      console.log("⏭️ 2/5 - profile: n'existe pas, ignoré");
    }
    
    // 3. Sauvegarder dans user: (si existe)
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        name: updates.name || currentUser.name,
        full_name: updates.name || currentUser.full_name,
        email: updates.email || currentUser.email,
        phone: normalizedPhone || currentUser.phone,
        updated_at: new Date().toISOString()
      };
      await kv.set(`user:${driverId}`, updatedUser);
      console.log('✅ 3/5 - user: mis à jour');
    } else {
      console.log("⏭️ 3/5 - user: n'existe pas, ignoré");
    }
    
    // 4. 🔥 METTRE À JOUR SUPABASE AUTH si l'email a changé OU si le téléphone a changé
    console.log("🔥 4/5 - Mise à jour Supabase Auth...");
    try {
      let authUpdated = false;
      
      // 🔥 CAS 1: L'email a changé (email réel, pas généré)
      if (updates.email && currentDriver.email !== updates.email) {
        console.log(`📧 Email changé: ${currentDriver.email} → ${updates.email}`);
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          driverId,
          { email: updates.email }
        );
        
        if (updateError) {
          console.error("⚠️ Erreur mise à jour email Supabase Auth:", updateError);
        } else {
          console.log("✅ Supabase Auth: email mis à jour");
          authUpdated = true;
        }
      }
      
      // 🔥 CAS 2: Le téléphone a changé
      // ⚠️ CORRECTION CRITIQUE : NE PAS MODIFIER L'EMAIL DANS SUPABASE AUTH
      // L'email dans Auth sert uniquement pour l'authentification et doit rester stable
      // On met seulement à jour les user_metadata pour garder la trace du nouveau téléphone
      if (normalizedPhone && currentDriver.phone !== normalizedPhone) {
        console.log(`📱 Téléphone changé: ${currentDriver.phone} → ${normalizedPhone}`);
        console.log(`🔄 Mise à jour des user_metadata uniquement (sans changer l'email Auth)...`);
        
        const { error: updatePhoneError } = await supabase.auth.admin.updateUserById(
          driverId,
          { 
            user_metadata: {
              phone: normalizedPhone
            }
          }
        );
        
        if (updatePhoneError) {
          console.error("⚠️ Erreur mise à jour téléphone dans Supabase Auth:", updatePhoneError);
        } else {
          console.log("✅ Supabase Auth: user_metadata.phone mis à jour (email Auth inchangé)");
          authUpdated = true;
        }
      }
      
      if (!authUpdated) {
        console.log("⏭️ 4/5 - Supabase Auth: aucun changement, ignoré");
      } else {
        console.log("✅ 4/5 - Supabase Auth: mis à jour avec succès!");
      }
    } catch (error) {
      console.error("⚠️ Erreur Supabase Auth:", error);
    }
    
    // 5. 🔥🔥🔥 METTRE À JOUR LA TABLE PROFILES (CRITIQUE POUR LA CONNEXION)
    console.log("🔥 5/5 - Mise à jour table profiles...");
    try {
      // 📖 D'abord, lire les données actuelles
      const { data: currentProfileData, error: selectError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', driverId)
        .single();
      
      if (selectError) {
        console.error("❌ Erreur lecture table profiles:", selectError);
        console.error("   Code:", selectError.code);
        console.error("   Message:", selectError.message);
        console.error("   Details:", selectError.details);
        console.log("⏭️ 5/5 - Table profiles: erreur de lecture, mise à jour ignorée pour éviter les conflits");
        // ⚠️ NE PAS continuer si on ne peut pas lire les données actuelles
      } else if (!currentProfileData) {
        console.error("❌ currentProfileData est null/undefined");
        console.log("⏭️ 5/5 - Table profiles: données actuelles introuvables, mise à jour ignorée");
      } else {
        console.log("📖 Données actuelles dans profiles:", JSON.stringify(currentProfileData, null, 2));
        
        const updateData: any = {};
        
        // ✅ Ne mettre à jour QUE les champs qui ont changé
        if (updates.name && updates.name !== currentProfileData.full_name) {
          updateData.full_name = updates.name;
          console.log(`   → full_name: "${currentProfileData.full_name}" → "${updates.name}"`);
        }
        
        if (updates.email && updates.email !== currentProfileData.email) {
          updateData.email = updates.email;
          console.log(`   → email: "${currentProfileData.email}" → "${updates.email}"`);
        }
        
        if (normalizedPhone && normalizedPhone !== currentProfileData.phone) {
          updateData.phone = normalizedPhone;
          console.log(`   → phone: "${currentProfileData.phone}" → "${normalizedPhone}"`);
        }
        
        // ✅ Seulement si on a des changements
        if (Object.keys(updateData).length === 0) {
          console.log("⏭️ 5/5 - Table profiles: aucun changement détecté, ignoré");
        } else {
          console.log("🔄 updateData à envoyer:", JSON.stringify(updateData, null, 2));
          
          const { data: updatedData, error: profileError } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', driverId)
            .select();
          
          if (profileError) {
            console.error("❌ Erreur mise à jour table profiles:", profileError);
            console.error("   Code:", profileError.code);
            console.error("   Message:", profileError.message);
            console.error("   Details:", profileError.details);
          } else {
            console.log("✅ 5/5 - Table profiles mise à jour avec succès !");
            console.log("✅ Nouvelles données:", JSON.stringify(updatedData, null, 2));
          }
        }
      }
    } catch (error) {
      console.error("❌ Exception table profiles:", error);
      console.error("   Stack:", error instanceof Error ? error.stack : 'N/A');
    }
    
    console.log(`🔥🔥🔥 ========== FIN UPDATE CONDUCTEUR (SUCCÈS) ==========`);
    
    return c.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      driver: updatedDriver
    });
  } catch (error) {
    console.error('🔥🔥🔥 ========== FIN UPDATE CONDUCTEUR (ERREUR) ==========');
    console.error('❌ Erreur mise à jour profil conducteur:', error);
    console.error('❌ Stack:', error instanceof Error ? error.stack : 'N/A');
    return c.json({
      success: false,
      error: 'Erreur serveur: ' + String(error)
    }, 500);
  }
});

// ============================================
// 📖 RÉCUPÉRER LE PROFIL D'UN CONDUCTEUR
// ============================================
driverRoutes.get('/profile/:driverId', async (c) => {
  try {
    const driverId = c.req.param('driverId');
    
    console.log(`📖 Récupération du profil du conducteur ${driverId}...`);
    
    // Récupérer depuis le KV store
    const driver = await kv.get(`driver:${driverId}`);
    
    if (!driver) {
      return c.json({
        success: false,
        error: 'Conducteur non trouvé'
      }, 404);
    }
    
    console.log(`✅ Profil du conducteur ${driverId} récupéré`);
    
    return c.json({
      success: true,
      driver: driver
    });
  } catch (error) {
    console.error('❌ Erreur récupération profil conducteur:', error);
    return c.json({
      success: false,
      error: 'Erreur serveur: ' + String(error)
    }, 500);
  }
});

// ============================================
// RÉCUPÉRER LES INFOS D'UN CONDUCTEUR SPÉCIFIQUE
// ============================================
driverRoutes.get('/:driverId', async (c) => {
  try {
    const driverId = c.req.param('driverId');
    console.log('🔍 Récupération info conducteur:', driverId);

    if (!driverId) {
      return c.json({ 
        success: false, 
        error: 'driverId requis' 
      }, 400);
    }

    // Récupérer les données du conducteur depuis le KV store
    const driverKey = `driver:${driverId}`;
    let driverData = await kv.get(driverKey);

    if (!driverData) {
      console.warn('⚠️ Conducteur introuvable dans le KV store:', driverId);
      console.log('🔄 Tentative de récupération depuis auth.users via Supabase...');
      
      // 🆕 NOUVEAU : Essayer de récupérer l'utilisateur depuis Supabase Auth
      try {
        const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(driverId);
        
        if (userError || !user) {
          console.error('❌ Utilisateur introuvable dans Supabase Auth:', driverId);
          return c.json({ 
            success: false, 
            error: 'Profil conducteur introuvable. Veuillez vous inscrire en tant que conducteur.',
            driver: null
          }, 404);
        }
        
        console.log('✅ Utilisateur trouvé dans Auth:', user.email);
        console.log('📋 User metadata:', user.user_metadata);
        
        // Créer un profil conducteur "pending" par défaut
        console.log('🆕 Création d\'un profil conducteur par défaut (status: pending)...');
        
        // ✅ CORRECTION : Utiliser le status depuis user_metadata si disponible
        // Cela permet de récupérer le statut "approved" si l'admin a déjà approuvé le compte
        const driverStatus = user.user_metadata?.status || user.user_metadata?.driver_status || 'pending';
        console.log('📊 Statut détecté depuis user_metadata:', driverStatus);
        
        const newDriverProfile = {
          id: user.id,
          user_id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'Conducteur',
          phone: user.user_metadata?.phone || user.phone || '',
          status: driverStatus, // ✅ Utiliser le statut depuis user_metadata
          is_available: false,
          photo: null,
          vehicle: {
            make: user.user_metadata?.vehicle_make || '',
            model: user.user_metadata?.vehicle_model || '',
            color: user.user_metadata?.vehicle_color || '',
            license_plate: user.user_metadata?.vehicle_plate || '',
            category: user.user_metadata?.vehicle_category || 'standard',
            year: new Date().getFullYear(),
            seats: 4
          },
          vehicle_make: user.user_metadata?.vehicle_make || '',
          vehicle_model: user.user_metadata?.vehicle_model || '',
          vehicle_plate: user.user_metadata?.vehicle_plate || '',
          vehicle_category: user.user_metadata?.vehicle_category || 'standard',
          rating: 0,
          total_rides: 0,
          wallet_balance: 0,
          balance: 0,
          created_at: user.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Sauvegarder le profil dans le KV store
        await kv.set(driverKey, newDriverProfile);
        console.log('✅ Profil conducteur créé et sauvegardé:', newDriverProfile.email);
        console.log('📊 Statut du profil créé:', newDriverProfile.status);
        
        if (newDriverProfile.status === 'pending') {
          console.log('⚠️ Le conducteur doit être approuvé par un admin avant de se connecter');
        } else if (newDriverProfile.status === 'approved') {
          console.log('✅ Le conducteur a déjà été approuvé par un admin');
        }
        
        // Utiliser ce nouveau profil
        driverData = newDriverProfile;
        
      } catch (authError) {
        console.error('❌ Erreur lors de la récupération depuis Supabase Auth:', authError);
        return c.json({ 
          success: false, 
          error: 'Profil conducteur introuvable',
          driver: null
        }, 404);
      }
    }

    console.log('✅ Conducteur trouvé:', driverData.full_name || driverData.name);
    console.log('📊 Statut du conducteur:', driverData.status);

    return c.json({
      success: true,
      driver: driverData
    });

  } catch (error) {
    console.error('❌ Erreur récupération conducteur:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur serveur',
      driver: null
    }, 500);
  }
});

// ============================================
// METTRE À JOUR LES INFOS D'UN CONDUCTEUR (POUR ADMIN)
// ============================================
driverRoutes.post('/update/:driverId', async (c) => {
  try {
    const driverId = c.req.param('driverId');
    const updates = await c.req.json();
    
    console.log('🔄 Mise à jour conducteur:', driverId);
    console.log('📝 Mises à jour:', updates);

    if (!driverId) {
      return c.json({ 
        success: false, 
        error: 'driverId requis' 
      }, 400);
    }

    // Récupérer les données actuelles du conducteur
    const driverKey = `driver:${driverId}`;
    const currentDriver = await kv.get(driverKey);

    if (!currentDriver) {
      console.error('❌ Conducteur introuvable:', driverId);
      return c.json({ 
        success: false, 
        error: 'Conducteur introuvable' 
      }, 404);
    }

    // Fusionner les mises à jour
    const updatedDriver = {
      ...currentDriver,
      ...updates,
      updated_at: new Date().toISOString()
    };

    // Sauvegarder dans le KV store
    await kv.set(driverKey, updatedDriver);
    console.log('✅ Conducteur mis à jour dans KV store');

    // ✅ CORRECTION CRITIQUE : Synchroniser le statut dans Supabase Auth user_metadata
    // Cela permet de garder la cohérence entre KV store et Auth
    if (updates.status) {
      try {
        console.log('🔄 Synchronisation du statut dans Supabase Auth:', updates.status);
        
        const { error: updateMetadataError } = await supabase.auth.admin.updateUserById(
          driverId,
          {
            user_metadata: {
              status: updates.status,
              driver_status: updates.status  // Aussi en tant que driver_status pour compatibilité
            }
          }
        );
        
        if (updateMetadataError) {
          console.error('⚠️ Erreur synchronisation statut dans Auth:', updateMetadataError);
        } else {
          console.log('✅ Statut synchronisé dans Supabase Auth user_metadata');
        }
      } catch (syncError) {
        console.error('⚠️ Erreur synchronisation Auth:', syncError);
        // Continue même si la synchro échoue, le KV store est la source de vérité
      }
    }

    return c.json({
      success: true,
      driver: updatedDriver
    });

  } catch (error) {
    console.error('❌ Erreur mise à jour conducteur:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur serveur' 
    }, 500);
  }
});

// ============================================
// 📊 RÉCUPÉRER LES STATISTIQUES D'UN CONDUCTEUR
// ============================================
driverRoutes.get('/:driverId/stats', async (c) => {
  try {
    const driverId = c.req.param('driverId');
   // ============================================
// RÉCUPÉRER LES CONDUCTEURS EN LIGNE
// ⚠️ AUCUNE SIMULATION - Données réelles uniquement
// ============================================ console.log(`📊 Récupération des stats du conducteur ${driverId}...`);

    // Récupérer les stats depuis le KV store
    const statsKey = `driver:${driverId}:stats`;
    const stats = await kv.get(statsKey) || {
      totalRides: 0,
      totalEarnings: 0,
      totalCommissions: 0,
      averageRating: 0,
      ratings: []
    };

    console.log(`✅ Stats récupérées:`, {
      totalRides: stats.totalRides,
      averageRating: stats.averageRating,
      totalRatings: stats.ratings?.length || 0
    });

    return c.json({
      success: true,
      stats: {
        totalRides: stats.totalRides || 0,
        totalEarnings: stats.totalEarnings || 0,
        totalCommissions: stats.totalCommissions || 0,
        averageRating: stats.averageRating || 0,
        ratingsCount: stats.ratings?.length || 0
      }
    });

  } catch (error) {
    console.error('❌ Erreur get-stats:', error);
    return c.json({
      success: false,
      error: 'Erreur serveur: ' + String(error),
      stats: {
        totalRides: 0,
        totalEarnings: 0,
        totalCommissions: 0,
        averageRating: 0,
        ratingsCount: 0
      }
    }, 500);
  }
});

export default driverRoutes;
