# 🔧 GUIDE - RÉSOLUTION DES CONFLITS GIT

## 🎯 **OBJECTIF**

Résoudre automatiquement les **5 conflits Git** détectés dans votre projet SmartCabb.

---

## 📋 **FICHIERS AVEC CONFLITS**

1. `components/driver/DriverWalletScreen.tsx`
2. `components/driver/EarningsScreen.tsx`
3. `components/driver/ClientInfoScreen.tsx`
4. `components/passenger/BookForSomeoneElse.tsx`
5. `components/passenger/PaymentScreen.tsx`

---

## ⚡ **UTILISATION RAPIDE (3 ÉTAPES)**

### **Étape 1 : Copier le script**

Le fichier `resolve-git-conflicts.sh` est déjà dans Figma Make.  
Copiez-le dans votre projet GitHub (à la racine).

---

### **Étape 2 : Exécuter le script**

```bash
# Rendre le script exécutable
chmod +x resolve-git-conflicts.sh

# Lancer la résolution automatique
./resolve-git-conflicts.sh
```

---

### **Étape 3 : Vérifier et commiter**

```bash
# Vérifier qu'il n'y a plus de conflits
./verify-imports.sh

# Vérifier les changements
git diff

# Commiter tout
git add .
git commit -m "fix: résolution conflits Git + correction imports pour Vercel"
git push origin main
```

---

## 🔍 **CE QUE FAIT LE SCRIPT**

### **1. Détection automatique**
- Scanne tous les fichiers dans `components/`
- Trouve les marqueurs de conflit Git :
  ```
  <<<<<<< HEAD
  =======
  >>>>>>>
  ```

### **2. Résolution intelligente**
- **Garde la version HEAD** (la plus récente)
- Supprime automatiquement les marqueurs
- Crée un backup avant toute modification

### **3. Méthodes de résolution**
Le script utilise **2 méthodes** :

**Méthode 1 : Python (préférée)** ⭐
- Plus fiable et précise
- Gère les conflits complexes
- Utilise des regex avancées

**Méthode 2 : sed (fallback)**
- Si Python n'est pas installé
- Moins fiable mais fonctionnel

---

## 📊 **RÉSULTAT ATTENDU**

Après l'exécution, vous devriez voir :

```
╔════════════════════════════════════════════════════════════╗
║   🔧 RÉSOLUTION AUTOMATIQUE DES CONFLITS GIT              ║
╚════════════════════════════════════════════════════════════╝

📦 Création du backup...
✅ Backup créé dans: backup_conflicts_20260105_140000

🔍 Recherche des fichiers avec conflits...

📝 Fichiers avec conflits Git :

📄 DriverWalletScreen.tsx
  🔍 Conflits détectés: 1
  ✓ Conflits résolus (version HEAD conservée)

📄 EarningsScreen.tsx
  🔍 Conflits détectés: 1
  ✓ Conflits résolus (version HEAD conservée)

📄 ClientInfoScreen.tsx
  🔍 Conflits détectés: 1
  ✓ Conflits résolus (version HEAD conservée)

📄 BookForSomeoneElse.tsx
  🔍 Conflits détectés: 1
  ✓ Conflits résolus (version HEAD conservée)

📄 PaymentScreen.tsx
  🔍 Conflits détectés: 1
  ✓ Conflits résolus (version HEAD conservée)

╔════════════════════════════════════════════════════════════╗
║  ✅ SUCCÈS ! Tous les conflits ont été résolus           ║
╚════════════════════════════════════════════════════════════╝

✅ Fichiers corrigés: 5
✅ Conflits résolus: 5
```

---

## 🔄 **ANNULER SI BESOIN**

Si le résultat ne vous convient pas :

```bash
./resolve-git-conflicts.sh --restore
```

Cela restaurera tous les fichiers depuis le backup automatique.

---

## 🆘 **EN CAS DE PROBLÈME**

### **Problème 1 : Python3 non installé**

Le script utilisera automatiquement `sed` comme fallback.

Pour installer Python3 :

**macOS :**
```bash
brew install python3
```

**Linux Ubuntu/Debian :**
```bash
sudo apt-get install python3
```

### **Problème 2 : Certains conflits non résolus**

Si le script affiche des erreurs, ouvrez le fichier manuellement :

```bash
code components/driver/DriverWalletScreen.tsx
```

Cherchez les marqueurs `<<<<<<<` et supprimez-les manuellement.

### **Problème 3 : "Permission denied"**

```bash
chmod +x resolve-git-conflicts.sh
```

---

## 📝 **VÉRIFICATION MANUELLE**

Pour vérifier qu'il ne reste plus de marqueurs :

```bash
# Compter les conflits restants
grep -r "<<<<<<< HEAD" components/ | wc -l

# Lister les fichiers avec conflits
grep -rl "<<<<<<< HEAD" components/
```

Si le résultat est **0** ou **vide**, c'est parfait ! ✅

---

## 🎯 **WORKFLOW COMPLET**

Voici l'ordre complet des commandes à exécuter :

```bash
# 1. Résoudre les conflits
chmod +x resolve-git-conflicts.sh
./resolve-git-conflicts.sh

# 2. Vérifier l'état
./verify-imports.sh

# 3. Voir les changements
git status
git diff

# 4. Commiter et pousser
git add .
git commit -m "fix: résolution conflits Git + correction imports pour Vercel"
git push origin main
```

---

## ⏱️ **TIMING**

| Étape | Temps |
|-------|-------|
| Copier le script | 30 sec |
| Exécution automatique | 5 sec ⚡ |
| Vérification | 10 sec |
| Commit et push | 30 sec |
| **TOTAL** | **~1 min 15 sec** |

---

## ✅ **APRÈS LA RÉSOLUTION**

Une fois les conflits résolus et le push effectué :

1. ✅ **Vercel détecte** le nouveau commit
2. ✅ **Build démarre** sans erreurs de conflit
3. ✅ **Imports corrects** (framer-motion, lucide-react)
4. ✅ **Déploiement réussi** sur smartcabb.com
5. ✅ **Application fonctionnelle** ! 🎉

---

## 🔍 **COMPRENDRE LES CONFLITS**

### **C'est quoi un conflit Git ?**

Un conflit Git se produit quand deux versions différentes du même fichier existent.

**Exemple de conflit :**

```typescript
<<<<<<< HEAD
import { motion } from 'framer-motion';        // Version actuelle
=======
import { motion } from '../../framer-motion';  // Ancienne version
>>>>>>> branch-name
```

### **Ce que fait le script :**

Il **garde automatiquement la version HEAD** (la plus récente) :

```typescript
import { motion } from 'framer-motion';        // ✅ Version conservée
```

---

## 💡 **CONSEILS**

1. ✅ **Toujours exécuter le backup** (le script le fait automatiquement)
2. ✅ **Vérifier avec `verify-imports.sh`** après résolution
3. ✅ **Tester localement** avant de pusher : `npm run dev`
4. ✅ **Garder le backup** quelques jours au cas où

---

## 📞 **BESOIN D'AIDE ?**

Si le script ne fonctionne pas ou si vous avez des questions :

1. Vérifiez que vous êtes à la racine du projet
2. Vérifiez les permissions : `ls -la resolve-git-conflicts.sh`
3. Lisez le message d'erreur complet
4. Restaurez depuis le backup si nécessaire
5. Contactez le support avec le message d'erreur

---

**Date de création :** 05 janvier 2026  
**Version :** 1.0  
**Projet :** SmartCabb - Transport RDC
