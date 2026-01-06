import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";

const app = new Hono();

/**
 * ✅ GET /passengers/:id - Récupérer les informations d'un passager
 */
app.get("/:id", async (c) => {
  try {
    const passengerId = c.req.param("id");
    
    if (!passengerId) {
      return c.json({ 
        success: false, 
        error: "ID passager requis" 
      }, 400);
    }

    console.log("🔍 Récupération informations passager:", passengerId);

    // Récupérer les informations du passager depuis le KV store
    const passenger = await kv.get(`user:${passengerId}`);
    
    if (!passenger) {
      console.warn("⚠️ Passager non trouvé:", passengerId);
      return c.json({ 
        success: false, 
        error: "Passager non trouvé" 
      }, 404);
    }

    console.log("✅ Passager trouvé:", passenger);

    return c.json({
      success: true,
      passenger: {
        id: passengerId,
        name: passenger.name || passenger.full_name || "Passager",
        full_name: passenger.full_name || passenger.name || "Passager",
        phone: passenger.phone || "",
        email: passenger.email || "",
        address: passenger.address || "",
        total_rides: passenger.total_rides || passenger.totalRides || 0,
        totalRides: passenger.total_rides || passenger.totalRides || 0,
        created_at: passenger.created_at || passenger.createdAt || new Date().toISOString(),
        registeredAt: passenger.created_at || passenger.createdAt || new Date().toISOString(),
        favorite_payment_method: passenger.favorite_payment_method || passenger.favoritePaymentMethod || "cash",
        favoritePaymentMethod: passenger.favorite_payment_method || passenger.favoritePaymentMethod || "cash",
        balance: passenger.balance || 0,
        rating: passenger.rating || 5.0
      }
    });

  } catch (error) {
    console.error("❌ Erreur récupération passager:", error);
    return c.json({ 
      success: false, 
      error: "Erreur serveur lors de la récupération des données" 
    }, 500);
  }
});

// ============================================
// 📊 RÉCUPÉRER LES STATISTIQUES D'UN PASSAGER
// ============================================
app.get('/:id/stats', async (c) => {
  try {
    const passengerId = c.req.param('id');
    console.log(`📊 Récupération des stats du passager ${passengerId}...`);

    // Récupérer toutes les courses depuis le KV store
    const allRides = await kv.getByPrefix('ride_request_');
    
    if (!allRides || allRides.length === 0) {
      console.log('⚠️ Aucune course trouvée dans le système');
      return c.json({
        success: true,
        stats: {
          totalRides: 0,
          completedRides: 0,
          totalSpent: 0
        }
      });
    }

    // 🔍 v517.91: LOG DÉTAILLÉ pour débogage
    console.log(`🔍 Recherche courses pour passengerId: \"${passengerId}\"`);
    console.log(`🔍 Total courses dans le système: ${allRides.length}`);
    
    // Examiner les passengerIds uniques
    const uniquePassengerIds = [...new Set(allRides.map((r: any) => r.passengerId))];
    console.log(`🔍 PassengerIds uniques trouvés:`, uniquePassengerIds);
    
    // Filtrer les courses du passager qui sont complétées
    const passengerRides = allRides.filter((ride: any) => {
      const matches = ride.passengerId === passengerId && ride.status === 'completed';
      if (ride.passengerId === passengerId) {
        console.log(`🔍 Course ${ride.id}: passengerId match, status=${ride.status}, included=${matches}`);
      }
      return matches;
    });

    // Calculer le total dépensé
    const totalSpent = passengerRides.reduce((sum: number, ride: any) => 
      sum + (ride.finalPrice || 0), 0
    );

    console.log(`✅ Stats calculées:`, {
      passengerId,
      totalRides: passengerRides.length,
      completedRides: passengerRides.length,
      totalSpent,
      coursesExaminées: allRides.length
    });

    return c.json({
      success: true,
      stats: {
        totalRides: passengerRides.length,
        completedRides: passengerRides.length,
        totalSpent: totalSpent
      }
    });

  } catch (error) {
    console.error('❌ Erreur get-stats passager:', error);
    return c.json({
      success: false,
      error: 'Erreur serveur: ' + String(error),
      stats: {
        totalRides: 0,
        completedRides: 0,
        totalSpent: 0
      }
    }, 500);
  }
});

// ============================================
// 🔄 MIGRER LES COURSES D'UN ANCIEN ID VERS UN NOUVEAU ID
// ============================================
app.post('/:newId/migrate-rides/:oldId', async (c) => {
  try {
    const newId = c.req.param('newId');
    const oldId = c.req.param('oldId');
    
    console.log(`🔄 Migration des courses: ${oldId} → ${newId}`);
    
    // Récupérer toutes les courses
    const allRides = await kv.getByPrefix('ride_request_');
    
    if (!allRides || allRides.length === 0) {
      return c.json({
        success: true,
        migrated: 0,
        message: 'Aucune course à migrer'
      });
    }
    
    // Filtrer les courses de l'ancien ID
    const ridesToMigrate = allRides.filter((ride: any) => ride.passengerId === oldId);
    
    console.log(`📊 ${ridesToMigrate.length} courses trouvées pour l'ancien ID`);
    
    // Mettre à jour chaque course
    let migratedCount = 0;
    for (const ride of ridesToMigrate) {
      try {
        ride.passengerId = newId;
        await kv.set(`ride_request_${ride.id}`, ride);
        migratedCount++;
        console.log(`✅ Course ${ride.id} migrée`);
      } catch (error) {
        console.error(`❌ Erreur migration course ${ride.id}:`, error);
      }
    }
    
    return c.json({
      success: true,
      migrated: migratedCount,
      total: ridesToMigrate.length,
      message: `${migratedCount} courses migrées avec succès`
    });
    
  } catch (error) {
    console.error('❌ Erreur migration:', error);
    return c.json({
      success: false,
      error: 'Erreur serveur: ' + String(error),
      migrated: 0
    }, 500);
  }
});

export default app;