import { Hono } from 'npm:hono';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const authRoutes = new Hono();

// ============================================
// CONNEXION (LOGIN)
// ============================================
authRoutes.post('/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ 
        success: false, 
        error: 'Email et mot de passe requis' 
      }, 400);
    }

    // Créer un client Supabase avec la clé service pour l'authentification
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Connexion avec Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('❌ Erreur authentification:', authError);
      return c.json({ 
        success: false, 
        error: 'Email ou mot de passe incorrect' 
      }, 401);
    }

    if (!authData.user) {
      return c.json({ 
        success: false, 
        error: 'Utilisateur non trouvé' 
      }, 401);
    }

    // Récupérer le profil depuis le KV store
    let profile = await kv.get(`profile:${authData.user.id}`);

    if (!profile) {
      console.log('⚠️ Profil non trouvé pour:', authData.user.id, '- Création automatique...');
      
      // Créer automatiquement le profil s'il n'existe pas
      profile = {
        id: authData.user.id,
        email: authData.user.email || email,
        full_name: authData.user.user_metadata?.full_name || authData.user.user_metadata?.name || email.split('@')[0],
        phone: authData.user.user_metadata?.phone || null,
        role: authData.user.user_metadata?.role || 'admin', // Par défaut admin pour les comptes existants
        balance: 0,
        password: password, // Stocker le mot de passe
        created_at: authData.user.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Sauvegarder le nouveau profil
      await kv.set(`profile:${authData.user.id}`, profile);
      
      // Stocker aussi avec le préfixe du rôle
      const rolePrefix = profile.role === 'driver' ? 'driver:' : profile.role === 'passenger' ? 'passenger:' : 'admin:';
      await kv.set(`${rolePrefix}${authData.user.id}`, profile);
      
      console.log('✅ Profil créé automatiquement pour:', authData.user.id);
    } else {
      // Mettre à jour le mot de passe dans le profil existant
      profile.password = password;
      profile.updated_at = new Date().toISOString();
      await kv.set(`profile:${authData.user.id}`, profile);
      
      // Mettre à jour aussi dans le préfixe du rôle
      const rolePrefix = profile.role === 'driver' ? 'driver:' : profile.role === 'passenger' ? 'passenger:' : 'admin:';
      await kv.set(`${rolePrefix}${authData.user.id}`, profile);
    }

    console.log('✅ Connexion réussie:', authData.user.id, '- Role:', profile.role);

    return c.json({
      success: true,
      user: authData.user,
      profile,
      accessToken: authData.session?.access_token
    });

  } catch (error) {
    console.error('❌ Erreur serveur lors de la connexion:', error);
    return c.json({ 
      success: false, 
      error: 'Erreur serveur lors de la connexion' 
    }, 500);
  }
});

// ============================================
// INSCRIPTION (SIGNUP)
// ============================================
authRoutes.post('/auth/signup', async (c) => {
  try {
    const { email, password, full_name, role } = await c.req.json();
    
    if (!email || !password || !full_name) {
      return c.json({ 
        success: false, 
        error: 'Email, mot de passe et nom complet requis' 
      }, 400);
    }

    if (password.length < 6) {
      return c.json({ 
        success: false, 
        error: 'Le mot de passe doit contenir au moins 6 caractères' 
      }, 400);
    }

    // Créer un client Supabase avec la clé service
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Créer l'utilisateur avec l'Admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirmer l'email
      user_metadata: {
        full_name,
        role: role || 'admin'
      }
    });

    if (authError) {
      console.error('❌ Erreur création utilisateur:', authError);
      
      if (authError.message.includes('already')) {
        return c.json({ 
          success: false, 
          error: 'Un compte existe déjà avec cet email' 
        }, 409);
      }
      
      return c.json({ 
        success: false, 
        error: authError.message 
      }, 400);
    }

    if (!authData.user) {
      return c.json({ 
        success: false, 
        error: 'Erreur lors de la création du compte' 
      }, 500);
    }

    // Créer le profil dans le KV store
    const profile = {
      id: authData.user.id,
      email,
      full_name,
      phone: null,
      role: role || 'admin',
      balance: 0,
      password: password, // ⚠️ Stocker le mot de passe en clair pour le panel admin (dev/test seulement)
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await kv.set(`profile:${authData.user.id}`, profile);
    
    // Stocker aussi avec le préfixe du rôle pour faciliter la récupération
    const rolePrefix = role === 'driver' ? 'driver:' : role === 'passenger' ? 'passenger:' : 'admin:';
    await kv.set(`${rolePrefix}${authData.user.id}`, profile);

    console.log('✅ Compte créé avec succès:', authData.user.id);

    return c.json({
      success: true,
      user: authData.user,
      profile
    });

  } catch (error) {
    console.error('❌ Erreur serveur lors de l\'inscription:', error);
    return c.json({ 
      success: false, 
      error: 'Erreur serveur lors de l\'inscription' 
    }, 500);
  }
});

// ============================================
// VÉRIFICATION DE SESSION
// ============================================
authRoutes.get('/auth/session', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ 
        success: false, 
        error: 'Pas de token fourni' 
      }, 401);
    }

    // Créer un client Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Vérifier le token
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ 
        success: false, 
        error: 'Session invalide' 
      }, 401);
    }

    // Récupérer le profil
    let profile = await kv.get(`profile:${user.id}`);

    if (!profile) {
      // Créer le profil s'il n'existe pas
      profile = {
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Admin',
        phone: user.user_metadata?.phone || null,
        role: user.user_metadata?.role || 'admin',
        balance: 0,
        created_at: user.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      await kv.set(`profile:${user.id}`, profile);
      console.log('✅ Profil créé automatiquement lors de la vérification de session');
    }

    return c.json({
      success: true,
      user,
      profile
    });

  } catch (error) {
    console.error('❌ Erreur vérification session:', error);
    return c.json({ 
      success: false, 
      error: 'Erreur serveur' 
    }, 500);
  }
});

