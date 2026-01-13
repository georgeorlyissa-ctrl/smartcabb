# 🚀 INSTALLATION PROPRE v2224 - GUIDE WINDOWS

## ✅ Pour Vous : Remplacement Complet Sans Garder Modifications

Ce guide est pour **Windows** uniquement. Si vous êtes sur Mac/Linux, utilisez le script `.sh`.

---

## 📋 MÉTHODE MANUELLE SIMPLE (Recommandée)

### ⏱️ Temps Total : 10 minutes

---

## 🔧 ÉTAPE 1 : Préparation

### 1.1 Ouvrir l'Explorateur Windows
- Appuyez sur `Windows + E`
- Naviguez vers le dossier parent de votre projet
- Exemple : `C:\Users\VotreNom\Documents\`

### 1.2 Afficher les fichiers cachés
- Dans l'Explorateur, cliquez sur **Affichage**
- Cochez **Éléments masqués**
- ✅ Maintenant vous pouvez voir le dossier `.git`

---

## 📥 ÉTAPE 2 : Télécharger v2224

### 2.1 Dans Figma Make
1. Cliquez sur l'icône **Téléchargement** (en haut à droite)
2. Attendez le téléchargement du ZIP
3. Le fichier s'appelle probablement `smartcabb.zip` ou similaire
4. Notez où il est sauvegardé (généralement `C:\Users\VotreNom\Downloads\`)

---

## 💾 ÉTAPE 3 : Backup de Sécurité

### 3.1 Copier le dossier actuel
1. Dans l'Explorateur, allez au dossier parent de `smartcabb`
2. **Clic droit** sur le dossier `smartcabb`
3. Choisir **Copier**
4. **Clic droit** dans un espace vide
5. Choisir **Coller**
6. Windows va créer `smartcabb - Copie`
7. **Renommer** en `smartcabb-backup-OLD`

✅ Vous avez maintenant :
- `smartcabb` ← Version actuelle (à remplacer)
- `smartcabb-backup-OLD` ← Backup au cas où

---

## 📂 ÉTAPE 4 : Sauvegarder le Dossier .git

### 4.1 Copier le dossier .git
1. Ouvrir le dossier `smartcabb`
2. Trouver le dossier `.git` (assurez-vous que "Éléments masqués" est coché)
3. **Clic droit** sur `.git`
4. **Copier**
5. **Coller** sur le Bureau (temporairement)
6. Vous avez maintenant `.git` sur votre Bureau

⚠️ **IMPORTANT :** Ne supprimez PAS ce dossier `.git` du Bureau avant la fin !

---

## 🗑️ ÉTAPE 5 : Vider le Dossier smartcabb

### 5.1 Supprimer TOUT sauf .git
1. Ouvrir le dossier `smartcabb`
2. **Ctrl + A** (sélectionner tout)
3. **Clic droit** sur le dossier `.git`
4. **Désélectionner** uniquement `.git` (maintenir Ctrl + clic)
5. Maintenant tout est sélectionné SAUF `.git`
6. Appuyer sur **Suppr** ou **Shift + Suppr** (suppression définitive)
7. Confirmer la suppression

✅ Le dossier `smartcabb` ne contient plus QUE le dossier `.git`

---

## 📦 ÉTAPE 6 : Extraire v2224

### 6.1 Extraire le ZIP téléchargé
1. Aller dans `C:\Users\VotreNom\Downloads\` (ou là où est le ZIP)
2. **Clic droit** sur `smartcabb.zip`
3. Choisir **Extraire tout...**
4. Destination : `C:\Users\VotreNom\Downloads\smartcabb-v2224`
5. Cliquer **Extraire**

### 6.2 Copier les fichiers extraits
1. Ouvrir le dossier `smartcabb-v2224` qui vient d'être créé
2. **ATTENTION :** Parfois le ZIP contient un dossier dans un dossier
   - Si vous voyez directement `App.tsx`, `package.json`, etc. → C'est bon
   - Si vous voyez UN SEUL dossier → Ouvrir ce dossier
3. **Ctrl + A** (sélectionner tout)
4. **Ctrl + C** (copier)
5. Aller dans votre dossier `smartcabb` (celui qui ne contient que `.git`)
6. **Ctrl + V** (coller)

✅ Le dossier `smartcabb` contient maintenant :
- `.git` ← L'ancien (conservé)
- `App.tsx` ← Nouveau de v2224
- `package.json` ← Nouveau de v2224
- Tous les autres fichiers ← Nouveaux de v2224

---

## 🔍 ÉTAPE 7 : Vérifier le Résultat

### 7.1 Vérifier que tout est là
Dans le dossier `smartcabb`, vous devez avoir :
- ✅ `.git` (dossier caché)
- ✅ `App.tsx`
- ✅ `package.json`
- ✅ `vite.config.ts`
- ✅ `index.html`
- ✅ Dossiers : `components`, `lib`, `hooks`, `supabase`, etc.

---

## 🔄 ÉTAPE 8 : Commit avec Git

### Option A : Via Git CLI (si installé)

1. **Ouvrir PowerShell** dans le dossier `smartcabb` :
   - Shift + Clic droit dans le dossier
   - Choisir "Ouvrir PowerShell ici" ou "Ouvrir dans Terminal"

2. **Exécuter les commandes** :

```powershell
# Vérifier le statut
git status

