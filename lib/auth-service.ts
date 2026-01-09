import { supabase } from './supabase';
import { profileService } from './supabase-services';
import { normalizePhoneNumber, detectInputType, isValidEmail, generateEmailFromPhone } from './phone-utils';
import { projectId, publicAnonKey } from '../utils/supabase/info';

/**
 * Service d'authentification pour SmartCabb (Version optimisée)
 * Messages d'erreur courts - L'UI gère les actions via toasts
 */

export interface LoginCredentials {
  identifier: string; // Email ou numéro de téléphone
  password: string;
}

export interface SignUpData {
  email?: string;
  phone?: string;
  password: string;
  fullName: string;
  role: 'passenger' | 'driver';
}

export interface AuthResult {
  success: boolean;
  user?: any;
  profile?: any;
  error?: string;
  accessToken?: string;
}

export interface CreateAdminData {
  email: string;
  password: string;
  fullName: string;
}

/**
 * Connexion avec email ou numéro de téléphone
 */
export async function signIn(credentials: LoginCredentials): Promise<AuthResult> {
  try {
    const { identifier, password } = credentials;
    
    // Nettoyer l'identifiant (enlever les espaces avant/après)
    const cleanIdentifier = identifier.trim();
    
    console.log('🔐 [signIn] Début de la connexion...');
    console.log('🔐 [signIn] Identifier:', cleanIdentifier);
    
    if (!cleanIdentifier) {
      console.log('❌ [signIn] Identifiant vide');
      return {
        success: false,
        error: 'Veuillez entrer un email ou un numéro de téléphone'
      };
    }
    
    if (!password) {
      console.log('❌ [signIn] Mot de passe vide');
      return {
        success: false,
        error: 'Veuillez entrer votre mot de passe'
      };
    }
    
    // Détecter si c'est un email ou un numéro de téléphone
    const inputType = detectInputType(cleanIdentifier);
    
    console.log('🔍 [signIn] Type détecté:', inputType, 'pour:', cleanIdentifier);
    
    let email = cleanIdentifier;
    
    // Si c'est un numéro de téléphone, générer l'email correspondant
    if (inputType === 'phone') {
      const normalizedPhone = normalizePhoneNumber(cleanIdentifier);
      if (!normalizedPhone) {
        return {
          success: false,
          error: 'Numéro de téléphone invalide. Format attendu: 0812345678'
        };
      }
      
      console.log('📱 Connexion par téléphone:', normalizedPhone);
      
      // 🆕 NOUVEAU : Chercher l'email associé au numéro dans la base de données
      console.log('🔍 Recherche de l\'email associé au numéro...');
      
      try {
        const findEmailResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/auth/get-email-by-phone`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`
            },
            body: JSON.stringify({ phoneNumber: normalizedPhone })
          }
        );
        
        const findEmailResult = await findEmailResponse.json();
        console.log('📥 Résultat recherche email:', findEmailResult);
        
        if (findEmailResult.success && findEmailResult.email) {
          // Email trouvé ! Utiliser cet email pour la connexion
          email = findEmailResult.email;
          console.log('✅ Email trouvé pour le numéro:', email);
        } else if (findEmailResult.error === 'ORPHAN_PROFILE') {
          // Profil orphelin détecté
          console.log('⚠️ Profil orphelin détecté');
          return {
            success: false,
            error: 'ORPHAN_PROFILE',
            orphanProfile: findEmailResult.profile
          };
        } else {
          // Aucun compte trouvé, essayer le format email généré (ancien système)
          console.log('⚠️ Aucun email trouvé, utilisation du format email généré (ancien système)');
          email = `${normalizedPhone}@smartcabb.app`;
          console.log('🔐 Email généré (ancien format):', email);
        }
      } catch (fetchError) {
        console.error('❌ Erreur lors de la recherche de l\'email:', fetchError);
        // Fallback : utiliser le format email généré
        email = `${normalizedPhone}@smartcabb.app`;
        console.log('🔐 Email généré (fallback):', email);
      }
    } else if (inputType === 'email') {
      // Vérifier que l'email est valide
      if (!isValidEmail(cleanIdentifier)) {
        return {
          success: false,
          error: 'Format email invalide'
        };
      }
      email = cleanIdentifier.toLowerCase();
    } else if (inputType === 'unknown') {
      // Essayer de normaliser comme téléphone quand même
      const normalizedPhone = normalizePhoneNumber(cleanIdentifier);
      if (normalizedPhone) {
        console.log('📱 Traitement comme téléphone:', normalizedPhone);
        email = `${normalizedPhone}@smartcabb.app`;
      } else {
        return {
          success: false,
          error: 'Format invalide. Entrez un email (ex: nom@email.com) ou un numéro de téléphone (ex: 0812345678)'
        };
      }
    }
    
    // Connexion avec Supabase Auth
    console.log('🔐 Tentative de connexion avec email:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('❌ Erreur de connexion:', error.message);
      
      // Message d'erreur spécifique pour "Email not confirmed"
      if (error.message.includes('Email not confirmed')) {
        console.error('═══════════════════════════════════════════════');
        console.error('❌ ERREUR: Email non confirmé');
        console.error('');
        console.error('Votre compte existe mais lemail nest pas confirmé.');
        console.error('');
        console.error('💡 SOLUTION RAPIDE:');
        console.error('   Ouvrez la console Supabase:');
        console.error('   https://supabase.com/dashboard/project/YOUR_PROJECT/editor');
        console.error('');
        console.error('   Puis exécutez:');
        console.error('   UPDATE auth.users');
        console.error('   SET email_confirmed_at = NOW()');
        console.error('   WHERE email = votre_email_ici;');
        console.error('═══════════════════════════════════════════════');
        return {
          success: false,
          error: 'Compte non activé. Vérifiez vos emails ou contactez le support.'
        };
      }
      
      // Messages d'erreur personnalisés pour "Invalid login credentials"
      if (error.message.includes('Invalid login credentials')) {
        // Si c'était un téléphone et que ça a échoué, essayer les anciens formats
        if (inputType === 'phone') {
          const normalizedPhone = normalizePhoneNumber(identifier);
          
          if (!normalizedPhone) {
            return {
              success: false,
              error: 'Numéro de téléphone invalide'
            };
          }
          
          console.log('🔄 Tentative avec autres formats pour:', normalizedPhone);
          
          // Liste des formats à essayer
          const emailFormats = [
            `${normalizedPhone}@smartcabb.app`,       // Ancien format 1
            `phone+${normalizedPhone}@smartcabb.app`, // Ancien format 2
            `${normalizedPhone}@smartcabb.temp`,      // Legacy
            `sc${normalizedPhone}@temp.mail`,         // Format généré
          ];
          
          for (const testEmail of emailFormats) {
            console.log('🔄 Test avec:', testEmail);
            
            const { data: testData, error: testError } = await supabase.auth.signInWithPassword({
              email: testEmail,
              password
            });
            
            if (!testError && testData.session) {
              console.log('✅ Connexion réussie avec format:', testEmail);
              
              const profile = await profileService.getProfile(testData.user.id);
              return {
                success: true,
                user: testData.user,
                profile,
                accessToken: testData.session?.access_token
              };
            }
          }
        }
        
        // 🔍 NOUVEAU : Vérifier si un profil orphelin existe (via backend)
        console.log('🔍 Vérification si un profil orphelin existe...');
        try {
          const { projectId, publicAnonKey } = await import('../utils/supabase/info');
          
          const checkResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/check-orphan-profile`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${publicAnonKey}`
              },
              body: JSON.stringify({ identifier: cleanIdentifier })
            }
          );
          
          const checkResult = await checkResponse.json();
          console.log('📥 Résultat vérification profil orphelin:', checkResult);
          
          if (checkResult.success && checkResult.hasOrphanProfile && checkResult.profile) {
            console.log('⚠️ PROFIL ORPHELIN DÉTECTÉ:', checkResult.profile.email);
            console.error('═══════════════════════════════════════════════');
            console.error('⚠️ COMPTE INCOMPLET DÉTECTÉ');
            console.error('');
            console.error('Votre profil existe mais votre compte d\'authentification n\'a pas été créé.');
            console.error('');
            console.error('💡 SOLUTION:');
            console.error('   Allez sur: /auth/create-auth-from-profile');
            console.error('   Ou utilisez le bouton "Activer mon compte" sur l\'écran de connexion');
            console.error('═══════════════════════════════════════════════');
            
            return {
              success: false,
              error: 'ORPHAN_PROFILE', // Code d'erreur spécial
              orphanProfile: checkResult.profile // Données du profil
            };
          }
        } catch (profileCheckError) {
          console.error('❌ Erreur vérification profil:', profileCheckError);
        }
        
        // Si toujours en échec (pas de profil orphelin)
        console.info('═══════════════════════════════════════════════');
        console.info('ℹ️ INFO: Identifiants non reconnus');
        console.info('');
        console.info('Le numéro/email ou le mot de passe ne correspond pas');
        console.info('');
        console.info('💡 SUGGESTIONS:');
        console.info('   1. Vérifiez votre numéro de téléphone/email');
        console.info('   2. Vérifiez votre mot de passe');
        console.info('   3. Si vous n\'avez pas de compte, cliquez sur Inscription');
        console.info('═══════════════════════════════════════════════');
        return {
          success: false,
          error: inputType === 'phone' 
            ? `Numéro ou mot de passe incorrect. Si vous n'avez pas de compte, veuillez vous inscrire.`
            : `Email ou mot de passe incorrect`
        };
      }
      
      if (error.message.includes('Database error querying schema') || 
          error.message.includes('relation') || 
          error.message.includes('does not exist')) {
        console.error('═══════════════════════════════════════════════');
        console.error('❌ BASE DE DONNÉES NON INITIALISÉE');
        console.error('Exécutez SETUP-TOUT-EN-UN.sql dans Supabase');
        console.error('══════════════════════════════════════════════');
        
        return {
          success: false,
          error: 'BASE DE DONNÉES NON INITIALISÉE'
        };
      }
      
      return {
        success: false,
        error: error.message
      };
    }
    
    if (!data.user) {
      return {
        success: false,
        error: 'Erreur de connexion. Veuillez réessayer.'
      };
    }
    
    // Récupérer le profil de l'utilisateur
    let profile = await profileService.getProfile(data.user.id);
    
    // Si le profil n'existe pas, essayer de le créer
    if (!profile) {
      console.warn('⚠️ Profil non trouvé, tentative de création...');
      
      try {
        const userData = data.user.user_metadata;
        const email = data.user.email || '';
        const fullName = userData?.full_name || userData?.name || 'Utilisateur';
        const phone = userData?.phone || null;
        const role = userData?.role || 'passenger';
        
        profile = await profileService.createProfile({
          id: data.user.id,
          email,
          full_name: fullName,
          phone: phone || undefined,
          role
        });
        
        if (profile) {
          console.log('✅ Profil créé avec succès lors de la connexion');
        }
      } catch (profileError: any) {
        console.error('❌ Erreur création profil:', profileError);
        
        // Si l'erreur est une clé dupliquée, essayer de récupérer le profil à nouveau
        if (profileError.message?.includes('duplicate key') || profileError.code === '23505') {
          console.log('🔄 Clé dupliquée détectée, récupération du profil existant...');
          profile = await profileService.getProfile(data.user.id);
        }
      }
    }
    
    console.log('✅ Connexion réussie:', data.user.id);
    
    return {
      success: true,
      user: data.user,
      profile,
      accessToken: data.session?.access_token
    };
    
  } catch (error) {
    console.error('❌ Erreur inattendue lors de la connexion:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

/**
 * Inscription avec email ou numéro de téléphone
 */
export async function signUp(userData: SignUpData): Promise<AuthResult> {
  try {
    const { email, phone, password, fullName, role } = userData;
    
    // Validation basique
    if (!password || password.length < 6) {
      return {
        success: false,
        error: 'Le mot de passe doit contenir au moins 6 caractères'
      };
    }
    
    if (!fullName || fullName.trim().length < 2) {
      return {
        success: false,
        error: 'Veuillez entrer votre nom complet'
      };
    }
    
    // Normaliser le numéro de téléphone si fourni
    const normalizedPhone = phone ? normalizePhoneNumber(phone) : null;
    
    // Déterminer l'email final à utiliser
    let finalEmail: string;
    if (email && email.trim() && isValidEmail(email)) {
      // Email fourni et valide
      finalEmail = email.trim().toLowerCase();
    } else if (normalizedPhone) {
      // Pas d'email valide mais téléphone fourni
      finalEmail = generateEmailFromPhone(normalizedPhone);
      console.log('📧 Email généré depuis téléphone:', finalEmail);
    } else {
      return {
        success: false,
        error: 'Veuillez fournir un email ou un numéro de téléphone valide'
      };
    }
    
    console.log('📝 Inscription avec:', { finalEmail, phone: normalizedPhone, role });
    
    // UTILISER LE SERVEUR pour créer le compte (l'API Admin accepte tous les formats)
    console.log('🔄 Création via API serveur (Admin API)...');
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/signup-passenger`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: finalEmail,
            phone: normalizedPhone,
            password,
            fullName,
            role
          }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        console.error('❌ Erreur serveur inscription:', result.error);
        return {
          success: false,
          error: result.error || 'Erreur lors de l\'inscription'
        };
      }

      console.log('✅ Compte créé via serveur:', result);

      // Se connecter automatiquement après inscription
      const { data, error } = await supabase.auth.signInWithPassword({
        email: finalEmail,
        password
      });

      if (error) {
        console.error('❌ Erreur connexion automatique:', error);
        return {
          success: true,
          user: result.user,
          profile: result.profile,
          error: 'Compte créé mais erreur de connexion. Veuillez vous connecter manuellement.'
        };
      }

      return {
        success: true,
        user: data.user,
        profile: result.profile,
        accessToken: data.session?.access_token
      };

    } catch (fetchError) {
      console.error('❌ Erreur appel serveur:', fetchError);
      
      // Fallback: essayer l'inscription côté client
      console.log('⚠️ Fallback: tentative inscription côté client...');
      
      const { data, error } = await supabase.auth.signUp({
        email: finalEmail,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: normalizedPhone,
            role
          }
        }
      });
      
      if (error) {
        console.error('❌ Erreur inscription fallback:', error);
        
        if (error.message.includes('already registered')) {
          return {
            success: false,
            error: 'Un compte existe déjà avec cet email ou ce numéro de téléphone'
          };
        }
        
        return {
          success: false,
          error: error.message
        };
      }
      
      if (!data.user) {
        return {
          success: false,
          error: 'Aucun utilisateur créé'
        };
      }
      
      // Créer le profil dans la table profiles
      let profile;
      try {
        profile = await profileService.createProfile({
          id: data.user.id,
          email: finalEmail,
          full_name: fullName,
          phone: normalizedPhone || undefined,
          role
        });
        
        console.log('✅ Profil créé avec succès');
      } catch (profileError: any) {
        console.error('❌ Erreur création profil:', profileError);
        
        // Si c'est une erreur de clé dupliquée, essayer de récupérer le profil existant
        if (profileError.message?.includes('duplicate key') || profileError.code === '23505') {
          console.log('🔄 Profil existe déjà, récupération...');
          profile = await profileService.getProfile(data.user.id);
          
          if (!profile) {
            return {
              success: false,
              error: 'Erreur lors de la création du profil. Veuillez réessayer.'
            };
          }
          
          console.log('✅ Profil existant récupéré');
        } else {
          return {
            success: false,
            error: 'Erreur lors de la création du profil. Veuillez réessayer.'
          };
        }
      }
      
      return {
        success: true,
        user: data.user,
        profile,
        accessToken: data.session?.access_token
      };
    }
  } catch (error) {
    console.error('❌ Erreur inattendue lors de inscription:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inattendue'
    };
  }
}

/**
 * Déconnexion
 */
export async function signOut(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
      return {
        success: false,
        error: error.message
      };
    }
    
    console.log('✅ Déconnexion réussie');
    return {
      success: true
    };
  } catch (error) {
    console.error('❌ Erreur inattendue lors de la déconnexion:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inattendue'
    };
  }
}

/**
 * Récupérer la session active
 */
export async function getSession(): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      return {
        success: false,
        error: error.message
      };
    }
    
    if (!data.session) {
      return {
        success: false,
        error: 'No active session'
      };
    }
    
    const profile = await profileService.getProfile(data.session.user.id);
    
    return {
      success: true,
      user: data.session.user,
      profile,
      accessToken: data.session.access_token
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Créer un compte administrateur
 */
export async function createAdmin(adminData: CreateAdminData): Promise<AuthResult> {
  try {
    const { email, password, fullName } = adminData;
    
    // Validation
    if (!email || !isValidEmail(email)) {
      return {
        success: false,
        error: 'Email invalide'
      };
    }
    
    if (!password || password.length < 6) {
      return {
        success: false,
        error: 'Le mot de passe doit contenir au moins 6 caractères'
      };
    }
    
    // Appel à l'endpoint serveur pour créer l'admin
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/create-admin`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ email, password, fullName })
      }
    );
    
    const result = await response.json();
    
    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Erreur lors de la création du compte admin'
      };
    }
    
    console.log('✅ Admin créé avec succès');
    return {
      success: true,
      user: result.user,
      profile: result.profile
    };
  } catch (error) {
    console.error('❌ Erreur création admin:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inattendue'
    };
  }
}

