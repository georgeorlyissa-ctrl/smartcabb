# ⚡ DÉPANNAGE RAPIDE - Connexion Conducteur

## 🎯 Objectif
Vous ne pouvez pas vous connecter à l'app conducteur. Ce guide vous aide à résoudre ça en 3 minutes.

---

## 🚀 SOLUTION EXPRESS (3 étapes)

### Étape 1 : Vérifier la connexion au serveur
Ouvrez cette page : **`/test-server-connection.html`**

**Résultat attendu :**
```
✅ Serveur répond: {"status":"ok"}
✅ API auth répond: ...
✅ API diagnostic répond: ...
```

**Si vous voyez des ❌ :**
- Le serveur backend n'est pas démarré
- Redéployez le projet sur Vercel
- Vérifiez les variables d'environnement Supabase

**Si tout est ✅ :** Passez à l'étape 2

---

### Étape 2 : Trouver votre email Auth
Ouvrez cette page : **`/diagnostic-driver-v2.html`**

1. Attendez que l'état du système soit vert ✅
2. Entrez votre numéro (ex: `0812345678`)
3. Cliquez sur "Lancer le diagnostic"

**Résultat attendu :**
```
✅ COMPTE TROUVÉ !
Email Auth: 243812345678@smartcabb.app
Téléphone: 243812345678
Nom: Votre Nom
```

**Notez l'email Auth** affiché !

---

### Étape 3 : Se connecter avec l'email Auth
Retournez sur l'app conducteur et connectez-vous avec :

```
Email : 243812345678@smartcabb.app  (l'email trouvé)
Mot de passe : votre-mot-de-passe
```

**✅ Ça devrait marcher !**

---

## 🆘 Si ça ne marche pas

### Cas 1 : "Failed to fetch" dans le diagnostic

**Problème :** Le serveur backend n'est pas accessible

**Solutions :**
1. Ouvrez `/test-server-connection.html` pour diagnostiquer
2. Vérifiez que le serveur est déployé sur Vercel
3. Vérifiez les variables d'environnement Supabase
4. Essayez la **SOLUTION ALTERNATIVE** ci-dessous

---

### Cas 2 : "Aucun compte trouvé"

**Problème :** Votre compte n'existe pas dans le système

**Solutions :**
1. Vérifiez le format de votre numéro :
   - `0812345678` ✅
   - `243812345678` ✅
   - `+243812345678` ✅
2. Essayez avec un autre format
3. Contactez l'administrateur avec votre numéro

---

### Cas 3 : "Email non confirmé"

**Problème :** Votre compte existe mais n'est pas confirmé

**Solution :** Le diagnostic vous donnera une commande SQL. Demandez à l'administrateur de l'exécuter dans Supabase :

```sql
UPDATE auth.users SET email_confirmed_at = NOW() WHERE id = 'votre-user-id';
```

---

### Cas 4 : "Invalid login credentials"

**Problème :** Le mot de passe est incorrect

**Solutions :**
1. Utilisez "Mot de passe oublié" dans l'app
2. OU contactez l'administrateur pour réinitialiser votre mot de passe

---

## 🔧 SOLUTION ALTERNATIVE (Via console)

Si les pages HTML ne marchent pas, utilisez la console du navigateur :

### 1. Ouvrez l'app conducteur
### 2. Appuyez sur F12
### 3. Allez dans l'onglet "Console"
### 4. Copiez-collez ce code :

```javascript
(async function() {
  const MON_NUMERO = "0812345678"; // 👈 CHANGEZ ICI
  
  try {
    const { projectId, publicAnonKey } = await import('./utils/supabase/info.js');
    
    const normalized = MON_NUMERO.replace(/[\s\-+()]/g, '')
      .replace(/^0/, '243')
      .replace(/^243243/, '243');
    
    console.log('📱 Recherche de:', normalized);
    
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
    
    if (result.success && result.login_info) {
      console.log('✅ ========== COMPTE TROUVÉ ==========');
      console.log('📧 EMAIL POUR CONNEXION:', result.login_info.email_auth);
      console.log('📱 Téléphone:', result.login_info.phone);
      console.log('👤 Nom:', result.login_info.name);
      console.log('');
      console.log('🎯 UTILISEZ CET EMAIL:', result.login_info.email_auth);
    } else {
      console.error('❌ Erreur:', result);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
})();
```

**5. Appuyez sur Entrée**

**6. Notez l'email affiché**

---

## 📞 CONTACTER LE SUPPORT

Si rien ne fonctionne, préparez ces infos :

### Informations à fournir :

1. **Votre numéro de téléphone** : `_________________`

2. **Résultat du test serveur** (`/test-server-connection.html`) :
   ```
   [Copier-coller le résultat ici]
   ```

3. **Résultat du diagnostic** (`/diagnostic-driver-v2.html` ou console) :
   ```
   [Copier-coller le résultat ici]
   ```

4. **Message d'erreur exact** dans l'app conducteur :
   ```
   [Copier-coller l'erreur ici]
   ```

5. **Capture d'écran** de la console (F12 > Console)

---

## 📚 Documents de référence

- `/GUIDE_DIAGNOSTIC_DRIVER.md` - Guide détaillé complet
- `/CONNEXION_DRIVER_INSTRUCTIONS.md` - Instructions simples
- `/SOLUTION_CONSOLE_DIAGNOSTIC.md` - Diagnostic via console
- `/DIAGNOSTIC_CONNEXION.md` - Explication technique du problème
- `/SOLUTION_FINALE.md` - Récapitulatif des corrections

---

## ✅ Checklist de dépannage

Avant de contacter le support :

- [ ] J'ai testé `/test-server-connection.html`
- [ ] J'ai testé `/diagnostic-driver-v2.html`
- [ ] J'ai essayé la solution via console
- [ ] J'ai essayé plusieurs formats de mon numéro
- [ ] J'ai noté l'email Auth trouvé (si trouvé)
- [ ] J'ai essayé de me connecter avec l'email Auth
- [ ] J'ai essayé "Mot de passe oublié"
- [ ] J'ai préparé les informations ci-dessus

---

## 🎯 Résumé en 1 phrase

**Trouvez votre email Auth avec `/diagnostic-driver-v2.html`, puis connectez-vous avec cet email au lieu de votre numéro.**

C'est tout ! 🚀
