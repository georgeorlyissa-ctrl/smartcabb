import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';

const adminRoutes = new Hono();

// ============================================
// 📊 STATISTIQUES GLOBALES
// ============================================
adminRoutes.get('/stats/overview', async (c) => {
  try {
    console.log('📊 Récupération des statistiques globales...');

    // Récupérer les stats du jour
    const today = new Date().toISOString().split('T')[0];
    const dailyStats = await kv.get(`stats:daily:${today}`) || {
      totalRides: 0,
      totalRevenue: 0,
      totalCommissions: 0,
      totalDriverEarnings: 0,
      ridesByCategory: {},
      activeDrivers: [],
      activePassengers: []
    };

    // Récupérer toutes les transactions
    const allTransactions = await kv.getByPrefix('transaction:');
    const totalTransactions = allTransactions.length;

    // Récupérer tous les conducteurs
    const allDrivers = await kv.getByPrefix('driver:');
    const drivers = allDrivers.filter(d => d && d.id);

    // Récupérer toutes les courses complétées
    const allCompletedRides = await kv.getByPrefix('ride_completed_');

    // Calculer les stats globales
    let totalRevenue = 0;
    let totalCommissions = 0;
    let totalDriverEarnings = 0;
    const ratingsList: number[] = [];

    for (const ride of allCompletedRides) {
      if (ride && ride.finalPrice) {
        totalRevenue += ride.finalPrice;
        totalCommissions += ride.commission || 0;
        totalDriverEarnings += ride.driverEarnings || 0;
        if (ride.rating) ratingsList.push(ride.rating);
      }
    }

    const averageRating = ratingsList.length > 0
      ? ratingsList.reduce((a, b) => a + b, 0) / ratingsList.length
      : 0;

    return c.json({
      success: true,
      stats: {
        today: {
          rides: dailyStats.totalRides || 0,
          revenue: dailyStats.totalRevenue || 0,
          commissions: dailyStats.totalCommissions || 0,
          driverEarnings: dailyStats.totalDriverEarnings || 0,
          activeDrivers: (dailyStats.activeDrivers || []).length,
          activePassengers: (dailyStats.activePassengers || []).length,
          ridesByCategory: dailyStats.ridesByCategory || {}
        },
        allTime: {
          totalRides: allCompletedRides.length,
          totalRevenue: totalRevenue,
          totalCommissions: totalCommissions,
          totalDriverEarnings: totalDriverEarnings,
          averageRating: averageRating,
          totalDrivers: drivers.length,
          totalTransactions: totalTransactions
        }
      }
    });

  } catch (error) {
    console.error('❌ Erreur récupération stats:', error);
    return c.json({
      success: false,
      error: 'Erreur serveur: ' + String(error)
    }, 500);
  }
});

// ============================================
// 📈 STATISTIQUES PAR PÉRIODE
// ============================================
adminRoutes.get('/stats/period/:days', async (c) => {
  try {
    const days = parseInt(c.req.param('days')) || 7;
    console.log(`📈 Récupération des stats des ${days} derniers jours...`);

    const dailyData = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const stats = await kv.get(`stats:daily:${dateStr}`) || {
        date: dateStr,
        totalRides: 0,
        totalRevenue: 0,
        totalCommissions: 0,
        totalDriverEarnings: 0,
        ridesByCategory: {},
        activeDrivers: [],
        activePassengers: []
      };

      dailyData.push({
        date: dateStr,
        rides: stats.totalRides || 0,
        revenue: stats.totalRevenue || 0,
        commissions: stats.totalCommissions || 0,
        driverEarnings: stats.totalDriverEarnings || 0,
        activeDrivers: (stats.activeDrivers || []).length,
        activePassengers: (stats.activePassengers || []).length,
        ridesByCategory: stats.ridesByCategory || {}
      });
    }

    // Inverser pour avoir du plus ancien au plus récent
    dailyData.reverse();

    return c.json({
      success: true,
      period: `${days} jours`,
      data: dailyData
    });

  } catch (error) {
    console.error('❌ Erreur récupération stats période:', error);
    return c.json({
      success: false,
      error: 'Erreur serveur: ' + String(error)
    }, 500);
  }
});