// ============================================
// MOT DE PASSE OUBLIÉ - PAR EMAIL
// ============================================
authRoutes.post('/auth/forgot-password', async (c) => {
  try {
    const { email } = await c.req.json();
    
    if (!email) {
      return c.json({ 
        success: false, 
        error: 'Email requis' 
      }, 400);
    }

    console.log('📧 Demande de réinitialisation pour:', email);

    // Créer un client Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Envoyer l'email de réinitialisation via Supabase Auth
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://chief-mess-97839970.figma.site/auth/reset-password'
    });

    if (error) {
      console.error('❌ Erreur envoi email:', error);
      // Pour la sécurité, ne pas révéler si l'email existe ou non
      return c.json({
        success: true,
        message: 'Si un compte existe avec cet email, un lien a été envoyé'
      });
    }

    console.log('✅ Email de réinitialisation envoyé');

    return c.json({
      success: true,
      message: 'Email envoyé avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur forgot-password:', error);
    return c.json({ 
      success: false, 
      error: 'Erreur serveur' 
    }, 500);
  }
});

// ============================================
// ENDPOINT DE TEST - Vérifier config Africa's Talking
// ============================================
authRoutes.get('/test-sms-config', async (c) => {
  try {
    const username = Deno.env.get('AFRICAS_TALKING_USERNAME') ?? '';
    const apiKey = Deno.env.get('AFRICAS_TALKING_API_KEY') ?? '';

    console.log('🔍 TEST CONFIG SMS');
    console.log('Username présent:', !!username);
    console.log('Username value:', username || 'VIDE');
    console.log('API Key présente:', !!apiKey);
    console.log('API Key (10 premiers char):', apiKey ? apiKey.substring(0, 10) + '...' : 'VIDE');

    return c.json({
      success: true,
      config: {
        username_present: !!username,
        username_value: username || 'NON CONFIGURÉ',
        api_key_present: !!apiKey,
        api_key_preview: apiKey ? apiKey.substring(0, 10) + '...' : 'NON CONFIGURÉ'
      }
    });
  } catch (error) {
    console.error('❌ Erreur test config:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// ENDPOINT DE TEST - Envoyer un SMS réel
// ============================================
authRoutes.post('/test-sms-send', async (c) => {
  try {
    const { phoneNumber } = await c.req.json();
    
    if (!phoneNumber) {
      return c.json({ 
        success: false, 
        error: 'Numéro de téléphone requis' 
      }, 400);
    }

    console.log('🧪 TEST ENVOI SMS à:', phoneNumber);

    // Récupérer les credentials
    const username = Deno.env.get('AFRICAS_TALKING_USERNAME') ?? '';
    const apiKey = Deno.env.get('AFRICAS_TALKING_API_KEY') ?? '';

    console.log('🔑 Username présent:', !!username);
    console.log('🔑 Username value:', username || 'VIDE');
    console.log('🔑 API Key présente:', !!apiKey);
    console.log('🔑 API Key length:', apiKey?.length || 0);

    // Vérifier les credentials
    if (!username || !apiKey || username.trim() === '' || apiKey.trim() === '') {
      console.error('❌ Credentials manquantes');
      
      return c.json({ 
        success: false,
        error: 'Configuration SMS manquante. Veuillez configurer Africa\'s Talking dans les paramètres.',
        debug: {
          username_present: !!username,
          username_value: username || 'MANQUANT',
          api_key_present: !!apiKey,
          api_key_length: apiKey?.length || 0
        }
      }, 500);
    }

    // Générer un code de test
    const testCode = Math.floor(100000 + Math.random() * 900000).toString();
    const smsMessage = `SmartCabb TEST: Votre code est ${testCode}. Ceci est un message de test.`;

    console.log('📤 Envoi SMS de test...');
    console.log('📝 Message:', smsMessage);

    try {
      const smsResponse = await fetch('https://api.africastalking.com/version1/messaging', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'apiKey': apiKey,
          'Accept': 'application/json'
        },
        body: new URLSearchParams({
          username: username,
          to: phoneNumber,
          message: smsMessage
        }).toString()
      });

      const smsResult = await smsResponse.json();
      console.log('📥 Résultat Africa\'s Talking:', JSON.stringify(smsResult, null, 2));

      // Vérifier le statut
      const status = smsResult.SMSMessageData?.Recipients?.[0]?.status;
      const messageId = smsResult.SMSMessageData?.Recipients?.[0]?.messageId;
      const cost = smsResult.SMSMessageData?.Recipients?.[0]?.cost;

      if (status === 'Success' || status === 'Sent') {
        console.log('✅ SMS envoyé avec succès !');
        return c.json({
          success: true,
          message: 'SMS envoyé avec succès',
          testCode: testCode,
          smsDetails: {
            status: status,
            messageId: messageId,
            cost: cost,
            phoneNumber: phoneNumber
          },
          rawResponse: smsResult
        });
      } else {
        console.error('❌ Échec envoi SMS:', status);
        return c.json({
          success: false,
          error: `Échec envoi SMS: ${status}`,
          testCode: testCode,
          smsDetails: {
            status: status || 'Unknown',
            messageId: messageId,
            phoneNumber: phoneNumber
          },
          rawResponse: smsResult
        }, 500);
      }

    } catch (smsError) {
      console.error('❌ Erreur lors de l\'appel API:', smsError);
      return c.json({ 
        success: false, 
        error: 'Erreur lors de l\'appel à Africa\'s Talking: ' + String(smsError),
        testCode: testCode
      }, 500);
    }

  } catch (error) {
    console.error('❌ Erreur test-sms-send:', error);
    return c.json({ 
      success: false, 
      error: 'Erreur serveur: ' + String(error) 
    }, 500);
  }
});

// ============================================
// RÉINITIALISATION PAR TÉLÉPHONE - ÉTAPE 1 : ENVOYER OTP
// ============================================
authRoutes.post('/send-reset-otp', async (c) => {
  try {
    const { phoneNumber } = await c.req.json();
    
    if (!phoneNumber) {
      return c.json({ 
        success: false, 
        error: 'Numéro de téléphone requis' 
      }, 400);
    }

    console.log('📞 Demande de réinitialisation pour:', phoneNumber);

    // Créer un client Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 🔧 CORRIGER : Chercher dans la table profiles au lieu du KV store
    console.log('🔍 Recherche du profil dans la table profiles...');
    
    // Normaliser le numéro pour la recherche (plusieurs formats possibles)
    const normalizePhone = (phone: string): string[] => {
      const clean = phone.replace(/[\s\-()]/g, '');
      const formats = [clean];
      
      if (clean.startsWith('+243')) {
        formats.push(clean.substring(4)); // Sans +243
        formats.push('0' + clean.substring(4)); // Avec 0
        formats.push(clean.substring(1)); // Sans +
      } else if (clean.startsWith('243')) {
        formats.push('+' + clean); // Avec +
        formats.push('0' + clean.substring(3)); // Avec 0
      } else if (clean.startsWith('0')) {
        formats.push('+243' + clean.substring(1)); // Avec +243
        formats.push('243' + clean.substring(1)); // Avec 243
      }
      
      return [...new Set(formats)]; // Enlever les doublons
    };
    
    const phoneFormats = normalizePhone(phoneNumber);
    console.log('🔍 Formats de téléphone à chercher:', phoneFormats);
    
    // Chercher l'utilisateur dans la table profiles
    const { data: profiles, error: searchError } = await supabase
      .from('profiles')
      .select('id, email, phone, full_name')
      .in('phone', phoneFormats)
      .limit(1);
    
    if (searchError) {
      console.error('❌ Erreur recherche profil:', searchError);
    }
    
    console.log('📊 Profils trouvés:', profiles?.length || 0);
    if (profiles && profiles.length > 0) {
      console.log('✅ Profil trouvé:', { id: profiles[0].id, email: profiles[0].email, phone: profiles[0].phone });
    }

    let userProfile = profiles && profiles.length > 0 ? profiles[0] : null;
    let userId = userProfile?.id || null;

    if (!userProfile || !userId) {
      // Pour la sécurité, ne pas révéler si le numéro existe ou non
      console.log('⚠️ Aucun utilisateur trouvé avec ce numéro:', phoneNumber);
      console.log('⚠️ Formats testés:', phoneFormats);
      
      // ❌ NE PAS ENVOYER DE CODE SI LE COMPTE N'EXISTE PAS
      return c.json({ 
        success: false,
        error: 'Aucun compte trouvé avec ce numéro. Veuillez créer un compte.'
      }, 404);
    }

    // Générer un code OTP à 6 chiffres
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Stocker le code OTP dans le KV store avec expiration de 13 minutes
    const otpData = {
      code: otpCode,
      userId: userId,
      phoneNumber: phoneNumber,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 13 * 60 * 1000).toISOString(), // 13 minutes
      used: false
    };

    await kv.set(`reset_otp:${phoneNumber}`, otpData);

    console.log('✅ Code OTP généré:', otpCode, 'pour', phoneNumber, 'userId:', userId);

    // Envoyer le SMS via Africa's Talking
    const username = Deno.env.get('AFRICAS_TALKING_USERNAME') ?? '';
    const apiKey = Deno.env.get('AFRICAS_TALKING_API_KEY') ?? '';

    console.log('🔑 Africa\'s Talking - Username présent:', !!username);
    console.log('🔑 Africa\'s Talking - Username value:', username || 'VIDE');
    console.log('🔑 Africa\'s Talking - API Key présente:', !!apiKey);
    console.log('🔑 Africa\'s Talking - API Key length:', apiKey?.length || 0);

    if (!username || !apiKey || username.trim() === '' || apiKey.trim() === '') {
      console.error('❌ Africa\'s Talking credentials manquantes ou vides');
      console.error('Username:', username || 'MANQUANT');
      console.error('Username length:', username?.length || 0);
      console.error('API Key:', apiKey ? `présente (${apiKey.length} chars)` : 'MANQUANTE');
      
      return c.json({ 
        success: false,
        error: 'Configuration SMS manquante. Impossible d\'envoyer le code OTP.'
      }, 500);
    }

    console.log('✅ Credentials OK, envoi du SMS via Africa\'s Talking...');

    try {
      const smsMessage = `SmartCabb: Votre code de réinitialisation est ${otpCode}. Valide pendant 13 minutes. Ne partagez ce code avec personne.`;

      console.log('📤 Envoi SMS à:', phoneNumber);
      console.log('📝 Message:', smsMessage);

      const smsResponse = await fetch('https://api.africastalking.com/version1/messaging', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'apiKey': apiKey,
          'Accept': 'application/json'
        },
        body: new URLSearchParams({
          username: username,
          to: phoneNumber,
          message: smsMessage,
          from: 'SMARTCABB' // ✅ Sender ID officiel SmartCabb
        }).toString()
      });

      const smsResult = await smsResponse.json();
      console.log('📤 Résultat envoi SMS:', JSON.stringify(smsResult, null, 2));

      // Enregistrer le SMS dans la table
      try {
        await supabase
          .from('sms_logs')
          .insert({
            phone_number: phoneNumber,
            message: smsMessage,
            status: smsResult.SMSMessageData?.Recipients?.[0]?.status || 'unknown',
            provider: 'africas_talking',
            type: 'reset_password_otp',
            metadata: { otpCode: otpCode, response: smsResult }
          });
      } catch (error) {
        console.warn('⚠️ Impossible d\'enregistrer le SMS dans la table:', error);
      }

      // Vérifier si l'envoi a réussi
      const status = smsResult.SMSMessageData?.Recipients?.[0]?.status;
      if (status && status !== 'Success') {
        console.error('❌ Échec envoi SMS:', status);
        return c.json({
          success: false,
          error: `Échec envoi SMS: ${status}`
        }, 500);
      }

      return c.json({
        success: true,
        userId: userId,
        message: 'Code envoyé par SMS'
      });

    } catch (smsError) {
      console.error('❌ Erreur envoi SMS:', smsError);
      return c.json({ 
        success: false, 
        error: 'Erreur lors de l\'envoi du SMS: ' + String(smsError)
      }, 500);
    }

  } catch (error) {
    console.error('❌ Erreur send-reset-otp:', error);
    return c.json({ 
      success: false, 
      error: 'Erreur serveur: ' + String(error)
    }, 500);
  }
});

