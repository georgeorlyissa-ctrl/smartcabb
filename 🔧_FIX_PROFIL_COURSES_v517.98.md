# 🔧 FIX PROFIL & COURSES RÉALISÉES - v517.98

## 📋 PROBLÈMES IDENTIFIÉS

### ❌ Problème 1 : Erreur modification profil
**Symptôme** : Message "Erreur lors de la sauvegarde dans la base de données"  
**Cause** : La table Supabase `profiles` n'a PAS de colonne `address`, mais le code essayait de l'envoyer

### ❌ Problème 2 : Courses réalisées = 0  
**Symptôme** : Affiche "0 Courses réalisées" alors que l'historique montre 32 courses  
**Cause** : Problème de matching `passengerId` entre le profil et les courses enregistrées

---

## ✅ SOLUTIONS IMPLÉMENTÉES

### 1️⃣ FIX : Modification profil (fichier `/lib/sync-service.ts`)

#### Changement A : Ne pas envoyer `address` à Supabase
```typescript
// AVANT (ligne 18-23) ❌
const supabaseData: any = {};
if (updates.name !== undefined) supabaseData.full_name = updates.name;
if (updates.email !== undefined) supabaseData.email = updates.email;
if (updates.phone !== undefined) supabaseData.phone = updates.phone;
if (updates.address !== undefined) supabaseData.address = updates.address; // ❌ ERREUR

// APRÈS (ligne 18-26) ✅
const supabaseData: any = {};
if (updates.name !== undefined) supabaseData.full_name = updates.name;
if (updates.email !== undefined) supabaseData.email = updates.email;
if (updates.phone !== undefined) supabaseData.phone = updates.phone;
// ✅ v517.98: Ne pas envoyer address à Supabase (colonne inexistante)
// L'adresse sera uniquement stockée dans localStorage
```

#### Changement B : Envoyer seulement si données non vides
```typescript
// ✅ v517.98: Envoyer seulement si on a des données à mettre à jour
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
```

#### Changement C : Prioriser `updates.address` pour localStorage
```typescript
// localStorage individuel (smartcabb_user_{id})
const updatedUserData = {
  ...existingUser,
  id: fullProfile.id,
  name: fullProfile.full_name !== null && fullProfile.full_name !== undefined ? fullProfile.full_name : (updates.name !== undefined ? updates.name : existingUser.name),
  email: fullProfile.email !== null && fullProfile.email !== undefined ? fullProfile.email : (updates.email !== undefined ? updates.email : existingUser.email),
  phone: fullProfile.phone !== null && fullProfile.phone !== undefined ? fullProfile.phone : (updates.phone !== undefined ? updates.phone : existingUser.phone),
  address: updates.address !== undefined ? updates.address : existingUser.address, // ✅ Priorité à updates
  walletBalance: existingUser.walletBalance || 0,
  walletTransactions: existingUser.walletTransactions || [],
};
```

#### Changement D : Même logique pour `smartcab_all_users`
```typescript
// smartcab_all_users
allUsers[userIndex] = {
  ...allUsers[userIndex],
  name: fullProfile.full_name !== null && fullProfile.full_name !== undefined ? fullProfile.full_name : (updates.name !== undefined ? updates.name : allUsers[userIndex].name),
  email: fullProfile.email !== null && fullProfile.email !== undefined ? fullProfile.email : (updates.email !== undefined ? updates.email : allUsers[userIndex].email),
  phone: fullProfile.phone !== null && fullProfile.phone !== undefined ? fullProfile.phone : (updates.phone !== undefined ? updates.phone : allUsers[userIndex].phone),
  address: updates.address !== undefined ? updates.address : allUsers[userIndex].address, // ✅ v517.98
};
```

---

### 2️⃣ DIAGNOSTIC : Courses réalisées = 0

#### Vérification logs backend

La route `/passengers/:id/stats` existe déjà dans `/supabase/functions/server/passenger-routes.tsx` (ligne 67-138).

