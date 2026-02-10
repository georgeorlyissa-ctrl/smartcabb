import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv-wrapper.tsx";
import { isValidUUID } from "./uuid-validator.tsx";

const app = new Hono();

// ============================================
// 🚗 METTRE À JOUR LE PROFIL D'UN CONDUCTEUR
// ============================================
app.post('/update', async (c) => {
  try {
    const body = await c.req.json();
    const { driverId, updates } = body;

    console.log('🔥🔥🔥 ========== DÉBUT UPDATE CONDUCTEUR ==========');
    console.log('🆔 Driver ID:', driverId);
    console.log('📝 Updates à appliquer:', JSON.stringify(updates, null, 2));

    if (!driverId || !updates) {
      return c.json({ 
        success: false, 
        error: 'Données manquantes' 
      }, 400);
    }

    // Initialiser Supabase client avec service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('❌ Clés Supabase manquantes');
      return c.json({ 
        success: false, 
        error: 'Configuration serveur invalide' 
      }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Récupérer le conducteur depuis le KV store
    const driverKey = `driver:${driverId}`;
    let currentDriver = await kv.get(driverKey);
    
    if (!currentDriver) {
      console.warn(`⚠️ Conducteur ${driverId} non trouvé dans KV, tentative de récupération depuis Auth...`);
      
      // FALLBACK : Récupérer depuis Supabase Auth
      try {
        const { data: { user }, error: authError } = await supabase.auth.admin.getUserById(driverId);
        
        if (authError || !user) {
          console.error('❌ Erreur Auth:', authError);
          throw new Error('Conducteur introuvable dans Auth');
        }
        
        console.log('✅ Conducteur trouvé dans Auth, création du profil KV...');
        
        // Créer l'objet conducteur depuis les données Auth
        currentDriver = {
          id: driverId,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
          phone: user.user_metadata?.phone || user.phone || '',
          status: user.user_metadata?.status || 'pending',
          driver_status: user.user_metadata?.driver_status || user.user_metadata?.status || 'pending',
          is_available: user.user_metadata?.is_available || false,
          isOnline: user.user_metadata?.isOnline || false,
          location: user.user_metadata?.location || null,
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
          rating: 5.0,
          total_rides: 0,
          wallet_balance: 0,
          balance: 0,
          created_at: user.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Sauvegarder dans le KV
        await kv.set(driverKey, currentDriver);
        await kv.set(`profile:${driverId}`, currentDriver);
        console.log('✅ Profil conducteur créé dans KV depuis Auth');
        
      } catch (authError) {
        console.error('❌ Erreur récupération depuis Auth:', authError);
        return c.json({ 
          success: false, 
          error: 'Conducteur introuvable' 
        }, 404);
      }
    }

    console.log('✅ Conducteur trouvé dans KV store');
    console.log('📊 Statut ACTUEL:', currentDriver.status);
    console.log('📊 Nouveau statut:', updates.status);

    // Fusionner les mises à jour
    const updatedDriver = {
      ...currentDriver,
      ...updates,
      updated_at: new Date().toISOString()
    };

    console.log('🔄 Objet conducteur fusionné:', JSON.stringify(updatedDriver, null, 2));

    // Sauvegarder dans le KV store
    console.log(`💾 Sauvegarde dans KV store avec la clé: ${driverKey}`);
    await kv.set(driverKey, updatedDriver);
    console.log('✅ Conducteur mis à jour dans KV store');
    
    // 🔥 FIX CRITIQUE : SYNCHRONISER AUSSI profile:${driverId}
    const profileKey = `profile:${driverId}`;
    console.log(`💾 SYNCHRONISATION CRITIQUE : Sauvegarde AUSSI dans ${profileKey}`);
    await kv.set(profileKey, updatedDriver);
    console.log('✅ Profil synchronisé dans KV store');
    
    // Vérifier immédiatement que la sauvegarde a fonctionné
    const verifyDriver = await kv.get(driverKey);
    const verifyProfile = await kv.get(profileKey);
    
    if (verifyDriver && verifyDriver.status === updates.status) {
      console.log('✅ VÉRIFICATION : Statut correctement sauvegardé dans driver: KV !');
      console.log('   Statut vérifié:', verifyDriver.status);
    } else {
      console.error('❌ ERREUR CRITIQUE : Le statut n\'a PAS été sauvegardé dans driver: !');
      console.error('   Statut attendu:', updates.status);
      console.error('   Statut trouvé:', verifyDriver?.status);
    }
    
    if (verifyProfile && verifyProfile.status === updates.status) {
      console.log('✅ VÉRIFICATION : Statut correctement sauvegardé dans profile: KV !');
      console.log('   Statut vérifié:', verifyProfile.status);
    } else {
      console.error('❌ ERREUR CRITIQUE : Le statut n\'a PAS été sauvegardé dans profile: !');
      console.error('   Statut attendu:', updates.status);
      console.error('   Statut trouvé:', verifyProfile?.status);
    }

    // ✅ SYNCHRONISATION CRITIQUE : Mettre à jour le statut dans Auth user_metadata
    if (updates.status) {
      try {
        console.log('🔄 Synchronisation du statut dans Auth user_metadata...');
        console.log('📊 Statut à synchroniser:', updates.status);
        
        const { data, error: authError } = await supabase.auth.admin.updateUserById(
          driverId,
          {
            user_metadata: {
              status: updates.status,
              driver_status: updates.status,
              updated_at: new Date().toISOString()
            }
          }
        );
        
        if (authError) {
          console.error('❌ Erreur synchro Auth:', authError);
        } else {
          console.log('✅ Statut synchronisé dans Auth user_metadata');
          console.log('📋 Auth user_metadata:', data.user?.user_metadata);
        }
      } catch (authSyncError) {
        console.error('❌ Exception synchro Auth:', authSyncError);
        // Continue même si la synchro échoue
      }
    }
    
    // ✅ SYNCHRONISATION POSTGRES : Mettre à jour la table drivers
    try {
      console.log('🔄 Synchronisation dans table Postgres drivers...');
      
      // ✅ FIX CRITIQUE : Utiliser user_id au lieu de id pour la table drivers
      // La table drivers utilise user_id comme référence à l'utilisateur Auth
      const { data: existingDriver, error: checkError } = await supabase
        .from('drivers')
        .select('id, user_id')
        .eq('user_id', driverId)
        .maybeSingle();
      
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = not found
        console.error('❌ Erreur vérification Postgres:', checkError);
      } else if (existingDriver) {
        // Le conducteur existe, faire un UPDATE
        console.log('✅ Conducteur trouvé dans Postgres, UPDATE...');
        
        // 🔥 FIX: Construire l'objet UPDATE avec SEULEMENT les champs que PostgreSQL accepte
        const pgUpdateData: any = {
          updated_at: new Date().toISOString()
        };
        
        // Ajouter les champs seulement s'ils sont présents dans updates
        if (updates.status) pgUpdateData.status = updates.status;
        if (updates.full_name) pgUpdateData.full_name = updates.full_name;
        if (updates.email) pgUpdateData.email = updates.email;
        if (updates.phone) pgUpdateData.phone = updates.phone;
        if (updates.is_available !== undefined) pgUpdateData.is_available = updates.is_available;
        
        console.log('📝 Données à UPDATE dans Postgres:', JSON.stringify(pgUpdateData, null, 2));
        
        const { error: pgError } = await supabase
          .from('drivers')
          .update(pgUpdateData)
          .eq('user_id', driverId);
        
        if (pgError) {
          console.error('❌ Erreur UPDATE Postgres:', pgError);
          console.error('   Code:', pgError.code);
          console.error('   Message:', pgError.message);
          console.error('   Details:', pgError.details);
        } else {
          console.log('✅ Table drivers mise à jour dans Postgres (UPDATE)');
        }
      } else {
        // Le conducteur n'existe pas, faire un INSERT
        console.log('⚠️ Conducteur absent de Postgres, INSERT...');
        
        // 🔥 FIX: Construire l'objet INSERT avec les champs de base
        const pgInsertData: any = {
          user_id: driverId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Ajouter les champs depuis updatedDriver (pas updates!)
        if (updatedDriver.status) pgInsertData.status = updatedDriver.status;
        if (updatedDriver.full_name) pgInsertData.full_name = updatedDriver.full_name;
        if (updatedDriver.email) pgInsertData.email = updatedDriver.email;
        if (updatedDriver.phone) pgInsertData.phone = updatedDriver.phone;
        if (updatedDriver.is_available !== undefined) pgInsertData.is_available = updatedDriver.is_available;
        
        console.log('📝 Données à INSERT dans Postgres:', JSON.stringify(pgInsertData, null, 2));
        
        const { error: insertError } = await supabase
          .from('drivers')
          .insert(pgInsertData);
        
        if (insertError) {
          console.error('❌ Erreur INSERT Postgres:', insertError);
          console.error('   Code:', insertError.code);
          console.error('   Message:', insertError.message);
          console.error('   Details:', insertError.details);
        } else {
          console.log('✅ Conducteur créé dans Postgres (INSERT)');
        }
      }
    } catch (pgSyncError) {
      console.error('❌ Exception synchro Postgres:', pgSyncError);
      // Continue même si la synchro échoue
    }

    console.log('🔥🔥🔥 ========== FIN UPDATE CONDUCTEUR (SUCCÈS) ==========');

    return c.json({
      success: true,
      driver: updatedDriver
    });

  } catch (error) {
    console.error('🔥🔥🔥 ========== FIN UPDATE CONDUCTEUR (ERREUR) ==========');
    console.error('❌ Erreur mise à jour conducteur:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur serveur' 
    }, 500);
  }
});

// ============================================
// 🚗 RÉCUPÉRER LE PROFIL D'UN CONDUCTEUR
// ============================================
app.get('/:driverId', async (c) => {
  try {
    const driverId = c.req.param('driverId');
    
    console.log('🔍 Recherche du conducteur:', driverId);

    // Essayer d'abord dans le KV store
    let driver = await kv.get(`driver:${driverId}`);
    
    if (!driver) {
      // Fallback : essayer avec la clé profile:
      driver = await kv.get(`profile:${driverId}`);
    }

    if (!driver) {
      console.log('⚠️ Conducteur non trouvé dans KV');
      return c.json({ 
        success: false, 
        error: 'Conducteur non trouvé' 
      }, 404);
    }

    console.log('✅ Conducteur trouvé:', driver.full_name);

    return c.json({
      success: true,
      driver: driver
    });

  } catch (error) {
    console.error('❌ Erreur récupération conducteur:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur serveur' 
    }, 500);
  }
});

