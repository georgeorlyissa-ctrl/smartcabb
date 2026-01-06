#!/bin/bash
# Script de correction des imports pour Vercel - SmartCabb
# Reconvertit les imports locaux vers les packages npm

echo "🚀 Correction des imports pour Vercel..."
echo ""

# Compteur de fichiers modifiés
count=0

# 1. Convertir imports locaux framer-motion → npm framer-motion
echo "📦 Conversion framer-motion local → npm..."
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/.next/*" \
  ! -path "*/dist/*" \
  ! -path "*/build/*" \
  ! -name "framer-motion.tsx" \
  ! -name "motion-wrapper.tsx" \
  -exec sed -i "s|from ['\"]\\.\\.*/framer-motion['\"]|from 'framer-motion'|g" {} +

# 2. Convertir imports locaux lucide-react → npm lucide-react
echo "🎨 Conversion lucide-react local → npm..."
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/.next/*" \
  ! -path "*/dist/*" \
  ! -path "*/build/*" \
  ! -name "lucide-react.ts" \
  -exec sed -i "s|from ['\"]\\.\\.*/lucide-react['\"]|from 'lucide-react'|g" {} +

# 3. Supprimer toutes les versions de framer-motion (au cas où)
echo "🔧 Suppression des versions framer-motion..."
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/.next/*" \
  -exec sed -i "s/from ['\"]framer-motion@[^'\"]*['\"]/from 'framer-motion'/g" {} +

# 4. Convertir motion/react → framer-motion
echo "🔄 Conversion motion/react → framer-motion..."
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/.next/*" \
  -exec sed -i "s/from ['\"]motion\\/react['\"]/from 'framer-motion'/g" {} +

# 5. Supprimer toutes les versions de lucide-react
echo "🎯 Suppression des versions lucide-react..."
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/.next/*" \
  -exec sed -i "s/from ['\"]lucide-react@[^'\"]*['\"]/from 'lucide-react'/g" {} +

# 6. Supprimer toutes les versions de sonner
echo "🔔 Suppression des versions sonner..."
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/.next/*" \
  -exec sed -i "s/from ['\"]sonner@[^'\"]*['\"]/from 'sonner'/g" {} +

# 7. Désactiver l'alias framer-motion dans vite.config.ts
if [ -f "vite.config.ts" ]; then
  echo "🔧 Désactivation de l'alias framer-motion dans vite.config.ts..."
  sed -i "s/'framer-motion': path.resolve(__dirname, '.\\/framer-motion.tsx'),/\\/\\/ 'framer-motion': path.resolve(__dirname, '.\\/framer-motion.tsx'),/g" vite.config.ts
fi

echo ""
echo "✅ Corrections terminées !"
echo ""
echo "🔍 Vérification rapide:"
# Vérifier qu'il ne reste plus d'imports locaux
local_imports=$(grep -r "from ['\"]\\.\\.*/framer-motion['\"]" --include="*.tsx" --include="*.ts" . 2>/dev/null | wc -l)
echo "   Imports locaux framer-motion restants: $local_imports"

local_lucide=$(grep -r "from ['\"]\\.\\.*/lucide-react['\"]" --include="*.tsx" --include="*.ts" . 2>/dev/null | wc -l)
echo "   Imports locaux lucide-react restants: $local_lucide"

echo ""
echo "📦 Prochaines étapes :"
echo "  1. git add ."
echo "  2. git commit -m 'fix: Imports pour production Vercel'"
echo "  3. git push origin main"
echo ""
echo "🚀 Vercel déploiera automatiquement sur smartcabb.com"