// ============================================
// RÉINITIALISATION PAR TÉLÉPHONE - ÉTAPE 2 : VÉRIFIER OTP
// ============================================
authRoutes.post('/verify-reset-otp', async (c) => {
  try {
    const { phoneNumber, otpCode, userId } = await c.req.json();
    
    if (!phoneNumber || !otpCode) {
      return c.json({ 
        success: false, 
        error: 'Numéro et code requis' 
      }, 400);
    }

    console.log('🔍 Vérification OTP pour:', phoneNumber);

    // Récupérer le code OTP stocké
    const otpData = await kv.get(`reset_otp:${phoneNumber}`);

    if (!otpData) {
      console.log('❌ Aucun code OTP trouvé pour ce numéro');
      return c.json({ 
        success: false, 
        error: 'Code invalide ou expiré' 
      }, 400);
    }

    // Vérifier si le code a expiré
    const expiresAt = new Date(otpData.expiresAt);
    if (new Date() > expiresAt) {
      console.log('❌ Code OTP expiré');
      await kv.del(`reset_otp:${phoneNumber}`);
      return c.json({ 
        success: false, 
        error: 'Code expiré. Demandez un nouveau code.' 
      }, 400);
    }

    // Vérifier si le code a déjà été utilisé
    if (otpData.used) {
      console.log('❌ Code OTP déjà utilisé');
      return c.json({ 
        success: false, 
        error: 'Code déjà utilisé. Demandez un nouveau code.' 
      }, 400);
    }

    // Vérifier le code
    if (otpData.code !== otpCode) {
      console.log('❌ Code OTP incorrect');
      return c.json({ 
        success: false, 
        error: 'Code incorrect' 
      }, 400);
    }

    console.log('✅ Code OTP valide pour:', phoneNumber);

    // Marquer le code comme vérifié (mais pas encore utilisé)
    otpData.verified = true;
    otpData.verifiedAt = new Date().toISOString();
    await kv.set(`reset_otp:${phoneNumber}`, otpData);

    return c.json({
      success: true,
      message: 'Code vérifié avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur verify-reset-otp:', error);
    return c.json({ 
      success: false, 
      error: 'Erreur serveur' 
    }, 500);
  }
});

// ============================================
// RÉINITIALISATION PAR TÉLÉPHONE - ÉTAPE 3 : CHANGER MOT DE PASSE
// ============================================
authRoutes.post('/reset-password-by-phone', async (c) => {
  try {
    const { userId, phoneNumber, otpCode, newPassword } = await c.req.json();
    
    if (!phoneNumber || !otpCode || !newPassword) {
      return c.json({ 
        success: false, 
        error: 'Tous les champs sont requis' 
      }, 400);
    }

    if (newPassword.length < 6) {
      return c.json({ 
        success: false, 
        error: 'Le mot de passe doit contenir au moins 6 caractères' 
      }, 400);
    }

    console.log('🔄 Réinitialisation du mot de passe pour:', phoneNumber);

    // Vérifier le code OTP une dernière fois
    const otpData = await kv.get(`reset_otp:${phoneNumber}`);

    if (!otpData || !otpData.verified || otpData.used) {
      return c.json({ 
        success: false, 
        error: 'Code invalide, non vérifié ou déjà utilisé' 
      }, 400);
    }

    // Vérifier expiration
    const expiresAt = new Date(otpData.expiresAt);
    if (new Date() > expiresAt) {
      await kv.del(`reset_otp:${phoneNumber}`);
      return c.json({ 
        success: false, 
        error: 'Code expiré' 
      }, 400);
    }

    // Créer un client Supabase Admin
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Mettre à jour le mot de passe de l'utilisateur
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      otpData.userId,
      { password: newPassword }
    );

    if (updateError) {
      console.error('❌ Erreur mise à jour mot de passe:', updateError);
      return c.json({ 
        success: false, 
        error: 'Erreur lors de la mise à jour du mot de passe' 
      }, 500);
    }

    console.log('✅ Mot de passe mis à jour pour:', otpData.userId);

    // Marquer le code comme utilisé
    otpData.used = true;
    otpData.usedAt = new Date().toISOString();
    await kv.set(`reset_otp:${phoneNumber}`, otpData);

    // Supprimer le code après 1 minute (pour éviter la réutilisation)
    setTimeout(async () => {
      await kv.del(`reset_otp:${phoneNumber}`);
    }, 60000);

    return c.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur reset-password-by-phone:', error);
    return c.json({ 
      success: false, 
      error: 'Erreur serveur' 
    }, 500);
  }
});

