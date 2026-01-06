#!/bin/bash

# 🔧 Correction FINALE : Supprimer les versions de framer-motion
# Laisser esm.sh résoudre automatiquement

echo "🔧 Suppression des versions de framer-motion"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Remplacer toutes les versions par framer-motion sans version
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -not -path "*/.git/*" \
  -exec sed -i "s|from 'framer-motion@[^']*'|from 'framer-motion'|g" {} + \
  -exec sed -i 's|from "framer-motion@[^"]*"|from "framer-motion"|g' {} + \
  -exec sed -i "s|from 'motion/react'|from 'framer-motion'|g" {} + \
  -exec sed -i 's|from "motion/react"|from "framer-motion"|g' {} +

echo "✅ Tous les imports utilisent maintenant:"
echo "   import { motion } from 'framer-motion';"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