// ============================================
// 👨‍✈️ CLASSEMENT DES CONDUCTEURS
// ============================================
adminRoutes.get('/drivers/leaderboard', async (c) => {
  try {
    console.log('🏆 Récupération du classement des conducteurs...');

    // Récupérer tous les conducteurs avec leurs stats
    const allDriverStats = await kv.getByPrefix('driver:');
    
    const leaderboard = [];

    for (const item of allDriverStats) {
      // Filtrer pour ne garder que les stats
      if (item && typeof item === 'object' && 'totalRides' in item) {
        // Récupérer les infos du conducteur
        const driverId = Object.keys(item)[0]; // Supposons que l'ID soit dans les clés
        
        leaderboard.push({
          driverId: item.driverId || 'unknown',
          totalRides: item.totalRides || 0,
          totalEarnings: item.totalEarnings || 0,
          totalCommissions: item.totalCommissions || 0,
          averageRating: item.averageRating || 0,
          lastRideAt: item.lastRideAt || null
        });
      }
    }

    // Trier par nombre de courses
    leaderboard.sort((a, b) => b.totalRides - a.totalRides);

    return c.json({
      success: true,
      leaderboard: leaderboard.slice(0, 50) // Top 50
    });

  } catch (error) {
    console.error('❌ Erreur récupération classement:', error);
    return c.json({
      success: false,
      error: 'Erreur serveur: ' + String(error)
    }, 500);
  }
});

// ============================================
// 💰 HISTORIQUE DES TRANSACTIONS
// ============================================
adminRoutes.get('/transactions', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '100');
    console.log(`💰 Récupération des ${limit} dernières transactions...`);

    const allTransactions = await kv.getByPrefix('transaction:');
    
    // Trier par date décroissante
    allTransactions.sort((a, b) => {
      const dateA = new Date(a.timestamp || 0).getTime();
      const dateB = new Date(b.timestamp || 0).getTime();
      return dateB - dateA;
    });

    const transactions = allTransactions.slice(0, limit);

    return c.json({
      success: true,
      count: transactions.length,
      total: allTransactions.length,
      transactions: transactions
    });

  } catch (error) {
    console.error('❌ Erreur récupération transactions:', error);
    return c.json({
      success: false,
      error: 'Erreur serveur: ' + String(error)
    }, 500);
  }
});

// ============================================
// 🚗 LISTE DES COURSES
// ============================================
adminRoutes.get('/rides', async (c) => {
  try {
    const status = c.req.query('status'); // pending, accepted, completed
    const limit = parseInt(c.req.query('limit') || '100');
    
    console.log(`🚗 Récupération des courses (status: ${status || 'all'}, limit: ${limit})...`);

    let rides = [];

    if (status === 'completed') {
      rides = await kv.getByPrefix('ride_completed_');
    } else if (status === 'active') {
      rides = await kv.getByPrefix('ride_active_');
    } else if (status === 'pending') {
      rides = await kv.getByPrefix('ride_pending_');
    } else {
      // Toutes les courses
      rides = await kv.getByPrefix('ride_request_');
    }

    // Trier par date décroissante
    rides.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    const limitedRides = rides.slice(0, limit);

    return c.json({
      success: true,
      count: limitedRides.length,
      total: rides.length,
      rides: limitedRides
    });

  } catch (error) {
    console.error('❌ Erreur récupération courses:', error);
    return c.json({
      success: false,
      error: 'Erreur serveur: ' + String(error)
    }, 500);
  }
});

// ============================================
// 📊 STATISTIQUES PAR CATÉGORIE
// ============================================
adminRoutes.get('/stats/categories', async (c) => {
  try {
    console.log('📊 Récupération des stats par catégorie...');

    const allCompletedRides = await kv.getByPrefix('ride_completed_');

    const categoryStats = {
      smart_standard: { rides: 0, revenue: 0, commissions: 0 },
      smart_confort: { rides: 0, revenue: 0, commissions: 0 },
      smart_plus: { rides: 0, revenue: 0, commissions: 0 },
      smart_business: { rides: 0, revenue: 0, commissions: 0 }
    };

    for (const ride of allCompletedRides) {
      if (ride && ride.vehicleType) {
        const category = ride.vehicleType;
        if (!categoryStats[category]) {
          categoryStats[category] = { rides: 0, revenue: 0, commissions: 0 };
        }
        categoryStats[category].rides += 1;
        categoryStats[category].revenue += ride.finalPrice || 0;
        categoryStats[category].commissions += ride.commission || 0;
      }
    }

    return c.json({
      success: true,
      categories: categoryStats
    });

  } catch (error) {
    console.error('❌ Erreur récupération stats catégories:', error);
    return c.json({
      success: false,
      error: 'Erreur serveur: ' + String(error)
    }, 500);
  }
});

