#!/bin/bash

# 🔧 Script de correction ULTRA-RAPIDE des imports motion
# Remplace motion/react par framer-motion@11.11.11

echo "🔧 Correction des imports motion → framer-motion@11.11.11"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Compter les fichiers avant
BEFORE=$(grep -r "from 'motion/react'" --include="*.tsx" --include="*.ts" . 2>/dev/null | wc -l)
echo "📊 Fichiers à corriger: $BEFORE"
echo ""

# Correction avec sed
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -not -path "*/.git/*" \
  -exec sed -i "s|from 'motion/react'|from 'framer-motion@11.11.11'|g" {} + \
  -exec sed -i 's|from "motion/react"|from "framer-motion@11.11.11"|g' {} +

# Compter après
AFTER=$(grep -r "from 'motion/react'" --include="*.tsx" --include="*.ts" . 2>/dev/null | wc -l)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Correction terminée!"
echo "   Avant: $BEFORE fichiers"
echo "   Après: $AFTER fichiers"
echo ""
echo "✅ Tous les imports utilisent maintenant:"
echo "   import { motion } from 'framer-motion@11.11.11';"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
