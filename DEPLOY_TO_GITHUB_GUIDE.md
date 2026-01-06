# 🚀 GUIDE DE DÉPLOIEMENT GITHUB → VERCEL
## SmartCabb - Étape par étape

---

## 📋 PRÉREQUIS

Avant de commencer, assurez-vous d'avoir :
- [ ] Git installé sur votre machine
- [ ] Accès à votre repo GitHub `smartcabb`
- [ ] Compte Vercel connecté à GitHub
- [ ] Terminal ouvert

---

## 🎯 MÉTHODE 1 : DÉPLOIEMENT AUTOMATIQUE (RECOMMANDÉ)

### Étape 1 : Télécharger les fichiers depuis Figma Make

Dans Figma Make, téléchargez TOUS les fichiers du projet.

### Étape 2 : Cloner votre repo GitHub

```bash
# Ouvrir un terminal et naviguer vers votre dossier de projets
cd ~/Documents/projets  # Ajustez selon votre structure

# Cloner le repo (si ce n'est pas déjà fait)
git clone https://github.com/VOTRE_USERNAME/smartcabb.git
cd smartcabb
```

### Étape 3 : Exécuter le script de déploiement

```bash
# Rendre le script exécutable
chmod +x deploy-from-figma.sh

# Exécuter le script
./deploy-from-figma.sh
```

Le script va :
1. ✅ Vérifier que vous êtes dans le bon dossier
2. ✅ Sauvegarder l'état actuel (backup)
3. ✅ Copier tous les nouveaux fichiers
4. ✅ Vérifier les fichiers critiques
5. ✅ Commiter et pousser vers GitHub
6. ✅ Déclencher le build Vercel automatiquement

---

## 🔧 MÉTHODE 2 : DÉPLOIEMENT MANUEL

### Étape 1 : Préparer votre environnement local

```bash
# Cloner ou mettre à jour votre repo
cd ~/Documents/projets
git clone https://github.com/VOTRE_USERNAME/smartcabb.git
cd smartcabb

# Vérifier la branche
git branch
# Vous devez être sur 'main' ou 'master'

# Si nécessaire, changer de branche
git checkout main
```

### Étape 2 : Copier les fichiers depuis Figma Make

**Option A : Copie manuelle**
- Ouvrez le dossier téléchargé depuis Figma Make
- Copiez TOUS les fichiers (sauf `node_modules` s'il existe)
- Collez dans votre dossier `smartcabb` local
- Remplacez les fichiers existants

**Option B : Avec ligne de commande**
```bash
# Remplacez /chemin/vers/figma-make par le vrai chemin
cp -r /chemin/vers/figma-make/* ~/Documents/projets/smartcabb/

# Vérifier que les fichiers sont bien copiés
ls -la
```

### Étape 3 : Vérifier les fichiers critiques

```bash
# Exécuter le script de vérification
chmod +x verify-before-deploy.sh
./verify-before-deploy.sh
```

### Étape 4 : Commiter et pousser

```bash
# Voir les fichiers modifiés
git status

# Ajouter tous les fichiers
git add .

# Vérifier ce qui va être commité
git status

# Commiter avec un message descriptif
git commit -m "feat: update from Figma Make - add .gitignore and .npmrc config files

- Add .gitignore with Figma Make exclusions
- Add .npmrc optimized for Vercel deployment
- Fix all import errors (AppProvider, lucide-react)
- Ready for production deployment on smartcabb.com"

# Pousser vers GitHub
git push origin main
```

### Étape 5 : Vérifier le déploiement Vercel

1. Allez sur https://vercel.com/dashboard
2. Sélectionnez votre projet `smartcabb`
3. Vous devriez voir un nouveau déploiement en cours
4. Attendez que le build se termine (2-5 minutes)
5. Vérifiez les logs en cas d'erreur

---

## 🛠️ MÉTHODE 3 : DÉPLOIEMENT PARTIEL (MISE À JOUR)

Si vous voulez juste mettre à jour certains fichiers :

```bash
# Copier uniquement les fichiers modifiés
cp /chemin/figma-make/.gitignore ~/Documents/projets/smartcabb/
cp /chemin/figma-make/.npmrc ~/Documents/projets/smartcabb/

# Commiter
git add .gitignore .npmrc
git commit -m "feat: add configuration files for production"
git push origin main
```

---

## ⚠️ EN CAS DE PROBLÈME

### Problème : Conflits Git

```bash
# Sauvegarder vos changements locaux
git stash

# Récupérer les dernières modifications
git pull origin main

# Réappliquer vos changements
git stash pop

# Résoudre les conflits manuellement, puis
git add .
git commit -m "resolve: merge conflicts"
git push origin main
```

### Problème : Build Vercel échoue

1. Vérifiez les logs sur Vercel Dashboard
2. Erreurs communes :
   - **Import errors** : Vérifiez que tous les imports sont corrects
   - **Type errors** : Vérifiez `tsconfig.json`
   - **Missing dependencies** : Vérifiez `package.json`

```bash
# Tester le build localement
npm install
npm run build

# Si ça fonctionne, poussez
git push origin main
```

### Problème : Variables d'environnement manquantes

Sur Vercel Dashboard :
1. Allez dans **Settings** → **Environment Variables**
2. Ajoutez les variables nécessaires :
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `AFRICAS_TALKING_API_KEY`
   - `AFRICAS_TALKING_USERNAME`
   - `FLUTTERWAVE_SECRET_KEY`
   - `SENDGRID_API_KEY`
3. **Redeploy** le projet

---

## ✅ CHECKLIST FINALE

Avant de déployer, vérifiez :

- [ ] Tous les fichiers sont copiés depuis Figma Make
- [ ] `.gitignore` et `.npmrc` sont présents
- [ ] `package.json` contient toutes les dépendances
- [ ] Variables d'environnement configurées sur Vercel
- [ ] Build local réussi (`npm run build`)
- [ ] Aucun fichier sensible n'est commité (`.env`, secrets)
- [ ] Commit message est descriptif
- [ ] Branch correcte (`main` ou `master`)

---

## 🎉 SUCCÈS !

Si tout s'est bien passé :
1. ✅ GitHub a reçu vos modifications
2. ✅ Vercel a détecté le changement
3. ✅ Build automatique en cours
4. ✅ Déploiement sur `smartcabb.com` dans quelques minutes

**Testez votre app :** https://smartcabb.com

---

## 📞 BESOIN D'AIDE ?

- **Logs Vercel** : https://vercel.com/dashboard → Votre projet → Deployments → Logs
- **GitHub Actions** : https://github.com/VOTRE_USERNAME/smartcabb/actions
- **Status Vercel** : https://www.vercel-status.com/

---

## 📝 NOTES IMPORTANTES

### Différences Figma Make vs Production

| Aspect | Figma Make | GitHub/Vercel |
|--------|------------|---------------|
| Imports | `esm.sh` CDN | `node_modules` |
| Config | Auto | `.npmrc`, `vercel.json` |
| Env vars | Figma UI | Vercel Dashboard |
| Build | Instantané | 2-5 minutes |
| Git | Non | Oui (versionning) |

### Workflow recommandé

```
Figma Make (Dev) → GitHub (Source) → Vercel (Production)
      ↓                  ↓                    ↓
  Prototypage       Versioning          smartcabb.com
```

---

**Créé pour SmartCabb 🇨🇩**  
*Version: 2024-01-04*