// ============================================
// 🚗 METTRE À JOUR LA POSITION GPS DU CONDUCTEUR
// ============================================
app.post('/location', async (c) => {
  try {
    const body = await c.req.json();
    const { driverId, location } = body;

    if (!driverId || !location || !location.lat || !location.lng) {
      return c.json({ 
        success: false, 
        error: 'Données de localisation invalides' 
      }, 400);
    }

    // Récupérer le conducteur
    const driverKey = `driver:${driverId}`;
    const driver = await kv.get(driverKey);

    if (!driver) {
      return c.json({ 
        success: false, 
        error: 'Conducteur non trouvé' 
      }, 404);
    }

    // Mettre à jour la position
    driver.location = {
      lat: location.lat,
      lng: location.lng,
      address: location.address || '',
      updated_at: new Date().toISOString()
    };
    driver.updated_at = new Date().toISOString();

    // Sauvegarder
    await kv.set(driverKey, driver);
    await kv.set(`profile:${driverId}`, driver);

    return c.json({
      success: true,
      message: 'Position mise à jour'
    });

  } catch (error) {
    console.error('❌ Erreur mise à jour position:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur serveur' 
    }, 500);
  }
});

// ============================================
// 🚗 METTRE À JOUR LA POSITION GPS (ROUTE ALTERNATIVE)
// ============================================
app.post('/update-driver-location', async (c) => {
  try {
    const body = await c.req.json();
    const { driverId, location } = body;

    console.log('📍 Mise à jour position driver:', driverId, location);

    if (!driverId || !location || !location.lat || !location.lng) {
      return c.json({ 
        success: false, 
        error: 'Données de localisation invalides' 
      }, 400);
    }

    // Récupérer le conducteur
    const driverKey = `driver:${driverId}`;
    let driver = await kv.get(driverKey);

    if (!driver) {
      console.log('⚠️ Driver non trouvé dans KV avec clé:', driverKey);
      // Essayer avec profile:
      driver = await kv.get(`profile:${driverId}`);
      
      if (!driver) {
        console.error('❌ Driver non trouvé:', driverId);
        return c.json({ 
          success: false, 
          error: 'Conducteur non trouvé' 
        }, 404);
      }
    }

    // Mettre à jour la position
    driver.location = {
      lat: location.lat,
      lng: location.lng,
      address: location.address || '',
      updated_at: new Date().toISOString()
    };
    driver.updated_at = new Date().toISOString();

    // Sauvegarder dans les deux clés
    await kv.set(driverKey, driver);
    await kv.set(`profile:${driverId}`, driver);

    console.log('✅ Position GPS mise à jour avec succès');

    return c.json({
      success: true,
      message: 'Position mise à jour'
    });

  } catch (error) {
    console.error('❌ Erreur mise à jour position:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur serveur' 
    }, 500);
  }
});

