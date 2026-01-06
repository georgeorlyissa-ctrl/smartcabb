#!/bin/bash

echo "🔧 Correction automatique de TOUS les imports..."
echo ""

# Compter les fichiers à modifier
TOTAL=$(find . -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) ! -path "*/node_modules/*" ! -path "*/.git/*" ! -path "*/.next/*" ! -path "*/dist/*" | wc -l)

echo "📁 $TOTAL fichiers à scanner"
echo ""

# Correction des imports
echo "🔄 Correction motion/react → framer-motion..."
find . -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) \
  ! -path "*/node_modules/*" ! -path "*/.git/*" ! -path "*/.next/*" ! -path "*/dist/*" \
  -exec sed -i'' -e "s/from ['\"]motion\/react['\"]/from 'framer-motion'/g" {} \;

echo "🔄 Correction lucide-react@0.550.0 → lucide-react..."
find . -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) \
  ! -path "*/node_modules/*" ! -path "*/.git/*" ! -path "*/.next/*" ! -path "*/dist/*" \
  -exec sed -i'' -e "s/from ['\"]lucide-react@[^'\"]*['\"]/from 'lucide-react'/g" {} \;

echo "🔄 Correction sonner@2.0.3 → sonner..."
find . -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) \
  ! -path "*/node_modules/*" ! -path "*/.git/*" ! -path "*/.next/*" ! -path "*/dist/*" \
  -exec sed -i'' -e "s/from ['\"]sonner@[^'\"]*['\"]/from 'sonner'/g" {} \;

echo "🔄 Correction framer-motion@X.X.X → framer-motion..."
find . -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) \
  ! -path "*/node_modules/*" ! -path "*/.git/*" ! -path "*/.next/*" ! -path "*/dist/*" \
  -exec sed -i'' -e "s/from ['\"]framer-motion@[^'\"]*['\"]/from 'framer-motion'/g" {} \;

echo "🔄 Correction react-hook-form@X.X.X → react-hook-form..."
find . -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) \
  ! -path "*/node_modules/*" ! -path "*/.git/*" ! -path "*/.next/*" ! -path "*/dist/*" \
  -exec sed -i'' -e "s/from ['\"]react-hook-form@[^'\"]*['\"]/from 'react-hook-form'/g" {} \;

echo ""
echo "✅ Correction terminée!"
echo ""
echo "📋 Prochaines étapes:"
echo "   git add ."
echo '   git commit -m "fix: Correction imports pour Vercel build"'
echo "   git push origin main"
echo ""
