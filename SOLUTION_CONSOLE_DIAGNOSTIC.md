# 🔧 DIAGNOSTIC VIA CONSOLE NAVIGATEUR

## 🚨 Si la page de diagnostic ne fonctionne pas

Vous pouvez faire le diagnostic directement depuis la console de votre navigateur.

---

## 📋 MÉTHODE 1 : Diagnostic complet depuis la console

### Étape 1 : Ouvrir la console
1. Allez sur l'application conducteur SmartCabb
2. Appuyez sur **F12** (ou Cmd+Option+I sur Mac)
3. Cliquez sur l'onglet **"Console"**

### Étape 2 : Copier-coller ce code

```javascript
// ============================================
// SCRIPT DE DIAGNOSTIC CONDUCTEUR
// ============================================

(async function() {
  console.log('🔧 ========== DIAGNOSTIC COMPTE CONDUCTEUR ==========');
  
  // CONFIGUREZ VOTRE NUMÉRO ICI
  const MON_NUMERO = "0812345678"; // 👈 CHANGEZ PAR VOTRE NUMÉRO
  
  try {
    // Récupération des infos Supabase
    const { projectId, publicAnonKey } = await import('./utils/supabase/info.js');
    
    console.log('📊 Configuration:');
    console.log('  Project ID:', projectId);
    console.log('  Anon Key présente:', !!publicAnonKey);
    
    // Normalisation du numéro
    function normalizePhone(phone) {
      const cleaned = phone.replace(/[\s\-+()]/g, '');
      
      if (cleaned.length === 9) return `243${cleaned}`;
      if (cleaned.length === 10 && cleaned.startsWith('0')) {
        return `243${cleaned.substring(1)}`;
      }
      if (cleaned.length === 12 && cleaned.startsWith('243')) return cleaned;
      
      return phone;
    }
    
    const normalized = normalizePhone(MON_NUMERO);
    console.log('📱 Numéro normalisé:', normalized);
    
    // Appel API de diagnostic
    console.log('🔍 Recherche du compte...');
    
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/diagnostic-driver`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ identifier: normalized })
      }
    );
    
    const result = await response.json();
    
    console.log('📊 ========== RÉSULTAT ==========');
    console.log(result);
    
    if (result.success && result.login_info) {
      console.log('✅ ========== COMPTE TROUVÉ ! ==========');
      console.log('');
      console.log('📧 EMAIL POUR CONNEXION:', result.login_info.email_auth);
      console.log('📱 Téléphone:', result.login_info.phone);
      console.log('👤 Nom:', result.login_info.name);
      console.log('🆔 User ID:', result.login_info.user_id);
      console.log('');
      console.log('🎯 UTILISEZ CET EMAIL POUR VOUS CONNECTER:');
      console.log('   ' + result.login_info.email_auth);
      console.log('');
      console.log('💡 Conseil: Notez cet email et utilisez-le dans l\'app conducteur');
      
    } else {
      console.error('❌ Aucun compte trouvé ou erreur');
      console.log('Détails:', result);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    console.error('Stack:', error.stack);
  }
  
  console.log('🔧 ========== FIN DU DIAGNOSTIC ==========');
})();
```

### Étape 3 : Modifier le numéro
Dans le code ci-dessus, changez cette ligne :
```javascript
const MON_NUMERO = "0812345678"; // 👈 METTEZ VOTRE NUMÉRO ICI
```

### Étape 4 : Exécuter
1. Appuyez sur **Entrée** dans la console
2. Le diagnostic va s'exécuter
3. Cherchez cette ligne dans les résultats :
   ```
   📧 EMAIL POUR CONNEXION: 243XXXXXXXXX@smartcabb.app
   ```

### Étape 5 : Se connecter
Utilisez l'email trouvé pour vous connecter dans l'app conducteur !

---

## 📋 MÉTHODE 2 : Test de connexion depuis la console

Si vous connaissez déjà votre email Auth et voulez juste tester la connexion :

```javascript
// ============================================
// TEST DE CONNEXION RAPIDE
// ============================================