// ============================================
// VÉRIFIER SI UN NUMÉRO DE TÉLÉPHONE EXISTE
// ============================================
authRoutes.post('/auth/check-phone-exists', async (c) => {
  try {
    const { phoneNumber } = await c.req.json();
    
    if (!phoneNumber) {
      return c.json({ 
        success: false, 
        error: 'Numéro de téléphone requis' 
      }, 400);
    }

    console.log('🔍 Vérification existence du numéro:', phoneNumber);

    // Normaliser le numéro de téléphone
    const normalizePhone = (phone: string): string[] => {
      const clean = phone.replace(/[\s\-()]/g, '');
      const formats: string[] = [clean];
      
      if (clean.startsWith('+243')) {
        const digits = clean.substring(4);
        formats.push(`+243${digits}`);
        formats.push(`243${digits}`);
        formats.push(`0${digits}`);
      } else if (clean.startsWith('243')) {
        const digits = clean.substring(3);
        formats.push(`+243${digits}`);
        formats.push(`243${digits}`);
        formats.push(`0${digits}`);
      } else if (clean.startsWith('0')) {
        const digits = clean.substring(1);
        formats.push(`+243${digits}`);
        formats.push(`243${digits}`);
        formats.push(`0${digits}`);
      }
      
      return [...new Set(formats)];
    };

    const phoneFormats = normalizePhone(phoneNumber);
    console.log('📱 Formats à chercher:', phoneFormats);

    // 🔥 CHERCHER DANS LE KV STORE AU LIEU DE LA TABLE PROFILES
    console.log('🔍 Recherche dans le KV store...');
    
    // Chercher dans tous les profils du KV store
    const allProfiles = await kv.getByPrefix('profile:');
    console.log(`📊 ${allProfiles.length} profils trouvés dans le KV store`);
    
    let foundEmail = null;
    let foundProfile = null;
    
    for (const profileData of allProfiles) {
      if (profileData && profileData.phone) {
        // Vérifier si le téléphone correspond à un des formats
        if (phoneFormats.includes(profileData.phone)) {
          foundEmail = profileData.email;
          foundProfile = profileData;
          console.log('✅ Profil trouvé dans KV:', { id: profileData.id, email: profileData.email, phone: profileData.phone });
          break;
        }
      }
    }
    
    if (!foundEmail) {
      console.log('❌ Aucun profil trouvé avec ce numéro dans le KV store');
      return c.json({
        success: true,
        exists: false
      });
    }

    return c.json({
      success: true,
      exists: true,
      email: foundEmail
    });

  } catch (error) {
    console.error('❌ Erreur check-phone-exists:', error);
    return c.json({ 
      success: false, 
      error: 'Erreur serveur' 
    }, 500);
  }
});