// ============================================
// 📱 STATISTIQUES D'UN CONDUCTEUR SPÉCIFIQUE
// ============================================
adminRoutes.get('/driver/:driverId/stats', async (c) => {
  try {
    const driverId = c.req.param('driverId');
    console.log(`📱 Récupération des stats du conducteur ${driverId}...`);

    // Récupérer les stats du conducteur
    const statsKey = `driver:${driverId}:stats`;
    const stats = await kv.get(statsKey) || {
      totalRides: 0,
      totalEarnings: 0,
      totalCommissions: 0,
      averageRating: 0,
      ratings: []
    };

    // Récupérer le solde
    const balanceKey = `driver:${driverId}:balance`;
    const balanceData = await kv.get(balanceKey) || { balance: 0 };
    const balance = typeof balanceData === 'number' ? balanceData : balanceData.balance;

    // Récupérer l'historique des transactions
    const allTransactions = await kv.getByPrefix('transaction:');
    const driverTransactions = allTransactions.filter(t => t && t.driverId === driverId);

    return c.json({
      success: true,
      driverId: driverId,
      stats: {
        ...stats,
        currentBalance: balance,
        transactionCount: driverTransactions.length
      },
      recentTransactions: driverTransactions.slice(0, 10)
    });

  } catch (error) {
    console.error('❌ Erreur récupération stats conducteur:', error);
    return c.json({
      success: false,
      error: 'Erreur serveur: ' + String(error)
    }, 500);
  }
});

// ============================================
// 💾 SAUVEGARDER LES PARAMÈTRES ADMIN (Commission, Taux, Codes promo, etc.)
// ============================================
adminRoutes.post('/settings/save', async (c) => {
  try {
    console.log('💾 Sauvegarde des paramètres admin...');
    
    const settings = await c.req.json();
    
    // Sauvegarder dans le KV store avec la clé 'admin_settings'
    await kv.set('admin_settings', settings);
    
    console.log('✅ Paramètres admin sauvegardés:', settings);
    
    return c.json({
      success: true,
      message: 'Paramètres enregistrés avec succès',
      settings: settings
    });
  } catch (error) {
    console.error('❌ Erreur sauvegarde paramètres admin:', error);
    return c.json({
      success: false,
      error: 'Erreur serveur: ' + String(error)
    }, 500);
  }
});

// ============================================
// 📖 CHARGER LES PARAMÈTRES ADMIN
// ============================================
adminRoutes.get('/settings/load', async (c) => {
  try {
    console.log('📖 Chargement des paramètres admin...');
    
    // Charger depuis le KV store
    const settings = await kv.get('admin_settings') || {
      commissionEnabled: true,
      commissionRate: 15,
      minimumCommission: 500,
      paymentFrequency: 'immediate',
      autoDeduction: true,
      updatedAt: new Date().toISOString()
    };
    
    console.log('✅ Paramètres admin chargés:', settings);
    
    return c.json({
      success: true,
      settings: settings
    });
  } catch (error) {
    console.error('❌ Erreur chargement paramètres admin:', error);
    return c.json({
      success: false,
      error: 'Erreur serveur: ' + String(error)
    }, 500);
  }
});

// ============================================
// 🎟️ SAUVEGARDER UN CODE PROMO
// ============================================
adminRoutes.post('/promo/save', async (c) => {
  try {
    console.log('🎟️ Sauvegarde du code promo...');
    
    const promo = await c.req.json();
    const promoCode = promo.code.toUpperCase();
    
    // Sauvegarder avec la clé 'promo:CODE'
    await kv.set(`promo:${promoCode}`, promo);
    
    console.log(`✅ Code promo ${promoCode} sauvegardé:`, promo);
    
    return c.json({
      success: true,
      message: `Code promo ${promoCode} créé avec succès`,
      promo: promo
    });
  } catch (error) {
    console.error('❌ Erreur sauvegarde code promo:', error);
    return c.json({
      success: false,
      error: 'Erreur serveur: ' + String(error)
    }, 500);
  }
});

