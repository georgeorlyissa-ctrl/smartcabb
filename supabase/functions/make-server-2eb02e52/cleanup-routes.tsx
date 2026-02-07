/**
 * 🧹 ROUTES DE NETTOYAGE DES DONNÉES
 * Script pour nettoyer les données de test/simulation avant les tests avec vraies données
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
    
    for (const item of profilesKeys) {
      const profile = item.value;
      if (profile) {
        if (profile.role === 'admin') {
          adminIds.add(profile.id);
          console.log(`✅ Admin conservé: ${profile.full_name || profile.email || profile.id}`);
        } else {
          nonAdminIds.add(profile.id);
        }
      }
    }
    
    console.log(`📊 Trouvé ${adminIds.size} admins et ${nonAdminIds.size} utilisateurs non-admin`);

    // 2. Supprimer toutes les courses
    console.log('🗑️ Suppression des courses...');
    const ridesKeys = await kv.getByPrefix('ride:');
    for (const item of ridesKeys) {
      await kv.del(item.key);
      deletedData.rides++;
    }

    // 3. Supprimer tous les passagers
    console.log('🗑️ Suppression des passagers...');
    const passengersKeys = await kv.getByPrefix('passenger:');
    for (const item of passengersKeys) {
      await kv.del(item.key);
      deletedData.passengers++;
    }

    // 4. Supprimer tous les chauffeurs
    console.log('🗑️ Suppression des chauffeurs...');
    const driversKeys = await kv.getByPrefix('driver:');
    for (const item of driversKeys) {
      await kv.del(item.key);
      deletedData.drivers++;
    }

    // 5. Supprimer tous les véhicules
    console.log('🗑️ Suppression des véhicules...');
    const vehiclesKeys = await kv.getByPrefix('vehicle:');
    for (const item of vehiclesKeys) {
      await kv.del(item.key);
      deletedData.vehicles++;
    }

    // 6. Supprimer tous les codes promo
    console.log('🗑️ Suppression des codes promo...');
    const promoKeys = await kv.getByPrefix('promo:');
    for (const item of promoKeys) {
      await kv.del(item.key);
      deletedData.promoCodes++;
    }

    // 7. Supprimer toutes les campagnes
    console.log('🗑️ Suppression des campagnes...');
    const campaignKeys = await kv.getByPrefix('campaign:');
    for (const item of campaignKeys) {
      await kv.del(item.key);
      deletedData.campaigns++;
    }

    // 8. Supprimer toutes les transactions wallet
    console.log('🗑️ Suppression des transactions wallet...');
    const walletKeys = await kv.getByPrefix('wallet:');
    for (const item of walletKeys) {
      await kv.del(item.key);
      deletedData.walletTransactions++;
    }

    // 9. Supprimer toutes les notifications
    console.log('🗑️ Suppression des notifications...');
    const notificationKeys = await kv.getByPrefix('notification:');
    for (const item of notificationKeys) {
      await kv.del(item.key);
      deletedData.notifications++;
    }

    // 10. Supprimer tous les messages
    console.log('🗑️ Suppression des messages...');
    const messageKeys = await kv.getByPrefix('message:');
    for (const item of messageKeys) {
      await kv.del(item.key);
      deletedData.messages++;
    }

    // 11. Supprimer tous les SMS
    console.log('🗑️ Suppression des SMS...');
    const smsKeys = await kv.getByPrefix('sms:');
    for (const item of smsKeys) {
      await kv.del(item.key);
      deletedData.sms++;
    }

    // 12. Supprimer tous les contacts
    console.log('🗑️ Suppression des contacts...');
    const contactKeys = await kv.getByPrefix('contact:');
    for (const item of contactKeys) {
      await kv.del(item.key);
      deletedData.contacts++;
    }

    // 13. Supprimer tous les backups
    console.log('🗑️ Suppression des backups...');
    const backupKeys = await kv.getByPrefix('backup:');
    for (const item of backupKeys) {
      await kv.del(item.key);
      deletedData.backups++;
    }

    // 14. Supprimer les profils NON-ADMIN
    console.log('🗑️ Suppression des profils non-admin...');
    for (const userId of nonAdminIds) {
      await kv.del(`profile:${userId}`);
      deletedData.profiles++;
    }

    // 15. Supprimer les utilisateurs Auth NON-ADMIN
    console.log('🗑️ Suppression des utilisateurs Auth non-admin...');
    for (const userId of nonAdminIds) {
      try {
        const { error } = await supabase.auth.admin.deleteUser(userId);
        if (!error) {
          deletedData.authUsers++;
          console.log(`✅ Utilisateur Auth supprimé: ${userId}`);
        }
      } catch (error) {
        console.log(`⚠️ Impossible de supprimer l'utilisateur Auth: ${userId}`);
      }
    }

    console.log('✅ Nettoyage terminé !');
    console.log('📊 Résumé:', deletedData);
    console.log(`👤 ${adminIds.size} admin(s) conservé(s)`);

    return c.json({
      success: true,
      message: 'Nettoyage complet terminé',
      deleted: deletedData,
      adminsConserves: adminIds.size
    });

  } catch (error: any) {
    console.error('❌ Erreur lors du nettoyage:', error);
    return c.json({
      success: false,
      message: 'Erreur lors du nettoyage',
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
    for (const item of driversKeys) {
      await kv.del(item.key);
    }
    
    // Supprimer tous les véhicules
    const vehiclesKeys = await kv.getByPrefix('vehicle:');
    for (const item of vehiclesKeys) {
      await kv.del(item.key);
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
    for (const item of driversKeys) {
      // Vérifier que l'item et sa clé sont valides
      if (!item || !item.key || typeof item.key !== 'string') {
        console.log('⚠️ Item invalide ignoré:', item);
        continue;
      }
      
      const driver = item.value;
      const driverId = item.key.replace('driver:', '');
      
      // Critères pour considérer un conducteur comme invalide:
      const isInvalid = (
        // Pas de données du tout
        !driver ||
        // Pas d'email ou email vide
        !driver.email || driver.email.trim() === '' ||
        // Nom invalide ("Conducteur inconnu", vide, ou non défini)
        !driver.full_name || 
        driver.full_name.trim() === '' || 
        driver.full_name === 'Conducteur inconnu' ||
        driver.full_name === 'undefined' ||
        // Téléphone invalide ("Non renseigné", vide, ou non défini)
        !driver.phone || 
        driver.phone.trim() === '' || 
        driver.phone === 'Non renseigné' ||
        driver.phone === '()' ||
        driver.phone === 'undefined'
      );

      if (isInvalid) {
        invalidDriverIds.push(driverId);
        console.log(`❌ Conducteur invalide trouvé: ${driverId} - ${driver?.full_name || 'pas de nom'} - ${driver?.email || 'pas d\'email'}`);
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
      
      // Supprimer les véhicules associés
      const vehiclesKeys = await kv.getByPrefix('vehicle:');
      for (const vehicleItem of vehiclesKeys) {
        const vehicle = vehicleItem.value;
        if (vehicle && vehicle.driverId === driverId) {
          await kv.del(vehicleItem.key);
          deletedCount.vehicles++;
          console.log(`🗑️ Véhicule supprimé: ${vehicleItem.key}`);
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
      message: `${deletedCount.drivers} conducteurs invalides supprimés`,
      details: deletedCount,
      invalidDriverIds
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
 * 📊 Statistiques des données actuelles
 * 
 * GET /cleanup/stats
 */
cleanupRoutes.get('/stats', async (c) => {
  try {
    const stats = {
      rides: (await kv.getByPrefix('ride:')).length,
      passengers: (await kv.getByPrefix('passenger:')).length,
      drivers: (await kv.getByPrefix('driver:')).length,
      vehicles: (await kv.getByPrefix('vehicle:')).length,
      profiles: (await kv.getByPrefix('profile:')).length,
      promoCodes: (await kv.getByPrefix('promo:')).length,
      campaigns: (await kv.getByPrefix('campaign:')).length,
      walletTransactions: (await kv.getByPrefix('wallet:')).length,
      notifications: (await kv.getByPrefix('notification:')).length,
      messages: (await kv.getByPrefix('message:')).length,
      sms: (await kv.getByPrefix('sms:')).length,
      contacts: (await kv.getByPrefix('contact:')).length,
      backups: (await kv.getByPrefix('backup:')).length
    };

    return c.json({
      success: true,
      stats,
      message: 'Statistiques des données'
    });

  } catch (error: any) {
    console.error('❌ Erreur récupération stats:', error);
    return c.json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    }, 500);
  }
});

export default cleanupRoutes;