// ============================================
// 💓 HEARTBEAT - Maintenir le statut en ligne
// ============================================
app.post('/heartbeat', async (c) => {
  try {
    const body = await c.req.json();
    const { driverId, isOnline, location, lastSeen } = body;

    console.log('💓 Heartbeat reçu:', driverId, 'isOnline:', isOnline);

    if (!driverId) {
      return c.json({ 
        success: false, 
        error: 'ID conducteur manquant' 
      }, 400);
    }

    // Récupérer le conducteur
    const driverKey = `driver:${driverId}`;
    let driver = await kv.get(driverKey);

    if (!driver) {
      console.log('⚠️ Driver non trouvé dans KV avec clé:', driverKey);
      // Essayer avec profile:
      driver = await kv.get(`profile:${driverId}`);
      
      if (!driver) {
        console.error('❌ Driver non trouvé:', driverId);
        return c.json({ 
          success: false, 
          error: 'Conducteur non trouvé' 
        }, 404);
      }
    }

    // Mettre à jour le statut en ligne
    driver.isOnline = isOnline;
    driver.is_available = isOnline;
    driver.lastSeen = lastSeen || new Date().toISOString();
    
    // Mettre à jour la position si fournie
    if (location && location.lat && location.lng) {
      driver.location = {
        lat: location.lat,
        lng: location.lng,
        address: location.address || '',
        updated_at: new Date().toISOString()
      };
    }
    
    driver.updated_at = new Date().toISOString();

    // Sauvegarder dans les deux clés
    await kv.set(driverKey, driver);
    await kv.set(`profile:${driverId}`, driver);

    console.log(`✅ Heartbeat traité: ${isOnline ? 'EN LIGNE' : 'HORS LIGNE'}`);

    return c.json({
      success: true,
      message: 'Heartbeat enregistré',
      isOnline: driver.isOnline
    });

  } catch (error) {
    console.error('❌ Erreur heartbeat:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur serveur' 
    }, 500);
  }
});

// ============================================
// 🚗 RÉCUPÉRER TOUS LES CONDUCTEURS
// ============================================
app.get('/', async (c) => {
  try {
    console.log('📋 Récupération de tous les conducteurs...');
    
    const drivers = await kv.getByPrefix('driver:');
    
    console.log(`✅ ${drivers?.length || 0} conducteurs trouvés`);

    return c.json({
      success: true,
      drivers: drivers || []
    });

  } catch (error) {
    console.error('❌ Erreur récupération conducteurs:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur serveur',
      drivers: []
    }, 500);
  }
});

export default app;
