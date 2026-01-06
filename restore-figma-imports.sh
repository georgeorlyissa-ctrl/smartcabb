#!/bin/bash

echo "🔄 RESTAURATION DES IMPORTS POUR FIGMA MAKE"
echo "============================================"
echo ""

# 1. Correction framer-motion → motion/react (pour esm.sh)
echo "📦 Correction framer-motion → motion/react..."
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/.next/*" \
  ! -path "*/dist/*" \
  -exec sed -i.bak "s/from ['\"]framer-motion['\"]/from 'motion\/react'/g" {} +

# 2. S'assurer que lucide-react n'a pas de version
echo "📦 Nettoyage lucide-react..."
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/.next/*" \
  ! -path "*/dist/*" \
  -exec sed -i.bak "s/from ['\"]lucide-react@[^'\"]*['\"]/from 'lucide-react'/g" {} +

# 3. S'assurer que sonner n'a pas de version
echo "📦 Nettoyage sonner..."
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/.next/*" \
  ! -path "*/dist/*" \
  -exec sed -i.bak "s/from ['\"]sonner@[^'\"]*['\"]/from 'sonner'/g" {} +

# Supprimer les fichiers .bak
echo "🧹 Nettoyage..."
find . -name "*.bak" -type f -delete

echo ""
echo "✅ RESTAURATION TERMINÉE !"
echo "============================================"
echo "📊 Imports corrigés pour Figma Make (esm.sh) :"
echo "   • framer-motion → motion/react ✅"
echo "   • lucide-react (sans version) ✅"
echo "   • sonner (sans version) ✅"
echo ""
