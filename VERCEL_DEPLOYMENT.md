# 🚀 DÉPLOIEMENT VERCEL - SMARTCABB

## ⚙️ **CONFIGURATION REQUISE**

### **1️⃣ Variables d'environnement Vercel**

Allez sur votre projet Vercel :
👉 https://vercel.com/your-username/smartcabb/settings/environment-variables

Ajoutez ces 2 variables d'environnement :

| Variable | Valeur |
|----------|--------|
| `VITE_SUPABASE_URL` | `https://zaerjqchzqmcxqblkfkg.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphZXJqcWNoenFtY3hxYmxrZmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNDMyOTgsImV4cCI6MjA3NTcxOTI5OH0.qwFRKsi9Gw4VVYoEGBBCIj0-lAZOxtqlGQ0eT6cPhik` |

**⚠️ IMPORTANT :** Appliquez ces variables à **tous les environnements** (Production, Preview, Development)

---

### **2️⃣ Configuration Build Vercel**

Vercel devrait détecter automatiquement Vite, mais si nécessaire :

```
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

---

### **3️⃣ Redéployer après modification**

Après avoir ajouté les variables d'environnement :

```bash
# Sur GitHub
git add .
git commit -m "fix: add Vercel environment variables support"
git push origin main
```

Ou depuis Vercel Dashboard :
👉 **Deployments** → **Redeploy**

---

## 🔍 **VÉRIFICATION**

Une fois déployé, ouvrez la console du navigateur sur **smartcabb.com** :

Vous devriez voir :
```
🔐 Supabase Config: {
  source: 'VERCEL (.env)',
  projectId: 'zaerjqch...',
  hasAnonKey: true
}
```

Si vous voyez `source: 'FIGMA_MAKE'`, c'est que les variables d'environnement ne sont pas configurées.

---

## ❌ **RÉSOLUTION D'ERREURS**

### **Erreur : `undefined.supabase.co`**

➡️ **Cause** : Variables d'environnement manquantes sur Vercel

➡️ **Solution** :
1. Allez sur Vercel Dashboard
2. Settings → Environment Variables
3. Ajoutez `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`
4. Redéployez

---

### **Erreur : `Failed to fetch`**

➡️ **Cause** : Backend Supabase non accessible

➡️ **Solution** :
1. Vérifiez que Supabase est actif : https://supabase.com/dashboard/project/zaerjqchzqmcxqblkfkg
2. Vérifiez les CORS dans Supabase
3. Vérifiez que la clé API est valide

---

## 📊 **FICHIERS MODIFIÉS**

- `/utils/supabase/info.tsx` - Détection auto environnement
- `/.env` - Variables locales (NE PAS COMMITER)
- `/.env.example` - Template pour autres devs
- `/.gitignore` - Protection fichiers sensibles

---

## 🎯 **RÉSULTAT ATTENDU**

✅ Aucune erreur `undefined.supabase.co`
✅ GPS instantané fonctionne
✅ Backend connecté
✅ Application déployée sur smartcabb.com