// ============================================
// 🔥 NOUVELLE ROUTE : RÉCUPÉRER L'EMAIL PAR TÉLÉPHONE (KV STORE)
// ============================================
authRoutes.post('/auth/get-email-by-phone', async (c) => {
  try {
    const { phoneNumber } = await c.req.json();
    
    if (!phoneNumber) {
      return c.json({ 
        success: false, 
        error: 'Numéro de téléphone requis' 
      }, 400);
    }

    console.log('🔥 Récupération email par téléphone (KV store):', phoneNumber);

    // Normaliser le numéro de téléphone
    const normalizePhone = (phone: string): string[] => {
      const clean = phone.replace(/[\s\-()]/g, '');
      const formats: string[] = [clean];
      
      if (clean.startsWith('+243')) {
        const digits = clean.substring(4);
        formats.push(`+243${digits}`);
        formats.push(`243${digits}`);
        formats.push(`0${digits}`);
      } else if (clean.startsWith('243')) {
        const digits = clean.substring(3);
        formats.push(`+243${digits}`);
        formats.push(`243${digits}`);
        formats.push(`0${digits}`);
      } else if (clean.startsWith('0')) {
        const digits = clean.substring(1);
        formats.push(`+243${digits}`);
        formats.push(`243${digits}`);
        formats.push(`0${digits}`);
      }
      
      return [...new Set(formats)];
    };

    const phoneFormats = normalizePhone(phoneNumber);
    console.log('📱 Formats à chercher:', phoneFormats);

    // 🔥 CHERCHER DANS LE KV STORE
    console.log('🔍 Recherche dans le KV store...');
    
    // Chercher dans tous les profils
    const allProfiles = await kv.getByPrefix('profile:');
    console.log(`📊 ${allProfiles.length} profils trouvés`);
    
    for (const profileData of allProfiles) {
      if (profileData && profileData.phone) {
        // Vérifier si le téléphone correspond
        if (phoneFormats.includes(profileData.phone)) {
          console.log('✅ Profil trouvé (KV) avec phone:', profileData.phone);
          
          // 🔥 CRITIQUE : Récupérer l'email Auth RÉEL depuis Supabase (pas l'email du profil)
          console.log('🔍 Récupération de l\'email Auth depuis Supabase...');
          try {
            const { createClient } = await import('npm:@supabase/supabase-js@2');
            const supabase = createClient(
              Deno.env.get('SUPABASE_URL') ?? '',
              Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
            );
            
            const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(profileData.id);
            
            if (authError || !authUser || !authUser.user || !authUser.user.email) {
              console.error('❌ Erreur récupération Auth user:', authError);
              console.log('⚠️ Fallback : utilisation de l\'email du profil');
              return c.json({
                success: true,
                email: profileData.email,
                userId: profileData.id
              });
            }
            
            const authEmail = authUser.user.email;
            console.log(`✅ Email Auth trouvé: ${authEmail} (email profil: ${profileData.email})`);
            
            // ✅ RETOURNER L'EMAIL AUTH (pas l'email du profil)
            return c.json({
              success: true,
              email: authEmail,  // Email réel dans Supabase Auth
              profileEmail: profileData.email,  // Email dans le profil (peut être différent)
              userId: profileData.id
            });
          } catch (error) {
            console.error('❌ Erreur accès Supabase Auth:', error);
            // Fallback : utiliser l'email du profil
            return c.json({
              success: true,
              email: profileData.email,
              userId: profileData.id
            });
          }
        }
      }
    }
    
    // Si pas trouvé dans profile:, chercher dans user:, passenger:, driver:
    console.log('🔍 Recherche dans user:...');
    const allUsers = await kv.getByPrefix('user:');
    console.log(`📊 ${allUsers.length} users trouvés`);
    
    for (const userData of allUsers) {
      if (userData && userData.phone) {
        if (phoneFormats.includes(userData.phone)) {
          console.log('✅ User trouvé (user:) avec phone:', userData.phone);
          
          try {
            const { createClient } = await import('npm:@supabase/supabase-js@2');
            const supabase = createClient(
              Deno.env.get('SUPABASE_URL') ?? '',
              Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
            );
            
            const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userData.id);
            
            if (authError || !authUser || !authUser.user || !authUser.user.email) {
              return c.json({
                success: true,
                email: userData.email,
                userId: userData.id
              });
            }
            
            const authEmail = authUser.user.email;
            console.log(`✅ Email Auth trouvé: ${authEmail}`);
            
            return c.json({
              success: true,
              email: authEmail,
              profileEmail: userData.email,
              userId: userData.id
            });
          } catch (error) {
            return c.json({
              success: true,
              email: userData.email,
              userId: userData.id
            });
          }
        }
      }
    }
    
    console.log('🔍 Recherche dans passenger:...');
    const allPassengers = await kv.getByPrefix('passenger:');
    console.log(`📊 ${allPassengers.length} passengers trouvés`);
    
    for (const passengerData of allPassengers) {
      if (passengerData && passengerData.phone) {
        if (phoneFormats.includes(passengerData.phone)) {
          console.log('✅ Passenger trouvé (passenger:) avec phone:', passengerData.phone);
          
          try {
            const { createClient } = await import('npm:@supabase/supabase-js@2');
            const supabase = createClient(
              Deno.env.get('SUPABASE_URL') ?? '',
              Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
            );
            
            const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(passengerData.id);
            
            if (authError || !authUser || !authUser.user || !authUser.user.email) {
              return c.json({
                success: true,
                email: passengerData.email,
                userId: passengerData.id
              });
            }
            
            const authEmail = authUser.user.email;
            console.log(`✅ Email Auth trouvé: ${authEmail}`);
            
            return c.json({
              success: true,
              email: authEmail,
              profileEmail: passengerData.email,
              userId: passengerData.id
            });
          } catch (error) {
            return c.json({
              success: true,
              email: passengerData.email,
              userId: passengerData.id
            });
          }
        }
      }
    }
    
    console.log('🔍 Recherche dans driver:...');
    const allDrivers = await kv.getByPrefix('driver:');
    console.log(`📊 ${allDrivers.length} drivers trouvés`);
    
    for (const driverData of allDrivers) {
      if (driverData && driverData.phone) {
        if (phoneFormats.includes(driverData.phone)) {
          console.log('✅ Driver trouvé (driver:) avec phone:', driverData.phone);
          
          try {
            const { createClient } = await import('npm:@supabase/supabase-js@2');
            const supabase = createClient(
              Deno.env.get('SUPABASE_URL') ?? '',
              Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
            );
            
            const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(driverData.id);
            
            if (authError || !authUser || !authUser.user || !authUser.user.email) {
              return c.json({
                success: true,
                email: driverData.email,
                userId: driverData.id
              });
            }
            
            const authEmail = authUser.user.email;
            console.log(`✅ Email Auth trouvé: ${authEmail}`);
            
            return c.json({
              success: true,
              email: authEmail,
              profileEmail: driverData.email,
              userId: driverData.id
            });
          } catch (error) {
            return c.json({
              success: true,
              email: driverData.email,
              userId: driverData.id
            });
          }
        }
      }
    }
    
    console.log('❌ Aucun compte trouvé avec ce numéro:', phoneNumber);
    return c.json({
      success: false,
      error: 'Aucun compte trouvé avec ce numéro'
    }, 404);

  } catch (error) {
    console.error('❌ Erreur get-email-by-phone:', error);
    return c.json({ 
      success: false, 
      error: 'Erreur serveur: ' + String(error)
    }, 500);
  }
});

