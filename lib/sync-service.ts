/**
 * Service de synchronisation centralisé pour SmartCabb
 * Gère la synchronisation bidirectionnelle entre Supabase et localStorage
 */

import { profileService } from './supabase-services';
import { supabase } from './supabase';
import { User } from '../types';

/**
 * Synchronise un profil utilisateur après modification
 * Met à jour Supabase + localStorage individuel + localStorage global
 */
export async function syncUserProfile(userId: string, updates: Partial<User>): Promise<boolean> {
  try {
    console.log('🔄 [SYNC] Début synchronisation profil:', userId, updates);

    // 1️⃣ Mettre à jour dans Supabase
    const supabaseData: any = {};
    if (updates.name !== undefined) supabaseData.full_name = updates.name;
    if (updates.email !== undefined) supabaseData.email = updates.email;
    if (updates.phone !== undefined) supabaseData.phone = updates.phone;
    // ✅ v517.97: Ne pas envoyer address à Supabase (colonne inexistante)
    // L'adresse sera uniquement stockée dans localStorage
    
    console.log('📦 [SYNC] Données à envoyer à Supabase:', supabaseData);
    
    // ✅ v517.97: Envoyer seulement si on a des données à mettre à jour
    let updatedProfile = null;
    if (Object.keys(supabaseData).length > 0) {
      updatedProfile = await profileService.updateProfile(userId, supabaseData);
      
      if (!updatedProfile) {
        console.error('❌ [SYNC] Échec mise à jour Supabase');
        // ⚠️ Ne pas retourner false immédiatement, continuer avec localStorage
      } else {
        console.log('✅ [SYNC] Supabase mis à jour:', updatedProfile);
      }
    } else {
      console.log('ℹ️ [SYNC] Aucune donnée Supabase à mettre à jour (seule adresse modifiée)');
    }

    // 2️⃣ Récupérer le profil complet depuis Supabase
    const { data: fullProfile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !fullProfile) {
      console.error('❌ [SYNC] Erreur récupération profil complet:', error);
      return false;
    }

    // 3️⃣ Mettre à jour localStorage individuel (smartcabb_user_{id})
    try {
      const userKey = `smartcabb_user_${userId}`;
      const existingData = localStorage.getItem(userKey);
      const existingUser = existingData ? JSON.parse(existingData) : {};

      // ✅ v517.97: L'adresse vient de updates, pas de fullProfile (colonne inexistante dans Supabase)
      const updatedUserData = {
        ...existingUser,
        id: fullProfile.id,
        name: fullProfile.full_name !== null && fullProfile.full_name !== undefined ? fullProfile.full_name : (updates.name !== undefined ? updates.name : existingUser.name),
        email: fullProfile.email !== null && fullProfile.email !== undefined ? fullProfile.email : (updates.email !== undefined ? updates.email : existingUser.email),
        phone: fullProfile.phone !== null && fullProfile.phone !== undefined ? fullProfile.phone : (updates.phone !== undefined ? updates.phone : existingUser.phone),
        address: updates.address !== undefined ? updates.address : existingUser.address, // ✅ Priorité à updates car Supabase n'a pas cette colonne
        walletBalance: existingUser.walletBalance || 0,
        walletTransactions: existingUser.walletTransactions || [],
      };

      localStorage.setItem(userKey, JSON.stringify(updatedUserData));
      console.log('✅ [SYNC] localStorage individuel mis à jour:', userKey, updatedUserData);
    } catch (e) {
      console.error('❌ [SYNC] Erreur localStorage individuel:', e);
    }

    // 4️⃣ Mettre à jour localStorage global (smartcab_all_users)
    try {
      const allUsersStr = localStorage.getItem('smartcab_all_users') || '[]';
      const allUsers: User[] = JSON.parse(allUsersStr);
      
      const userIndex = allUsers.findIndex((u: User) => u.id === userId);
      
      if (userIndex !== -1) {
        // Utilisateur existe, mettre à jour
        allUsers[userIndex] = {
          ...allUsers[userIndex],
          name: fullProfile.full_name !== null && fullProfile.full_name !== undefined ? fullProfile.full_name : (updates.name !== undefined ? updates.name : allUsers[userIndex].name),
          email: fullProfile.email !== null && fullProfile.email !== undefined ? fullProfile.email : (updates.email !== undefined ? updates.email : allUsers[userIndex].email),
          phone: fullProfile.phone !== null && fullProfile.phone !== undefined ? fullProfile.phone : (updates.phone !== undefined ? updates.phone : allUsers[userIndex].phone),
          address: updates.address !== undefined ? updates.address : allUsers[userIndex].address, // ✅ v517.97: Priorité à updates
        };
        
        localStorage.setItem('smartcab_all_users', JSON.stringify(allUsers));
        console.log('✅ [SYNC] smartcab_all_users mis à jour (utilisateur existant)');
      } else {
        // Utilisateur n'existe pas, l'ajouter
        const newUser: User = {
          id: fullProfile.id,
          name: fullProfile.full_name || updates.name || '',
          email: fullProfile.email || updates.email || '',
          phone: fullProfile.phone || updates.phone || '',
          address: updates.address || '', // ✅ v517.97: Utiliser updates.address
          walletBalance: 0,
          walletTransactions: [],
        };
        
        allUsers.push(newUser);
        localStorage.setItem('smartcab_all_users', JSON.stringify(allUsers));
        console.log('✅ [SYNC] smartcab_all_users mis à jour (nouvel utilisateur ajouté)');
      }
    } catch (e) {
      console.error('❌ [SYNC] Erreur smartcab_all_users:', e);
    }

    // 5️⃣ Déclencher un événement personnalisé pour notifier les autres composants
    window.dispatchEvent(new CustomEvent('userProfileUpdated', { 
      detail: { userId, profile: fullProfile } 
    }));
    
    console.log('✅ [SYNC] Synchronisation complète réussie!');
    return true;

  } catch (error) {
    console.error('❌ [SYNC] Erreur lors de la synchronisation:', error);
    return false;
  }
}

