#!/bin/bash

echo "🔧 SUPPRESSION TOTALE DE FRAMER-MOTION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Supprimer tous les imports framer-motion et motion/react
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -not -path "*/.git/*" \
  -exec sed -i "/import.*from.*['\"]\(framer-motion\|motion\/react\)/d" {} +

# 2. Remplacer <motion.XXX par <div  
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -exec sed -i "s|<motion\.[a-zA-Z0-9]*|<div|g" {} +

# 3. Remplacer </motion.XXX> par </div>
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -exec sed -i "s|</motion\.[a-zA-Z0-9]*>|</div>|g" {} +

# 4. Remplacer <AnimatePresence> par <div>
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -exec sed -i "s|<AnimatePresence[^>]*>|<div>|g" {} + \
  -exec sed -i "s|</AnimatePresence>|</div>|g" {} +

echo "✅ Terminé! Maintenant lancez: npm run build"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
