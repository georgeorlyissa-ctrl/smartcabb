import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// ============================================
// 🌟 GESTION DES LIEUX FAVORIS
// ============================================
// ⚠️ IMPORTANT: Ces routes doivent être AVANT /:id pour éviter les conflits

/**
 * ✅ GET /passengers/:userId/favorites - Récupérer les lieux favoris d'un passager
 */
app.get("/:userId/favorites", async (c) => {
  try {
    const userId = c.req.param("userId");
    
    console.log(`🌟 Récupération des favoris pour le passager ${userId}...`);

    // Récupérer les favoris depuis le KV store
    const favorites = await kv.get(`favorites:${userId}`);
    
    if (!favorites || !Array.isArray(favorites)) {
      console.log(`⚠️ Aucun favori trouvé pour ${userId}`);
      return c.json({
        success: true,
        favorites: []
      });
    }

    console.log(`✅ ${favorites.length} favoris trouvés pour ${userId}`);

    return c.json({
      success: true,
      favorites: favorites
    });

  } catch (error) {
    console.error("❌ Erreur récupération favoris:", error);
    return c.json({ 
      success: false, 
      error: "Erreur serveur lors de la récupération des favoris",
      favorites: []
    }, 500);
  }
});

/**
 * ✅ POST /passengers/:userId/favorites - Ajouter un lieu favori
 */
