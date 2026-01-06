# 📚 SmartCabb - Index de documentation

Bienvenue dans la documentation SmartCabb ! Voici tous les guides disponibles.

---

## 🚀 Guides de démarrage

### 1. [QUICK_START.md](./QUICK_START.md) ⚡
**Pour qui :** Développeurs qui veulent démarrer rapidement

**Contenu :**
- ✅ Commandes essentielles
- ✅ Workflows typiques
- ✅ Comprendre les rapports
- ✅ Messages d'erreur courants
- ✅ One-liners utiles

**Temps de lecture :** 5 minutes

---

### 2. [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md) 🚀
**Pour qui :** Déploiement vers Vercel/GitHub

**Contenu :**
- ✅ 3 options de déploiement (auto/manuel/hooks)
- ✅ Checklist complète
- ✅ Dépannage détaillé
- ✅ Best practices
- ✅ Sécurité

**Temps de lecture :** 10 minutes

---

### 3. [WORKFLOW.md](./WORKFLOW.md) 🔄
**Pour qui :** Comprendre le système en profondeur

**Contenu :**
- ✅ Problématique technique détaillée
- ✅ Comment fonctionnent les scripts
- ✅ Automatisation avancée (Git hooks, npm scripts)
- ✅ Fichiers protégés
- ✅ Dépannage exhaustif

**Temps de lecture :** 15 minutes

---

### 4. [CHEAT_SHEET.md](./CHEAT_SHEET.md) 📝
**Pour qui :** Référence rapide quotidienne

**Contenu :**
- ✅ Toutes les commandes NPM
- ✅ Structure du projet
- ✅ Variables d'environnement
- ✅ Prix des véhicules
- ✅ Coordonnées RDC
- ✅ One-liners Git

**Temps de lecture :** 2 minutes (référence)

---

## 📖 Documentation technique

### 5. [README.md](./README.md) 📱
**Pour qui :** Vue d'ensemble du projet

**Contenu :**
- ✅ Présentation SmartCabb
- ✅ Stack technique
- ✅ Installation
- ✅ Structure du projet
- ✅ Fonctionnalités
- ✅ Types de véhicules

**Temps de lecture :** 8 minutes

---

## 🛠️ Scripts et outils

### Scripts de transformation

| Script | Fichier | Description |
|--------|---------|-------------|
| `npm run prepare:vercel` | `/scripts/prepare-for-vercel.mjs` | Transforme Figma Make → Vercel |
| `npm run prepare:figma` | `/scripts/prepare-for-figma.mjs` | Transforme Vercel → Figma Make |
| `npm run check:imports` | `/scripts/check-imports.mjs` | Vérifie l'environnement actuel |

### Configuration

| Fichier | Description |
|---------|-------------|
| `/setup-git-hooks.sh` | Configure la transformation automatique au commit |
| `/.gitignore` | Exclut les wrappers Figma Make de GitHub |
| `/.npmrc` | Configuration npm pour ESM |
| `/package.json` | Scripts npm et dépendances |

---

## 🎯 Parcours recommandé

### Pour débuter (30 min)
1. Lire [README.md](./README.md) - 8 min
2. Lire [QUICK_START.md](./QUICK_START.md) - 5 min
3. Lire [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md) - 10 min
4. Bookmark [CHEAT_SHEET.md](./CHEAT_SHEET.md) - 2 min
5. Tester `npm run quick-deploy` - 5 min

### Pour maîtriser (1h)
1. Tout le parcours débutant - 30 min
2. Lire [WORKFLOW.md](./WORKFLOW.md) en détail - 15 min
3. Configurer Git Hooks avec `setup-git-hooks.sh` - 5 min
4. Tester tous les workflows - 10 min

### Pour référence quotidienne
1. Garder [CHEAT_SHEET.md](./CHEAT_SHEET.md) ouvert
2. Exécuter `npm run check:imports` avant chaque action
3. Utiliser `npm run quick-deploy` pour déployer

---

## 🔍 Recherche rapide

### Je veux...

**...déployer maintenant**
→ [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md) - Section "Option 1 : Automatique"
```bash
npm run quick-deploy
```

**...comprendre les erreurs**
→ [QUICK_START.md](./QUICK_START.md) - Section "Messages d'erreur courants"

**...voir toutes les commandes**
→ [CHEAT_SHEET.md](./CHEAT_SHEET.md) - Section "Commandes NPM"