// ============================================
// 🎟️ RÉCUPÉRER TOUS LES CODES PROMOS
// ============================================
adminRoutes.get('/promo/list', async (c) => {
  try {
    console.log('🎟️ Récupération de tous les codes promos...');
    
    // Récupérer tous les promos
    const allPromos = await kv.getByPrefix('promo:');
    
    console.log(`✅ ${allPromos.length} codes promos trouvés`);
    
    return c.json({
      success: true,
      promos: allPromos
    });
  } catch (error) {
    console.error('❌ Erreur récupération codes promos:', error);
    return c.json({
      success: false,
      error: 'Erreur serveur: ' + String(error)
    }, 500);
  }
});

// ============================================
// 🎟️ VÉRIFIER UN CODE PROMO (pour les passagers)
// ============================================
adminRoutes.post('/promo/check', async (c) => {
  try {
    const { code } = await c.req.json();
    const promoCode = code.toUpperCase();
    
    console.log(`🎟️ Vérification du code promo: ${promoCode}`);
    
    // Récupérer le promo
    const promo = await kv.get(`promo:${promoCode}`);
    
    if (!promo) {
      return c.json({
        success: false,
        error: 'Code promo invalide'
      }, 404);
    }
    
    // Vérifier si le promo est actif
    if (!promo.active) {
      return c.json({
        success: false,
        error: 'Ce code promo est désactivé'
      }, 400);
    }
    
    // Vérifier la date d'expiration
    if (promo.expirationDate) {
      const now = new Date();
      const expiration = new Date(promo.expirationDate);
      
      if (now > expiration) {
        return c.json({
          success: false,
          error: 'Ce code promo a expiré'
        }, 400);
      }
    }
    
    // Vérifier le nombre d'utilisations
    if (promo.maxUses && promo.usedCount >= promo.maxUses) {
      return c.json({
        success: false,
        error: 'Ce code promo a atteint sa limite d\'utilisation'
      }, 400);
    }
    
    console.log(`✅ Code promo ${promoCode} valide:`, promo);
    
    return c.json({
      success: true,
      promo: promo
    });
  } catch (error) {
    console.error('❌ Erreur vérification code promo:', error);
    return c.json({
      success: false,
      error: 'Erreur serveur: ' + String(error)
    }, 500);
  }
});

// ============================================
// 🎟️ INCRÉMENTER L'UTILISATION D'UN CODE PROMO
// ============================================
adminRoutes.post('/promo/use', async (c) => {
  try {
    const { code } = await c.req.json();
    const promoCode = code.toUpperCase();
    
    console.log(`🎟️ Incrémentation utilisation du code promo: ${promoCode}`);
    
    // Récupérer le promo
    const promo = await kv.get(`promo:${promoCode}`);
    
    if (!promo) {
      return c.json({
        success: false,
        error: 'Code promo invalide'
      }, 404);
    }
    
    // Incrémenter le compteur
    promo.usedCount = (promo.usedCount || 0) + 1;
    
    // Sauvegarder
    await kv.set(`promo:${promoCode}`, promo);
    
    console.log(`✅ Code promo ${promoCode} utilisé (${promo.usedCount}/${promo.maxUses || '∞'})`);
    
    return c.json({
      success: true,
      promo: promo
    });
  } catch (error) {
    console.error('❌ Erreur incrémentation code promo:', error);
    return c.json({
      success: false,
      error: 'Erreur serveur: ' + String(error)
    }, 500);
  }
});

// ============================================
// 🗑️ SUPPRIMER UN CODE PROMO
// ============================================
adminRoutes.delete('/promo/delete/:code', async (c) => {
  try {
    const promoCode = c.req.param('code').toUpperCase();
    
    console.log(`🗑️ Suppression du code promo: ${promoCode}`);
    
    // Supprimer du KV store
    await kv.del(`promo:${promoCode}`);
    
    console.log(`✅ Code promo ${promoCode} supprimé`);
    
    return c.json({
      success: true,
      message: `Code promo ${promoCode} supprimé avec succès`
    });
  } catch (error) {
    console.error('❌ Erreur suppression code promo:', error);
    return c.json({
      success: false,
      error: 'Erreur serveur: ' + String(error)
    }, 500);
  }
});

export default adminRoutes;