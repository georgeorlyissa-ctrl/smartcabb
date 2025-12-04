import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';
import { createClient } from 'npm:@supabase/supabase-js@2';

const walletRoutes = new Hono();

// Supabase client (utiliser les vraies variables d'environnement)
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// ============================================
// SOUMETTRE UNE DEMANDE DE RECHARGE EN ESPÈCES
// ============================================
walletRoutes.post('/cash-recharge-request', async (c) => {
  try {
    const { userId, userName, userPhone, amount, description } = await c.req.json();

    if (!userId || !amount || amount <= 0) {
      return c.json({
        success: false,
        error: 'Données invalides'
      }, 400);
    }

    console.log('💰 Demande de recharge en espèces:', {
      userId,
      userName,
      amount,
      description
    });

    // Créer la transaction
    const transactionId = `cash-recharge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const transaction = {
      id: transactionId,
      userId,
      userName,
      userPhone,
      amount,
      description: description || `Recharge en espèces de ${amount.toLocaleString()} CDF`,
      type: 'recharge',
      method: 'cash',
      status: 'pending',
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    // Sauvegarder dans le KV store avec préfixe recharge:
    await kv.set(`recharge:${transactionId}`, transaction);

    console.log('✅ Demande de recharge enregistrée:', transactionId);

    return c.json({
      success: true,
      transaction
    });

  } catch (error) {
    console.error('❌ Erreur demande recharge:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur serveur'
    }, 500);
  }
});

// ============================================
// RÉCUPÉRER TOUTES LES RECHARGES EN ATTENTE
// ============================================
walletRoutes.get('/pending-recharges', async (c) => {
  try {
    console.log('📋 Récupération des recharges en attente...');

    // Récupérer toutes les recharges
    const allRecharges = await kv.getByPrefix('recharge:');
    
    // Filtrer les recharges en attente
    const pendingRecharges = allRecharges.filter((r: any) => r.status === 'pending');

    console.log(`✅ ${pendingRecharges.length} recharge(s) en attente trouvée(s)`);

    return c.json({
      success: true,
      recharges: pendingRecharges,
      count: pendingRecharges.length
    });

  } catch (error) {
    console.error('❌ Erreur récupération recharges:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur serveur',
      recharges: []
    }, 500);
  }
});

// ============================================
// RÉCUPÉRER L'HISTORIQUE DE TOUTES LES RECHARGES
// ============================================
walletRoutes.get('/recharges-history', async (c) => {
  try {
    console.log('📜 Récupération de l\'historique des recharges...');

    // Récupérer toutes les recharges
    const allRecharges = await kv.getByPrefix('recharge:');
    
    // Trier par date (plus récent d'abord)
    const sortedRecharges = allRecharges.sort((a: any, b: any) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    console.log(`✅ ${sortedRecharges.length} recharge(s) dans l'historique`);

    return c.json({
      success: true,
      recharges: sortedRecharges,
      count: sortedRecharges.length,
      stats: {
        total: sortedRecharges.length,
        pending: sortedRecharges.filter((r: any) => r.status === 'pending').length,
        approved: sortedRecharges.filter((r: any) => r.status === 'approved').length,
        rejected: sortedRecharges.filter((r: any) => r.status === 'rejected').length
      }
    });

  } catch (error) {
    console.error('❌ Erreur récupération historique:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur serveur',
      recharges: []
    }, 500);
  }
});

