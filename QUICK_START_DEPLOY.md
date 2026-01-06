# ⚡ DÉMARRAGE RAPIDE - DÉPLOIEMENT EN 3 ÉTAPES

## 🎯 Pour déployer SmartCabb de Figma Make vers GitHub/Vercel

---

## 📥 ÉTAPE 1 : TÉLÉCHARGER LES FICHIERS

Dans **Figma Make** :
1. Cliquez sur le bouton de téléchargement/export
2. Téléchargez tous les fichiers du projet
3. Notez le chemin où ils sont sauvegardés (ex: `~/Downloads/smartcabb-figma`)

---

## 💻 ÉTAPE 2 : CLONER VOTRE REPO GITHUB

Ouvrez un terminal et exécutez :

```bash
# Naviguer vers votre dossier de projets
cd ~/Documents/projets

# Cloner le repo (remplacez VOTRE_USERNAME par votre nom d'utilisateur GitHub)
git clone https://github.com/VOTRE_USERNAME/smartcabb.git

# Entrer dans le dossier
cd smartcabb
```

---

## 🚀 ÉTAPE 3 : EXÉCUTER LE SCRIPT DE DÉPLOIEMENT

### Option A : Script automatique (RECOMMANDÉ) ⭐

```bash
# Rendre le script exécutable
chmod +x deploy-from-figma.sh

# Lancer le déploiement
./deploy-from-figma.sh
```

Le script vous demandera :
1. Le chemin vers vos fichiers Figma Make
2. Confirmation avant de pousser vers GitHub

### Option B : Script manuel

```bash
# 1. Vérifier que tout est OK
chmod +x verify-before-deploy.sh
./verify-before-deploy.sh

# 2. Si tout est vert, copier manuellement les fichiers
cp -r /chemin/vers/figma-make/* ./

# 3. Commiter et pousser
git add .
git commit -m "feat: update from Figma Make with config files"
git push origin main
```

---

## ✅ VÉRIFICATION FINALE

Après avoir poussé vers GitHub :

1. **Allez sur Vercel** : https://vercel.com/dashboard
2. **Sélectionnez** votre projet `smartcabb`
3. **Surveillez** le déploiement en cours (2-5 minutes)
4. **Testez** votre app : https://smartcabb.com

---

## 🔧 EN CAS DE PROBLÈME

### Le build Vercel échoue ?

```bash
# Tester le build localement
npm install
npm run build

# Si ça marche, re-pusher
git push origin main --force
```

### Variables d'environnement manquantes ?

Sur **Vercel Dashboard** → **Settings** → **Environment Variables**, ajoutez :
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AFRICAS_TALKING_API_KEY`
- `AFRICAS_TALKING_USERNAME`
- `FLUTTERWAVE_SECRET_KEY`
- `SENDGRID_API_KEY`

Puis **Redeploy** le projet.

---

## 📚 DOCUMENTATION COMPLÈTE

Pour plus de détails, consultez : `DEPLOY_TO_GITHUB_GUIDE.md`

---

## 🎉 C'EST TOUT !

Votre app sera disponible sur **https://smartcabb.com** dans quelques minutes.

**Bon déploiement ! 🇨🇩🚀**