(async function() {
  // CONFIGUREZ VOS IDENTIFIANTS ICI
  const EMAIL = "243812345678@smartcabb.app"; // 👈 EMAIL AUTH
  const PASSWORD = "votre-mot-de-passe"; // 👈 VOTRE MOT DE PASSE
  
  try {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const { projectId, publicAnonKey } = await import('./utils/supabase/info.js');
    
    const supabase = createClient(
      `https://${projectId}.supabase.co`,
      publicAnonKey
    );
    
    console.log('🔐 Test de connexion avec:', EMAIL);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: EMAIL,
      password: PASSWORD
    });
    
    if (error) {
      console.error('❌ ÉCHEC DE LA CONNEXION');
      console.error('Erreur:', error.message);
      
      if (error.message.includes('Invalid login credentials')) {
        console.log('');
        console.log('⚠️ Le mot de passe est incorrect ou l\'email n\'est pas le bon');
        console.log('Solutions:');
        console.log('1. Vérifiez votre mot de passe');
        console.log('2. Utilisez le diagnostic pour trouver le bon email');
        console.log('3. Utilisez "Mot de passe oublié"');
      }
    } else {
      console.log('✅ ========== CONNEXION RÉUSSIE ! ==========');
      console.log('User:', data.user);
      console.log('Email:', data.user.email);
      console.log('ID:', data.user.id);
      console.log('Metadata:', data.user.user_metadata);
      console.log('');
      console.log('✅ Vos identifiants sont corrects !');
      console.log('Utilisez-les dans l\'app conducteur');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
})();
```

---

## 📋 MÉTHODE 3 : Recherche manuelle dans le KV store

Si tout le reste échoue, vous pouvez chercher directement dans le KV store :

```javascript
// ============================================
// RECHERCHE MANUELLE DANS KV STORE
// ============================================

(async function() {
  const NUMERO_RECHERCHE = "243812345678"; // 👈 CHANGEZ ICI
  
  try {
    const { projectId, publicAnonKey } = await import('./utils/supabase/info.js');
    
    console.log('🔍 Recherche de tous les conducteurs...');
    
    // Récupérer tous les conducteurs
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-2eb02e52/drivers/list`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        }
      }
    );
    
    const result = await response.json();
    
    if (result.success && result.drivers) {
      console.log(`📊 ${result.drivers.length} conducteurs trouvés`);
      
      // Chercher votre numéro
      const myDriver = result.drivers.find(d => 
        d.phone === NUMERO_RECHERCHE ||
        d.phone === NUMERO_RECHERCHE.replace('243', '0') ||
        d.phone === `0${NUMERO_RECHERCHE.replace('243', '')}`
      );
      
      if (myDriver) {
        console.log('✅ CONDUCTEUR TROUVÉ !');
        console.log('');
        console.log('📧 Email:', myDriver.email);
        console.log('📱 Téléphone:', myDriver.phone);
        console.log('👤 Nom:', myDriver.name);
        console.log('🆔 ID:', myDriver.id);
        console.log('🚗 Véhicule:', myDriver.vehicle?.licensePlate || 'N/A');
        console.log('');
        console.log('💡 Email pour connexion:', myDriver.email);
      } else {
        console.log('❌ Aucun conducteur trouvé avec ce numéro');
        console.log('Numéros recherchés:');
        console.log('  -', NUMERO_RECHERCHE);
        console.log('  -', NUMERO_RECHERCHE.replace('243', '0'));
        console.log('  -', `0${NUMERO_RECHERCHE.replace('243', '')}`);
      }
    } else {
      console.error('❌ Erreur:', result);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
})();
```

---

## 🆘 Si rien ne fonctionne

### Option 1 : Utilisez curl (ligne de commande)

Ouvrez un terminal et exécutez :

```bash
curl -X POST \
  https://[PROJECT_ID].supabase.co/functions/v1/make-server-2eb02e52/diagnostic-driver \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [ANON_KEY]" \
  -d '{"identifier": "0812345678"}'
```

Remplacez :
- `[PROJECT_ID]` par l'ID de votre projet Supabase
- `[ANON_KEY]` par votre clé publique Supabase
- `0812345678` par votre numéro

### Option 2 : Contactez l'administrateur

Fournissez ces informations :
1. Votre numéro de téléphone conducteur
2. La capture d'écran de l'erreur
3. Les logs de la console (F12 > Console > copier tout)

---

## 📝 Notes importantes

- Ces scripts sont **100% sûrs** et ne modifient rien
- Ils lisent seulement les données pour vous aider
- L'email trouvé est l'**email Auth** réel à utiliser pour la connexion
- Si l'email est différent de votre numéro actuel, c'est **NORMAL**
- Ne partagez jamais votre mot de passe avec quelqu'un