// ============================================
// RÉINITIALISATION PAR TÉLÉPHONE - VERSION SIMPLIFIÉE
// ============================================
authRoutes.post('/auth/reset-password-phone', async (c) => {
  try {
    const { phoneNumber, newPassword } = await c.req.json();
    
    if (!phoneNumber || !newPassword) {
      return c.json({ 
        success: false, 
        error: 'Numéro et mot de passe requis' 
      }, 400);
    }

    if (newPassword.length < 6) {
      return c.json({ 
        success: false, 
        error: 'Le mot de passe doit contenir au moins 6 caractères' 
      }, 400);
    }

    console.log('🔄 Réinitialisation du mot de passe pour:', phoneNumber);

    // Créer un client Supabase Admin
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 🔧 NORMALISER LE NUMÉRO DE TÉLÉPHONE POUR LA RECHERCHE
    // Accepter tous les formats : +243XXX, 243XXX, 0XXX
    const normalizePhone = (phone: string): string[] => {
      const clean = phone.replace(/[\s\-()]/g, ''); // Enlever espaces, tirets, parenthèses
      const formats: string[] = [clean]; // Format original
      
      // Si commence par +243
      if (clean.startsWith('+243')) {
        const digits = clean.substring(4); // Les chiffres après +243
        formats.push(`+243${digits}`);
        formats.push(`243${digits}`);
        formats.push(`0${digits}`);
      }
      // Si commence par 243 (sans +)
      else if (clean.startsWith('243')) {
        const digits = clean.substring(3);
        formats.push(`+243${digits}`);
        formats.push(`243${digits}`);
        formats.push(`0${digits}`);
      }
      // Si commence par 0
      else if (clean.startsWith('0')) {
        const digits = clean.substring(1);
        formats.push(`+243${digits}`);
        formats.push(`243${digits}`);
        formats.push(`0${digits}`);
      }
      
      return [...new Set(formats)]; // Retirer les doublons
    };

    const phoneFormats = normalizePhone(phoneNumber);
    console.log('🔍 Formats de numéro à rechercher:', phoneFormats);

    // Chercher l'utilisateur par numéro de téléphone dans TOUS les types de profils
    // (passenger:, driver:, profile:, admin:)
    console.log('🔍 Recherche dans le KV store...');
    console.log('🔍 Numéro recherché (original):', phoneNumber);
    
    let userProfile = null;
    let userId = null;
    let profileType = '';

    // Chercher dans passenger:
    const passengers = await kv.getByPrefix('passenger:');
    console.log('📊 Nombre de passagers dans KV:', passengers?.length || 0);
    if (passengers && passengers.length > 0) {
      console.log('📋 Premiers passagers (debug):', passengers.slice(0, 3).map((p: any) => ({ id: p.id, phone: p.phone, full_name: p.full_name })));
      // ✅ RECHERCHE AVEC NORMALISATION
      const found = passengers.find((p: any) => {
        const profilePhone = p.phone || p.phone_number || '';
        const profileFormats = normalizePhone(profilePhone);
        // Vérifier si un des formats correspond
        return phoneFormats.some(format => profileFormats.includes(format));
      });
      if (found) {
        userProfile = found;
        userId = found.id;
        profileType = 'passenger';
        console.log('✅ Passager trouvé:', userId, 'avec numéro:', found.phone);
      } else {
        console.log('❌ Aucun passager trouvé avec le numéro:', phoneNumber);
        console.log('🔍 Tous les numéros de passagers:', passengers.map((p: any) => p.phone || p.phone_number));
      }
    }

    // Si pas trouvé, chercher dans driver:
    if (!userProfile) {
      const drivers = await kv.getByPrefix('driver:');
      console.log('📊 Nombre de conducteurs dans KV:', drivers?.length || 0);
      if (drivers && drivers.length > 0) {
        const found = drivers.find((d: any) => {
          const profilePhone = d.phone || d.phone_number || '';
          const profileFormats = normalizePhone(profilePhone);
          return phoneFormats.some(format => profileFormats.includes(format));
        });
        if (found) {
          userProfile = found;
          userId = found.id;
          profileType = 'driver';
          console.log('✅ Conducteur trouvé:', userId);
        }
      }
    }

    // Si pas trouvé, chercher dans profile:
    if (!userProfile) {
      const profiles = await kv.getByPrefix('profile:');
      console.log('📊 Nombre de profils dans KV:', profiles?.length || 0);
      if (profiles && profiles.length > 0) {
        const found = profiles.find((p: any) => {
          const profilePhone = p.phone || p.phone_number || '';
          const profileFormats = normalizePhone(profilePhone);
          return phoneFormats.some(format => profileFormats.includes(format));
        });
        if (found) {
          userProfile = found;
          userId = found.id;
          profileType = 'profile';
          console.log('✅ Profil trouvé:', userId);
        }
      }
    }

    console.log('📊 Résultat recherche:', { found: !!userProfile, type: profileType, userId });

    if (!userProfile || !userId) {
      console.error('❌ Utilisateur non trouvé avec le numéro:', phoneNumber);
      
      return c.json({ 
        success: false, 
        error: 'Aucun compte trouvé avec ce numéro de téléphone' 
      }, 404);
    }

    console.log('👤 Utilisateur trouvé:', userId, 'Type:', profileType);

    // Mettre à jour le mot de passe de l'utilisateur
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (updateError) {
      console.error('❌ Erreur mise à jour mot de passe:', updateError);
      return c.json({ 
        success: false, 
        error: 'Erreur lors de la mise à jour du mot de passe' 
      }, 500);
    }

    console.log('✅ Mot de passe mis à jour pour:', userId);

    return c.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur reset-password-phone:', error);
    return c.json({ 
      success: false, 
      error: 'Erreur serveur: ' + String(error)
    }, 500);
  }
});

