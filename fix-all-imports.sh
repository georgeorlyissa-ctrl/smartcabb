#!/bin/bash

echo "🔧 Correction massive de tous les imports..."

# Trouver et corriger lucide-react@version
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -not -path "*/.git/*" \
  -not -path "*/.next/*" \
  -not -path "*/.backup/*" \
  -exec sed -i "s|from ['\"]lucide-react@[^'\"]*['\"]|from 'lucide-react'|g" {} +

# Trouver et corriger sonner@version  
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -not -path "*/.git/*" \
  -not -path "*/.next/*" \
  -not -path "*/.backup/*" \
  -exec sed -i "s|from ['\"]sonner@[^'\"]*['\"]|from 'sonner'|g" {} +

# Trouver et corriger framer-motion@version
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -not -path "*/.git/*" \
  -not -path "*/.next/*" \
  -not -path "*/.backup/*" \
  -exec sed -i "s|from ['\"]framer-motion@[^'\"]*['\"]|from 'framer-motion'|g" {} +

# Trouver et corriger motion/react
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -not -path "*/.git/*" \
  -not -path "*/.next/*" \
  -not -path "*/.backup/*" \
  -exec sed -i "s|from ['\"]motion/react['\"]|from 'framer-motion'|g" {} +

echo "✅ Correction terminée !"
echo ""
echo "Vérification:"
echo "Imports lucide-react@ restants:"
grep -r "from ['\"]lucide-react@" --include="*.tsx" --include="*.ts" . 2>/dev/null | grep -v node_modules | wc -l
echo "Imports sonner@ restants:"
grep -r "from ['\"]sonner@" --include="*.tsx" --include="*.ts" . 2>/dev/null | grep -v node_modules | wc -l
echo "Imports motion/react restants:"
grep -r "from ['\"]motion/react" --include="*.tsx" --include="*.ts" . 2>/dev/null | grep -v node_modules | wc -l
