# 🎯 GUIDE FINAL - Gestion des Imports

## 🚨 SITUATION ACTUELLE

Vous développez SmartCabb dans **2 environnements différents** :

| Environnement | CDN/Package | Imports requis |
|--------------|-------------|----------------|
| **Figma Make** (dev actuel) | esm.sh | `motion/react`, `lucide-react`, `sonner` |
| **Vercel** (production) | npm | `framer-motion`, `lucide-react`, `sonner` |

---

## ✅ ÉTAT ACTUEL (Figma Make)

Tous les fichiers utilisent maintenant les **bons imports pour Figma Make** :
- ✅ `motion/react` (au lieu de `framer-motion`)
- ✅ `lucide-react` (sans version)
- ✅ `sonner` (sans version)

**L'application fonctionne maintenant dans Figma Make !** 🎉

---

## 🚀 POUR DÉPLOYER SUR VERCEL

**IMPORTANT :** Avant chaque push vers GitHub, exécutez :

```bash
python3 fix-vercel-imports.py
```

**OU:**

```bash
chmod +x fix-vercel-imports.sh
./fix-vercel-imports.sh
```

Ces scripts vont **automatiquement** convertir :
- `motion/react` → `framer-motion`
- Supprimer toutes les versions (@X.X.X)

---

## 📋 WORKFLOW COMPLET

### 1️⃣ Développer dans Figma Make

```bash
# Les imports sont déjà corrects !
# Développez normalement
```

### 2️⃣ Avant de push vers Vercel

```bash
# Convertir les imports
python3 fix-vercel-imports.py

# Vérifier
git status

# Commit et push
git add .
git commit -m "feat: Nouvelle fonctionnalité"
git push origin main
```

### 3️⃣ Après le déploiement Vercel (pour continuer à développer)

```bash
# Si vous voulez continuer à développer dans Figma Make
# après avoir pull depuis GitHub, restaurez les imports:

python3 restore-all-motion.py
```

---

## 🛠️ SCRIPTS DISPONIBLES

| Script | Usage | Description |
|--------|-------|-------------|
| `fix-vercel-imports.py` | Avant push vers Vercel | Convertit `motion/react` → `framer-motion` |
| `fix-vercel-imports.sh` | Alternative Bash | Même chose que le script Python |
| `restore-all-motion.py` | Après pull depuis GitHub | Restaure `framer-motion` → `motion/react` |
| `restore-figma-imports.sh` | Alternative Bash | Même chose que restore Python |

---

## 💡 COMMANDES RAPIDES

### Pour déployer sur Vercel (tout en une ligne)
```bash
python3 fix-vercel-imports.py && git add . && git commit -m "deploy: Production build" && git push origin main
```

### Pour revenir à Figma Make après pull
```bash
git pull origin main && python3 restore-all-motion.py
```

---

## ⚠️ POINTS IMPORTANTS

1. **NE JAMAIS** pusher des fichiers avec `motion/react` vers GitHub si vous voulez déployer sur Vercel
2. **TOUJOURS** exécuter `fix-vercel-imports.py` avant de pusher vers production
3. **NE PAS** commiter les changements de scripts de conversion
4. **VÉRIFIER** `git status` avant chaque commit

---

## 🐛 DÉBOGAGE

### Si Figma Make affiche des erreurs
```bash
# Vérifier les imports
grep -r "framer-motion" . --include="*.tsx" --include="*.ts" | grep -v node_modules

# Si résultat : exécuter
python3 restore-all-motion.py
```

### Si Vercel build échoue
```bash
# Vérifier les imports
grep -r "motion/react" . --include="*.tsx" --include="*.ts" | grep -v node_modules

# Si résultat : exécuter
python3 fix-vercel-imports.py
git add .
git commit -m "fix: Imports Vercel"
git push origin main
```

---

## 📊 RÉSUMÉ VISUEL

```
┌─────────────────────┐
│   FIGMA MAKE (dev)  │
│                     │
│  motion/react ✅    │
│  lucide-react ✅    │
│  sonner ✅          │
└─────────────────────┘
         │
         │ fix-vercel-imports.py
         ▼
┌─────────────────────┐
│  VERCEL (production)│
│                     │
│  framer-motion ✅   │
│  lucide-react ✅    │
│  sonner ✅          │
└─────────────────────┘
         │
         │ restore-all-motion.py
         ▼
┌─────────────────────┐
│   FIGMA MAKE (dev)  │
│   (back to dev)     │
└─────────────────────┘
```

---

## ✨ C'EST TOUT !

Maintenant vous pouvez :
- ✅ Développer dans Figma Make sans erreurs
- ✅ Déployer sur Vercel sans erreurs  
- ✅ Basculer entre les deux facilement

**Bon développement !** 🚀