// ============================================
// CRÉER UN COMPTE AUTH.USERS À PARTIR D'UN PROFIL EXISTANT
// ============================================
authRoutes.post('/create-auth-from-profile', async (c) => {
  try {
    const { email, password, phoneNumber } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ 
        success: false, 
        error: 'Email et mot de passe requis' 
      }, 400);
    }

    if (password.length < 6) {
      return c.json({ 
        success: false, 
        error: 'Le mot de passe doit contenir au moins 6 caractères' 
      }, 400);
    }

    console.log('🔧 Création compte auth.users pour:', email);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Vérifier si le profil existe dans profiles
    const { data: profiles, error: searchError } = await supabase
      .from('profiles')
      .select('id, email, phone, full_name, role')
      .eq('email', email)
      .limit(1);
    
    if (searchError) {
      console.error('❌ Erreur recherche profil:', searchError);
      return c.json({ 
        success: false, 
        error: 'Erreur lors de la recherche du profil' 
      }, 500);
    }

    if (!profiles || profiles.length === 0) {
      return c.json({ 
        success: false, 
        error: 'Aucun profil trouvé avec cet email' 
      }, 404);
    }

    const profile = profiles[0];
    console.log('✅ Profil trouvé:', profile.id);

    // Vérifier si le compte auth.users existe déjà
    const { data: existingUser } = await supabase.auth.admin.getUserById(profile.id);
    
    if (existingUser && existingUser.user) {
      return c.json({ 
        success: false, 
        error: 'Un compte existe déjà. Utilisez "Mot de passe oublié" pour le réinitialiser.' 
      }, 400);
    }

    // Créer le compte dans auth.users avec l'ID du profil
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      id: profile.id, // Utiliser le même ID que le profil
      email: email,
      password: password,
      email_confirm: true, // Auto-confirmer l'email
      user_metadata: {
        name: profile.full_name,
        fullName: profile.full_name,
        phone: profile.phone || phoneNumber,
        role: profile.role
      }
    });

    if (createError) {
      console.error('❌ Erreur création compte:', createError);
      return c.json({ 
        success: false, 
        error: 'Erreur lors de la création du compte: ' + createError.message 
      }, 500);
    }

    console.log('✅ Compte auth.users créé avec succès:', newUser.user?.id);

    return c.json({
      success: true,
      message: 'Compte créé avec succès',
      userId: newUser.user?.id
    });

  } catch (error) {
    console.error('❌ Erreur create-auth-from-profile:', error);
    return c.json({ 
      success: false, 
      error: 'Erreur serveur: ' + String(error)
    }, 500);
  }
});

