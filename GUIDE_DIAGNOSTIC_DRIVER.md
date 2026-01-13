# 🔧 GUIDE DE DIAGNOSTIC - Connexion Conducteur

## 🚨 Problème
Vous ne pouvez pas vous connecter à l'application conducteur avec vos identifiants habituels.

## ✅ Solutions disponibles

### Solution 1 : Page de diagnostic (RECOMMANDÉ)

1. **Ouvrez cette page** : `/diagnostic-driver.html`
2. **Entrez votre numéro de téléphone** (ex: 0812345678)
3. **Cliquez sur "Recherche complète"** (pas besoin de mot de passe)
4. **Le système vous donnera** :
   - L'email exact à utiliser pour la connexion
   - L'ID de votre compte
   - Le statut de votre compte (confirmé ou non)

5. **Une fois l'email trouvé** :
   - Retournez sur l'app conducteur
   - Utilisez cet **email exact** pour vous connecter
   - Entrez votre **mot de passe habituel**

### Solution 2 : API de diagnostic (Pour développeurs)

**Endpoint :** `POST /make-server-2eb02e52/diagnostic-driver`

**Payload :**
```json
{
  "identifier": "0812345678"
}
```

**Exemple avec curl :**
```bash
curl -X POST \
  https://[PROJECT_ID].supabase.co/functions/v1/make-server-2eb02e52/diagnostic-driver \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [ANON_KEY]" \
  -d '{"identifier": "0812345678"}'
```

**Réponse attendue :**
```json
{
  "success": true,
  "message": "Diagnostic terminé - Compte OK",
  "results": {
    "checks": [...]
  },
  "login_info": {
    "email_auth": "243812345678@smartcabb.app",
    "phone": "243812345678",
    "user_id": "uuid-ici",
    "name": "Votre Nom",
    "role": "driver"
  },
  "recommendation": "Utilisez cet email pour vous connecter: 243812345678@smartcabb.app"
}
```

## 🔍 Cas d'erreurs possibles

### Cas 1 : "Aucun compte trouvé"

**Message :** `Aucun compte trouvé avec cet identifiant`

**Causes possibles :**
1. Le numéro de téléphone est incorrect
2. Le compte n'existe pas dans le système
3. Le compte existe mais n'est pas dans le KV store

**Solutions :**
1. Vérifiez le numéro de téléphone (format: 0812345678 ou 243812345678)
2. Essayez avec un autre format du numéro
3. Contactez l'administrateur pour vérifier dans la console Supabase

### Cas 2 : "Email non confirmé"

**Message :** `Email non confirmé`

**Cause :** Le compte existe mais l'email n'a pas été confirmé dans Supabase Auth

**Solution :** Le diagnostic vous donnera une commande SQL à exécuter :
```sql
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE id = 'votre-user-id';
```

Exécutez cette commande dans la console Supabase (SQL Editor).

### Cas 3 : "Compte trouvé mais pas dans Supabase Auth"

**Message :** `Compte trouvé dans KV store mais pas dans Supabase Auth`

**Cause :** Désynchronisation entre le KV store et Supabase Auth (compte corrompu)

**Solution :** Le compte doit être recréé. Contactez l'administrateur.

### Cas 4 : "Identifiants incorrects" (après avoir trouvé l'email)

**Message :** `Invalid login credentials`

**Causes possibles :**
1. Le mot de passe est incorrect
2. Vous utilisez un ancien mot de passe

**Solutions :**
1. Utilisez la fonction "Mot de passe oublié"
2. Réinitialisez votre mot de passe par téléphone (OTP)
3. Contactez l'administrateur si le problème persiste

## 📊 Informations retournées par le diagnostic

Le diagnostic vérifie **5 points critiques** :

### ✅ Check 1 : Type d'identifiant
- Détecte si c'est un email ou un numéro de téléphone
- Normalise le numéro au format 243XXXXXXXXX

### ✅ Check 2 : Présence dans KV store
- Vérifie si le compte existe dans `driver:`, `profile:`, ou `user:`
- Retourne l'ID, email, téléphone, nom, rôle

### ✅ Check 3 : Présence dans table profiles
- Vérifie si le profil existe dans la table Supabase `profiles`
- Compare les données avec le KV store

### ✅ Check 4 : Présence dans Supabase Auth
- Vérifie si le compte Auth existe
- Récupère l'**email Auth réel** (crucial pour la connexion)
- Vérifie si l'email est confirmé

### ✅ Check 5 : Cohérence des données
- Compare email KV vs Auth
- Compare email profile vs Auth
- Compare téléphone KV vs profile
- Vérifie le rôle (doit être "driver")

## 🎯 Exemple de résultat attendu

```
✅ DIAGNOSTIC TERMINÉ

Email Auth: 243812345678@smartcabb.app
Téléphone: 243812345678
User ID: 12345678-abcd-1234-abcd-123456789012
Nom: Jean Kalala
Rôle: driver
Email confirmé: Oui

📧 Pour vous connecter :
   Email: 243812345678@smartcabb.app
   Mot de passe: [votre mot de passe habituel]
```

## 🆘 Besoin d'aide supplémentaire ?

Si le diagnostic ne résout pas votre problème :

1. **Faites une capture d'écran** du résultat du diagnostic
2. **Notez** :
   - Le numéro avec lequel vous essayez de vous connecter
   - Le message d'erreur exact
   - Les logs de la console (F12 dans le navigateur)
3. **Contactez** le support avec ces informations

## 📝 Notes importantes

- ⚠️ Le diagnostic **ne modifie rien** dans votre compte
- ✅ Il est **100% sûr** de l'exécuter plusieurs fois
- 📱 Utilisez l'email Auth trouvé, **PAS** l'email du profil
- 🔐 Si l'email Auth est différent de votre numéro actuel, c'est normal (voir `/DIAGNOSTIC_CONNEXION.md` pour plus d'infos)
