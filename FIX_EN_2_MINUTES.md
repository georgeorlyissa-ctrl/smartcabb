# ⚡ FIX BUILD VERCEL EN 2 MINUTES

## 🎯 PROBLÈME
Build Vercel échoue avec erreur "Could not resolve"

---

## ✅ SOLUTION

### **ÉTAPE 1 : Terminal (1 minute)**

```bash
cd ~/chemin/vers/smartcabb

rm -f lib/route-calculator.ts components/InteractiveRouteMap.tsx && \
sed -i.bak 's/export { Loader as Loader2 }/export { Loader2 }/' lib/icons.ts && \
rm -rf node_modules/.vite dist .vercel && \
git add -A && \
git commit -m "fix: build" && \
git push origin main
```

*(Remplacer `~/chemin/vers/smartcabb` par votre vrai chemin)*

---

### **ÉTAPE 2 : Vercel (1 minute)**

1. https://vercel.com → Deployments
2. Redeploy → ☑️ **Clear Build Cache**
3. Deploy

---

## ✅ TERMINÉ !

Ouvrir : **https://smartcabb.com** ✅

---

## 📖 PLUS DE DÉTAILS ?

| Besoin | Fichier |
|--------|---------|
| Guide simple | `FIX_SIMPLE_3_ETAPES.md` |
| Script auto | `COMMANDES_FIX_EXACTES.sh` |
| Doc complète | `VERCEL_BUILD_FIX_COMPLET.md` |

---

**Temps total : 2 minutes** ⏱️
