#!/bin/bash

# 🔧 Script ULTRA-SIMPLE : Supprime TOUS les imports framer-motion/motion
# et remplace motion.xxx par <xxx> (div, button, etc.)

echo "🔧 Suppression complète de framer-motion"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Étape 1: Supprimer toutes les lignes d'import framer-motion
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -not -path "*/.git/*" \
  -exec sed -i "/import.*from.*['\"]\(framer-motion\|motion\/react\)/d" {} +

# Étape 2: Remplacer motion.div par div
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -exec sed -i "s|<motion\.div|<div|g" {} + \
  -exec sed -i "s|</motion\.div>|</div>|g" {} +

# Étape 3: Remplacer motion.button par button
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -exec sed -i "s|<motion\.button|<button|g" {} + \
  -exec sed -i "s|</motion\.button>|</button>|g" {} +

# Étape 4: Remplacer motion.h1, h2, etc.
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -exec sed -i "s|<motion\.h1|<h1|g" {} + \
  -exec sed -i "s|</motion\.h1>|</h1>|g" {} + \
  -exec sed -i "s|<motion\.h2|<h2|g" {} + \
  -exec sed -i "s|</motion\.h2>|</h2>|g" {} + \
  -exec sed -i "s|<motion\.p|<p|g" {} + \
  -exec sed -i "s|</motion\.p>|</p>|g" {} + \
  -exec sed -i "s|<motion\.span|<span|g" {} + \
  -exec sed -i "s|</motion\.span>|</span>|g" {} + \
  -exec sed -i "s|<motion\.section|<section|g" {} + \
  -exec sed -i "s|</motion\.section>|</section>|g" {} +

# Étape 5: Supprimer les props d'animation (initial, animate, exit, etc.)
# On garde className et les autres props normales
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -exec sed -i 's/ initial={{[^}]*}}//g' {} + \
  -exec sed -i 's/ animate={{[^}]*}}//g' {} + \
  -exec sed -i 's/ exit={{[^}]*}}//g' {} + \
  -exec sed -i 's/ transition={{[^}]*}}//g' {} + \
  -exec sed -i 's/ whileHover={{[^}]*}}//g' {} + \
  -exec sed -i 's/ whileTap={{[^}]*}}//g' {} + \
  -exec sed -i 's/ variants={{[^}]*}}//g' {} + \
  -exec sed -i 's/ layout={[^}]*}//g' {} + \
  -exec sed -i 's/ layout//g' {} +

echo ""
echo "✅ Framer Motion complètement supprimé!"
echo "✅ motion.div → div, motion.button → button, etc."
echo "✅ Props d'animation supprimées"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