// ============================================
// APPROUVER UNE RECHARGE EN ESPÈCES
// ============================================
walletRoutes.post('/approve-cash-recharge', async (c) => {
  try {
    const { transactionId, adminId, adminName } = await c.req.json();

    if (!transactionId) {
      return c.json({
        success: false,
        error: 'ID de transaction requis'
      }, 400);
    }

    console.log('✅ Approbation de la recharge:', transactionId);

    // Récupérer la transaction
    const transaction: any = await kv.get(`recharge:${transactionId}`);

    if (!transaction) {
      return c.json({
        success: false,
        error: 'Transaction non trouvée'
      }, 404);
    }

    if (transaction.status !== 'pending') {
      return c.json({
        success: false,
        error: `Transaction déjà traitée (statut: ${transaction.status})`
      }, 400);
    }

    // Récupérer le profil du passager
    const passengerKey = `passenger:${transaction.userId}`;
    let passenger: any = await kv.get(passengerKey);

    // 🆕 Si le passager n'existe pas dans le KV store, le créer depuis Supabase
    if (!passenger) {
      console.log('⚠️ Passager non trouvé dans KV, récupération depuis Supabase...');
      
      try {
        // Récupérer le profil depuis Supabase
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', transaction.userId)
          .single();

        if (profileError || !profile) {
          console.error('❌ Profil introuvable dans Supabase:', profileError);
          return c.json({
            success: false,
            error: 'Passager non trouvé dans la base de données'
          }, 404);
        }

        // Créer le passager dans le KV store avec le solde depuis Supabase
        passenger = {
          id: profile.id,
          full_name: profile.full_name,
          email: profile.email,
          phone: profile.phone,
          role: profile.role,
          wallet_balance: profile.wallet_balance || 0, // ✅ Sync depuis Supabase
          created_at: profile.created_at,
          updated_at: new Date().toISOString()
        };

        await kv.set(passengerKey, passenger);
        console.log('✅ Passager créé dans le KV store:', passengerKey);
      } catch (err) {
        console.error('❌ Erreur création passager dans KV:', err);
        return c.json({
          success: false,
          error: 'Erreur lors de la création du profil passager'
        }, 500);
      }
    }

    // Calculer le nouveau solde
    const currentBalance = passenger.wallet_balance || 0;
    const newBalance = currentBalance + transaction.amount;

    console.log('💰 Mise à jour du solde:', {
      ancien: currentBalance,
      montant: transaction.amount,
      nouveau: newBalance
    });

    // Mettre à jour la transaction
    const updatedTransaction = {
      ...transaction,
      status: 'approved',
      approvedAt: new Date().toISOString(),
      approvedBy: adminName || adminId || 'admin',
      balanceAfter: newBalance
    };

    // Mettre à jour le passager avec le nouveau solde
    const updatedPassenger = {
      ...passenger,
      wallet_balance: newBalance,
      updated_at: new Date().toISOString()
    };

    // Sauvegarder les modifications dans le KV store
    await kv.set(`recharge:${transactionId}`, updatedTransaction);
    await kv.set(passengerKey, updatedPassenger);

    // ✅ CRITICAL: Mettre à jour AUSSI dans Supabase profiles pour sync multi-device
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ wallet_balance: newBalance })
        .eq('id', transaction.userId);

      if (updateError) {
        console.error('⚠️ Erreur mise à jour Supabase wallet_balance:', updateError);
        // Continue quand même, le KV store est mis à jour
      } else {
        console.log('✅ Wallet balance synchronisé dans Supabase:', newBalance);
      }
    } catch (syncError) {
      console.error('⚠️ Erreur sync Supabase:', syncError);
      // Continue quand même
    }

    console.log('✅ Recharge approuvée avec succès (KV + Supabase)');

    return c.json({
      success: true,
      transaction: updatedTransaction,
      newBalance,
      message: `Recharge de ${transaction.amount.toLocaleString()} CDF approuvée`
    });

  } catch (error) {
    console.error('❌ Erreur approbation recharge:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur serveur'
    }, 500);
  }
});

// ============================================
// REJETER UNE RECHARGE EN ESPÈCES
// ============================================
walletRoutes.post('/reject-cash-recharge', async (c) => {
  try {
    const { transactionId, adminId, adminName, reason } = await c.req.json();

    if (!transactionId || !reason) {
      return c.json({
        success: false,
        error: 'ID de transaction et raison requis'
      }, 400);
    }

    console.log('❌ Rejet de la recharge:', transactionId);

    // Récupérer la transaction
    const transaction: any = await kv.get(`recharge:${transactionId}`);

    if (!transaction) {
      return c.json({
        success: false,
        error: 'Transaction non trouvée'
      }, 404);
    }

    if (transaction.status !== 'pending') {
      return c.json({
        success: false,
        error: `Transaction déjà traitée (statut: ${transaction.status})`
      }, 400);
    }

    // Mettre à jour la transaction
    const updatedTransaction = {
      ...transaction,
      status: 'rejected',
      rejectedAt: new Date().toISOString(),
      rejectedBy: adminName || adminId || 'admin',
      rejectionReason: reason
    };

    // Sauvegarder
    await kv.set(`recharge:${transactionId}`, updatedTransaction);

    console.log('✅ Recharge rejetée avec succès');

    return c.json({
      success: true,
      transaction: updatedTransaction,
      message: `Recharge rejetée: ${reason}`
    });

  } catch (error) {
    console.error('❌ Erreur rejet recharge:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur serveur'
    }, 500);
  }
});

