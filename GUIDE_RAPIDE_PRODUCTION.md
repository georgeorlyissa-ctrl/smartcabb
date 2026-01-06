# ⚡ Guide Rapide: Figma Make → GitHub/Vercel

## 🎯 Problème
Votre code utilise `from 'lucide-react@0.550.0'` (esm.sh) mais Vercel nécessite `from 'lucide-react'` (npm).

## ✅ Solution en 3 commandes

```bash
# 1. Convertir automatiquement tous les fichiers
bash convert-to-production.sh

# 2. Initialiser Git et pusher sur GitHub
git init
git add .
git commit -m "Production ready"
git remote add origin https://github.com/VOTRE_USERNAME/smartcabb.git
git push -u origin main

# 3. Déployer sur Vercel (via interface web)
# → vercel.com → Import Project → Sélectionner smartcabb → Deploy
```

## 📝 Qu'est-ce que le script fait ?

Le script `convert-to-production.sh` fait automatiquement:

✅ Remplace tous les imports:
- `from 'lucide-react@0.550.0'` → `from 'lucide-react'`
- `from 'sonner@2.0.3'` → `from 'sonner'`
- `from 'framer-motion@10.16.4'` → `from 'framer-motion'`

✅ Supprime les wrappers Figma Make

✅ Configure package.json pour npm

✅ Crée vite.config.ts optimisé

✅ Teste le build

## ⚠️ Variables d'environnement Vercel

Dans Vercel, ajoutez ces variables:
```
SUPABASE_URL=votre_url
SUPABASE_ANON_KEY=votre_key
SUPABASE_SERVICE_ROLE_KEY=votre_key
AFRICAS_TALKING_API_KEY=votre_key
AFRICAS_TALKING_USERNAME=votre_username
FLUTTERWAVE_SECRET_KEY=votre_key
SENDGRID_API_KEY=votre_key
```

## 🆘 Problème ?

**Build échoue ?**
```bash
# Vérifier les imports restants
grep -r "@0\." --include="*.tsx" . | grep -v node_modules
```

**Script ne fonctionne pas ?**
```bash
# Exécuter manuellement
node fix-for-production.js
npm install
npm run build
```

**Pour plus de détails:** Consultez `DEPLOIEMENT_PRODUCTION.md`

---

## 🎉 Résultat
✅ Code compilé sans erreur
✅ Compatible Vercel/npm
✅ Prêt pour smartcabb.com