/**
 * Charge les données d'un utilisateur depuis Supabase et synchronise localStorage
 */
export async function loadAndSyncUserProfile(userId: string): Promise<User | null> {
  try {
    console.log('📥 [SYNC] Chargement profil depuis Supabase:', userId);

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      console.error('❌ [SYNC] Erreur chargement profil:', error);
      return null;
    }

    // Créer l'objet User
    const user: User = {
      id: profile.id,
      name: profile.full_name || '',
      email: profile.email || '',
      phone: profile.phone || '',
      address: profile.address || '',
      walletBalance: 0, // Sera chargé depuis localStorage si disponible
      walletTransactions: [],
    };

    // Récupérer les données de portefeuille depuis localStorage
    const userKey = `smartcabb_user_${userId}`;
    const localData = localStorage.getItem(userKey);
    if (localData) {
      const parsedLocalData = JSON.parse(localData);
      user.walletBalance = parsedLocalData.walletBalance || 0;
      user.walletTransactions = parsedLocalData.walletTransactions || [];
    }

    // Synchroniser localStorage
    localStorage.setItem(userKey, JSON.stringify(user));

    // Synchroniser smartcab_all_users
    const allUsersStr = localStorage.getItem('smartcab_all_users') || '[]';
    const allUsers: User[] = JSON.parse(allUsersStr);
    const userIndex = allUsers.findIndex((u: User) => u.id === userId);
    
    if (userIndex !== -1) {
      allUsers[userIndex] = user;
    } else {
      allUsers.push(user);
    }
    
    localStorage.setItem('smartcab_all_users', JSON.stringify(allUsers));

    console.log('✅ [SYNC] Profil chargé et synchronisé:', user);
    return user;

  } catch (error) {
    console.error('❌ [SYNC] Erreur loadAndSyncUserProfile:', error);
    return null;
  }
}

/**
 * Synchronise tous les utilisateurs depuis Supabase vers localStorage
 * Utile pour l'admin au démarrage
 */
export async function syncAllUsersFromSupabase(): Promise<void> {
  try {
    console.log('🔄 [SYNC] Synchronisation de tous les utilisateurs depuis Supabase...');

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'passenger');

    if (error || !profiles) {
      console.error('❌ [SYNC] Erreur récupération profiles:', error);
      return;
    }

    // Récupérer les données existantes de localStorage
    const allUsersStr = localStorage.getItem('smartcab_all_users') || '[]';
    const existingUsers: User[] = JSON.parse(allUsersStr);

    // Créer un map des utilisateurs existants pour garder les données de portefeuille
    const existingUsersMap = new Map<string, User>();
    existingUsers.forEach(user => existingUsersMap.set(user.id, user));

    // Créer la liste mise à jour
    const updatedUsers: User[] = profiles.map(profile => {
      const existingUser = existingUsersMap.get(profile.id);
      
      return {
        id: profile.id,
        name: profile.full_name || existingUser?.name || '',
        email: profile.email || existingUser?.email || '',
        phone: profile.phone || existingUser?.phone || '',
        address: profile.address || existingUser?.address || '',
        walletBalance: existingUser?.walletBalance || 0,
        walletTransactions: existingUser?.walletTransactions || [],
      };
    });

    // Sauvegarder dans localStorage
    localStorage.setItem('smartcab_all_users', JSON.stringify(updatedUsers));
    
    console.log(`✅ [SYNC] ${updatedUsers.length} utilisateurs synchronisés depuis Supabase`);

  } catch (error) {
    console.error('❌ [SYNC] Erreur syncAllUsersFromSupabase:', error);
  }
}

/**
 * Écoute les changements en temps réel de Supabase
 */
export function listenToProfileChanges(callback: (payload: any) => void) {
  const channel = supabase
    .channel('profile-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'profiles'
      },
      (payload) => {
        console.log('🔔 [SYNC] Changement détecté dans profiles:', payload);
        callback(payload);
      }
    )
    .subscribe();

  return channel;
}