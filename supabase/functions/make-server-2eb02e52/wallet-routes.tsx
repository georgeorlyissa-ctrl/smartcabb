import { Hono } from 'npm:hono';
import * as kv from './kv-wrapper.tsx';
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

    // ✅ FIX: Synchroniser avec la clé balance utilisée par ride-routes.tsx
    const balanceKey = `passenger:${transaction.userId}:balance`;
    await kv.set(balanceKey, {
      balance: newBalance,
      updated_at: new Date().toISOString()
    });

    // Sauvegarder les modifications dans le KV store
    await kv.set(`recharge:${transactionId}`, updatedTransaction);
    await kv.set(passengerKey, updatedPassenger);
    console.log('✅ Passager mis à jour dans KV store');

    // 📡 SYNCHRONISER AVEC SUPABASE (optionnel, pour garder la cohérence)
    // ⚠️ DÉSACTIVÉ: La colonne wallet_balance n'existe pas dans Supabase profiles
    // Si vous créez cette colonne, décommentez ce code
    /*
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
    */
    console.log('ℹ️ Synchronisation Supabase désactivée (colonne wallet_balance non créée)');

    console.log('✅ Recharge approuvée avec succès (KV store)');

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

    // ✅ FIX: Utiliser la clé balance cohérente avec ride-routes.tsx
    const balanceKey = `passenger:${userId}:balance`;
    let balanceData: any = await kv.get(balanceKey);

    // Si pas de données de balance, initialiser à 0
    if (!balanceData) {
      console.log('⚠️ Solde non trouvé, initialisation à 0 CDF');
      balanceData = {
        balance: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      await kv.set(balanceKey, balanceData);
    }

    // Extraire le montant du solde
    const balance = typeof balanceData === 'number' 
      ? balanceData 
      : (balanceData.balance || 0);

    // Récupérer aussi le profil pour le nom
    let userName = 'Passager';
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single();
      
      if (profile) {
        userName = profile.full_name || 'Passager';
      }
    } catch (err) {
      console.warn('⚠️ Impossible de récupérer le nom du passager');
    }

    console.log(`✅ Solde récupéré: ${balance} CDF pour ${userName}`);

    return c.json({
      success: true,
      balance: balance,
      userId: userId,
      userName: userName
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
// DÉDUIRE DU SOLDE DU PASSAGER (PAIEMENT COURSE)
// ============================================
walletRoutes.post('/deduct', async (c) => {
  try {
    const { userId, amount, rideId } = await c.req.json();

    if (!userId || !amount || amount <= 0) {
      return c.json({
        success: false,
        error: 'Données invalides'
      }, 400);
    }

    console.log('💳 Déduction du solde:', {
      userId,
      amount,
      rideId
    });

    // Récupérer le profil du passager
    const passengerKey = `passenger:${userId}`;
    let passenger: any = await kv.get(passengerKey);

    // 🆕 Si le passager n'existe pas dans le KV store, le créer depuis Supabase
    if (!passenger) {
      console.log('⚠️ Passager non trouvé dans KV, récupération depuis Supabase...');
      
      try {
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

        passenger = {
          id: profile.id,
          full_name: profile.full_name,
          email: profile.email,
          phone: profile.phone,
          role: profile.role,
          wallet_balance: profile.wallet_balance || 0,
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

    // Vérifier le solde
    const currentBalance = passenger.wallet_balance || 0;
    
    if (currentBalance < amount) {
      console.log('❌ Solde insuffisant:', {
        actuel: currentBalance,
        requis: amount
      });
      return c.json({
        success: false,
        error: 'Solde insuffisant',
        currentBalance,
        required: amount
      }, 400);
    }

    // Calculer le nouveau solde
    const newBalance = currentBalance - amount;

    console.log('💰 Mise à jour du solde:', {
      ancien: currentBalance,
      montantDéduit: amount,
      nouveau: newBalance
    });

    // Mettre à jour le passager avec le nouveau solde
    const updatedPassenger = {
      ...passenger,
      wallet_balance: newBalance,
      updated_at: new Date().toISOString()
    };

    // Sauvegarder dans le KV store
    await kv.set(passengerKey, updatedPassenger);
    console.log('✅ Solde mis à jour dans KV store');

    // Créer une transaction de déduction dans l'historique
    const transactionId = `deduct-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const transaction = {
      id: transactionId,
      userId,
      userName: passenger.full_name,
      amount: -amount, // Montant négatif pour la déduction
      type: 'deduction',
      method: 'wallet',
      status: 'completed',
      rideId,
      description: `Paiement de la course ${rideId}`,
      balanceBefore: currentBalance,
      balanceAfter: newBalance,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    // Sauvegarder la transaction
    await kv.set(`transaction:${transactionId}`, transaction);
    console.log('✅ Transaction de déduction enregistrée:', transactionId);

    // 📡 SYNCHRONISER AVEC SUPABASE (optionnel)
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ wallet_balance: newBalance })
        .eq('id', userId);

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

    console.log('✅ Déduction du solde réussie');

    return c.json({
      success: true,
      newBalance,
      transaction,
      message: `${amount.toLocaleString()} CDF déduits de votre solde`
    });

  } catch (error) {
    console.error('❌ Erreur déduction solde:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur serveur'
    }, 500);
  }
});

// ============================================
// AJOUTER AU SOLDE DU PASSAGER
// ============================================
walletRoutes.post('/add', async (c) => {
  try {
    const { userId, amount, description, source } = await c.req.json();

    if (!userId || !amount || amount <= 0) {
      return c.json({
        success: false,
        error: 'Données invalides'
      }, 400);
    }

    console.log('💰 Ajout au solde:', {
      userId,
      amount,
      source: source || 'manual'
    });

    // Récupérer le profil du passager
    const passengerKey = `passenger:${userId}`;
    let passenger: any = await kv.get(passengerKey);

    // 🆕 Si le passager n'existe pas dans le KV store, le créer depuis Supabase
    if (!passenger) {
      console.log('⚠️ Passager non trouvé dans KV, récupération depuis Supabase...');
      
      try {
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

        passenger = {
          id: profile.id,
          full_name: profile.full_name,
          email: profile.email,
          phone: profile.phone,
          role: profile.role,
          wallet_balance: profile.wallet_balance || 0,
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
    const newBalance = currentBalance + amount;

    console.log('💰 Mise à jour du solde:', {
      ancien: currentBalance,
      montantAjouté: amount,
      nouveau: newBalance
    });

    // Mettre à jour le passager avec le nouveau solde
    const updatedPassenger = {
      ...passenger,
      wallet_balance: newBalance,
      updated_at: new Date().toISOString()
    };

    // Sauvegarder dans le KV store
    await kv.set(passengerKey, updatedPassenger);
    console.log('✅ Solde mis à jour dans KV store');

    // Créer une transaction d'ajout dans l'historique
    const transactionId = `add-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const transaction = {
      id: transactionId,
      userId,
      userName: passenger.full_name,
      amount: amount, // Montant positif pour l'ajout
      type: 'addition',
      method: source || 'manual',
      status: 'completed',
      description: description || `Ajout au solde de ${amount.toLocaleString()} CDF`,
      balanceBefore: currentBalance,
      balanceAfter: newBalance,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    // Sauvegarder la transaction
    await kv.set(`transaction:${transactionId}`, transaction);
    console.log('✅ Transaction d\'ajout enregistrée:', transactionId);

    // 📡 SYNCHRONISER AVEC SUPABASE
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ wallet_balance: newBalance })
        .eq('id', userId);

      if (updateError) {
        console.error('⚠️ Erreur mise à jour Supabase wallet_balance:', updateError);
      } else {
        console.log('✅ Wallet balance synchronisé dans Supabase:', newBalance);
      }
    } catch (syncError) {
      console.error('⚠️ Erreur sync Supabase:', syncError);
    }

    console.log('✅ Ajout au solde réussi');

    return c.json({
      success: true,
      newBalance,
      transaction,
      message: `${amount.toLocaleString()} CDF ajoutés à votre solde`
    });

  } catch (error) {
    console.error('❌ Erreur ajout solde:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur serveur'
    }, 500);
  }
});

// ============================================
// RÉCUPÉRER L'HISTORIQUE DES TRANSACTIONS D'UN PASSAGER
// ============================================
walletRoutes.get('/transactions/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    console.log('📜 Récupération de l\'historique des transactions pour:', userId);

    // Récupérer toutes les recharges (clé: recharge:)
    const allRecharges = await kv.getByPrefix('recharge:');
    
    // Filtrer les recharges de l'utilisateur
    const userRecharges = allRecharges.filter((r: any) => r.userId === userId);
    
    // Récupérer aussi les transactions de paiement de courses (clé: transaction:)
    const allTransactions = await kv.getByPrefix('transaction:');
    const userTransactions = allTransactions.filter((t: any) => t.userId === userId);
    
    // Fusionner les deux listes
    const allUserTransactions = [
      ...userRecharges.map((r: any) => ({
        id: r.id,
        type: 'recharge',
        amount: r.amount,
        method: r.method,
        status: r.status,
        description: r.description || `Recharge ${r.method === 'mobile_money' ? 'Mobile Money' : 'Espèces'}`,
        timestamp: new Date(r.createdAt),
        balanceAfter: r.balanceAfter || 0,
        userId: r.userId,
        userName: r.userName,
        userPhone: r.userPhone,
        approvedAt: r.approvedAt ? new Date(r.approvedAt) : undefined,
        rejectedAt: r.rejectedAt ? new Date(r.rejectedAt) : undefined
      })),
      ...userTransactions.map((t: any) => ({
        id: t.id,
        type: t.type || 'debit',
        amount: t.amount,
        method: t.method,
        status: t.status || 'approved',
        description: t.description || 'Transaction',
        timestamp: new Date(t.createdAt),
        balanceAfter: t.balanceAfter || 0,
        userId: t.userId
      }))
    ];
    
    // Trier par date (plus récent d'abord)
    const sortedTransactions = allUserTransactions.sort((a: any, b: any) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    console.log(`✅ ${sortedTransactions.length} transaction(s) trouvée(s) (${userRecharges.length} recharges + ${userTransactions.length} paiements)`);

    return c.json({
      success: true,
      transactions: sortedTransactions,
      count: sortedTransactions.length
    });

  } catch (error) {
    console.error('❌ Erreur récupération transactions:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur serveur',
      transactions: []
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