// ============================================
// VÉRIFIER SI UN PROFIL ORPHELIN EXISTE
// ============================================
authRoutes.post('/check-orphan-profile', async (c) => {
  try {
    const { identifier } = await c.req.json();
    
    if (!identifier) {
      return c.json({ 
        success: false, 
        error: 'Identifiant requis' 
      }, 400);
    }

    console.log('🔍 Vérification profil orphelin pour:', identifier);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Chercher dans profiles par email ou téléphone
    const { data: profiles, error: searchError } = await supabase
      .from('profiles')
      .select('id, email, phone, full_name, role')
      .or(`email.eq.${identifier},phone.eq.${identifier}`)
      .limit(1);
    
    if (searchError) {
      console.error('❌ Erreur recherche profil:', searchError);
      return c.json({ 
        success: false, 
        hasOrphanProfile: false
      });
    }

    if (!profiles || profiles.length === 0) {
      console.log('❌ Aucun profil trouvé');
      return c.json({ 
        success: true, 
        hasOrphanProfile: false
      });
    }

    const profile = profiles[0];
    console.log('✅ Profil trouvé:', profile.id);

    // Vérifier si le compte auth.users existe
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(profile.id);
    
    if (authUser && authUser.user) {
      console.log('✅ Compte auth.users existe');
      return c.json({ 
        success: true, 
        hasOrphanProfile: false,
        hasAuthAccount: true
      });
    }

    console.log('⚠️ PROFIL ORPHELIN DÉTECTÉ');
    return c.json({ 
      success: true, 
      hasOrphanProfile: true,
      profile: {
        email: profile.email,
        phone: profile.phone,
        fullName: profile.full_name,
        role: profile.role
      }
    });

  } catch (error) {
    console.error('❌ Erreur check-orphan-profile:', error);
    return c.json({ 
      success: false, 
      error: 'Erreur serveur: ' + String(error)
    }, 500);
  }
});

// ============================================
// TROUVER L'EMAIL À PARTIR DU NUMÉRO DE TÉLÉPHONE
// ============================================
authRoutes.post('/find-email-by-phone', async (c) => {
  try {
    const { phoneNumber } = await c.req.json();
    
    if (!phoneNumber) {
      return c.json({ 
        success: false, 
        error: 'Numéro de téléphone requis' 
      }, 400);
    }

    console.log('🔍 Recherche email pour le numéro:', phoneNumber);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Normaliser le numéro de téléphone (enlever les espaces, +, etc.)
    const cleanPhone = phoneNumber.replace(/[\s\-\+\(\)]/g, '');
    
    // Chercher dans profiles par différents formats de téléphone
    const phoneFormats = [
      cleanPhone,
      `+${cleanPhone}`,
      cleanPhone.startsWith('243') ? cleanPhone : `243${cleanPhone}`,
      cleanPhone.startsWith('0') ? `243${cleanPhone.substring(1)}` : null,
    ].filter(Boolean);

    console.log('🔍 Formats de téléphone à essayer:', phoneFormats);

    // Construire la requête OR pour tous les formats
    const orQuery = phoneFormats.map(format => `phone.eq.${format}`).join(',');

    const { data: profiles, error: searchError } = await supabase
      .from('profiles')
      .select('id, email, phone, full_name')
      .or(orQuery)
      .limit(1);
    
    if (searchError) {
      console.error('❌ Erreur recherche profil:', searchError);
      return c.json({ 
        success: false, 
        error: 'Erreur lors de la recherche' 
      }, 500);
    }

    if (!profiles || profiles.length === 0) {
      console.log('❌ Aucun profil trouvé pour ce numéro');
      return c.json({ 
        success: false, 
        error: 'Aucun compte trouvé avec ce numéro de téléphone'
      }, 404);
    }

    const profile = profiles[0];
    console.log('✅ Profil trouvé:', profile.email);

    // Vérifier que le compte auth.users existe
    const { data: authUser } = await supabase.auth.admin.getUserById(profile.id);
    
    if (!authUser || !authUser.user) {
      console.log('⚠️ Profil orphelin détecté');
      return c.json({ 
        success: false, 
        error: 'ORPHAN_PROFILE',
        profile: {
          email: profile.email,
          phone: profile.phone,
          fullName: profile.full_name
        }
      }, 404);
    }

    console.log('✅ Email trouvé:', profile.email);
    return c.json({ 
      success: true, 
      email: profile.email,
      fullName: profile.full_name
    });

  } catch (error) {
    console.error('❌ Erreur find-email-by-phone:', error);
    return c.json({ 
      success: false, 
      error: 'Erreur serveur: ' + String(error)
    }, 500);
  }
});

// ============================================
// ROUTE SPÉCIALE : CRÉER LE PREMIER ADMIN
// ============================================
authRoutes.post('/auth/create-first-admin', async (c) => {
  try {
    console.log('🔧 Création du premier admin...');

    const { email, password, full_name } = await c.req.json();

    // Validation
    if (!email || !password) {
      return c.json({ 
        success: false, 
        error: 'Email et mot de passe requis' 
      }, 400);
    }

    // Créer un client Supabase avec la clé service
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Vérifier s'il existe déjà un admin
    const existingAdmins = await kv.getByPrefix('profile:');
    const hasAdmin = existingAdmins.some((profile: any) => profile.role === 'admin');

    if (hasAdmin) {
      console.log('⚠️ Un admin existe déjà !');
      return c.json({ 
        success: false, 
        error: 'Un compte administrateur existe déjà. Utilisez la page d\'inscription normale.' 
      }, 403);
    }

    console.log('✅ Aucun admin existant, création...');

    // Créer l'utilisateur avec Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirmer l'email
      user_metadata: {
        full_name: full_name || 'Admin',
        role: 'admin'
      }
    });

    if (authError || !authData.user) {
      console.error('❌ Erreur création utilisateur:', authError);
      return c.json({ 
        success: false, 
        error: authError?.message || 'Erreur lors de la création du compte' 
      }, 500);
    }

    console.log('✅ Utilisateur Supabase créé:', authData.user.id);

    // Créer le profil dans le KV store
    const profile = {
      id: authData.user.id,
      email,
      full_name: full_name || 'Admin',
      phone: null,
      role: 'admin',
      balance: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await kv.set(`profile:${authData.user.id}`, profile);
    console.log('✅ Profil admin créé dans KV store');

    return c.json({
      success: true,
      message: 'Premier compte administrateur créé avec succès !',
      user: {
        id: authData.user.id,
        email,
        full_name: full_name || 'Admin'
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la création du premier admin:', error);
    return c.json({ 
      success: false, 
      error: 'Erreur serveur: ' + String(error) 
    }, 500);
  }
});

export default authRoutes;