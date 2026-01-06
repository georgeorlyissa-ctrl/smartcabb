#!/bin/bash

echo "🔧 CORRECTION AUTOMATIQUE DES IMPORTS POUR VERCEL"
echo "=================================================="
echo ""

# Compteur
FIXED=0

# 1. Correction motion/react → framer-motion
echo "📦 Correction motion/react → framer-motion..."
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/.next/*" \
  ! -path "*/dist/*" \
  -exec sed -i.bak "s/from ['\"]motion\/react['\"]/from 'framer-motion'/g" {} + && FIXED=$((FIXED+1))

# 2. Correction lucide-react@0.550.0 → lucide-react
echo "📦 Correction lucide-react@X.X.X → lucide-react..."
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/.next/*" \
  ! -path "*/dist/*" \
  -exec sed -i.bak "s/from ['\"]lucide-react@[^'\"]*['\"]/from 'lucide-react'/g" {} + && FIXED=$((FIXED+1))

# 3. Correction sonner@2.0.3 → sonner
echo "📦 Correction sonner@X.X.X → sonner..."
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/.next/*" \
  ! -path "*/dist/*" \
  -exec sed -i.bak "s/from ['\"]sonner@[^'\"]*['\"]/from 'sonner'/g" {} + && FIXED=$((FIXED+1))

# Supprimer les fichiers .bak
echo "🧹 Nettoyage des fichiers temporaires..."
find . -name "*.bak" -type f -delete

echo ""
echo "✅ CORRECTION TERMINÉE AVEC SUCCÈS !"
echo "=================================================="
echo "📊 Résumé :"
echo "   • motion/react → framer-motion"
echo "   • lucide-react@X.X.X → lucide-react"
echo "   • sonner@X.X.X → sonner"
echo ""
echo "🚀 Prochaines étapes :"
echo "   1. Vérifier les changements avec: git status"
echo "   2. Commiter: git add . && git commit -m 'fix: Correction imports Vercel'"
echo "   3. Pusher: git push origin main"
echo ""
