/**
 * 🧹 ROUTES DE NETTOYAGE DES DONNÉES
 * Script pour nettoyer les données de test/simulation avant les tests avec vraies données
 */

import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';

const cleanupRoutes = new Hono();

/**
 * 🧹 Nettoyer TOUTES les données de simulation
 * Garde uniquement les comptes utilisateurs (profiles)
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
      profiles: 0
    };

    // 1. Supprimer toutes les courses
    console.log('🗑️ Suppression des courses...');
    const ridesKeys = await kv.getByPrefix('ride:');
    for (const item of ridesKeys) {
      await kv.del(item.key);
      deletedData.rides++;
    }

    // 2. Supprimer tous les passagers
    console.log('🗑️ Suppression des passagers...');
    const passengersKeys = await kv.getByPrefix('passenger:');
    for (const item of passengersKeys) {
      await kv.del(item.key);
      deletedData.passengers++;
    }

    // 3. Supprimer les profiles passagers (sauf admins)
    console.log('🗑️ Suppression des profils passagers...');
    const profilesKeys = await kv.getByPrefix('profile:');
    for (const item of profilesKeys) {
      const profile = item.value;
      if (profile && profile.role === 'passenger') {
        await kv.del(item.key);
        deletedData.profiles++;
      }
    }

    // 4. Supprimer tous les chauffeurs
    console.log('🗑️ Suppression des chauffeurs...');
    const driversKeys = await kv.getByPrefix('driver:');
    for (const item of driversKeys) {
      await kv.del(item.key);
      deletedData.drivers++;
    }

    // 5. Supprimer les profiles conducteurs (sauf admins)
    console.log('🗑️ Suppression des profils conducteurs...');
    const profilesKeys2 = await kv.getByPrefix('profile:');
    for (const item of profilesKeys2) {
      const profile = item.value;
      if (profile && profile.role === 'driver') {
        await kv.del(item.key);
        deletedData.profiles++;
      }
    }

    // 6. Supprimer tous les véhicules
    console.log('🗑️ Suppression des véhicules...');
    const vehiclesKeys = await kv.getByPrefix('vehicle:');
    for (const item of vehiclesKeys) {
      await kv.del(item.key);
      deletedData.vehicles++;
    }

    // 7. Supprimer tous les codes promo
    console.log('🗑️ Suppression des codes promo...');
    const promoKeys = await kv.getByPrefix('promo:');
    for (const item of promoKeys) {
      await kv.del(item.key);
      deletedData.promoCodes++;
    }

    // 8. Supprimer toutes les campagnes marketing
    console.log('🗑️ Suppression des campagnes...');
    const campaignKeys = await kv.getByPrefix('campaign:');
    for (const item of campaignKeys) {
      await kv.del(item.key);
      deletedData.campaigns++;
    }

    // 9. Supprimer les transactions wallet
    console.log('🗑️ Suppression des transactions wallet...');
    const walletKeys = await kv.getByPrefix('wallet:');
    for (const item of walletKeys) {
      await kv.del(item.key);
      deletedData.walletTransactions++;
    }

    // 10. Supprimer les notifications
    console.log('🗑️ Suppression des notifications...');
    const notifKeys = await kv.getByPrefix('notification:');
    for (const item of notifKeys) {
      await kv.del(item.key);
      deletedData.notifications++;
    }

    // 11. Supprimer les messages chat
    console.log('🗑️ Suppression des messages...');
    const messageKeys = await kv.getByPrefix('message:');
    for (const item of messageKeys) {
      await kv.del(item.key);
      deletedData.messages++;
    }

    // 12. Supprimer l'historique SMS
    console.log('🗑️ Suppression de l\'historique SMS...');
    const smsKeys = await kv.getByPrefix('sms:');
    for (const item of smsKeys) {
      await kv.del(item.key);
      deletedData.sms++;
    }

    // 13. Supprimer les messages de contact
    console.log('🗑️ Suppression des messages de contact...');
    const contactKeys = await kv.getByPrefix('contact:');
    for (const item of contactKeys) {
      await kv.del(item.key);
      deletedData.contacts++;
    }

    // 14. Supprimer les backups
    console.log('🗑️ Suppression des backups...');
    const backupKeys = await kv.getByPrefix('backup:');
    for (const item of backupKeys) {
      await kv.del(item.key);
      deletedData.backups++;
    }

    console.log('✅ Nettoyage terminé !', deletedData);

    return c.json({
      success: true,
      message: 'Nettoyage complet effectué avec succès',
      deleted: deletedData,
      note: 'Les comptes admins ont été conservés. Tous les profils passagers et conducteurs ont été supprimés.'
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
 * 🧹 Nettoyer uniquement les courses
 * 
 * DELETE /cleanup/rides
 */
cleanupRoutes.delete('/rides', async (c) => {
  try {
    console.log('🧹 Nettoyage des courses...');
    
    const ridesKeys = await kv.getByPrefix('ride:');
    let count = 0;
    
    for (const item of ridesKeys) {
      await kv.del(item.key);
      count++;
    }

    console.log(`✅ ${count} courses supprimées`);

    return c.json({
      success: true,
      message: `${count} courses supprimées avec succès`
    });

  } catch (error: any) {
    console.error('❌ Erreur lors du nettoyage des courses:', error);
    return c.json({
      success: false,
      message: 'Erreur lors du nettoyage des courses',
      error: error.message
    }, 500);
  }
});

/**
 * 🧹 Nettoyer uniquement les chauffeurs
 * 
 * DELETE /cleanup/drivers
 */
cleanupRoutes.delete('/drivers', async (c) => {
  try {
    console.log('🧹 Nettoyage des chauffeurs...');
    
    const driversKeys = await kv.getByPrefix('driver:');
    const vehiclesKeys = await kv.getByPrefix('vehicle:');
    let count = 0;
    
    for (const item of driversKeys) {
      await kv.del(item.key);
      count++;
    }
    
    for (const item of vehiclesKeys) {
      await kv.del(item.key);
    }

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

/**
 * ⚠️ RESET COMPLET (TOUT SUPPRIMER Y COMPRIS LES COMPTES)
 * À UTILISER AVEC EXTRÊME PRUDENCE
 * 
 * DELETE /cleanup/reset-all-including-users
 */
cleanupRoutes.delete('/reset-all-including-users', async (c) => {
  try {
    console.log('⚠️⚠️⚠️ RESET COMPLET - SUPPRESSION DE TOUTES LES DONNÉES ⚠️⚠️⚠️');
    
    const allKeys = await kv.getByPrefix('');
    let count = 0;
    
    for (const item of allKeys) {
      await kv.del(item.key);
      count++;
    }

    console.log(`✅ ${count} entrées supprimées - Base de données vide`);

    return c.json({
      success: true,
      message: `RESET COMPLET : ${count} entrées supprimées`,
      warning: 'Tous les comptes utilisateurs ont été supprimés'
    });

  } catch (error: any) {
    console.error('❌ Erreur lors du reset complet:', error);
    return c.json({
      success: false,
      message: 'Erreur lors du reset complet',
      error: error.message
    }, 500);
  }
});

export default cleanupRoutes;