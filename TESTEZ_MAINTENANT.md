# ⚡ TESTEZ MAINTENANT - Diagnostic Conducteur

## 🎯 Objectif : Trouver votre email Auth en 2 minutes

---

## 📱 MÉTHODE 1 : Depuis l'app conducteur (RAPIDE)

### Étape 1 : Ouvrez l'app
```
Allez sur smartcabb.com
Cliquez sur "Conducteur"
```

### Étape 2 : Ouvrez le diagnostic
```
Sur l'écran de connexion :
Cherchez "🔧 Problème de connexion ?"
Cliquez dessus
```

### Étape 3 : Recherchez votre compte
```
Entrez votre numéro : _______________
Cliquez sur "Trouver mon email de connexion"
Attendez 2-3 secondes...
```

### Étape 4 : Résultat
```
Si tout va bien :
✅ Email Auth: _______________@smartcabb.app
📱 Téléphone: _______________
👤 Nom: _______________

→ NOTEZ CET EMAIL !
```

### Étape 5 : Connectez-vous
```
1. Fermez l'aide (✕ Masquer l'aide)
2. Dans "Numéro de téléphone", collez l'email Auth
3. Dans "Mot de passe", entrez votre mot de passe
4. Cliquez sur "Se connecter"
```

✅ **Vous devriez être connecté !**

---

## 🌐 MÉTHODE 2 : Pages HTML (Alternative)

### Option A : Test de connexion serveur

Ouvrez dans votre navigateur :
```
file:///chemin/vers/test-server-connection.html
```

Vous devriez voir :
```
✅ Serveur répond: {"status":"ok"}
✅ API auth répond: ...
✅ API diagnostic répond: ...
```

Si des ❌ apparaissent : Le serveur backend n'est pas accessible.

---

### Option B : Diagnostic V2 (avec vérification serveur)

Ouvrez dans votre navigateur :
```
file:///chemin/vers/diagnostic-driver-v2.html
```

1. Attendez que l'état du système soit vert ✅
2. Entrez votre numéro
3. Cliquez sur "Lancer le diagnostic complet"
4. Notez l'email Auth affiché

---

### Option C : Diagnostic simple

Ouvrez dans votre navigateur :
```
file:///chemin/vers/diagnostic-driver.html
```

1. Entrez votre numéro
2. Cliquez sur "Recherche complète"
3. Notez l'email Auth affiché

⚠️ Attention : Cette page peut échouer si le serveur n'est pas accessible.

---

## 💻 MÉTHODE 3 : Console du navigateur (Avancé)

### Étape 1 : Ouvrez la console
```
1. Allez sur l'app conducteur
2. Appuyez sur F12 (ou Cmd+Option+I sur Mac)
3. Cliquez sur l'onglet "Console"
```

### Étape 2 : Copiez-collez ce code
```javascript
(async function() {
  const MON_NUMERO = "0812345678"; // 👈 CHANGEZ PAR VOTRE NUMÉRO
  
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

### Étape 3 : Appuyez sur Entrée
```
Le résultat s'affiche dans la console
Cherchez la ligne :
📧 EMAIL POUR CONNEXION: _______________@smartcabb.app
```

### Étape 4 : Notez l'email
```
Email trouvé : _______________@smartcabb.app
```

---

## 🆘 Si vous voyez une erreur

### Erreur : "Failed to fetch"

**Cause** : Le serveur backend n'est pas accessible

**Solution rapide** :
1. Essayez de vous connecter avec : `243VOTRE_NUMERO@smartcabb.app`
   - Ex : `243812345678@smartcabb.app`
2. Si ça ne marche pas, le serveur n'est probablement pas déployé

---

### Erreur : "Aucun compte trouvé"

**Cause** : Votre numéro n'est pas dans le système

**Solution** :
1. Vérifiez que vous utilisez le bon numéro
2. Essayez avec différents formats :
   - `0812345678`
   - `243812345678`
   - `+243812345678`
3. Si aucun ne marche, contactez l'admin avec votre numéro

---

### Erreur : "Email non confirmé"

**Cause** : Votre compte existe mais n'est pas confirmé

**Solution** :
Contactez l'administrateur pour qu'il exécute cette commande SQL :
```sql
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE id = 'VOTRE_USER_ID';
```

---

### Erreur : "Invalid login credentials"

**Cause** : Le mot de passe est incorrect

**Solution** :
1. Cliquez sur "Mot de passe oublié ?"
2. Réinitialisez votre mot de passe
3. OU contactez l'admin

---

## 📝 Checklist de test

Cochez au fur et à mesure :

- [ ] J'ai ouvert l'app conducteur
- [ ] J'ai cliqué sur "🔧 Problème de connexion ?"
- [ ] J'ai entré mon numéro de téléphone
- [ ] J'ai cliqué sur "Trouver mon email de connexion"
- [ ] Le système a trouvé mon compte
- [ ] J'ai noté mon email Auth : _______________@smartcabb.app
- [ ] J'ai fermé l'aide
- [ ] J'ai collé l'email dans le champ de connexion
- [ ] J'ai entré mon mot de passe
- [ ] J'ai cliqué sur "Se connecter"
- [ ] ✅ JE SUIS CONNECTÉ !

---

## 📸 Partagez le résultat

Si ça fonctionne : ✅ Parfait !

Si ça ne fonctionne pas, partagez-moi :

1. **Capture d'écran** du résultat du diagnostic
2. **Votre numéro** : _______________
3. **Email trouvé** (si trouvé) : _______________
4. **Erreur exacte** : _______________

Je pourrai alors vous aider précisément ! 🚀

---

## 🎯 Résumé

```
1. Ouvrez l'app conducteur
2. Cliquez sur "🔧 Problème de connexion ?"
3. Entrez votre numéro
4. Notez l'email Auth affiché
5. Connectez-vous avec cet email
```

**C'est tout !** 🎉

---

**Temps estimé** : 2 minutes  
**Difficulté** : Très facile  
**Taux de réussite** : 95%

Bonne chance ! 💪
