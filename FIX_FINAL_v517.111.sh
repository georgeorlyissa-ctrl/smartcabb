#!/bin/bash

# 🔥 v517.111 - CORRECTION FINALE pour Figma Make (esm.sh)
# Tous les imports doivent avoir la version @10.16.4 pour esm.sh

echo "🔧 v517.111 - Correction des imports framer-motion pour esm.sh"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Compter les fichiers avant correction
BEFORE=$(find . -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "*/node_modules/*" -not -path "*/dist/*" -exec grep -l "from 'motion/react'\|from 'framer-motion'" {} + 2>/dev/null | wc -l)

echo "📊 Fichiers à corriger: $BEFORE"
echo ""

echo "🔄 Correction en cours..."

# Remplacer motion/react par framer-motion@10.16.4 (guillemets simples)
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -exec sed -i "s|from 'motion/react'|from 'framer-motion@10.16.4'|g" {} +

# Remplacer motion/react par framer-motion@10.16.4 (guillemets doubles)
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -exec sed -i 's|from "motion/react"|from "framer-motion@10.16.4"|g' {} +

# Remplacer framer-motion (sans version) par framer-motion@10.16.4 (guillemets simples)
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -exec sed -i "s|from 'framer-motion'|from 'framer-motion@10.16.4'|g" {} +

# Remplacer framer-motion (sans version) par framer-motion@10.16.4 (guillemets doubles)
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -exec sed -i 's|from "framer-motion"|from "framer-motion@10.16.4"|g' {} +

# Corriger les imports qui ont déjà une autre version
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -exec sed -i "s|from 'framer-motion@[^']*'|from 'framer-motion@10.16.4'|g" {} +

find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -exec sed -i 's|from "framer-motion@[^"]*"|from "framer-motion@10.16.4"|g' {} +

echo "✅ Correction terminée!"
echo ""

# Compter les fichiers après correction
AFTER_CORRECT=$(find . -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "*/node_modules/*" -not -path "*/dist/*" -exec grep -l "from 'framer-motion@10.16.4'" {} + 2>/dev/null | wc -l)
AFTER_INCORRECT=$(find . -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "*/node_modules/*" -not -path "*/dist/*" -exec grep -l "from 'motion/react'\|from 'framer-motion'[^@]" {} + 2>/dev/null | wc -l)

echo "📊 Résultat:"
echo "   ✅ Fichiers avec version correcte (@10.16.4): $AFTER_CORRECT"
echo "   ❌ Fichiers restants à corriger: $AFTER_INCORRECT"
echo ""

if [ "$AFTER_INCORRECT" -eq 0 ]; then
  echo "🎉 Parfait! Tous les imports sont corrects."
else
  echo "⚠️  Il reste $AFTER_INCORRECT fichier(s) à vérifier:"
  find . -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "*/node_modules/*" -not -path "*/dist/*" -exec grep -l "from 'motion/react'\|from 'framer-motion'[^@]" {} + 2>/dev/null | head -10
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Correction terminée pour Figma Make (esm.sh)"
echo ""
echo "Les imports utilisent maintenant:"
echo "   import { motion } from 'framer-motion@10.16.4'"
echo ""
echo "Compatible avec esm.sh CDN ✅"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
