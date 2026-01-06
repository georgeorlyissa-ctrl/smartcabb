#!/bin/bash

# 🚀 Script de conversion automatique Figma Make → Production Vercel
# Exécute toutes les étapes nécessaires pour préparer le déploiement

echo "================================================"
echo "🚀 CONVERSION FIGMA MAKE → PRODUCTION VERCEL"
echo "================================================"
echo ""

# Vérifier qu'on est dans le bon répertoire
if [ ! -f "App.tsx" ]; then
    echo "❌ Erreur: App.tsx introuvable"
    echo "   Assurez-vous d'être dans le répertoire racine du projet"
    exit 1
fi

echo "📋 Étape 1/7: Backup des fichiers importants..."
mkdir -p .backup
cp package.json .backup/package.json.figma-make 2>/dev/null || true
echo "   ✓ Backup créé dans .backup/"
echo ""

echo "🔧 Étape 2/7: Conversion des imports (esm.sh → npm)..."
node fix-for-production.js
echo ""

echo "🗑️  Étape 3/7: Suppression des wrappers Figma Make..."
FILES_TO_DELETE=(
    "lib/motion-wrapper.tsx"
    "motion/react.tsx"
    "framer-motion.tsx"
    "lucide-react.ts"
)

for file in "${FILES_TO_DELETE[@]}"; do
    if [ -f "$file" ]; then
        rm "$file"
        echo "   ✓ Supprimé: $file"
    fi
done
echo ""

echo "📦 Étape 4/7: Configuration des fichiers de production..."

# Remplacer package.json
if [ -f "package.json.production" ]; then
    mv package.json package.json.figma-make
    mv package.json.production package.json
    echo "   ✓ package.json mis à jour"
fi

# Remplacer vite.config.ts
if [ -f "vite.config.ts.production" ]; then
    mv vite.config.ts.production vite.config.ts
    echo "   ✓ vite.config.ts créé"
fi

# Remplacer .gitignore
if [ -f ".gitignore.production" ]; then
    mv .gitignore.production .gitignore
    echo "   ✓ .gitignore créé"
fi
echo ""

echo "🔍 Étape 5/7: Vérification des imports restants..."
REMAINING=$(grep -r "from ['\"].*@[0-9]" --include="*.tsx" --include="*.ts" . 2>/dev/null | grep -v node_modules | grep -v ".backup" | wc -l)

if [ "$REMAINING" -eq 0 ]; then
    echo "   ✅ Aucun import avec version trouvé"
else
    echo "   ⚠️  Attention: $REMAINING imports avec version trouvés"
    echo "   Exécutez: grep -r \"from ['\\\"].*@[0-9]\" --include=\"*.tsx\" . | grep -v node_modules"
fi
echo ""

echo "📦 Étape 6/7: Installation des dépendances npm..."
if command -v npm &> /dev/null; then
    npm install
    echo "   ✓ npm install terminé"
else
    echo "   ⚠️  npm non trouvé, ignoré"
fi
echo ""

echo "🏗️  Étape 7/7: Test du build..."
if command -v npm &> /dev/null; then
    if npm run build; then
        echo "   ✅ Build réussi!"
    else
        echo "   ❌ Build échoué - vérifiez les erreurs ci-dessus"
        exit 1
    fi
else
    echo "   ⚠️  npm non trouvé, test ignoré"
fi
echo ""

echo "================================================"
echo "✅ CONVERSION TERMINÉE AVEC SUCCÈS!"
echo "================================================"
echo ""
echo "📋 Prochaines étapes pour déployer sur GitHub + Vercel:"
echo ""
echo "1. Initialiser Git:"
echo "   git init"
echo "   git add ."
echo "   git commit -m 'Initial commit: SmartCabb production ready'"
echo ""
echo "2. Créer le repo sur GitHub puis:"
echo "   git remote add origin https://github.com/VOTRE_USERNAME/smartcabb.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Déployer sur Vercel:"
echo "   - Aller sur vercel.com"
echo "   - Import project from GitHub"
echo "   - Configurer les variables d'environnement"
echo "   - Deploy!"
echo ""
echo "📚 Pour plus de détails, consultez: DEPLOIEMENT_PRODUCTION.md"
echo ""