**Logs à vérifier** :
```typescript
console.log(`🔍 Recherche courses pour passengerId: \"${passengerId}\"`);
console.log(`🔍 Total courses dans le système: ${allRides.length}`);
console.log(`🔍 PassengerIds uniques trouvés:`, uniquePassengerIds);
```

**Filtrage des courses** :
```typescript
const passengerRides = allRides.filter((ride: any) => {
  const matches = ride.passengerId === passengerId && ride.status === 'completed';
  if (ride.passengerId === passengerId) {
    console.log(`🔍 Course ${ride.id}: passengerId match, status=${ride.status}, included=${matches}`);
  }
  return matches;
});
```

#### 🔍 ACTIONS À FAIRE (Frontend)

1. **Ouvrir DevTools Console** sur le profil passager
2. **Chercher les logs** :
   - `📊 v517.91 - Stats passager reçues`
   - `🔍 Recherche courses pour passengerId`
   - `🔍 PassengerIds uniques trouvés`
   
3. **Vérifier** :
   - Le `passengerId` actuel : `state.currentUser.id`
   - Les `passengerIds` dans les courses
   - **Si différents** → C'est le problème !

#### 🛠️ SOLUTION POSSIBLE

Si le `passengerId` ne correspond pas, il y a 2 options :

**Option A** : Mettre à jour manuellement dans le KV store (côté admin)
```javascript
// Dans la console admin
localStorage.getItem('smartcabb_user_[ID_ACTUEL]')
// Récupérer l'ID et chercher toutes les courses avec un autre ID
// Les mettre à jour manuellement
```

**Option B** : Ajouter une route backend pour corriger en masse
```typescript
// Route à créer : POST /passengers/:id/fix-ride-history
// Paramètre : oldPassengerId
// Action : Mettre à jour toutes les courses de oldPassengerId → newPassengerId
```

---

## 📊 RÉSUMÉ DES MODIFICATIONS

| Fichier | Lignes modifiées | Description |
|---------|------------------|-------------|
| `/lib/sync-service.ts` | 18-130 | Ne plus envoyer `address` à Supabase, prioriser `updates` pour localStorage |

---

## 🧪 TESTS À FAIRE

### Test 1 : Modification nom ✅
1. Passager modifie son nom : "marc" → "Marc Junior"
2. Cliquer "Sauvegarder"
3. **Résultat attendu** : ✅ "Profil mis à jour avec succès"
4. Recharger page → Nom bien affiché

### Test 2 : Modification adresse ✅
1. Passager modifie son adresse : vide → "123 Rue de Kinshasa"
2. Cliquer "Sauvegarder"
3. **Résultat attendu** : ✅ "Profil mis à jour avec succès"
4. Recharger page → Adresse bien affichée

### Test 3 : Courses réalisées 🔍
1. Ouvrir DevTools Console
2. Aller sur Profil passager
3. **Vérifier logs** :
   - `📊 v517.91 - Stats passager reçues: { stats: { totalRides: XX } }`
   - `🔍 PassengerIds uniques trouvés: [...]`
4. **Si totalRides = 0** mais historique montre des courses :
   - Vérifier que `passengerId` match
   - Sinon, créer route `/fix-ride-history`

---

## 🚀 COMMANDES DÉPLOIEMENT

```bash
git add .
git commit -m "✅ v517.98: Fix modification profil + diagnostic courses réalisées

✅ FIX PROFIL:
- sync-service: Ne plus envoyer address à Supabase (colonne inexistante)
- Stocker address uniquement dans localStorage
- Continuer synchro même si Supabase échoue

🔍 DIAGNOSTIC COURSES:
- Route /passengers/:id/stats existe déjà
- Logs détaillés pour débogage
- Vérifier matching passengerId dans DevTools"

git push origin main
```

---

## 📝 NOTES TECHNIQUES

### Structure Supabase `profiles`
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  -- ❌ PAS de colonne 'address'
  role TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Structure localStorage `smartcabb_user_{id}`
```json
{
  "id": "uuid",
  "name": "Marc",
  "email": "marc@example.com",
  "phone": "+243...",
  "address": "123 Rue de Kinshasa", // ✅ Stocké uniquement ici
  "walletBalance": 36960,
  "walletTransactions": [...]
}
```

---

**Version** : v517.98  
**Date** : 2 janvier 2026  
**Status** : ✅ Fix profil implémenté / 🔍 Diagnostic courses à vérifier
