#!/bin/bash

echo "🔧 CORRECTION DES IMPORTS POUR VERCEL"
echo "============================================================"
echo "Suppression de TOUTES les versions (@X.X.X) dans les imports..."
echo ""

# 1. Supprimer les versions de framer-motion
echo "📦 Nettoyage framer-motion@X.X.X..."
find . -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/.next/*" \
  ! -path "*/dist/*" \
  ! -path "*/.vercel/*" \
  -exec sed -i.bak "s/from ['\"]framer-motion@[^'\"]*['\"]/from 'framer-motion'/g" {} +

# 2. Supprimer les versions de lucide-react
echo "📦 Nettoyage lucide-react@X.X.X..."
find . -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/.next/*" \
  ! -path "*/dist/*" \
  ! -path "*/.vercel/*" \
  -exec sed -i.bak "s/from ['\"]lucide-react@[^'\"]*['\"]/from 'lucide-react'/g" {} +

# 3. Supprimer les versions de sonner
echo "📦 Nettoyage sonner@X.X.X..."
find . -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/.next/*" \
  ! -path "*/dist/*" \
  ! -path "*/.vercel/*" \
  -exec sed -i.bak "s/from ['\"]sonner@[^'\"]*['\"]/from 'sonner'/g" {} +

# 4. Convertir motion/react → framer-motion (pour Vercel)
echo "📦 Conversion motion/react → framer-motion..."
find . -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/.next/*" \
  ! -path "*/dist/*" \
  ! -path "*/.vercel/*" \
  -exec sed -i.bak "s/from ['\"]motion\/react['\"]/from 'framer-motion'/g" {} +

# 5. Nettoyer TOUS les autres packages avec versions
echo "📦 Nettoyage de tous les packages avec versions..."
find . -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/.next/*" \
  ! -path "*/dist/*" \
  ! -path "*/.vercel/*" \
  -exec perl -i.bak2 -pe 's/from ['\''"]([a-zA-Z0-9@\/_-]+)@[0-9]+\.[0-9]+\.[0-9]+[^'\''"]*['\''"]/from '\''\1'\''/g' {} +

# Supprimer les fichiers .bak
echo "🧹 Nettoyage des fichiers temporaires..."
find . -name "*.bak" -type f -delete
find . -name "*.bak2" -type f -delete

echo ""
echo "✅ CORRECTION TERMINÉE AVEC SUCCÈS !"
echo "============================================================"
echo "📊 Corrections appliquées :"
echo "   • framer-motion@X.X.X → framer-motion"
echo "   • lucide-react@X.X.X → lucide-react"
echo "   • sonner@X.X.X → sonner"
echo "   • motion/react → framer-motion"
echo "   • Toutes autres versions supprimées"
echo ""
echo "🚀 PROCHAINES ÉTAPES :"
echo "   1. Vérifier: git status"
echo "   2. Commit: git add . && git commit -m 'fix: Suppression versions imports pour Vercel'"
echo "   3. Push: git push origin main"
echo ""
echo "✨ Vercel devrait maintenant builder avec succès !"