app.post("/:userId/favorites", async (c) => {
  try {
    const userId = c.req.param("userId");
    const body = await c.req.json();
    
    console.log(`🌟 Ajout d'un favori pour le passager ${userId}:`, body);

    // Validation
    if (!body.name || !body.address) {
      return c.json({
        success: false,
        error: "Nom et adresse requis"
      }, 400);
    }

    // Récupérer les favoris existants
    let favorites = await kv.get(`favorites:${userId}`) || [];
    if (!Array.isArray(favorites)) {
      favorites = [];
    }

    // Créer le nouveau favori
    const newFavorite = {
      id: `fav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      name: body.name,
      address: body.address,
      lat: body.lat || -4.3276,
      lng: body.lng || 15.3136,
      icon: body.icon || 'home',
      created_at: new Date().toISOString()
    };

    // Ajouter au début de la liste
    favorites.unshift(newFavorite);

    // Sauvegarder dans le KV store
    await kv.set(`favorites:${userId}`, favorites);

    console.log(`✅ Favori ajouté avec succès:`, newFavorite.id);

    return c.json({
      success: true,
      favorite: newFavorite
    });

  } catch (error) {
    console.error("❌ Erreur ajout favori:", error);
    return c.json({ 
      success: false, 
      error: "Erreur serveur lors de l'ajout du favori" 
    }, 500);
  }
});

/**
 * ✅ PUT /passengers/:userId/favorites/:favoriteId - Modifier un lieu favori
 */
app.put("/:userId/favorites/:favoriteId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const favoriteId = c.req.param("favoriteId");
    const body = await c.req.json();
    
    console.log(`🌟 Modification du favori ${favoriteId} pour ${userId}:`, body);

    // Récupérer les favoris existants
    let favorites = await kv.get(`favorites:${userId}`) || [];
    if (!Array.isArray(favorites)) {
      return c.json({
        success: false,
        error: "Aucun favori trouvé"
      }, 404);
    }

    // Trouver et mettre à jour le favori
    const index = favorites.findIndex(f => f.id === favoriteId);
    if (index === -1) {
      return c.json({
        success: false,
        error: "Favori introuvable"
      }, 404);
    }

    favorites[index] = {
      ...favorites[index],
      name: body.name || favorites[index].name,
      address: body.address || favorites[index].address,
      lat: body.lat || favorites[index].lat,
      lng: body.lng || favorites[index].lng,
      icon: body.icon || favorites[index].icon
    };

    // Sauvegarder
    await kv.set(`favorites:${userId}`, favorites);

    console.log(`✅ Favori ${favoriteId} mis à jour avec succès`);

    return c.json({
      success: true,
      favorite: favorites[index]
    });

  } catch (error) {
    console.error("❌ Erreur modification favori:", error);
    return c.json({ 
      success: false, 
      error: "Erreur serveur lors de la modification du favori" 
    }, 500);
  }
});

/**
 * ✅ DELETE /passengers/:userId/favorites/:favoriteId - Supprimer un lieu favori
 */
app.delete("/:userId/favorites/:favoriteId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const favoriteId = c.req.param("favoriteId");
    
    console.log(`🌟 Suppression du favori ${favoriteId} pour ${userId}`);

    // Récupérer les favoris existants
    let favorites = await kv.get(`favorites:${userId}`) || [];
    if (!Array.isArray(favorites)) {
      return c.json({
        success: false,
        error: "Aucun favori trouvé"
      }, 404);
    }

    // Filtrer pour retirer le favori
    const newFavorites = favorites.filter(f => f.id !== favoriteId);

    if (newFavorites.length === favorites.length) {
      return c.json({
        success: false,
        error: "Favori introuvable"
      }, 404);
    }

    // Sauvegarder
    await kv.set(`favorites:${userId}`, newFavorites);

    console.log(`✅ Favori ${favoriteId} supprimé avec succès`);

    return c.json({
      success: true
    });

  } catch (error) {
    console.error("❌ Erreur suppression favori:", error);
    return c.json({ 
      success: false, 
      error: "Erreur serveur lors de la suppression du favori" 
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

/**
 * 🔥 PUT /passengers/update/:id - Mettre à jour les informations d'un passager
 */
app.put("/update/:id", async (c) => {
  try {
    const passengerId = c.req.param("id");
    const body = await c.req.json();
    
    console.log("💾 Mise à jour passager:", passengerId, body);

    if (!passengerId) {
      return c.json({ 
        success: false, 
        error: "ID passager requis" 
      }, 400);
    }

    // Récupérer les données existantes depuis TOUTES les clés possibles
    let existingPassenger = await kv.get(`user:${passengerId}`);
    const existingProfile = await kv.get(`profile:${passengerId}`);
    const existingPassengerKey = await kv.get(`passenger:${passengerId}`);
    
    // 🔥 Si l'utilisateur n'existe pas, le créer
    if (!existingPassenger) {
      console.log("⚠️ Passager non trouvé, création d'un nouveau profil...");
      existingPassenger = {
        id: passengerId,
        name: body.name || "Utilisateur",
        full_name: body.name || "Utilisateur",
        email: body.email || "",
        phone: body.phone || "",
        address: body.address || "",
        role: "passenger",
        created_at: new Date().toISOString(),
        total_rides: 0,
        balance: 0,
        rating: 5.0,
        favorite_payment_method: "cash"
      };
    }

    // Mettre à jour les champs
    const updatedPassenger = {
      ...existingPassenger,
      name: body.name || existingPassenger.name,
      full_name: body.name || existingPassenger.full_name,
      email: body.email || existingPassenger.email,
      phone: body.phone || existingPassenger.phone,
      address: body.address !== undefined ? body.address : existingPassenger.address,
      updated_at: new Date().toISOString()
    };

    // 🔥 MISE À JOUR DANS TOUTES LES CLÉS DU KV STORE
    // 1. Sauvegarder dans user:
    await kv.set(`user:${passengerId}`, updatedPassenger);
    
    // 2. Sauvegarder dans profile: (si existe)
    if (existingProfile) {
      const updatedProfile = {
        ...existingProfile,
        full_name: body.name || existingProfile.full_name,
        email: body.email || existingProfile.email,
        phone: body.phone || existingProfile.phone,
        address: body.address !== undefined ? body.address : existingProfile.address,
        updated_at: new Date().toISOString()
      };
      await kv.set(`profile:${passengerId}`, updatedProfile);
      console.log("✅ profile: mis à jour");
    }
    
    // 3. Sauvegarder dans passenger: (si existe)
    if (existingPassengerKey) {
      const updatedPassengerKey = {
        ...existingPassengerKey,
        name: body.name || existingPassengerKey.name,
        full_name: body.name || existingPassengerKey.full_name,
        email: body.email || existingPassengerKey.email,
        phone: body.phone || existingPassengerKey.phone,
        address: body.address !== undefined ? body.address : existingPassengerKey.address,
        updated_at: new Date().toISOString()
      };
      await kv.set(`passenger:${passengerId}`, updatedPassengerKey);
      console.log("✅ passenger: mis à jour");
    }

    // 4. 🔥 METTRE À JOUR SUPABASE AUTH si l'email a changé
    if (body.email && existingPassenger.email !== body.email) {
      try {
        const { createClient } = await import('npm:@supabase/supabase-js@2');
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );
        
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          passengerId,
          { email: body.email }
        );
        
        if (updateError) {
          console.error("⚠️ Erreur mise à jour email Supabase Auth:", updateError);
          // Ne pas bloquer la mise à jour si Supabase Auth échoue
        } else {
          console.log("✅ Email mis à jour dans Supabase Auth");
        }
      } catch (error) {
        console.error("⚠️ Erreur Supabase Auth:", error);
        // Ne pas bloquer
      }
    }

    console.log("✅ Passager mis à jour avec succès dans toutes les clés");

    return c.json({
      success: true,
      passenger: updatedPassenger
    });

  } catch (error) {
    console.error("❌ Erreur mise à jour passager:", error);
    return c.json({ 
      success: false, 
      error: "Erreur serveur lors de la mise à jour: " + String(error)
    }, 500);
  }
});

export default app;
