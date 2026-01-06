# ⚡ QUICKFIX v517.109 - Correction immédiate

## 🚨 Erreur actuelle
```
ERROR: [plugin: npm] Failed to fetch
npm-modules:https://esm.sh/framer-motion
```

## ✅ Solution en 3 étapes (2 minutes)

### Étape 1: Copier cette commande (Linux/Mac)
```bash
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -exec sed -i "s|from 'motion/react'|from 'framer-motion@10.16.4'|g" {} + \
  -exec sed -i "s|from 'framer-motion'|from 'framer-motion@10.16.4'|g" {} +
```

### Étape 2: Commit et Push
```bash
git add .
git commit -m "fix: framer-motion@10.16.4 for esm.sh (v517.109)"
git push origin main
```

### Étape 3: Attendre le build Vercel
✅ Le build devrait réussir maintenant!

---

## 🪟 Pour Windows (VS Code)

1. Ouvrir VS Code
2. Appuyer `Ctrl+Shift+H`
3. **Chercher**: `from 'motion/react'`
4. **Remplacer**: `from 'framer-motion@10.16.4'`
5. Cliquer **Replace All**
6. Répéter avec:
   - Chercher: `from "motion/react"`
   - Remplacer: `from "framer-motion@10.16.4"`
7. Répéter avec:
   - Chercher: `from 'framer-motion'`
   - Remplacer: `from 'framer-motion@10.16.4'`

---

## 📋 Vérification rapide

```bash
# Après la correction, vérifier:
grep -r "motion/react" --include="*.tsx" . | grep -v node_modules
# Devrait ne rien afficher

grep -r "from 'framer-motion@" --include="*.tsx" . | grep -v node_modules | wc -l
# Devrait afficher environ 94
```

---

## 💡 Explication rapide

- **Problème**: esm.sh (CDN de Figma Make) nécessite une version explicite
- **Solution**: Ajouter `@10.16.4` à tous les imports framer-motion
- **Résultat**: Compatible Figma Make + Vercel

---

**Temps estimé**: 2-3 minutes  
**Difficulté**: ⭐ (Très facile)