// ============================================
// RÉCUPÉRER LE SOLDE D'UN PASSAGER
// ============================================
walletRoutes.get('/passenger-balance/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    console.log('💳 Récupération du solde pour:', userId);

    let passenger: any = await kv.get(`passenger:${userId}`);

    // 🆕 Si le passager n'existe pas dans le KV store, le créer depuis Supabase
    if (!passenger) {
      console.log('⚠️ Passager non trouvé dans KV, récupération depuis Supabase...');
      
      try {
        // Récupérer le profil depuis Supabase
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError || !profile) {
          console.error('❌ Profil introuvable dans Supabase:', profileError);
          return c.json({
            success: false,
            error: 'Passager non trouvé dans la base de données'
          }, 404);
        }

        // Créer le passager dans le KV store avec le solde depuis Supabase
        passenger = {
          id: profile.id,
          full_name: profile.full_name,
          email: profile.email,
          phone: profile.phone,
          role: profile.role,
          wallet_balance: profile.wallet_balance || 0, // ✅ Sync depuis Supabase
          created_at: profile.created_at,
          updated_at: new Date().toISOString()
        };

        await kv.set(`passenger:${userId}`, passenger);
        console.log('✅ Passager créé dans le KV store:', userId);
      } catch (err) {
        console.error('❌ Erreur création passager dans KV:', err);
        return c.json({
          success: false,
          error: 'Erreur lors de la récupération du profil passager'
        }, 500);
      }
    }

    return c.json({
      success: true,
      balance: passenger.wallet_balance || 0,
      userId: passenger.id,
      userName: passenger.full_name
    });

  } catch (error) {
    console.error('❌ Erreur récupération solde:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur serveur'
    }, 500);
  }
});

// ============================================
// MIGRATION: SYNC KV STORE -> SUPABASE
// ============================================
walletRoutes.post('/sync-kv-to-supabase/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    console.log('🔄 Migration wallet KV -> Supabase pour:', userId);

    // Récupérer le passager depuis le KV store
    const passenger: any = await kv.get(`passenger:${userId}`);

    if (!passenger) {
      return c.json({
        success: false,
        error: 'Passager non trouvé dans le KV store'
      }, 404);
    }

    const kvBalance = passenger.wallet_balance || 0;
    console.log('💰 Solde dans KV store:', kvBalance);

    // Récupérer le profil depuis Supabase
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('wallet_balance')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return c.json({
        success: false,
        error: 'Profil non trouvé dans Supabase'
      }, 404);
    }

    const supabaseBalance = profile.wallet_balance || 0;
    console.log('💰 Solde dans Supabase:', supabaseBalance);

    // Mettre à jour Supabase avec le solde du KV store (KV est la source de vérité ici)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ wallet_balance: kvBalance })
      .eq('id', userId);

    if (updateError) {
      console.error('❌ Erreur mise à jour Supabase:', updateError);
      return c.json({
        success: false,
        error: 'Erreur lors de la synchronisation'
      }, 500);
    }

    console.log('✅ Migration réussie:', {
      userId,
      oldSupabaseBalance: supabaseBalance,
      newSupabaseBalance: kvBalance,
      synced: true
    });

    return c.json({
      success: true,
      message: 'Synchronisation réussie',
      oldBalance: supabaseBalance,
      newBalance: kvBalance,
      migrated: kvBalance !== supabaseBalance
    });

  } catch (error) {
    console.error('❌ Erreur migration:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur serveur'
    }, 500);
  }
});

export default walletRoutes;