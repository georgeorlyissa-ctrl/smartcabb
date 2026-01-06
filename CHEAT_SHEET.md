# 🚀 SmartCabb - Aide-mémoire

## 📝 Commandes NPM

```bash
# Vérifier l'environnement actuel
npm run check:imports

# Préparer pour Vercel/GitHub
npm run prepare:vercel

# Préparer pour Figma Make
npm run prepare:figma

# Déploiement complet automatique
npm run quick-deploy

# Développement local
npm run dev

# Build production
npm run build
```

---

## 🔄 Workflows

### 🎨 Figma Make → 🌐 GitHub/Vercel
```bash
npm run prepare:vercel && git add . && git commit -m "deploy" && git push
```

### 🌐 GitHub → 🎨 Figma Make
```bash
git pull && npm run prepare:figma
```

### ⚡ Déploiement ultra-rapide
```bash
npm run quick-deploy
```

---

## 📁 Structure

```
smartcabb/
├── components/
│   ├── admin/          # 🎛️ Dashboard admin
│   ├── driver/         # 🚗 Interface chauffeur
│   ├── passenger/      # 📱 App passager
│   ├── auth/           # 🔐 Authentification
│   ├── shared/         # 🔄 Composants partagés
│   └── ui/             # 🎨 Composants UI de base
├── lib/                # 🛠️ Utilitaires et services
├── pages/              # 📄 Pages
├── supabase/           # 🗄️ Backend
│   └── functions/      # ⚡ Edge Functions
├── scripts/            # 🤖 Scripts de transformation
│   ├── prepare-for-vercel.mjs
│   ├── prepare-for-figma.mjs
│   └── check-imports.mjs
└── styles/             # 🎨 Styles globaux
```

---

## 🔑 Variables d'environnement (déjà configurées)

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `FLUTTERWAVE_SECRET_KEY`
- `AFRICAS_TALKING_API_KEY`
- `AFRICAS_TALKING_USERNAME`
- `SENDGRID_API_KEY`

---

## 💰 Prix des véhicules

| Catégorie | Base | Prix/km | Nuit (+30%) |
|-----------|------|---------|-------------|
| Standard  | 2000 | 350 CDF | 21h-5h |
| Confort   | 3000 | 450 CDF | 21h-5h |
| Premium   | 5000 | 650 CDF | 21h-5h |
| Van       | 6000 | 700 CDF | 21h-5h |

---

## 🗺️ Coordonnées RDC

**Kinshasa :** -4.322447, 15.307045  
**Lubumbashi :** -11.6796, 27.5126  
**Goma :** -1.6744, 29.2244  
**Bukavu :** -2.5081, 28.8546  
**Kisangani :** 0.5167, 25.2000

---

## 🔧 Git

```bash
# Statut
git status

# Pull
git pull origin main

# Commit rapide
git add . && git commit -m "message" && git push

# Annuler dernier commit (garder les changements)
git reset --soft HEAD~1

# Voir les changements
git diff
```

---

## 🚨 Dépannage

### Build error Vercel : "Can't resolve 'motion/react'"
```bash
npm run prepare:vercel
git add . && git commit -m "fix" && git push
```

### 63 erreurs Figma Make
```bash
npm run prepare:figma
```

### Imports mixtes
```bash
npm run check:imports
# Puis choisir : prepare:vercel OU prepare:figma
```

---

## 📞 Contacts

**Support :** support@smartcabb.com  
**Site :** smartcabb.com  
**Production :** [Vercel Dashboard](https://vercel.com)

---

## ⚡ One-liners

```bash
# Vérifier + Déployer
npm run check:imports && npm run quick-deploy

# Pull + Préparer Figma
git pull && npm run prepare:figma

# Tout nettoyer et rebuild
npm run clean && npm install && npm run build

# Voir les logs de déploiement Vercel
vercel logs smartcabb --prod
```

---

**Made with ❤️ in RDC 🇨🇩**
