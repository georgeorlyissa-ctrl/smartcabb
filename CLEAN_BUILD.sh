#!/bin/bash

##############################################################################
# 🧹 NETTOYAGE TOTAL + BUILD SMARTCABB
##############################################################################

set -e

echo ""
echo "========================================================================"
echo "🧹 NETTOYAGE TOTAL SMARTCABB"
echo "========================================================================"
echo ""

# 1. Nettoyage profond
echo "🗑️  Suppression node_modules, dist, caches..."
rm -rf node_modules
rm -rf dist
rm -rf .vercel
rm -rf node_modules/.vite
rm -rf node_modules/.cache
rm -f package-lock.json
rm -f npm-debug.log*
rm -f yarn-error.log*
echo "✅ Nettoyage terminé"
echo ""

# 2. Vérifier vite.config.ts
echo "🔍 Vérification vite.config.ts..."
cat vite.config.ts
echo ""

# 3. Installation fraîche
echo "📦 Installation npm (3-5 min)..."
npm cache clean --force 2>/dev/null || true
npm install --legacy-peer-deps || {
    echo "❌ Installation échouée avec --legacy-peer-deps, essai avec --force..."
    npm install --force || {
        echo "❌ npm install échoué complètement"
        exit 1
    }
}
echo "✅ Installation réussie"
echo ""

# 4. Vérifier que react et vite sont installés
echo "🔍 Vérification des packages critiques..."
if [ ! -d "node_modules/react" ]; then
    echo "❌ React non installé !"
    exit 1
fi

if [ ! -d "node_modules/vite" ]; then
    echo "❌ Vite non installé !"
    exit 1
fi

echo "✅ React: $(node -p "require('./node_modules/react/package.json').version")"
echo "✅ Vite: $(node -p "require('./node_modules/vite/package.json').version")"
echo ""

# 5. Build
echo "🏗️  Lancement build Vite..."
npm run build 2>&1 | tee build.log || {
    echo ""
    echo "========================================================================"
    echo "❌ BUILD ÉCHOUÉ"
    echo "========================================================================"
    echo ""
    echo "Dernières lignes d'erreur :"
    tail -n 30 build.log
    exit 1
}

echo ""
echo "========================================================================"
echo "✅ BUILD RÉUSSI !"
echo "========================================================================"
echo ""
echo "📂 Fichiers générés :"
ls -lh dist/ | head -n 20
echo ""
echo "📊 Taille totale dist/ :"
du -sh dist/
echo ""
