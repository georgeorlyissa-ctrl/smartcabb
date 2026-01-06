# Changelog

Toutes les modifications notables de SmartCabb sont documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Versioning Sémantique](https://semver.org/lang/fr/).

---

## [1.0.0] - 2026-01-03

### 🎉 Version Initiale Production

Première version production-ready de SmartCabb, convertie depuis Figma Make vers GitHub/Vercel.

### ✅ Ajouté

#### Fonctionnalités principales
- Interface passager complète avec réservation en temps réel
- Interface conducteur avec acceptation/refus de courses
- Panel administrateur avec dashboard et statistiques
- Authentification sécurisée avec SMS OTP (Africa's Talking)
- Géolocalisation GPS précise pour la RDC
- Système de paiement multi-méthodes (Mobile Money, Cash, Mixte)
- Intégration Flutterwave pour paiements mobile
- Système de notation 5 étoiles
- Support multilingue (Français, Lingala, Swahili)
- Historique des courses
- Gestion des promotions et codes promo
- Calcul automatique des prix en CDF
- Matching intelligent conducteur-passager par catégorie de véhicule
- Suivi de course en temps réel sur carte
- Notifications SMS

#### Backend
- Backend Supabase avec PostgreSQL
- Edge Functions avec Hono (serveur API)
- KV Store pour données en temps réel
- Authentification Supabase Auth
- Gestion de fichiers Supabase Storage

#### Infrastructure
- Build Vite optimisé pour production
- Déploiement Vercel avec CI/CD
- Configuration auto-deploy sur git push
- SSL/HTTPS automatique
- Code splitting intelligent
- Optimisations de bundle

#### Scripts de conversion
- `convert-to-production.sh` - Script tout-en-un pour conversion automatique
- `fix-for-production.js` - Script Node.js de conversion des imports
- Conversion automatique de 140+ imports esm.sh → npm

#### Documentation
- `START_HERE.md` - Guide de démarrage rapide
- `README_DEPLOIEMENT.md` - Guide complet de déploiement
- `GUIDE_RAPIDE_PRODUCTION.md` - Guide express 5 minutes
- `ERREUR_RESOLUE.md` - Résolution erreur "Cannot import"
- `INDEX_DEPLOIEMENT.md` - Table des matières
- `VISUAL_GUIDE.txt` - Guide visuel ASCII
- `README.md` - Documentation principale du projet
- `CHANGELOG.md` - Ce fichier

### 🔧 Modifié

#### Imports
- **AVANT**: `from 'lucide-react@0.550.0'` (esm.sh)
- **APRÈS**: `from 'lucide-react'` (npm)

Packages concernés:
- `lucide-react@0.550.0` → `lucide-react`
- `sonner@2.0.3` → `sonner`
- `framer-motion@10.16.4` → `framer-motion`
- `motion/react` → `framer-motion`

Total: 140+ imports corrigés dans 94 fichiers

#### Configuration
- `package.json` adapté pour npm (suppression des versions dans imports)
- `vite.config.ts` optimisé pour production Vercel
- `.gitignore` configuré pour ignorer node_modules, dist, .env

### 🗑️ Supprimé

#### Wrappers Figma Make
Fichiers nécessaires uniquement pour esm.sh CDN, supprimés pour production:
- `/lib/motion-wrapper.tsx`
- `/motion/react.tsx`
- `/framer-motion.tsx`
- `/lucide-react.ts`

Ces wrappers servaient à adapter framer-motion et lucide-react pour esm.sh mais causent des problèmes sur npm/Vite.

### 🐛 Corrigé

#### Erreur de build Vercel
- **Problème**: Build échouait avec `"Cannot import 'framer-motion@10.16.4'"`
- **Cause**: Imports avec versions (syntaxe esm.sh) incompatibles avec npm/Rollup
- **Solution**: Conversion automatique de tous les imports vers syntaxe npm standard
- **Impact**: 94 fichiers modifiés, 140+ imports corrigés
- **Résultat**: Build réussi, application déployable sur Vercel

#### Problèmes de compatibilité
- Résolution des conflits esm.sh vs npm
- Suppression des dépendances circulaires dans les wrappers
- Fix des imports relatifs pour production

### 📊 Métriques

- **Fichiers source**: 150+ fichiers `.tsx` et `.ts`
- **Lignes de code**: ~15,000 lignes
- **Composants React**: 80+ composants
- **Taille du bundle**: ~2.1 MB (optimisé avec code splitting)
- **Temps de build**: ~45 secondes
- **Support navigateurs**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### 🔒 Sécurité

- Authentification sécurisée avec Supabase Auth
- SMS OTP pour vérification téléphone
- Variables d'environnement pour clés API sensibles
- HTTPS obligatoire en production
- Validation côté serveur de tous les paiements
- Protection CSRF
- Rate limiting sur API

### 🌍 Localisation RDC

- Devise: Franc Congolais (CDF)
- Langues: Français, Lingala, Swahili
- Noms congolais pour conducteurs de test
- Coordonnées GPS de Kinshasa par défaut
- Intégration paiements mobile money RDC

---

## [0.5.0] - 2026-01-02 (Figma Make)

### Note
Version développée dans Figma Make avec esm.sh CDN. Non compatible avec production npm/Vercel sans conversion.

### Fonctionnalités
- Prototype fonctionnel de l'application
- Interfaces passager et conducteur basiques
- Tests de géolocalisation
- Tests de paiement Flutterwave en mode sandbox

---

## Types de changements

- `Ajouté` pour les nouvelles fonctionnalités
- `Modifié` pour les changements dans les fonctionnalités existantes
- `Déprécié` pour les fonctionnalités qui seront bientôt supprimées
- `Supprimé` pour les fonctionnalités supprimées
- `Corrigé` pour les corrections de bugs
- `Sécurité` pour les vulnérabilités

---

## Versions à venir

### [1.1.0] - Prévu Q1 2026
- [ ] Application mobile native (React Native)
- [ ] Support pour autres villes de RDC (Lubumbashi, Goma)
- [ ] Programme de fidélité
- [ ] Notifications push natives
- [ ] Mode hors-ligne amélioré

### [1.2.0] - Prévu Q2 2026
- [ ] API publique pour partenaires
- [ ] Widget d'intégration tierce
- [ ] Support de courses partagées (covoiturage)
- [ ] Planification de courses à l'avance
- [ ] Support de livraison de colis

### [2.0.0] - Prévu Q3 2026
- [ ] Refonte UI/UX complète
- [ ] Architecture microservices
- [ ] Support multi-pays (Afrique centrale)
- [ ] Intégration blockchain pour paiements

---

## Support des versions

| Version | Status | Support jusqu'à | Notes |
|---------|--------|-----------------|-------|
| 1.0.x | ✅ Active | 2026-12-31 | Version actuelle production |
| 0.5.x | ❌ Obsolète | 2026-01-03 | Version Figma Make uniquement |

---

## Liens

- [Code source](https://github.com/USERNAME/smartcabb)
- [Site web](https://smartcabb.com)
- [Documentation](./README_DEPLOIEMENT.md)
- [Signaler un bug](https://github.com/USERNAME/smartcabb/issues)
- [Demander une fonctionnalité](https://github.com/USERNAME/smartcabb/issues/new?labels=enhancement)

---

**Légende des émojis**
- 🎉 Version majeure
- ✅ Ajout
- 🔧 Modification
- 🗑️ Suppression
- 🐛 Correction de bug
- 🔒 Sécurité
- 📊 Métriques
- 🌍 Localisation
- ⚡ Performance
- 📚 Documentation
