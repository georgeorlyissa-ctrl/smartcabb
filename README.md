# 🚖 SmartCabb - Application de Transport RDC

SmartCabb est une application complète de transport pour la République Démocratique du Congo, comprenant :

- 📱 **Application passager** - Réservation de courses en temps réel
- 🚗 **Application chauffeur** - Gestion des courses et revenus
- 🎛️ **Panel administrateur** - Dashboard et statistiques

## 🌍 Production

**URL** : [smartcabb.com](https://smartcabb.com)

**Stack technique** :
- ⚛️ React + TypeScript
- 🎨 Tailwind CSS v4
- 🗄️ Supabase (Backend, Auth, Storage)
- 🗺️ Leaflet (Cartes interactives)
- 🎭 Motion (Animations)
- 📊 Recharts (Graphiques)

## 🚀 Déploiement rapide

### Depuis Figma Make vers GitHub/Vercel :

```bash
# 1. Transformer les imports pour Vercel
npm run prepare:vercel

# 2. Commit et push
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin main
```

**OU** en une seule commande :

```bash
npm run quick-deploy
```

## 🛠️ Développement

### Installation

```bash
npm install
```

### Démarrage local

```bash
npm run dev
```

### Build

```bash
npm run build
```

## 📁 Structure du projet

```
smartcabb/
├── components/
│   ├── admin/          # Composants admin
│   ├── driver/         # Composants chauffeur
│   ├── passenger/      # Composants passager
│   ├── auth/           # Authentification
│   ├── shared/         # Composants partagés
│   └── ui/             # Composants UI de base
├── lib/                # Utilitaires et services
├── pages/              # Pages de l'application
├── supabase/           # Backend Supabase
│   └── functions/      # Edge Functions
├── scripts/            # Scripts de transformation
└── styles/             # Styles globaux
```

## 🔄 Workflow Figma Make ↔ Vercel

SmartCabb est développé dans **Figma Make** puis déployé sur **Vercel via GitHub**.

Les deux environnements utilisent des systèmes d'imports différents. Des scripts automatiques gèrent la transformation :

- `npm run prepare:vercel` - Prépare le code pour Vercel/GitHub
- `npm run prepare:figma` - Retour aux imports Figma Make

**📖 Guide complet** : Voir [WORKFLOW.md](./WORKFLOW.md)

## 💰 Système de paiement

SmartCabb utilise **Flutterwave** pour les paiements :
- Mobile Money (MTN, Airtel, Orange, Vodacom)
- Cartes bancaires
- Paiement en espèces

**Devise** : Franc Congolais (CDF) 🇨🇩

## 🗺️ Zones de service

Actuellement disponible à :
- Kinshasa
- Lubumbashi
- Goma
- Bukavu
- Kisangani

## 🔐 Variables d'environnement

Les secrets suivants sont déjà configurés :

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `FLUTTERWAVE_SECRET_KEY`
- `AFRICAS_TALKING_API_KEY`
- `AFRICAS_TALKING_USERNAME`
- `SENDGRID_API_KEY`

## 📱 Fonctionnalités principales

### Passager
- ✅ Réservation de course en temps réel
- ✅ Estimation de prix transparente
- ✅ Suivi GPS du chauffeur
- ✅ Paiement mobile et espèces
- ✅ Historique des courses
- ✅ Système de notation
- ✅ Support multilingue (FR/EN)

### Chauffeur
- ✅ Tableau de bord temps réel
- ✅ Gestion du statut en ligne/hors ligne
- ✅ Navigation intégrée
- ✅ Suivi des gains
- ✅ Gestion du portefeuille
- ✅ Historique des courses

### Admin
- ✅ Dashboard avec statistiques
- ✅ Gestion des utilisateurs
- ✅ Gestion des chauffeurs
- ✅ Monitoring des courses en temps réel
- ✅ Rapports et analytics
- ✅ Configuration des prix
- ✅ Gestion des commissions

## 🚗 Types de véhicules

| Catégorie | Prix de base | Prix/km |
|-----------|--------------|---------|
| **Standard** | 2000 CDF | 350 CDF |
| **Confort** | 3000 CDF | 450 CDF |
| **Premium** | 5000 CDF | 650 CDF |
| **Van** | 6000 CDF | 700 CDF |

*Tarifs de nuit : +30% (21h-5h)*

## 🤝 Contribution

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Commitez vos changements (`git commit -m 'Add: Amazing Feature'`)
4. Transformez pour Vercel (`npm run prepare:vercel`)
5. Pushez (`git push origin feature/AmazingFeature`)
6. Ouvrez une Pull Request

## 📄 Licence

Propriété de SmartCabb - Tous droits réservés © 2026

## 📞 Contact

**Email** : support@smartcabb.com  
**Site** : [smartcabb.com](https://smartcabb.com)  
**WhatsApp** : +243 XXX XXX XXX

---

Fait avec ❤️ en République Démocratique du Congo 🇨🇩
