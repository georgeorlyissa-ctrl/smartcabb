#!/bin/bash

# 🔥 v517.110 - CORRECTION FINALE pour Vite/Rollup
# Remplace tous les imports motion/react et framer-motion@version
# par des imports simples: from 'framer-motion'

echo "🔧 v517.110 - Correction des imports framer-motion pour Vite/Rollup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Compter les fichiers avant correction
BEFORE_MOTION=$(find . -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "*/node_modules/*" -not -path "*/dist/*" -exec grep -l "from 'motion/react'" {} + 2>/dev/null | wc -l)
BEFORE_VERSION=$(find . -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "*/node_modules/*" -not -path "*/dist/*" -exec grep -l "framer-motion@" {} + 2>/dev/null | wc -l)

echo "📊 État avant correction:"
echo "   - Fichiers avec 'motion/react': $BEFORE_MOTION"
echo "   - Fichiers avec 'framer-motion@version': $BEFORE_VERSION"
echo ""

echo "🔄 Correction en cours..."

# 1. Remplacer motion/react par framer-motion (guillemets simples)
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -exec sed -i "s|from 'motion/react'|from 'framer-motion'|g" {} +

# 2. Remplacer motion/react par framer-motion (guillemets doubles)
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -exec sed -i 's|from "motion/react"|from "framer-motion"|g' {} +

# 3. Remplacer framer-motion@version par framer-motion (guillemets simples)
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -exec sed -i "s|from 'framer-motion@[^']*'|from 'framer-motion'|g" {} +

# 4. Remplacer framer-motion@version par framer-motion (guillemets doubles)
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -exec sed -i 's|from "framer-motion@[^"]*"|from "framer-motion"|g' {} +

echo "✅ Correction terminée!"
echo ""

# Compter les fichiers après correction
AFTER_CORRECT=$(find . -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "*/node_modules/*" -not -path "*/dist/*" -exec grep -l "from 'framer-motion'" {} + 2>/dev/null | wc -l)
AFTER_INCORRECT=$(find . -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "*/node_modules/*" -not -path "*/dist/*" -exec grep -l "framer-motion@\|motion/react" {} + 2>/dev/null | wc -l)

echo "📊 État après correction:"
echo "   - Fichiers avec 'framer-motion' (correct): $AFTER_CORRECT"
echo "   - Fichiers avec imports incorrects: $AFTER_INCORRECT"
echo ""

if [ "$AFTER_INCORRECT" -eq 0 ]; then
  echo "✅ Tous les imports sont corrects!"
else
  echo "⚠️  Il reste $AFTER_INCORRECT fichier(s) avec des imports incorrects"
  echo ""
  echo "Fichiers concernés:"
  find . -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "*/node_modules/*" -not -path "*/dist/*" -exec grep -l "framer-motion@\|motion/react" {} + 2>/dev/null
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Prochaines étapes:"
echo ""
echo "   1. Vérifier: git diff"
echo "   2. Installer: npm install"
echo "   3. Build:     npm run build"
echo "   4. Commit:    git add . && git commit -m 'fix: Remove @version from imports (v517.110)'"
echo "   5. Push:      git push origin main"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