/**
 * Alias pour createAdmin (compatibilité)
 */
export const createAdminUser = createAdmin;

/**
 * Réinitialiser le mot de passe
 */
export async function resetPassword(identifier: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Nettoyer l'identifiant
    const cleanIdentifier = identifier.trim();
    
    if (!cleanIdentifier) {
      return {
        success: false,
        error: 'Veuillez entrer un email ou un numéro de téléphone'
      };
    }
    
    // Détecter le type d'identifiant
    const inputType = detectInputType(cleanIdentifier);
    let email = cleanIdentifier;
    
    // Si c'est un numéro de téléphone, convertir en email
    if (inputType === 'phone') {
      const normalizedPhone = normalizePhoneNumber(cleanIdentifier);
      if (!normalizedPhone) {
        return {
          success: false,
          error: 'Numéro de téléphone invalide. Format: 0812345678'
        };
      }
      
      // Générer l'email depuis le téléphone
      email = `${normalizedPhone}@smartcabb.app`;
      console.log('📱 Réinitialisation pour téléphone:', normalizedPhone, '-> Email:', email);
    } else if (inputType === 'email') {
      if (!isValidEmail(cleanIdentifier)) {
        return {
          success: false,
          error: 'Email invalide'
        };
      }
      email = cleanIdentifier.toLowerCase();
    } else {
      return {
        success: false,
        error: 'Format invalide. Utilisez un email ou un numéro (0812345678)'
      };
    }
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    
    if (error) {
      console.error('❌ Erreur réinitialisation mot de passe:', error);
      return {
        success: false,
        error: 'Erreur lors de l\'envoi. Vérifiez que ce compte existe.'
      };
    }
    
    console.log('✅ Email de réinitialisation envoyé à:', email);
    return {
      success: true
    };
  } catch (error) {
    console.error('❌ Erreur inattendue lors de la réinitialisation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inattendue'
    };
  }
}
