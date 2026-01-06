# ❓ FAQ - Questions Fréquemment Posées

> Réponses aux questions courantes sur le déploiement de SmartCabb

---

## 🔴 Erreurs et Problèmes

### Q: Le script `convert-to-production.sh` ne fonctionne pas sur Windows

**A:** Windows utilise PowerShell/CMD par défaut qui ne supporte pas les scripts Bash.

**Solutions:**
1. **Git Bash** (recommandé):
   ```bash
   # Clic droit dans le dossier → Git Bash Here
   bash convert-to-production.sh
   ```

2. **WSL** (Windows Subsystem for Linux):
   ```bash
   wsl
   bash convert-to-production.sh
   ```

3. **Méthode manuelle** (si Git Bash ne fonctionne pas):
   ```bash
   node fix-for-production.js
   mv package.json.production package.json
   mv vite.config.ts.production vite.config.ts
   mv .gitignore.production .gitignore
   npm install
   npm run build
   ```

---

### Q: J'ai l'erreur "Cannot import 'framer-motion@10.16.4'"

**A:** C'est exactement l'erreur que nous corrigeons ! Cela signifie que les imports n'ont pas été convertis.

**Solution:**
```bash
# 1. Vérifier les imports restants
grep -r "from ['\"].*@[0-9]" --include="*.tsx" . | grep -v node_modules

# 2. Re-exécuter la conversion
node fix-for-production.js

# 3. Rebuilder
npm run build
```

---

### Q: `npm install` prend très longtemps (10+ minutes)

**A:** C'est normal, surtout la première fois. npm télécharge ~500 MB de dépendances.

**Facteurs:**
- Vitesse de connexion Internet
- État des serveurs npm
- Performance de votre ordinateur

**Astuce:** Utiliser `npm ci` pour une installation plus rapide (si package-lock.json existe)

---

### Q: Git me demande un mot de passe mais il ne fonctionne pas

**A:** GitHub a désactivé l'authentification par mot de passe en 2021.

