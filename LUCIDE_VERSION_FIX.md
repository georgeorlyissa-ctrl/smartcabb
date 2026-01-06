# 🔧 FIX: Lucide React Version Lock (v517.9)

## 🚨 Problème

L'application chargeait `lucide-react@0.561.0` au lieu de `0.263.1`, causant des erreurs :
- Build errors: "Route is not exported"
- Runtime errors dans le navigateur

## ✅ Solutions Appliquées

### 1. **Package.json** - Verrouillage de version
```json
{
  "dependencies": {
    "lucide-react": "0.263.1"
  }
}
```

### 2. **Vite Config** - Alias de résolution
```ts
// vite.config.ts
resolve: {
  alias: {
    'lucide-react': 'lucide-react@0.263.1'
  }
}
```

### 3. **Import Map** - Force la version dans le navigateur
```html
<!-- index.html -->
<script type="importmap">
{
  "imports": {
    "lucide-react": "https://esm.sh/lucide-react@0.263.1"
  }
}
</script>
```

### 4. **Fix Icône Route → Navigation**
- Fichier: `/components/passenger/RideHistoryScreen.tsx`
- Changement: `Route` → `Navigation` (compatible 0.263.1)

## 📦 Fichiers Modifiés

- ✅ `/package.json` → Version verrouillée à 0.263.1
- ✅ `/vite.config.ts` → Alias ajouté
- ✅ `/index.html` → Import map ajouté
- ✅ `/.npmrc` → Créé pour legacy-peer-deps
- ✅ `/components/passenger/RideHistoryScreen.tsx` → Icon fix
- ✅ `/BUILD_VERSION.ts` → v517.9
- ✅ `/public/sw.js` → v517.9

## 🚀 Déploiement

```bash
git add .
git commit -m "🔧 v517.9 - Force lucide-react@0.263.1 (import map + vite alias)"
git push origin main
```

## 🧪 Vérification Post-Déploiement

1. Ouvrir la console du navigateur
2. Vérifier qu'aucune erreur lucide-react n'apparaît
3. Tester les écrans avec des icônes (RideHistory, Dashboard, etc.)
4. Vérifier le bouton VisualDebug 🐛 en bas à droite

## 📝 Notes

- L'import map est supporté par tous les navigateurs modernes
- Vite alias garantit la bonne résolution au build
- Package.json verrouille la version pour npm install
