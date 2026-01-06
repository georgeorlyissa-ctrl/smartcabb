# ⚡ GUIDE RAPIDE VERCEL - 5 MINUTES

## 🎯 **ÉTAPES OBLIGATOIRES**

### **1️⃣ Ajouter les variables d'environnement (2 min)**

1. Allez sur : https://vercel.com/votre-compte/smartcabb/settings/environment-variables

2. Cliquez sur **"Add New"**

3. Ajoutez cette variable :
   ```
   Name: VITE_SUPABASE_URL
   Value: https://zaerjqchzqmcxqblkfkg.supabase.co
   Environments: ✅ Production ✅ Preview ✅ Development
   ```

4. Cliquez sur **"Save"**

5. Ajoutez cette deuxième variable :
   ```
   Name: VITE_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphZXJqcWNoenFtY3hxYmxrZmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNDMyOTgsImV4cCI6MjA3NTcxOTI5OH0.qwFRKsi9Gw4VVYoEGBBCIj0-lAZOxtqlGQ0eT6cPhik
   Environments: ✅ Production ✅ Preview ✅ Development
   ```

6. Cliquez sur **"Save"**

---

### **2️⃣ Pousser le code sur GitHub (1 min)**

```bash
git add .
git commit -m "v517.92: GPS instantané + fix Vercel deployment"
git push origin main
```

---

### **3️⃣ Redéployer sur Vercel (1 min)**

**Option A (Auto)** : Vercel redéploie automatiquement après le push GitHub ✅

**Option B (Manuel)** :
1. Allez sur : https://vercel.com/votre-compte/smartcabb/deployments
2. Cliquez sur les **3 points** du dernier déploiement
3. Cliquez sur **"Redeploy"**

---

### **4️⃣ Vérifier que ça marche (1 min)**

1. Ouvrez : https://smartcabb.com

2. Ouvrez la **Console du navigateur** (F12)

3. Vous devriez voir :
   ```
   🔐 Supabase Config: {
     source: 'VERCEL (.env)',  ← IMPORTANT !
     projectId: 'zaerjqch...',
     hasAnonKey: true
   }
   ```

4. Si vous voyez `source: 'FIGMA_MAKE'`, retournez à l'étape 1

---

## ✅ **CHECKLIST FINALE**

- [ ] Variables d'environnement ajoutées sur Vercel
- [ ] Code poussé sur GitHub
- [ ] Déploiement lancé
- [ ] Console affiche `source: 'VERCEL (.env)'`
- [ ] Aucune erreur `undefined.supabase.co`
- [ ] GPS s'affiche en < 3 secondes
- [ ] Application fonctionne normalement

---

## 🆘 **EN CAS DE PROBLÈME**

### **Erreur persiste après redéploiement**

1. **Vider le cache Vercel** :
   - Allez sur Vercel Dashboard
   - Cliquez sur **Settings**
   - Cliquez sur **"Clear Cache"**
   - Redéployez

2. **Vérifier les variables** :
   - Retournez sur **Environment Variables**
   - Vérifiez que les 2 variables sont présentes
   - Vérifiez qu'elles sont actives sur **tous les environnements**

3. **Hard reload navigateur** :
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

---

## 📸 **CAPTURE D'ÉCRAN DES VARIABLES**

Sur Vercel, ça devrait ressembler à :

```
Environment Variables (2)

Name                      Value                    Environments
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VITE_SUPABASE_URL         https://zaerjq...        🌍 🔍 💻
VITE_SUPABASE_ANON_KEY    eyJhbGciOiJI...         🌍 🔍 💻

Legend: 🌍 Production  🔍 Preview  💻 Development
```

---

## 🎉 **C'EST TOUT !**

Votre application devrait maintenant fonctionner parfaitement sur **smartcabb.com** ! 🚀