**Solution - Personal Access Token:**
1. GitHub → Settings (icône profil en haut à droite)
2. Developer settings (tout en bas)
3. Personal access tokens → Tokens (classic)
4. Generate new token (classic)
5. Note: "SmartCabb deployment"
6. Expiration: 90 days (ou No expiration)
7. Scopes: Cocher `repo` (tout)
8. Generate token
9. **COPIER LE TOKEN** (vous ne le verrez qu'une fois!)
10. Utiliser ce token comme "mot de passe" dans le terminal

**Alternative - SSH:**
```bash
# Générer une clé SSH
ssh-keygen -t ed25519 -C "your_email@example.com"

# Copier la clé publique
cat ~/.ssh/id_ed25519.pub

# Ajouter sur GitHub → Settings → SSH and GPG keys → New SSH key
```

---

### Q: Le build réussit mais le site ne charge pas

**A:** Problème de variables d'environnement.

**Checklist:**
1. ✅ Variables ajoutées dans Vercel Dashboard
2. ✅ Nom des variables correct (pas de fautes de frappe)
3. ✅ Valeurs des variables correctes (copier-coller depuis Supabase)
4. ✅ Redéploiement fait après ajout des variables

**Vérification:**
- F12 dans le navigateur → Console
- Chercher les erreurs en rouge
- Si "Failed to fetch" → Backend non configuré
- Si "Invalid API key" → Variables incorrectes

---

### Q: La géolocalisation ne fonctionne pas

**A:** La géolocalisation nécessite HTTPS (ou localhost).

**Sur Vercel:** ✅ HTTPS automatique, ça doit fonctionner

**Raisons possibles:**
1. Navigateur bloque la géolocalisation → Autoriser dans les paramètres
2. Pas sur HTTPS → Déployer sur Vercel
3. Code géolocalisation incorrect → Vérifier la console (F12)

---

### Q: Les paiements ne fonctionnent pas

**A:** En mode test, c'est normal que certains paiements échouent.

**Checklist:**
1. ✅ `FLUTTERWAVE_SECRET_KEY` configuré
2. ✅ Mode test activé dans Flutterwave Dashboard
3. ✅ Carte de test utilisée (voir docs Flutterwave)

**Cartes de test Flutterwave:**
- Succès: `5531886652142950`
- Échec: `5531886652142951`

---

## 🌐 Déploiement

### Q: Combien coûte le déploiement ?

**A:** **Gratuit** pour commencer !

**Tarifs:**
- **Vercel**: Plan gratuit inclut:
  - Bande passante illimitée
  - 100 GB/mois de build
  - HTTPS automatique
  - Déploiements illimités

- **Supabase**: Plan gratuit inclut:
  - 500 MB de stockage base de données
  - 2 GB de stockage fichiers
  - 50,000 utilisateurs actifs/mois

**Upgrade nécessaire si:**
- Plus de 100 GB de build/mois
- Plus de 500 MB de données
- Plus de 50,000 utilisateurs

---

### Q: Combien de temps prend un déploiement ?

**A:** 
- **Premier déploiement**: 3-5 minutes
- **Redéploiements**: 1-2 minutes
- **Build local**: 30-60 secondes

---

### Q: Puis-je utiliser un autre service que Vercel ?

**A:** Oui ! L'application est compatible avec:

- **Netlify**: Similaire à Vercel
- **Cloudflare Pages**: Gratuit, rapide
- **AWS Amplify**: Plus complexe
- **DigitalOcean App Platform**: Payant
- **Heroku**: Payant (plus de plan gratuit)

**Mais Vercel est recommandé** pour sa simplicité et intégration avec Supabase.

---

### Q: Comment déployer sur un serveur VPS (DigitalOcean, AWS EC2) ?

**A:** C'est plus complexe mais possible.

**Étapes:**
```bash
# Sur le serveur
git clone https://github.com/USERNAME/smartcabb.git
cd smartcabb
npm install
npm run build

# Servir avec nginx
sudo apt install nginx
# Configurer nginx pour servir dist/
```

**Pas recommandé pour débutants** - Utiliser Vercel à la place.

---

## 📦 Configuration

### Q: Où mettre les clés API sensibles ?

**A:** **JAMAIS** dans le code source !

**Bon:**
- Fichier `.env` (local, gitignored)
- Variables d'environnement Vercel

**Mauvais:**
- ❌ Hardcodé dans le code
- ❌ Dans un fichier commité sur Git
- ❌ Dans le frontend (visible dans le navigateur)

---

### Q: Comment gérer plusieurs environnements (dev, staging, prod) ?

**A:** Utiliser les environnements Vercel.

**Setup:**
1. Créer 3 branches Git:
   - `main` → Production
   - `staging` → Staging
   - `dev` → Development

2. Dans Vercel, configurer:
   - Production: branche `main`
   - Preview: branches `staging`, `dev`

3. Variables d'environnement différentes par environnement

---

### Q: Comment configurer un domaine personnalisé ?

**A:** Via Vercel Dashboard.

**Étapes:**
1. Acheter un domaine (Namecheap, GoDaddy, etc.)
2. Vercel → Projet → Settings → Domains
3. Add Domain: `smartcabb.com`
4. Suivre les instructions DNS

**DNS Records:**
```
Type: A
Name: @
Value: 76.76.21.21 (IP Vercel)

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Délai:** 5-30 minutes (propagation DNS)

---

## 🔧 Développement

### Q: Comment ajouter une nouvelle fonctionnalité ?

**A:** Workflow standard:

```bash
# 1. Créer une branche
git checkout -b feature/nouvelle-fonctionnalite

# 2. Développer
# Modifier les fichiers...

# 3. Tester localement
npm run dev

# 4. Commiter
git add .
git commit -m "Ajout de la nouvelle fonctionnalité"

# 5. Pusher
git push origin feature/nouvelle-fonctionnalite

# 6. Créer une Pull Request sur GitHub

# 7. Merger dans main
# 8. Vercel auto-déploie
```

---

### Q: Comment revenir en arrière après un mauvais déploiement ?

**A:** Vercel permet de revenir à une version précédente.

**Via Web:**
1. Vercel Dashboard → Deployments
2. Trouver le déploiement précédent (qui fonctionnait)
3. Cliquer les 3 points → Promote to Production

**Via Git:**
```bash
# Revert le dernier commit
git revert HEAD
git push

# Ou reset à un commit spécifique
git log --oneline
git reset --hard COMMIT_HASH
git push --force
```

---

### Q: Comment débugger une erreur en production ?

**A:** Utiliser les logs Vercel.

**Étapes:**
1. Vercel Dashboard → Deployments
2. Cliquer sur le déploiement avec erreur
3. Onglet "Runtime Logs" ou "Build Logs"
4. Chercher les erreurs en rouge

**Alternative - Console navigateur:**
1. Ouvrir le site
2. F12 → Console
3. Reproduire l'erreur
4. Noter le message d'erreur

---

## 🚀 Performance

### Q: Mon site est lent, que faire ?

**A:** Plusieurs optimisations possibles.

**Vérifier:**
1. **Taille du bundle**: `npm run build` → regarder dist/
2. **Images**: Compresser avec TinyPNG
3. **Code splitting**: Déjà configuré dans `vite.config.ts`
4. **Cache**: Activé automatiquement par Vercel

**Tests:**
- Chrome DevTools → Lighthouse
- [PageSpeed Insights](https://pagespeed.web.dev/)

---

### Q: Comment réduire la taille du bundle ?

**A:** Le `vite.config.ts` inclut déjà du code splitting.

**Optimisations supplémentaires:**
```typescript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor': ['react', 'react-dom'],
        'maps': ['react-leaflet', 'leaflet'],
        'charts': ['recharts'],
      }
    }
  }
}
```

---

## 🔒 Sécurité

### Q: Mon API key est visible dans le code, c'est grave ?

**A:** **Très grave si c'est une clé secrète !**

**Clés publiques** (OK dans le code):
- `SUPABASE_ANON_KEY` (publique)
- `STRIPE_PUBLISHABLE_KEY` (publique)

**Clés secrètes** (JAMAIS dans le code):
- `SUPABASE_SERVICE_ROLE_KEY` ❌
- `FLUTTERWAVE_SECRET_KEY` ❌
- `SENDGRID_API_KEY` ❌

**Si exposée:**
1. Révoquer immédiatement la clé
2. Générer une nouvelle clé
3. La mettre dans `.env` (gitignored)
4. Commit du code sans la clé
5. Configurer dans Vercel

---

### Q: Comment protéger mon backend des abus ?

**A:** Plusieurs couches de sécurité.

**Dans le code:**
```typescript
// Rate limiting
// CORS
// Validation des inputs
// Authentification sur toutes les routes sensibles
```

**Supabase:**
- Row Level Security (RLS)
- API key rotation
- Monitoring des requêtes

---

## 💰 Coûts

### Q: Quand vais-je devoir payer ?

**A:** Dépend de votre usage.

**Plan gratuit Vercel suffit si:**
- Moins de 100 déploiements/jour
- Moins de 100 GB de bande passante/mois
- 1 équipe (vous)

**Plan gratuit Supabase suffit si:**
- Moins de 500 MB de données
- Moins de 50,000 utilisateurs actifs/mois
- Moins de 2 GB de fichiers

**Upgrade nécessaire pour:**
- Application virale (100k+ utilisateurs)
- Beaucoup de données (videos, images)
- Équipe de développement

---

### Q: Combien coûte l'upgrade ?

**A:** Tarifs 2026:

**Vercel:**
- Pro: $20/mois (par personne)
- Team: Custom pricing

**Supabase:**
- Pro: $25/mois (par projet)
- Team: $599/mois

**Total pour une petite app:** ~$45/mois

---

## 📱 Mobile

### Q: Comment créer une app mobile ?

**A:** Plusieurs options:

1. **PWA** (déjà inclus !):
   - Installer depuis le navigateur
   - Fonctionne offline
   - Notifications push

2. **React Native**:
   - App native iOS/Android
   - Partage 80% du code avec le web
   - Nécessite développement supplémentaire

3. **Capacitor/Ionic**:
   - Wrapper autour de l'app web
   - Distribution via App Store/Play Store

---

### Q: SmartCabb est-elle déjà une PWA ?

**A:** Oui ! Les composants PWA sont inclus:
- `PWAInstallPrompt.tsx`
- Manifest
- Service Worker (si configuré)

**Pour l'installer:**
1. Ouvrir sur mobile
2. Menu navigateur → "Ajouter à l'écran d'accueil"
3. L'app s'installe comme une app native

---

## 🌍 Internationalisation

### Q: Comment ajouter une nouvelle langue ?

**A:** Modifier les fichiers de traduction.

**Structure actuelle:**
```typescript
// hooks/useTranslation.ts
const translations = {
  fr: { ... },
  ln: { ... },  // Lingala
  sw: { ... },  // Swahili
  en: { ... },  // À ajouter
};
```

**Ajouter une langue:**
1. Ajouter l'objet `en` avec toutes les traductions
2. Ajouter dans le sélecteur de langue
3. Tester tous les écrans

---

## 🐛 Bugs Connus

### Q: Y a-t-il des bugs connus ?

**A:** Consulter les [Issues GitHub](https://github.com/USERNAME/smartcabb/issues)

**Signaler un bug:**
1. GitHub → Issues → New Issue
2. Template: Bug Report
3. Décrire le problème
4. Étapes pour reproduire
5. Screenshots si possible

---

## 📚 Documentation

### Q: Quel fichier lire en premier ?

**A:** Dépend de votre situation:

**Déploiement rapide:**
→ `START_HERE.md` (5 min)

**Premier déploiement:**
→ `GUIDE_SIMPLE.md` (débutants)
→ `README_DEPLOIEMENT.md` (développeurs)

**Erreur de build:**
→ `ERREUR_RESOLUE.md`

**Référence rapide:**
→ `CHEATSHEET.md`

**Questions:**
→ `FAQ.md` (ce fichier)

---

### Q: La documentation est-elle à jour ?

**A:** Oui, version 1.0 datant du 3 janvier 2026.

**Contributions bienvenues** pour améliorer la documentation !

---

## 🤝 Contribution

### Q: Puis-je contribuer au projet ?

**A:** Absolument !

**Comment:**
1. Fork le repository
2. Créer une branche: `feature/ma-contribution`
3. Développer et tester
4. Créer une Pull Request
5. Attendre la review

**Ce qui est utile:**
- Corrections de bugs
- Nouvelles fonctionnalités
- Amélioration de la documentation
- Tests
- Traductions

---

### Q: Puis-je vendre une app basée sur SmartCabb ?

**A:** Oui ! C'est sous licence MIT.

**Vous pouvez:**
- ✅ Utiliser commercialement
- ✅ Modifier le code
- ✅ Distribuer
- ✅ Utiliser en privé

**Vous devez:**
- ✅ Inclure la licence MIT
- ✅ Inclure le copyright

**Vous ne pouvez pas:**
- ❌ Tenir les auteurs responsables

---

## 🎓 Apprentissage

### Q: Je débute, par où commencer ?

**A:** Ressources recommandées:

**JavaScript/TypeScript:**
- [JavaScript.info](https://javascript.info/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

**React:**
- [React Official Tutorial](https://react.dev/learn)
- [React Beta Docs](https://react.dev/)

**Git:**
- [Git Book](https://git-scm.com/book/fr/v2)
- [GitHub Skills](https://skills.github.com/)

**Deployment:**
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)

---

### Q: Combien de temps pour maîtriser la stack ?

**A:** Dépend de votre niveau:

**Débutant complet:**
- JavaScript: 3-6 mois
- React: 2-3 mois
- TypeScript: 1-2 mois
- Git: 1 mois

**Développeur expérimenté:**
- Stack complète: 2-4 semaines

**Pour maintenir SmartCabb:**
- 1-2 semaines pour comprendre le code

---

## 📞 Support

### Q: Où obtenir de l'aide ?

**A:** Plusieurs options:

1. **Documentation** (ce repo)
2. **GitHub Issues** (bugs, questions)
3. **Stack Overflow** (questions techniques)
4. **Discord/Slack** (communauté, si disponible)
5. **Email** contact@smartcabb.com

---

### Q: Proposez-vous du support payant ?

**A:** Non actuellement, mais contributions GitHub bienvenues !

---

## 🔮 Futur

### Q: Quelles sont les prochaines fonctionnalités ?

**A:** Voir `CHANGELOG.md` section "Versions à venir":

**v1.1 (Q1 2026):**
- App mobile React Native
- Support autres villes RDC
- Programme de fidélité

**v1.2 (Q2 2026):**
- API publique
- Courses partagées
- Livraison de colis

**v2.0 (Q3 2026):**
- Refonte UI/UX
- Architecture microservices
- Multi-pays

---

**Votre question n'est pas listée ?**

→ Créer une [Issue GitHub](https://github.com/USERNAME/smartcabb/issues)  
→ On l'ajoutera à cette FAQ !

---

**Version**: 1.0  
**Dernière mise à jour**: 3 janvier 2026  
**Contributeurs**: SmartCabb Team
