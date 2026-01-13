# 📖 Guide de Résolution des Conflits Git - SmartCabb

## 🎯 Situation Actuelle

Vous avez **147 fichiers en conflit** suite à un merge Git. Ce guide vous aide à résoudre cette situation rapidement.

---

## 🚀 Solution Rapide - Scripts Automatiques

Trois scripts sont disponibles pour résoudre TOUS les conflits automatiquement :

### Option 1: Script Node.js (Recommandé - Multi-plateforme) ✅

```bash
node 🔧_RESOLVE_ALL_CONFLICTS.js
```

**Avantages:**
- ✅ Fonctionne sur Windows, Mac, Linux
- ✅ Affichage coloré
- ✅ Confirmation avant action
- ✅ Rapport détaillé

**Options avancées:**
```bash
# Accepter la version distante au lieu de la locale
node 🔧_RESOLVE_ALL_CONFLICTS.js --theirs

# Ne pas demander de confirmation
node 🔧_RESOLVE_ALL_CONFLICTS.js --skip-confirm
```

### Option 2: Script Bash (Linux/Mac)

```bash
chmod +x 🔧_RESOLVE_ALL_CONFLICTS.sh
./🔧_RESOLVE_ALL_CONFLICTS.sh
```

### Option 3: Script Batch (Windows)

Double-cliquez sur: `🔧_RESOLVE_ALL_CONFLICTS.bat`

Ou dans le terminal:
```cmd
🔧_RESOLVE_ALL_CONFLICTS.bat
```

---

## ⚠️ Que Font Ces Scripts ?

Les scripts vont:

1. **Détecter** tous les fichiers en conflit
2. **Accepter** la version LOCALE (HEAD) pour chaque fichier
3. **Marquer** les fichiers comme résolus (git add)
4. **Vous guider** pour finaliser le merge

**ATTENTION:** La version distante sera écrasée ! Si vous voulez conserver la version distante, utilisez l'option `--theirs`.

---

## 🔧 Solution Manuelle (Si les scripts ne fonctionnent pas)

### Étape 1: Voir les conflits

```bash
git status
```

### Étape 2: Accepter TOUTES les versions locales

```bash
# Pour accepter NOTRE version (locale) pour TOUS les fichiers
git checkout --ours .
git add .
```

**OU**

```bash
# Pour accepter LEUR version (distante) pour TOUS les fichiers
git checkout --theirs .
git add .
```

### Étape 3: Finaliser le merge

```bash
git commit -m "Merge: Résolution des conflits - Version locale conservée"
```

### Étape 4: Pousser les changements

```bash
git push origin main
```

---

## 🎨 Solution Sélective (Résoudre fichier par fichier)

Si vous voulez choisir quelle version conserver pour chaque fichier:

### 1. Voir les conflits

```bash
git diff --name-only --diff-filter=U
```

### 2. Pour CHAQUE fichier en conflit:

**Accepter la version locale:**
```bash
git checkout --ours chemin/vers/fichier.tsx
git add chemin/vers/fichier.tsx
```

**Accepter la version distante:**
```bash
git checkout --theirs chemin/vers/fichier.tsx
git add chemin/vers/fichier.tsx
```

**Éditer manuellement:**
```bash
# Ouvrir le fichier et chercher les marqueurs:
# <<<<<<< HEAD
# ...votre code...
# =======
# ...leur code...
# >>>>>>> branch-name

# Éditer pour garder ce que vous voulez, puis:
git add chemin/vers/fichier.tsx
```

### 3. Finaliser

```bash
git commit -m "Merge: Résolution sélective des conflits"
git push origin main
```

---

## 🛠️ Commandes Git Utiles

### Voir l'état actuel

```bash
git status
```

### Voir les fichiers en conflit seulement

```bash
git diff --name-only --diff-filter=U
```

### Annuler le merge en cours

```bash
git merge --abort
```

### Voir l'historique

```bash
git log --oneline --graph --all
```

### Forcer le push (ATTENTION - Écrase l'historique distant)

