# 🧪 TEST DE CONNEXION - Guide de diagnostic

## ✅ Corrections appliquées

1. **Profils passagers** (`/supabase/functions/server/passenger-routes.tsx`) :
   - ❌ AVANT : Changement de numéro → email Auth modifié → connexion impossible
   - ✅ MAINTENANT : Changement de numéro → email Auth INCHANGÉ → connexion toujours possible

2. **Profils conducteurs** (`/supabase/functions/server/driver-routes.tsx`) :
   - ❌ AVANT : Changement de numéro → email Auth modifié → connexion impossible
   - ✅ MAINTENANT : Changement de numéro → email Auth INCHANGÉ → connexion toujours possible

3. **Recherche email par téléphone** (`/supabase/functions/server/auth-routes.tsx`) :
   - ❌ AVANT : Retournait l'email du profil (peut être différent de l'email Auth)
   - ✅ MAINTENANT : Récupère l'email AUTH RÉEL depuis Supabase pour garantir la connexion

## 🔍 Comment tester

### Test 1 : Connexion côté passager

1. **Ouvrez l'app passager**
2. **Essayez de vous connecter avec :**
   - Numéro : `[votre numéro actuel dans le profil]`
   - Mot de passe : `[votre mot de passe habituel]`

3. **Observez les logs dans la console** :
   - Recherchez `🔥 Récupération email par téléphone`
   - Recherchez `✅ Email Auth trouvé:`
   - Vérifiez que l'email Auth est bien récupéré

4. **Si ça ne fonctionne pas** :
   - Notez le message d'erreur exact
   - Vérifiez les logs serveur pour voir quel email Auth a été trouvé
   - Essayez avec le numéro au format `243XXXXXXXXX`

### Test 2 : Connexion côté conducteur

1. **Ouvrez l'app conducteur**
2. **Essayez de vous connecter avec :**
   - Numéro : `[votre numéro actuel dans le profil]`
   - Mot de passe : `[votre mot de passe habituel]`

3. **Observez les logs** comme pour le test passager

### Test 3 : Vérification manuelle de l'email Auth

Si les deux tests ci-dessus échouent, vérifiez manuellement :

1. **Ouvrez la console Supabase** : https://supabase.com/dashboard
2. **Allez dans Authentication > Users**
3. **Cherchez votre utilisateur** (par nom ou ID)
4. **Notez l'email exact** dans la colonne "Email"
5. **Essayez de vous connecter avec cet email + votre mot de passe**

## 📊 Logs à surveiller

### Logs de succès (attendus)

```
🔐 [signIn] Début de la connexion...
📱 Connexion par téléphone: 243XXXXXXXXX
🔍 Recherche de l'email associé au numéro...
✅ Email trouvé pour le numéro: XXXXX@smartcabb.app
🔐 Tentative de connexion avec email: XXXXX@smartcabb.app
✅ Connexion réussie: [user-id]
```

### Logs d'échec (à investiguer)

```
❌ Erreur de connexion: Invalid login credentials
```

**Si vous voyez cet échec, vérifiez :**
1. Le mot de passe est-il correct ?
2. L'email Auth récupéré est-il le bon ?
3. Y a-t-il un conflit de synchronisation entre KV/Profiles/Auth ?

## 🔧 Diagnostic avancé

Si vous ne pouvez toujours pas vous connecter :

### Étape 1 : Vérifier les données dans le KV store

Ouvrez la console du panel admin et exécutez :

```javascript
// Vérifier le profil
const profile = await kv.get('profile:[votre-user-id]');
console.log('Profile KV:', profile);

// Vérifier l'user
const user = await kv.get('user:[votre-user-id]');
console.log('User KV:', user);

// Vérifier le passager/conducteur
const passenger = await kv.get('passenger:[votre-user-id]');
console.log('Passenger KV:', passenger);
```

### Étape 2 : Vérifier la table profiles Supabase

Dans la console Supabase, exécutez :

```sql
SELECT * FROM profiles WHERE id = '[votre-user-id]';
```

### Étape 3 : Vérifier Supabase Auth

Dans Authentication > Users, vérifiez :
- Email
- Email confirmed
- Phone
- User metadata

### Étape 4 : Test manuel de connexion

Dans la console browser (F12), essayez :

```javascript
const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
const supabase = createClient('SUPABASE_URL', 'SUPABASE_ANON_KEY');

const { data, error } = await supabase.auth.signInWithPassword({
  email: 'EMAIL_AUTH_EXACT',
  password: 'VOTRE_MOT_DE_PASSE'
});

console.log('Résultat:', { data, error });
```

## 💡 Solutions selon les cas

### Cas 1 : "Numéro ou mot de passe incorrect"

**Cause possible :** L'email Auth n'est pas trouvé dans le KV store

**Solution :**
1. Vérifiez que votre profil existe bien dans le KV store avec `profile:[user-id]`
2. Vérifiez que le champ `phone` contient bien votre numéro normalisé (`243XXXXXXXXX`)
3. Si le profil n'existe pas, il faut le recréer

### Cas 2 : "Email not confirmed"

**Cause :** Le compte Auth n'a pas été confirmé

**Solution :**
Dans la console Supabase, exécutez :
```sql
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'VOTRE_EMAIL_AUTH';
```

### Cas 3 : Connexion réussie mais profil vide

**Cause :** Le profil dans le KV store n'est pas correctement synchronisé

**Solution :**
Contactez-moi pour recréer le profil dans le KV store

## 📞 Besoin d'aide ?

Si aucun des tests ci-dessus ne fonctionne, partagez-moi :

1. **Les logs complets** de la tentative de connexion (côté frontend ET serveur)
2. **Votre user ID** (trouvable dans la console Supabase)
3. **Le numéro avec lequel vous essayez de vous connecter**
4. **Le numéro affiché dans votre profil** (panel admin si passager, ou app si conducteur)

Je pourrai alors diagnostiquer précisément le problème !