**...configurer Git Hooks**
→ [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md) - Section "Option 3 : Git Hooks"
```bash
bash setup-git-hooks.sh
```

**...comprendre pourquoi ça existe**
→ [WORKFLOW.md](./WORKFLOW.md) - Section "Problématique"

**...revenir à Figma Make**
→ [QUICK_START.md](./QUICK_START.md) - Section "Scénario 2"
```bash
npm run prepare:figma
```

**...voir la structure du projet**
→ [README.md](./README.md) - Section "Structure du projet"

**...connaître les prix**
→ [CHEAT_SHEET.md](./CHEAT_SHEET.md) - Section "Prix des véhicules"

---

## 📊 Arborescence complète

```
smartcabb/
├── 📚 DOCUMENTATION
│   ├── README.md                    # Vue d'ensemble
│   ├── QUICK_START.md               # Démarrage rapide
│   ├── DEPLOY_GUIDE.md              # Guide de déploiement
│   ├── WORKFLOW.md                  # Workflow détaillé
│   ├── CHEAT_SHEET.md               # Aide-mémoire
│   └── DOCUMENTATION_INDEX.md       # Ce fichier
│
├── 🤖 SCRIPTS
│   ├── scripts/
│   │   ├── prepare-for-vercel.mjs   # Transformation Vercel
│   │   ├── prepare-for-figma.mjs    # Transformation Figma
│   │   └── check-imports.mjs        # Vérification
│   └── setup-git-hooks.sh           # Configuration Git
│
├── ⚙️ CONFIGURATION
│   ├── .gitignore                   # Exclusions Git
│   ├── .npmrc                       # Config npm
│   ├── package.json                 # Dépendances & scripts
│   ├── vite.config.ts               # Config Vite
│   └── tsconfig.json                # Config TypeScript
│
├── 📱 APPLICATION
│   ├── App.tsx                      # Point d'entrée
│   ├── components/                  # Composants React
│   ├── lib/                         # Utilitaires
│   ├── pages/                       # Pages
│   ├── styles/                      # Styles
│   └── supabase/                    # Backend
│
└── 🔧 WRAPPERS (Figma Make uniquement)
    ├── framer-motion.tsx            # Wrapper Motion
    └── lucide-react.tsx             # Wrapper Lucide
```

---

## 💡 Conseils

### 📌 À épingler
1. [CHEAT_SHEET.md](./CHEAT_SHEET.md) - Pour référence quotidienne
2. [QUICK_START.md](./QUICK_START.md) - Pour les commandes fréquentes

### 🔖 À lire une fois
1. [README.md](./README.md) - Pour comprendre le projet
2. [WORKFLOW.md](./WORKFLOW.md) - Pour comprendre le système

### 🎯 À utiliser régulièrement
1. `npm run check:imports` - Avant chaque action
2. `npm run quick-deploy` - Pour déployer
3. [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md) - Si problème

---

## 🆘 Besoin d'aide ?

1. **Chercher dans cette documentation**
   - Utilisez Ctrl+F dans chaque fichier
   - Consultez la section "Recherche rapide" ci-dessus

2. **Exécuter les commandes de diagnostic**
   ```bash
   npm run check:imports
   ```

3. **Consulter les logs**
   ```bash
   # Logs transformation
   npm run prepare:vercel
   
   # Logs Git
   git status
   git log --oneline -5
   
   # Logs Vercel
   vercel logs smartcabb --prod
   ```

4. **Contacter le support**
   - Email : support@smartcabb.com
   - GitHub Issues (si configuré)

---

## 🎓 Glossaire

| Terme | Signification |
|-------|---------------|
| **Figma Make** | Environnement de développement web de Figma |
| **Vercel** | Plateforme de déploiement (production) |
| **Wrapper** | Fichier qui réexporte un module pour compatibilité |
| **Import relatif** | `from './fichier'` (chemin relatif) |
| **Import direct** | `from 'package'` (depuis node_modules) |
| **esm.sh** | CDN pour modules ES utilisé par Figma Make |
| **Transform** | Convertir un type d'import vers un autre |
| **Git Hook** | Script qui s'exécute automatiquement avec Git |

---

## 📅 Dernière mise à jour

**Date :** 5 janvier 2026  
**Version :** 517.109.0  
**Statut :** ✅ Production

---

**Questions ?** Consultez d'abord cette documentation, puis contactez support@smartcabb.com

**Made with ❤️ in RDC 🇨🇩**
