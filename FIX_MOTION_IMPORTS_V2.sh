#!/bin/bash

# 🔥 v517.109 - Fix Motion imports avec version spécifique compatible esm.sh
# Remplace 'motion/react' par 'framer-motion@10.16.4'

echo "🔄 Remplacement des imports motion/react par framer-motion@10.16.4..."

# Trouver tous les fichiers .tsx et .ts et remplacer les imports
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "*/node_modules/*" -not -path "*/dist/*" -exec sed -i "s|from 'motion/react'|from 'framer-motion@10.16.4'|g" {} +
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "*/node_modules/*" -not -path "*/dist/*" -exec sed -i "s|from 'framer-motion'|from 'framer-motion@10.16.4'|g" {} +

# Aussi pour les imports avec guillemets doubles
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "*/node_modules/*" -not -path "*/dist/*" -exec sed -i 's|from "motion/react"|from "framer-motion@10.16.4"|g' {} +
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "*/node_modules/*" -not -path "*/dist/*" -exec sed -i 's|from "framer-motion"|from "framer-motion@10.16.4"|g' {} +

echo "✅ Remplacement terminé!"
echo ""
echo "📋 Vérification:"
grep -r "from 'framer-motion@10.16.4'" --include="*.tsx" --include="*.ts" . 2>/dev/null | grep -v node_modules | wc -l
echo ""
echo "🚀 Prochaines étapes:"
echo "   1. Vérifier:  git diff"
echo "   2. Commit:    git add . && git commit -m 'fix: Use framer-motion@10.16.4 for esm.sh compatibility (v517.109)'"
echo "   3. Push:      git push origin main"
