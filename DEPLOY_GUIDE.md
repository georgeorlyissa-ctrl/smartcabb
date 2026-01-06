# 🚀 Guide de déploiement SmartCabb

## 🎯 Objectif

Déployer SmartCabb de **Figma Make** vers **GitHub/Vercel** sans conflit d'imports.

---

## ✅ Étapes de déploiement

### Option 1 : Déploiement automatique (RECOMMANDÉ)

```bash
npm run quick-deploy
```

**Terminé !** 🎉 Votre code est sur GitHub et Vercel le déploie automatiquement.

---

### Option 2 : Déploiement manuel (contrôle total)

#### Étape 1 : Vérifier l'état actuel
```bash
npm run check:imports
```

**Résultat attendu :**
```
✅ Environnement détecté : FIGMA MAKE
💡 Pour déployer sur Vercel : npm run prepare:vercel
```

#### Étape 2 : Transformer pour Vercel
```bash
npm run prepare:vercel
```

**Résultat :**
```
🚀 Transformation des imports pour Vercel/GitHub...

✅ components/driver/DriverDashboard.tsx (2 imports)
✅ components/passenger/EstimateScreen.tsx (3 imports)
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
```

#### Étape 3 : Vérifier les changements (optionnel)
```bash
git status
git diff
```

#### Étape 4 : Commit et push
```bash
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin main
```

#### Étape 5 : Vérifier le déploiement
Allez sur [vercel.com](https://vercel.com) et vérifiez que le déploiement se lance automatiquement.

---

## 🔄 Revenir à Figma Make après déploiement

Si vous voulez continuer à développer dans Figma Make :

```bash
npm run prepare:figma
```

**Important :** Ne committez PAS après cette commande ! C'est uniquement pour continuer le développement local dans Figma Make.

---

## 🤖 Option 3 : Git Hooks automatiques (AVANCÉ)

Pour que la transformation se fasse **automatiquement** à chaque commit :

```bash
bash setup-git-hooks.sh
```

**Après cette configuration :**
```bash
# Vous faites juste :
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push

# La transformation se fait AUTOMATIQUEMENT avant le commit ! ✨
```

**Pour désactiver temporairement :**
```bash
git commit --no-verify -m "message"
```

---

## 📋 Checklist de déploiement

Avant chaque déploiement :

- [ ] ✅ Code testé dans Figma Make
- [ ] ✅ `npm run check:imports` exécuté
- [ ] ✅ Environnement détecté : "FIGMA MAKE"
- [ ] ✅ `npm run prepare:vercel` exécuté
- [ ] ✅ Rapport de transformation affiché
- [ ] ✅ Changements vérifiés avec `git diff`
- [ ] ✅ Commit avec message descriptif
- [ ] ✅ Push sur GitHub
- [ ] ✅ Vérification du déploiement Vercel

---

## 🚨 Problèmes courants

### ❌ Erreur : "Module not found: Can't resolve 'motion/react'"

**Cause :** Vous avez des imports Figma Make sur Vercel

**Solution immédiate :**
```bash
npm run prepare:vercel
git add .
git commit -m "fix: imports for Vercel"
git push
```

---

### ❌ Erreur : "63 build errors" dans Figma Make

**Cause :** Vous avez des imports Vercel dans Figma Make

**Solution :**
```bash
npm run prepare:figma
# NE PAS COMMIT APRÈS !
```

---

### ⚠️ Warning : "Fichiers avec imports mixtes"

**Cause :** Certains fichiers mélangent les deux types d'imports

**Solution :**
```bash
# Choisir votre environnement cible
npm run prepare:vercel  # Pour déployer
# OU
npm run prepare:figma   # Pour développer
```

---

### ❌ Erreur : Build Vercel réussit mais app ne fonctionne pas

**Vérifications :**

1. **Variables d'environnement** dans Vercel Dashboard
   - SUPABASE_URL ✅
   - SUPABASE_ANON_KEY ✅
   - FLUTTERWAVE_SECRET_KEY ✅
   - etc.

2. **Logs Vercel**
   ```bash
   vercel logs smartcabb --prod
   ```

3. **Console navigateur**
   - Ouvrir DevTools → Console
   - Chercher les erreurs

---

## 📊 Comprendre la transformation

### AVANT (Figma Make)
```tsx
import { motion } from '../../framer-motion';
import { Star } from '../../lucide-react';
```

### APRÈS (Vercel)
```tsx
import { motion } from 'motion/react';
import { Star } from 'lucide-react';
```

**Pourquoi ?**
- Figma Make utilise esm.sh CDN → wrappers locaux requis
- Vercel utilise node_modules → imports directs standard

---

## 🎓 Best Practices

### ✅ À FAIRE

1. **Toujours vérifier avant de déployer**
   ```bash
   npm run check:imports
   ```

2. **Toujours transformer avant de push**
   ```bash
   npm run prepare:vercel
   ```

3. **Utiliser des messages de commit descriptifs**
   ```bash
   git commit -m "feat: ajout notifications SMS pour chauffeurs"
   ```

4. **Tester dans Figma Make avant de déployer**

5. **Vérifier le déploiement Vercel après push**

### ❌ À NE PAS FAIRE

1. **Ne jamais commit les wrappers Figma Make**
   - Ils sont dans `.gitignore` automatiquement

2. **Ne jamais mixer les deux types d'imports**
   - Utilisez toujours les scripts de transformation

3. **Ne jamais modifier manuellement les imports**
   - Trop de fichiers (43+), trop de risques d'erreur

4. **Ne jamais commit après `prepare:figma`**
   - Cette commande est UNIQUEMENT pour développement local

5. **Ne jamais push sans transformer**
   - Vercel build va échouer

---

## 🔐 Sécurité

Les fichiers suivants NE SONT PAS committés sur GitHub (`.gitignore`) :

- `/framer-motion.tsx` ❌
- `/lucide-react.tsx` ❌
- `node_modules/` ❌
- `.env*` ❌
- `.vercel/` ❌

**Résultat :** GitHub et Vercel n'ont JAMAIS les wrappers Figma Make ✅

---

## 📈 Workflow quotidien

### Matin : Sync avec GitHub
```bash
git pull origin main
npm run prepare:figma
# Développer dans Figma Make
```

### Soir : Déploiement
```bash
npm run check:imports
npm run quick-deploy
# Vérifier sur vercel.com
```

---

## 🆘 Support

En cas de problème :

1. **Consultez ce guide** et [QUICK_START.md](./QUICK_START.md)
2. **Vérifiez les logs Vercel**
3. **Exécutez `npm run check:imports`**
4. **Vérifiez le rapport de transformation**
5. **Contactez support@smartcabb.com**

---

## 🎉 Résumé en 3 lignes

```bash
npm run check:imports      # Vérifier
npm run prepare:vercel     # Transformer
git add . && git commit -m "deploy" && git push  # Déployer
```

**OU simplement :**

```bash
npm run quick-deploy
```

---

**Bon déploiement ! 🚀**

Made with ❤️ in RDC 🇨🇩
