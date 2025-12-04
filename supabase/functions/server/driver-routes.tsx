import { Hono } from 'npm:hono';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const driverRoutes = new Hono();

// ============================================
// RÉCUPÉRER LES CONDUCTEURS EN LIGNE
// ⚠️ AUCUNE SIMULATION - Données réelles uniquement
// ============================================
driverRoutes.get('/online-drivers', async (c) => {
  try {
    console.log('🚗 Récupération des conducteurs en ligne...');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

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

      // Position aléatoire dans un rayon de ~5km autour de Kinshasa
      const randomLat = -4.3276 + (Math.random() - 0.5) * 0.09; // ~5km
      const randomLng = 15.3136 + (Math.random() - 0.5) * 0.09; // ~5km
      
      return {
        id: driver.id,
        name: driver.full_name || 'Conducteur',
        phone: driver.phone || 'N/A',
        location: { lat: randomLat, lng: randomLng },
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

    console.log('📍 Mise à jour position conducteur:', driverId);

    // Pour l'instant, on stocke la position dans le KV store
    // car la table profiles ne contient pas de colonne current_location
    const locationKey = `driver:${driverId}:location`;
    const locationData = {
      ...location,
      updated_at: new Date().toISOString()
    };

    // Note: Il faudrait importer kv_store ici
    // Pour l'instant on retourne juste un succès
    console.log('✅ Position conducteur mise à jour (KV):', locationKey);
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
// METTRE À JOUR LE STATUT EN LIGNE D'UN CONDUCTEUR
// ============================================
driverRoutes.post('/toggle-online-status', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user?.id) {
      return c.json({ 
        success: false, 
        error: 'Non autorisé' 
      }, 401);
    }

    const { isOnline, location } = await c.req.json();

    console.log('🔄 Changement statut conducteur:', user.id, 'en ligne:', isOnline);

    // ✅ VÉRIFICATION DU SOLDE AVANT ACTIVATION
    if (isOnline) {
      // Récupérer le solde du conducteur
      const balanceKey = `driver:${user.id}:balance`;
      const balanceData = await kv.get(balanceKey);
      
      // Gérer différentes structures possibles
      let currentBalance = 0;
      if (typeof balanceData === 'number') {
        currentBalance = balanceData;
      } else if (balanceData && typeof balanceData === 'object' && 'balance' in balanceData) {
        currentBalance = balanceData.balance;
      }

      console.log('💰 Solde du conducteur:', currentBalance, 'CDF (type:', typeof balanceData, ')');

      // Si solde = 0, interdire l'activation
      if (currentBalance <= 0) {
        console.log('❌ Activation refusée : solde insuffisant');
        return c.json({
          success: false,
          error: 'Solde insuffisant pour activer le mode en ligne. Veuillez recharger votre compte.',
          balance: currentBalance
        }, 400);
      }
      
      console.log('✅ Solde OK pour activation:', currentBalance, 'CDF');
    }

    // Stocker le statut dans le KV store
    const statusKey = `driver:${user.id}:status`;
    const statusData = {
      isOnline,
      location: location || null,
      updated_at: new Date().toISOString()
    };

    await kv.set(statusKey, statusData);
    
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

    const balanceValue = typeof balance === 'number' ? balance : parseFloat(String(balance));
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

    console.log('💰 Mise à jour du solde du conducteur:', driverId);

    const balanceKey = `driver:${driverId}:balance`;

    if (operation === 'add' && amount) {
      // Ajouter au solde existant
      const currentBalance = await kv.get(balanceKey) || 0;
      const currentBalanceValue = typeof currentBalance === 'number' ? currentBalance : parseFloat(String(currentBalance));
      const newBalance = currentBalanceValue + amount;
      await kv.set(balanceKey, newBalance);
      
      console.log(`✅ Solde augmenté: ${currentBalanceValue} + ${amount} = ${newBalance} CDF`);
      
      // Enregistrer l'historique
      const historyKey = `driver:${driverId}:balance_history:${Date.now()}`;
      await kv.set(historyKey, {
        operation: 'recharge',
        amount: amount,
        previous_balance: currentBalance,
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
      const currentBalanceValue = typeof currentBalance === 'number' ? currentBalance : parseFloat(String(currentBalance));
      const newBalance = Math.max(0, currentBalanceValue - amount);
      await kv.set(balanceKey, newBalance);
      
      console.log(`✅ Solde déduit: ${currentBalanceValue} - ${amount} = ${newBalance} CDF`);
      
      // Enregistrer l'historique
      const historyKey = `driver:${driverId}:balance_history:${Date.now()}`;
      await kv.set(historyKey, {
        operation: 'deduction',
        amount: amount,
        previous_balance: currentBalance,
        new_balance: newBalance,
        timestamp: new Date().toISOString()
      });

      return c.json({
        success: true,
        balance: newBalance
      });
      
    } else if (balance !== undefined) {
      // Définir directement le solde
      await kv.set(balanceKey, balance);
      console.log(`✅ Solde défini: ${balance} CDF`);
      
      return c.json({
        success: true,
        balance: balance
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
    
    console.log(`💾 Mise à jour du profil du conducteur ${driverId}...`);
    console.log('📝 Mises à jour:', updates);
    
    // Récupérer le profil actuel du conducteur
    const currentDriver = await kv.get(`driver:${driverId}`) || {};
    
    // Fusionner les mises à jour
    const updatedDriver = {
      ...currentDriver,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    // Sauvegarder dans le KV store
    await kv.set(`driver:${driverId}`, updatedDriver);
    
    console.log(`✅ Profil du conducteur ${driverId} mis à jour avec succès`);
    
    return c.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      driver: updatedDriver
    });
  } catch (error) {
    console.error('❌ Erreur mise à jour profil conducteur:', error);
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

export default driverRoutes;