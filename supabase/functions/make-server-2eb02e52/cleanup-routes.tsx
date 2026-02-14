/**
 * 🧹 ROUTES DE NETTOYAGE DES DONNÉES
 * Script pour nettoyer les données de test/simulation avant les tests avec vraies données
 * Version: 3.0 - Option nucléaire ajoutée
 */

import { Hono } from 'npm:hono';
import * as kv from './kv-wrapper.tsx';
import { createClient } from 'npm:@supabase/supabase-js@2';

const cleanupRoutes = new Hono();

// Client Supabase avec service role key pour supprimer les utilisateurs
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

/**
 * 🔍 DEBUG - Afficher tous les conducteurs du KV store
 * GET /cleanup/debug-drivers
 */
cleanupRoutes.get('/debug-drivers', async (c) => {
  try {
    console.log('🔍 ========== DIAGNOSTIC CONDUCTEURS ==========');
    
    // 1. Charger tous les drivers du KV store
    const driversKV = await kv.getByPrefix('driver:');
    console.log('📊 KV Store - Total conducteurs:', driversKV.length);
    console.log('📋 KV Store - Conducteurs:', driversKV);
    
    // 2. Charger aussi depuis Supabase Postgres pour comparaison
    const { data: driversPostgres, error: errorDrivers } = await supabase
      .from('drivers')
      .select('*');
    
    const { data: profilesPostgres, error: errorProfiles } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'driver');
    
    console.log('📊 Postgres - Drivers table:', driversPostgres?.length || 0);
    console.log('📊 Postgres - Profiles (role=driver):', profilesPostgres?.length || 0);
    
    return c.json({
      success: true,
      kv: {
        total: driversKV.length,
        drivers: driversKV
      },
      postgres: {
        drivers: {
          total: driversPostgres?.length || 0,
          data: driversPostgres || [],
          error: errorDrivers
        },
        profiles: {
          total: profilesPostgres?.length || 0,
          data: profilesPostgres || [],
          error: errorProfiles
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur debug conducteurs:', error);
    return c.json({
      success: false,
      error: String(error)
    }, 500);
  }
});

/**
 * 🧹 Nettoyer TOUTES les données de simulation
 * Garde uniquement les comptes admins
 * 
 * DELETE /cleanup/all
 */
cleanupRoutes.delete('/all', async (c) => {
  try {
    console.log('🧹 Début du nettoyage complet des données...');
    
    const deletedData = {
      rides: 0,
      passengers: 0,
      drivers: 0,
      vehicles: 0,
      promoCodes: 0,
      campaigns: 0,
      walletTransactions: 0,
      notifications: 0,
      messages: 0,
      sms: 0,
      contacts: 0,
      backups: 0,
      profiles: 0,
      authUsers: 0
    };

    // 1. Récupérer tous les profils pour identifier les admins
    console.log('🔍 Identification des comptes admins...');
    const profilesKeys = await kv.getByPrefix('profile:');
    const adminIds = new Set<string>();
    const nonAdminIds = new Set<string>();
    
    for (const profile of profilesKeys) {
      if (profile && profile.id) {
        if (profile.role === 'admin') {
          adminIds.add(profile.id);
          console.log(`✅ Admin conservé: ${profile.full_name || profile.email || profile.id}`);
        } else {
          nonAdminIds.add(profile.id);
        }
      }
    }

    // 2. Supprimer toutes les courses
    console.log('🗑️ Suppression des courses...');
    const ridesKeys = await kv.getByPrefix('ride:');
    for (const ride of ridesKeys) {
      if (ride && ride.id) {
        await kv.del(`ride:${ride.id}`);
        deletedData.rides++;
      }
    }

    // 3. Supprimer tous les passagers
    console.log('🗑️ Suppression des passagers...');
    const passengersKeys = await kv.getByPrefix('passenger:');
    for (const passenger of passengersKeys) {
      if (passenger && passenger.id) {
        await kv.del(`passenger:${passenger.id}`);
        deletedData.passengers++;
      }
    }

    // 4. Supprimer tous les chauffeurs
    console.log('🗑️ Suppression des chauffeurs...');
    const driversKeys = await kv.getByPrefix('driver:');
    for (const driver of driversKeys) {
      if (driver && driver.id) {
        await kv.del(`driver:${driver.id}`);
        deletedData.drivers++;
      }
    }

    // 5. Supprimer tous les véhicules
    console.log('🗑️ Suppression des véhicules...');
    const vehiclesKeys = await kv.getByPrefix('vehicle:');
    for (const vehicle of vehiclesKeys) {
      if (vehicle && vehicle.id) {
        await kv.del(`vehicle:${vehicle.id}`);
        deletedData.vehicles++;
      }
    }

    // 6. Supprimer tous les codes promo
    console.log('🗑️ Suppression des codes promo...');
    const promoKeys = await kv.getByPrefix('promo:');
    for (const promo of promoKeys) {
      if (promo && promo.code) {
        await kv.del(`promo:${promo.code}`);
        deletedData.promoCodes++;
      }
    }

    // 7. Supprimer toutes les campagnes
    console.log('🗑️ Suppression des campagnes...');
    const campaignKeys = await kv.getByPrefix('campaign:');
    for (const campaign of campaignKeys) {
      if (campaign && campaign.id) {
        await kv.del(`campaign:${campaign.id}`);
        deletedData.campaigns++;
      }
    }

    // 8. Supprimer toutes les transactions wallet
    console.log('🗑️ Suppression des transactions wallet...');
    const walletKeys = await kv.getByPrefix('wallet:');
    for (const wallet of walletKeys) {
      if (wallet && wallet.id) {
        await kv.del(`wallet:${wallet.id}`);
        deletedData.walletTransactions++;
      }
    }

    // 9. Supprimer toutes les notifications
    console.log('🗑️ Suppression des notifications...');
    const notificationKeys = await kv.getByPrefix('notification:');
    for (const notif of notificationKeys) {
      if (notif && notif.id) {
        await kv.del(`notification:${notif.id}`);
        deletedData.notifications++;
      }
    }

    // 10. Supprimer tous les messages
    console.log('🗑️ Suppression des messages...');
    const messageKeys = await kv.getByPrefix('message:');
    for (const message of messageKeys) {
      if (message && message.id) {
        await kv.del(`message:${message.id}`);
        deletedData.messages++;
      }
    }

    // 11. Supprimer tous les SMS
    console.log('🗑️ Suppression des SMS...');
    const smsKeys = await kv.getByPrefix('sms:');
    for (const sms of smsKeys) {
      if (sms && sms.id) {
        await kv.del(`sms:${sms.id}`);
        deletedData.sms++;
      }
    }

    // 12. Supprimer tous les contacts
    console.log('🗑️ Suppression des contacts...');
    const contactKeys = await kv.getByPrefix('contact:');
    for (const contact of contactKeys) {
      if (contact && contact.id) {
        await kv.del(`contact:${contact.id}`);
        deletedData.contacts++;
      }
    }

    // 13. Supprimer tous les backups
    console.log('🗑️ Suppression des backups...');
    const backupKeys = await kv.getByPrefix('backup:');
    for (const backup of backupKeys) {
      if (backup && backup.id) {
        await kv.del(`backup:${backup.id}`);
        deletedData.backups++;
      }
    }

    // 14. Supprimer les profils non-admin du KV
    console.log('🗑️ Suppression des profils non-admin du KV...');
    for (const userId of nonAdminIds) {
      await kv.del(`profile:${userId}`);
      deletedData.profiles++;
    }

    // 15. Supprimer les profils de la table Supabase (sauf admins)
    console.log('🗑️ Suppression des profils de la table Supabase...');
    const adminIdsArray = Array.from(adminIds);
    if (adminIdsArray.length > 0) {
      const { error: profilesError } = await supabase
        .from('profiles')
        .delete()
        .not('id', 'in', `(${adminIdsArray.map(id => `'${id}'`).join(',')})`);
      
      if (profilesError) {
        console.error('⚠️ Erreur suppression profiles Supabase:', profilesError);
      }
    }

    // 16. Supprimer les utilisateurs de Supabase Auth (sauf admins)
    console.log('🗑️ Suppression des utilisateurs Supabase Auth...');
    for (const userId of nonAdminIds) {
      try {
        const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
        if (!deleteError) {
          deletedData.authUsers++;
        }
      } catch (authError) {
        console.log(`⚠️ Impossible de supprimer l'utilisateur Auth: ${userId}`);
      }
    }

    console.log('✅ Nettoyage complet terminé');
    console.log('📊 Résumé:', deletedData);

    return c.json({
      success: true,
      message: 'Toutes les données ont été nettoyées avec succès',
      data: deletedData
    });

  } catch (error: any) {
    console.error('❌ Erreur lors du nettoyage:', error);
    return c.json({
      success: false,
      message: 'Erreur lors du nettoyage des données',
      error: error.message
    }, 500);
  }
});

/**
 * 🗑️ Supprimer tous les chauffeurs et leurs données
 * 
 * DELETE /cleanup/drivers
 */
cleanupRoutes.delete('/drivers', async (c) => {
  try {
    console.log('🧹 Suppression de tous les chauffeurs...');
    
    // Supprimer tous les chauffeurs
    const driversKeys = await kv.getByPrefix('driver:');
    for (const driver of driversKeys) {
      if (driver && driver.id) {
        await kv.del(`driver:${driver.id}`);
      }
    }
    
    // Supprimer tous les véhicules
    const vehiclesKeys = await kv.getByPrefix('vehicle:');
    for (const vehicle of vehiclesKeys) {
      if (vehicle && vehicle.id) {
        await kv.del(`vehicle:${vehicle.id}`);
      }
    }
    
    const count = driversKeys.length;
    console.log(`✅ ${count} chauffeurs supprimés`);

    return c.json({
      success: true,
      message: `${count} chauffeurs et leurs véhicules supprimés avec succès`
    });

  } catch (error: any) {
    console.error('❌ Erreur lors du nettoyage des chauffeurs:', error);
    return c.json({
      success: false,
      message: 'Erreur lors du nettoyage des chauffeurs',
      error: error.message
    }, 500);
  }
});

/**
 * 🧹 Nettoyer les conducteurs invalides
 * Supprime les conducteurs sans nom valide, sans données, ou avec des données vides
 * 
 * DELETE /cleanup/invalid-drivers
 */
cleanupRoutes.delete('/invalid-drivers', async (c) => {
  try {
    console.log('🧹 Début du nettoyage des conducteurs invalides...');
    
    const deletedCount = {
      drivers: 0,
      profiles: 0,
      vehicles: 0
    };
    const invalidDriverIds = [];

    // 1. Récupérer tous les conducteurs
    console.log('🔍 Récupération des conducteurs...');
    const driversKeys = await kv.getByPrefix('driver:');
    
    console.log(`📊 Total conducteurs trouvés: ${driversKeys.length}`);

    // 2. Identifier les conducteurs invalides
    for (const driver of driversKeys) {
      // Vérifier que le conducteur est valide
      if (!driver || !driver.id) {
        console.log('⚠️ Conducteur sans ID ignoré:', driver);
        continue;
      }
      
      const driverId = driver.id;
      
      // Fonction pour vérifier si une valeur est vide ou invalide
      const isEmptyOrInvalid = (value: any) => {
        if (!value) return true; // null, undefined, false, 0, ''
        if (typeof value !== 'string') return true; // pas une string
        const trimmed = value.trim();
        if (trimmed === '') return true; // string vide
        if (trimmed === 'null') return true; // string "null"
        if (trimmed === 'undefined') return true; // string "undefined"
        if (trimmed === 'Non renseigné') return true; // valeur par défaut
        if (trimmed === '()') return true; // valeur vide entre parenthèses
        if (trimmed === 'Conducteur inconnu') return true; // nom par défaut
        if (trimmed === 'N/A') return true; // non applicable
        return false;
      };
      
      // CRITÈRE PRINCIPAL : Le nom contient "Conducteur inconnu" = INVALIDE
      const hasInvalidName = isEmptyOrInvalid(driver.full_name) || 
                             isEmptyOrInvalid(driver.name) ||
                             (driver.full_name && driver.full_name.includes('Conducteur inconnu')) ||
                             (driver.name && driver.name.includes('Conducteur inconnu'));
      
      // Critères secondaires
      const hasInvalidEmail = isEmptyOrInvalid(driver.email);
      const hasInvalidPhone = isEmptyOrInvalid(driver.phone);
      
      // Un conducteur est invalide SI :
      // - Son nom est invalide OU contient "Conducteur inconnu"
      // - OU il n'a ni email ni téléphone valides
      const isInvalid = hasInvalidName || (hasInvalidEmail && hasInvalidPhone);

      if (isInvalid) {
        invalidDriverIds.push(driverId);
        console.log(`❌ Conducteur invalide trouvé: ${driverId}`);
        console.log(`   - Nom (full_name): ${JSON.stringify(driver?.full_name)}`);
        console.log(`   - Nom (name): ${JSON.stringify(driver?.name)}`);
        console.log(`   - Email: ${JSON.stringify(driver?.email)}`);
        console.log(`   - Phone: ${JSON.stringify(driver?.phone)}`);
        console.log(`   - Invalide car: name=${hasInvalidName}, email=${hasInvalidEmail}, phone=${hasInvalidPhone}`);
      } else {
        // Logger aussi les conducteurs VALIDES pour debug
        console.log(`✅ Conducteur valide: ${driverId} - ${driver?.full_name || driver?.name}`);
      }
    }

    console.log(`📊 Conducteurs invalides identifiés: ${invalidDriverIds.length}`);

    // 3. Supprimer les conducteurs invalides et leurs données associées
    for (const driverId of invalidDriverIds) {
      // Supprimer le conducteur
      await kv.del(`driver:${driverId}`);
      deletedCount.drivers++;
      
      // Supprimer le profil associé
      await kv.del(`profile:${driverId}`);
      deletedCount.profiles++;
      
      // Supprimer de la table profiles Supabase
      try {
        const { error: profileDeleteError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', driverId);
        
        if (!profileDeleteError) {
          console.log(`  ✅ Supprimé de table profiles Supabase`);
        }
      } catch (profileError) {
        console.log(`  ⚠️ Erreur suppression profiles Supabase: ${profileError}`);
      }
      
      // Supprimer les véhicules associés
      const vehiclesKeys = await kv.getByPrefix('vehicle:');
      for (const vehicle of vehiclesKeys) {
        if (vehicle && vehicle.driverId === driverId) {
          await kv.del(`vehicle:${vehicle.id}`);
          deletedCount.vehicles++;
          console.log(`🗑️ Véhicule supprimé: vehicle:${vehicle.id}`);
        }
      }
      
      // Supprimer l'utilisateur de Supabase Auth si possible
      try {
        const { error: deleteError } = await supabase.auth.admin.deleteUser(driverId);
        if (!deleteError) {
          console.log(`🗑️ Utilisateur Auth supprimé: ${driverId}`);
        }
      } catch (authError) {
        console.log(`⚠️ Impossible de supprimer l'utilisateur Auth: ${driverId}`);
      }
      
      console.log(`✅ Conducteur supprimé: ${driverId}`);
    }

    console.log('✅ Nettoyage des conducteurs invalides terminé');
    console.log(`📊 Résumé: ${deletedCount.drivers} conducteurs, ${deletedCount.profiles} profils, ${deletedCount.vehicles} véhicules supprimés`);

    return c.json({
      success: true,
      message: `${deletedCount.drivers} conducteur(s) invalide(s) supprimé(s) avec succès`,
      data: deletedCount
    });

  } catch (error: any) {
    console.error('❌ Erreur lors du nettoyage des conducteurs invalides:', error);
    return c.json({
      success: false,
      message: 'Erreur lors du nettoyage des conducteurs invalides',
      error: error.message
    }, 500);
  }
});

/**
 * 💥 OPTION NUCLÉAIRE : Supprimer TOUS LES CONDUCTEURS sans exception
 * ⚠️ Cette route supprime TOUS les conducteurs, même ceux avec des données valides
 * 
 * DELETE /cleanup/delete-all-drivers
 */
cleanupRoutes.delete('/delete-all-drivers', async (c) => {
  try {
    console.log('💥💥💥 OPTION NUCLÉAIRE : Suppression de TOUS les conducteurs...');
    
    const deletedCount = {
      drivers: 0,
      profiles: 0,
      vehicles: 0,
      authUsers: 0
    };

    // 1. Récupérer TOUS les conducteurs
    console.log('🔍 Récupération de tous les conducteurs...');
    const driversKeys = await kv.getByPrefix('driver:');
    
    console.log(`📊 Total conducteurs à supprimer: ${driversKeys.length}`);

    // 2. Supprimer chaque conducteur et ses données associées
    for (const driver of driversKeys) {
      if (!driver || !driver.id) {
        console.log('⚠️ Conducteur sans ID ignoré');
        continue;
      }
      
      const driverId = driver.id;
      console.log(`🗑️ Suppression conducteur: ${driverId} - ${driver?.full_name || 'Sans nom'}`);
      
      // Supprimer le conducteur du KV
      await kv.del(`driver:${driverId}`);
      deletedCount.drivers++;
      
      // Supprimer le profil du KV
      await kv.del(`profile:${driverId}`);
      deletedCount.profiles++;
      
      // Supprimer de la table profiles Supabase
      try {
        const { error: profileDeleteError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', driverId);
        
        if (!profileDeleteError) {
          console.log(`  ✅ Profil Supabase supprimé`);
        }
      } catch (profileError) {
        console.log(`  ⚠️ Erreur suppression profil Supabase:`, profileError);
      }
      
      // Supprimer TOUS les véhicules associés
      const vehiclesKeys = await kv.getByPrefix('vehicle:');
      for (const vehicle of vehiclesKeys) {
        if (vehicle && vehicle.driverId === driverId) {
          await kv.del(`vehicle:${vehicle.id}`);
          deletedCount.vehicles++;
          console.log(`  🗑️ Véhicule supprimé: ${vehicle.id}`);
        }
      }
      
      // Supprimer l'utilisateur de Supabase Auth
      try {
        const { error: deleteError } = await supabase.auth.admin.deleteUser(driverId);
        if (!deleteError) {
          deletedCount.authUsers++;
          console.log(`  🗑️ Utilisateur Auth supprimé`);
        }
      } catch (authError) {
        console.log(`  ⚠️ Impossible de supprimer l'utilisateur Auth:`, authError);
      }
      
      console.log(`✅ Conducteur ${driverId} entièrement supprimé`);
    }

    console.log('💥 SUPPRESSION NUCLÉAIRE TERMINÉE');
    console.log(`📊 Résumé: ${deletedCount.drivers} conducteurs, ${deletedCount.profiles} profils, ${deletedCount.vehicles} véhicules, ${deletedCount.authUsers} utilisateurs Auth supprimés`);

    return c.json({
      success: true,
      message: `TOUS les conducteurs ont été supprimés (${deletedCount.drivers} conducteurs)`,
      data: deletedCount
    });

  } catch (error: any) {
    console.error('❌ Erreur lors de la suppression nucléaire:', error);
    return c.json({
      success: false,
      message: 'Erreur lors de la suppression de tous les conducteurs',
      error: error.message
    }, 500);
  }
});

export default cleanupRoutes;
