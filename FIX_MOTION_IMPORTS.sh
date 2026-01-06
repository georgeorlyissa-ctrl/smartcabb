#!/bin/bash

# 🔥 v517.108 - Fix Motion/React imports to use framer-motion instead
# Ce script remplace tous les imports 'motion/react' par 'framer-motion'

echo "🔄 Remplacement des imports motion/react par framer-motion..."

# Trouver tous les fichiers .tsx et .ts et remplacer les imports
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "*/node_modules/*" -not -path "*/dist/*" -exec sed -i "s|from 'motion/react'|from 'framer-motion'|g" {} +

# Aussi pour les imports avec guillemets doubles
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "*/node_modules/*" -not -path "*/dist/*" -exec sed -i 's|from "motion/react"|from "framer-motion"|g' {} +

echo "✅ Remplacement terminé!"
echo ""
echo "📋 Fichiers modifiés:"
grep -r "from 'framer-motion'" --include="*.tsx" --include="*.ts" . 2>/dev/null | grep -v node_modules | wc -l
echo ""
echo "🚀 Vous pouvez maintenant:"
echo "   1. Vérifier les changements avec: git diff"
echo "   2. Installer les dépendances: npm install"
echo "   3. Lancer le build: npm run build"
echo "   4. Commit et push vers GitHub/Vercel"
