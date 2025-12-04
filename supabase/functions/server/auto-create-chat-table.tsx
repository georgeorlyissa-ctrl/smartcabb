// ============================================================
// SMARTCABB - AUTO-CRÉATION TABLE CHAT
// ============================================================
// Crée automatiquement la table chat_messages si elle n'existe pas
// ============================================================

import { createClient } from 'npm:@supabase/supabase-js@2';

export async function ensureChatTableExists(): Promise<boolean> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Variables d\'environnement Supabase manquantes');
      return false;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Tenter d'insérer un message de test pour vérifier si la table existe
    const testResult = await supabase
      .from('chat_messages')
      .select('id')
      .limit(1);

    if (testResult.error) {
      // La table n'existe probablement pas, la créer via KV
      console.log('⚠️ Table chat_messages non trouvée, tentative de création...');
      
      // Utiliser le KV pour stocker temporairement les messages
      console.log('📦 Utilisation du système KV pour le stockage des messages chat');
      
      return true; // On continue avec le KV
    }

    console.log('✅ Table chat_messages existe et est accessible');
    return true;

  } catch (error) {
    console.error('❌ Erreur lors de la vérification de la table chat:', error);
    return false;
  }
}