# Ajouter tous les fichiers
git add -A

# Commit
git commit -m "🚀 Version 2224 - Installation propre complète

- Version stable v517.36
- Tous les fichiers remplacés
- Configuration production optimisée
- Prêt pour déploiement Vercel"

# Push vers GitHub
git push origin main
```

3. **Si erreur "rejected"**, forcer :
```powershell
git push -f origin main
```

---

### Option B : Via GitHub Desktop (si installé)

1. **Ouvrir GitHub Desktop**
2. Aller dans **File** → **Add Local Repository**
3. Sélectionner le dossier `smartcabb`
4. Vous devez voir TOUS les fichiers modifiés dans la liste
5. En bas à gauche, dans "Summary" :
   ```
   🚀 Version 2224 - Installation propre
   ```
6. Dans "Description" :
   ```
   - Version stable v517.36
   - Tous les fichiers remplacés
   - Configuration production optimisée
   - Prêt pour déploiement Vercel
   ```
7. Cliquer **Commit to main**
8. Cliquer **Push origin** (en haut)

---

### Option C : Via GitHub Web (sans Git installé)

Si vous n'avez **ni Git CLI ni GitHub Desktop** :

1. Aller sur https://github.com/VOTRE-USERNAME/smartcabb
2. Pour **CHAQUE** fichier modifié :
   - Cliquer sur le fichier
   - Cliquer sur ✏️ (Edit)
   - Supprimer tout le contenu
   - Ouvrir le fichier correspondant dans votre dossier `smartcabb` local
   - Copier tout le contenu
   - Coller dans GitHub
   - Scroll en bas
   - Message : `Update NomDuFichier.tsx`
   - Cliquer **Commit changes**
3. Répéter pour TOUS les fichiers

⚠️ **Attention :** Cette méthode est TRÈS longue (plusieurs heures) !

---

## 🚀 ÉTAPE 9 : Vérifier le Déploiement Vercel

### 9.1 Suivre le déploiement
1. Aller sur https://vercel.com/dashboard
2. Cliquer sur votre projet **smartcabb**
3. Onglet **Deployments**
4. Voir le statut :
   - 🟡 **Building** → En cours (1-2 min)
   - 🟢 **Ready** → Déployé ! (3-5 min total)

### 9.2 Tester l'application
1. Ouvrir https://smartcabb.com
2. La page doit charger sans erreur
3. Tester les 3 boutons :
   - ✅ Je suis passager
   - ✅ Je suis conducteur
   - ✅ Administration

---

## ✅ ÉTAPE 10 : Nettoyer (Optionnel)

Si tout fonctionne bien :

1. **Supprimer le backup** (si vous n'en avez plus besoin) :
   - Supprimer `smartcabb-backup-OLD`

2. **Supprimer le ZIP et dossier extrait** :
   - Supprimer `Downloads\smartcabb.zip`
   - Supprimer `Downloads\smartcabb-v2224`

3. **Supprimer le .git du Bureau** :
   - Supprimer le dossier `.git` du Bureau (on n'en a plus besoin)

---

## 🐛 Dépannage

### Problème : Le dossier .git est invisible

**Solution :**
1. Explorateur → **Affichage**
2. Cocher **Éléments masqués**

### Problème : Git push rejected

**Solution :**
```powershell
git push -f origin main
```

Le `-f` force le push et écrase tout sur GitHub.

### Problème : "git: command not found"

**Solutions :**
1. Installer **Git for Windows** : https://git-scm.com/download/win
2. Ou installer **GitHub Desktop** : https://desktop.github.com/
3. Ou utiliser **Option C** (GitHub Web) - mais c'est très long

### Problème : Build échoue sur Vercel

**Solution :**
1. Vercel Dashboard → Deployments
2. Cliquer sur le déploiement en erreur
3. Onglet **Build Logs**
4. Chercher les lignes rouges
5. Copier l'erreur et me la donner

---

## 📋 Checklist Complète

- [ ] Fichiers cachés affichés dans Windows
- [ ] ZIP v2224 téléchargé depuis Figma Make
- [ ] Backup créé (`smartcabb-backup-OLD`)
- [ ] Dossier `.git` copié sur le Bureau
- [ ] Ancien contenu supprimé (sauf `.git`)
- [ ] Nouveaux fichiers v2224 copiés
- [ ] Dossier vérifié (`.git` + nouveaux fichiers)
- [ ] Commit créé avec Git
- [ ] Push vers GitHub effectué
- [ ] Vercel build réussi
- [ ] Application testée sur smartcabb.com
- [ ] Nettoyage effectué

---

## 🎉 Félicitations !

Vous avez maintenant une **version 100% propre de v2224** déployée en production !

**Prochaines étapes :**
- Tester toutes les fonctionnalités
- Vérifier sur mobile
- Partager avec vos utilisateurs

---

**Questions ? Problèmes ?** Dites-moi exactement à quelle étape vous êtes bloqué !

*Version 2224 | Build v517.36 | 6 janvier 2026*
