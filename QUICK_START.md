# ⚡ Guide de démarrage rapide - SmartCabb

## 🎯 Commandes essentielles

### Vérifier l'état actuel
```bash
npm run check:imports
```

**Résultat :**
- ✅ Indique si vous êtes en mode **Figma Make** ou **Vercel**
- ⚠️ Détecte les imports mixtes (problématiques)
- 💡 Suggère l'action à prendre

---

### Préparer pour Vercel/GitHub
```bash
npm run prepare:vercel
```

**Ce que ça fait :**
1. Transforme tous les imports relatifs → imports directs
2. Remplace `from './framer-motion'` → `from 'motion/react'`
3. Remplace `from './lucide-react'` → `from 'lucide-react'`
4. Affiche un rapport détaillé

**Après exécution :**
```bash
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push
```

---

### Déploiement ultra-rapide
```bash
npm run quick-deploy
```

**Ce que ça fait :**
1. Transforme les imports pour Vercel
2. Add tous les fichiers à Git
3. Commit automatiquement avec message "deploy: automated"
4. Push sur GitHub
5. Vercel déploie automatiquement ! 🚀

---

### Revenir à Figma Make
```bash
npm run prepare:figma
```

**Quand l'utiliser :**
- Après avoir pull du code depuis GitHub
- Si vous devez continuer à travailler dans Figma Make
- Si vous voyez des erreurs de build dans Figma Make

---

## 🔄 Workflow typique

### Scénario 1 : Développement normal dans Figma Make

```bash
# Étape 1 : Développer dans Figma Make (déjà configuré ✅)

# Étape 2 : Vérifier l'état
npm run check:imports

# Étape 3 : Déployer
npm run quick-deploy
```

---

### Scénario 2 : Après un pull depuis GitHub

```bash
# Étape 1 : Pull les derniers changements
git pull origin main

# Étape 2 : Vérifier l'état
npm run check:imports
# → Résultat probable : "Environnement VERCEL/GITHUB"

# Étape 3 : Retransformer pour Figma Make
npm run prepare:figma

# Étape 4 : Continuer le développement dans Figma Make ✅
```

---

### Scénario 3 : Déploiement avec commit personnalisé

```bash
# Étape 1 : Transformer pour Vercel
npm run prepare:vercel

# Étape 2 : Vérifier les changements
git status
git diff

# Étape 3 : Commit avec message personnalisé
git add .
git commit -m "feat: ajout système de notifications SMS"
git push origin main
```

---

## 📊 Comprendre le rapport

Après `npm run check:imports` :

```
============================================================
📊 RAPPORT DE VÉRIFICATION
============================================================
🎨 Imports Figma Make  : 87
🌐 Imports Vercel      : 0
============================================================

✅ Environnement détecté : FIGMA MAKE
💡 Pour déployer sur Vercel : npm run prepare:vercel
```

**Signification :**
- **87 imports Figma Make** = Vous êtes en mode Figma Make ✅
- **0 imports Vercel** = Pas d'imports directs
- **Prêt à déployer** : Exécutez `npm run prepare:vercel`

---

Après `npm run prepare:vercel` :

```
🚀 Transformation des imports pour Vercel/GitHub...

📁 148 fichiers TypeScript trouvés

✅ components/driver/DriverDashboard.tsx (2 imports)
✅ components/passenger/EstimateScreen.tsx (3 imports)
✅ components/passenger/PaymentScreen.tsx (2 imports)
...

============================================================
📊 RAPPORT DE TRANSFORMATION
============================================================
📄 Fichiers analysés    : 148
✏️  Fichiers modifiés    : 43
🔄 Imports transformés  : 87
============================================================

✅ Transformation réussie !
💡 Vous pouvez maintenant commit et push sur GitHub.
🌐 Le déploiement Vercel utilisera les imports corrects.
```

**Signification :**
- **43 fichiers modifiés** = Nombre de fichiers qui utilisaient des imports Figma Make
- **87 imports transformés** = Total d'imports transformés
- **Prêt à commit** : `git add . && git commit && git push`

---

## ⚠️ Messages d'erreur courants

### Erreur : "Module not found: Can't resolve 'motion/react'"

**Cause :** Vous avez des imports Figma Make sur Vercel

**Solution :**
```bash
npm run prepare:vercel
git add .
git commit -m "fix: imports for Vercel"
git push
```

---

### Erreur : "63 erreurs de build" dans Figma Make

**Cause :** Vous avez des imports directs au lieu des wrappers

**Solution :**
```bash
npm run prepare:figma
```

---

### Erreur : "Fichiers avec imports mixtes détectés"

**Cause :** Certains fichiers mélangent les deux types d'imports

**Solution :**
```bash
# Choisissez votre environnement cible
npm run prepare:vercel  # OU
npm run prepare:figma
```

---

## 🎓 Points clés à retenir

1. **Toujours vérifier avant de déployer**
   ```bash
   npm run check:imports
   ```

2. **Toujours transformer avant de push sur GitHub**
   ```bash
   npm run prepare:vercel
   ```

3. **Toujours retransformer après un pull**
   ```bash
   git pull
   npm run prepare:figma
   ```

4. **Utiliser quick-deploy pour gagner du temps**
   ```bash
   npm run quick-deploy
   ```

---

## 📱 Commandes du quotidien

| Commande | Usage | Fréquence |
|----------|-------|-----------|
| `npm run check:imports` | Vérifier l'état | Avant chaque action |
| `npm run prepare:vercel` | Préparer pour GitHub | Avant chaque push |
| `npm run prepare:figma` | Retour à Figma Make | Après chaque pull |
| `npm run quick-deploy` | Déploiement rapide | Quotidien |
| `npm run dev` | Dev local (si installé) | Optionnel |

---

## 🚀 One-liner ultime

Déploiement en une seule ligne :

```bash
npm run check:imports && npm run quick-deploy
```

**Ce que ça fait :**
1. ✅ Vérifie l'état actuel
2. ✅ Transforme pour Vercel
3. ✅ Commit et push automatique
4. ✅ Vercel déploie ! 🎉

---

**Questions ?** Consultez [WORKFLOW.md](./WORKFLOW.md) pour plus de détails.
