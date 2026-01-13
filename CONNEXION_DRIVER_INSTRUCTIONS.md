# 🚗 INSTRUCTIONS CONNEXION CONDUCTEUR

## ⚡ Solution Rapide (3 étapes)

### Étape 1 : Diagnostic
Ouvrez cette page dans votre navigateur :
```
https://[VOTRE-DOMAINE]/diagnostic-driver.html
```

### Étape 2 : Recherche de votre compte
1. Entrez votre **numéro de téléphone** (ex: 0812345678)
2. Cliquez sur **"🔎 Recherche complète"**
3. Attendez quelques secondes...

### Étape 3 : Connexion
Le diagnostic va vous afficher quelque chose comme :
```
✅ COMPTE TROUVÉ
Email Auth: 243812345678@smartcabb.app
```

**Utilisez CET EMAIL pour vous connecter !**

---

## 📱 Exemple concret

**Votre situation :**
- Vous essayez de vous connecter avec : `0898765432`
- Ça ne fonctionne pas ❌

**Après le diagnostic :**
- Email trouvé : `243812345678@smartcabb.app`
- 👉 **Connectez-vous avec `243812345678@smartcabb.app`** + votre mot de passe

**Pourquoi l'email est différent ?**
- C'est l'email d'authentification (technique, invisible pour vous)
- Il a été créé lors de votre inscription avec votre numéro original
- Même si vous avez changé de numéro dans le profil, l'email Auth reste le même

---

## ❓ FAQ

### Q : Je ne me souviens pas de mon mot de passe
**R :** Utilisez "Mot de passe oublié" avec l'email trouvé par le diagnostic

### Q : Le diagnostic ne trouve pas mon compte
**R :** 
1. Vérifiez que vous entrez le bon numéro
2. Essayez avec le format `243XXXXXXXXX`
3. Contactez l'administrateur (le compte n'existe peut-être pas)

### Q : Le diagnostic dit "Email non confirmé"
**R :** Contactez l'administrateur, il doit confirmer votre compte dans Supabase

### Q : J'ai trouvé l'email mais "Identifiants incorrects"
**R :** Le mot de passe est incorrect. Utilisez "Mot de passe oublié"

---

## 🔧 Dépannage avancé

### Test manuel de connexion

Si vous voulez tester manuellement :

1. Ouvrez la **console du navigateur** (F12)
2. Allez dans l'onglet **Console**
3. Collez ce code :

```javascript
// Remplacez par VOS valeurs
const EMAIL_TROUVE = "243812345678@smartcabb.app"; // Email du diagnostic
const MON_PASSWORD = "votre-mot-de-passe"; // Votre mot de passe

// Test de connexion
const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
const supabase = createClient(
  'VOTRE_SUPABASE_URL',
  'VOTRE_SUPABASE_ANON_KEY'
);

const { data, error } = await supabase.auth.signInWithPassword({
  email: EMAIL_TROUVE,
  password: MON_PASSWORD
});

if (error) {
  console.error('❌ Erreur:', error.message);
} else {
  console.log('✅ CONNEXION RÉUSSIE !', data.user);
}
```

**Résultat attendu :**
- ✅ Si succès : Votre compte fonctionne, utilisez ces identifiants dans l'app
- ❌ Si échec : Le mot de passe est incorrect ou le compte a un problème

---

## 📞 Contact Support

Si rien ne fonctionne, préparez ces informations :

1. **Votre numéro de téléphone**
2. **Le résultat du diagnostic** (copier-coller complet)
3. **Les messages d'erreur exacts** de l'app conducteur
4. **Capture d'écran** de la console (F12)

Et contactez l'administrateur.

---

## ✅ Checklist avant de contacter le support

- [ ] J'ai exécuté le diagnostic sur `/diagnostic-driver.html`
- [ ] J'ai essayé de me connecter avec l'**email trouvé** (pas mon numéro)
- [ ] J'ai vérifié que mon mot de passe est correct
- [ ] J'ai essayé "Mot de passe oublié"
- [ ] J'ai noté le résultat complet du diagnostic
- [ ] J'ai fait une capture d'écran des erreurs

Si toutes les cases sont cochées, contactez le support avec les informations ci-dessus.
