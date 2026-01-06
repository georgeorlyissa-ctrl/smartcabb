#!/bin/bash

# Script de correction pour tous les imports motion/react → framer-motion
# POUR BUILD VITE/VERCEL (sans version)

echo "🔧 Correction de TOUS les imports framer-motion pour Vite/Vercel..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Remplacer tous les imports motion/react par framer-motion
find . -type f -name "*.tsx" -o -name "*.ts" | \
  grep -v node_modules | \
  grep -v dist | \
  xargs sed -i.bak \
    -e "s|from 'motion/react'|from 'framer-motion'|g" \
    -e 's|from "motion/react"|from "framer-motion"|g'

# Supprimer les fichiers de backup
find . -name "*.bak" -type f -delete

echo "✅ Correction terminée!"
echo ""
echo "📊 Vérification:"
echo "   Fichiers avec 'motion/react' restants:"
grep -r "motion/react" --include="*.tsx" --include="*.ts" . | grep -v node_modules | wc -l

echo ""
echo "   Fichiers avec 'framer-motion' (correct):"
grep -r "from 'framer-motion'" --include="*.tsx" --include="*.ts" . | grep -v node_modules | wc -l

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Tous les imports utilisent maintenant 'framer-motion' (sans version)"
