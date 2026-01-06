#!/bin/bash

# 🔧 Script FINAL : Supprime framer-motion et utilise le remplacement CSS
# Compatible avec esm.sh CDN de Figma Make

echo "🔧 Suppression de framer-motion (incompatible avec esm.sh)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Étape 1: Remplacer tous les imports framer-motion
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -not -path "*/.git/*" \
  -not -path "*/motion-replacement.tsx" \
  -exec sed -i "s|import { motion } from 'framer-motion'|import { motion } from './motion-replacement'|g" {} + \
  -exec sed -i "s|import { motion } from 'framer-motion@[^']*'|import { motion } from './motion-replacement'|g" {} + \
  -exec sed -i "s|import { motion } from 'motion/react'|import { motion } from './motion-replacement'|g" {} + \
  -exec sed -i 's|import { motion } from "framer-motion"|import { motion } from "./motion-replacement"|g' {} + \
  -exec sed -i 's|import { motion } from "framer-motion@[^"]*"|import { motion } from "./motion-replacement"|g' {} + \
  -exec sed -i 's|import { motion } from "motion/react"|import { motion } from "./motion-replacement"|g' {} +

# Étape 2: Remplacer AnimatePresence
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -not -path "*/.git/*" \
  -not -path "*/motion-replacement.tsx" \
  -exec sed -i "s|import { motion, AnimatePresence } from 'framer-motion'|import { motion, AnimatePresence } from './motion-replacement'|g" {} + \
  -exec sed -i "s|import { motion, AnimatePresence } from 'motion/react'|import { motion, AnimatePresence } from './motion-replacement'|g" {} + \
  -exec sed -i 's|import { motion, AnimatePresence } from "framer-motion"|import { motion, AnimatePresence } from "./motion-replacement"|g' {} + \
  -exec sed -i 's|import { motion, AnimatePresence } from "motion/react"|import { motion, AnimatePresence } from "./motion-replacement"|g' {} +

# Étape 3: Gérer les imports inversés (AnimatePresence, motion)
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -not -path "*/.git/*" \
  -not -path "*/motion-replacement.tsx" \
  -exec sed -i "s|import { AnimatePresence, motion } from 'framer-motion'|import { motion, AnimatePresence } from './motion-replacement'|g" {} + \
  -exec sed -i "s|import { AnimatePresence, motion } from 'motion/react'|import { motion, AnimatePresence } from './motion-replacement'|g" {} + \
  -exec sed -i 's|import { AnimatePresence, motion } from "framer-motion"|import { motion, AnimatePresence } from "./motion-replacement"|g' {} + \
  -exec sed -i 's|import { AnimatePresence, motion } from "motion/react"|import { motion, AnimatePresence } from "./motion-replacement"|g' {} +

echo ""
echo "✅ Tous les imports framer-motion ont été remplacés!"
echo "✅ Utilise maintenant: import { motion } from './motion-replacement'"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