```bash
git push --force origin main
```

---

## 🎯 Stratégies Recommandées

### Scénario 1: Vous êtes sûr que votre version locale est correcte

```bash
node 🔧_RESOLVE_ALL_CONFLICTS.js
# OU
git checkout --ours .
git add .
git commit -m "Merge: Version locale conservée"
git push origin main
```

### Scénario 2: Vous voulez la version distante

```bash
node 🔧_RESOLVE_ALL_CONFLICTS.js --theirs
# OU
git checkout --theirs .
git add .
git commit -m "Merge: Version distante conservée"
git push origin main
```

### Scénario 3: C'est un mess complet - Recommencer

```bash
# Annuler le merge
git merge --abort

# Récupérer la version distante
git fetch origin main

# Voir les différences
git diff origin/main

# Décider: merge ou rebase
git merge origin/main
# OU
git rebase origin/main
```

---

## 🆘 En Cas de Problème

### Problème: "error: Your local changes would be overwritten"

```bash
# Sauvegarder vos modifications
git stash

# Résoudre les conflits
node 🔧_RESOLVE_ALL_CONFLICTS.js

# Récupérer vos modifications
git stash pop
```

### Problème: "fatal: Not a git repository"

Vous n'êtes pas dans le bon dossier. Naviguez vers la racine du projet:

```bash
cd /chemin/vers/smartcabb
```

### Problème: Les scripts ne s'exécutent pas

**Sur Linux/Mac:**
```bash
chmod +x 🔧_RESOLVE_ALL_CONFLICTS.sh
```

**Sur Windows:**
Utilisez le script .bat ou le script .js avec Node.js

---

## 📊 Workflow Idéal pour Éviter les Conflits à l'Avenir

### 1. Avant de commencer à coder

```bash
git pull origin main
```

### 2. Créer une branche pour vos modifications

```bash
git checkout -b feature/ma-fonctionnalite
```

### 3. Commiter régulièrement

```bash
git add .
git commit -m "Description claire des changements"
```

### 4. Avant de merger

```bash
# Mettre à jour main
git checkout main
git pull origin main

# Merger votre branche
git merge feature/ma-fonctionnalite

# Si conflits, les résoudre
# Puis push
git push origin main
```

---

## 🎓 Comprendre les Marqueurs de Conflit

Quand vous ouvrez un fichier en conflit, vous verrez:

```typescript
<<<<<<< HEAD
// Votre code (version locale)
const example = "locale";
=======
// Leur code (version distante)
const example = "distante";
>>>>>>> branch-name
```

**Pour résoudre manuellement:**

1. Supprimer les marqueurs (`<<<<<<<`, `=======`, `>>>>>>>`)
2. Garder le code que vous voulez
3. Sauvegarder
4. `git add fichier`

---

## ✅ Checklist de Résolution

- [ ] Sauvegarde du projet (copie locale)
- [ ] Décider quelle stratégie: locale ou distante
- [ ] Exécuter le script approprié
- [ ] Vérifier `git status`
- [ ] Commit des résolutions
- [ ] Push vers origin
- [ ] Vérifier sur GitHub/GitLab que tout est OK
- [ ] Tester l'application

---

## 🚨 Commandes d'Urgence

### Reset complet à la version distante (PERD VOS MODIFICATIONS)

```bash
git fetch origin
git reset --hard origin/main
git clean -fd
```

### Créer une branche de secours avant de résoudre

```bash
git branch backup-before-merge
```

Comme ça, si ça se passe mal:
```bash
git checkout backup-before-merge
```

---

## 📞 Support

Si vous êtes bloqué:

1. **Ne paniquez pas** - vos fichiers sont dans Git, rien n'est perdu
2. **Vérifiez** `git status` et `git log`
3. **Utilisez** `git merge --abort` pour annuler
4. **Demandez de l'aide** avec les sorties de `git status`

---

**Version:** SmartCabb v517.161.3  
**Date:** 13 janvier 2026  
**Auteur:** Équipe SmartCabb

**Bon courage ! 💪**
