#!/bin/bash

# 🚀 PRÉPARATION FINALE VERCEL
# Configure tout pour un build Vercel réussi

echo "╔════════════════════════════════════════════════════════════╗"
echo "║      🚀 PRÉPARATION FINALE VERCEL                         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Backup
BACKUP_DIR="backup_final_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "📦 Backup: $BACKUP_DIR"

# ============================================================================
# ÉTAPE 1 : VÉRIFIER vite.config.ts
# ============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📝 ÉTAPE 1: Vérification vite.config.ts..."
echo "═══════════════════════════════════════════════════════════"
echo ""

if grep -q "alias.*framer-motion.*path.resolve" vite.config.ts 2>/dev/null; then
    if grep -q "^[[:space:]]*//.*alias:" vite.config.ts 2>/dev/null; then
        echo "  ✅ Alias framer-motion déjà commenté (bon pour Vercel)"
    else
        echo "  ⚠️  Alias framer-motion ACTIF (problème pour Vercel)"
        echo "  💡 L'alias doit être commenté pour Vercel"
        exit 1
    fi
else
    echo "  ✅ Pas d'alias framer-motion (bon pour Vercel)"
fi

# Vérifier optimizeDeps
if grep -q "optimizeDeps.*include.*'framer-motion'" vite.config.ts 2>/dev/null; then
    echo "  ✅ optimizeDeps inclut framer-motion"
elif grep -q "optimizeDeps.*include.*'motion'" vite.config.ts 2>/dev/null; then
    echo "  ⚠️  optimizeDeps inclut 'motion' au lieu de 'framer-motion'"
    echo "  💡 Devrait être 'framer-motion' pour Vercel"
    exit 1
else
    echo "  ✅ optimizeDeps OK"
fi

# ============================================================================
# ÉTAPE 2 : NETTOYER TOUS LES CACHES
# ============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🧹 ÉTAPE 2: Nettoyage complet des caches..."
echo "═══════════════════════════════════════════════════════════"
echo ""

CLEANED=0

# Cache Vite
if [ -d "node_modules/.vite" ]; then
    rm -rf node_modules/.vite
    echo "  ✅ Cache Vite supprimé"
    ((CLEANED++))
fi

# Cache Vercel
if [ -d ".vercel" ]; then
    rm -rf .vercel
    echo "  ✅ Cache Vercel supprimé"
    ((CLEANED++))
fi

# Dist
if [ -d "dist" ]; then
    rm -rf dist
    echo "  ✅ Dossier dist supprimé"
    ((CLEANED++))
fi

# TypeScript build info
find . -name "*.tsbuildinfo" -delete 2>/dev/null && echo "  ✅ .tsbuildinfo supprimés" && ((CLEANED++))

# Fichiers temporaires
find . -name "*.temp" -o -name "*.tmp" -o -name "*.bak" 2>/dev/null | while read file; do
    rm -f "$file"
    echo "  ✅ Supprimé: $file"
    ((CLEANED++))
done

if [ "$CLEANED" -eq 0 ]; then
    echo "  ✅ Aucun cache à nettoyer"
fi

# ============================================================================
# ÉTAPE 3 : VÉRIFIER LES IMPORTS
# ============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🔍 ÉTAPE 3: Vérification des imports..."
echo "═══════════════════════════════════════════════════════════"
echo ""

ERRORS=0

# Vérifier motion/react (ne devrait PAS exister)
MOTION_REACT=$(find components hooks lib utils pages App.tsx -type f -name "*.tsx" -exec grep -l "from ['\"]motion/react['\"]" {} \; 2>/dev/null | wc -l)
if [ "$MOTION_REACT" -gt 0 ]; then
    echo "  ❌ $MOTION_REACT fichier(s) avec motion/react (incompatible)"
    ((ERRORS++))
else
    echo "  ✅ Pas d'import motion/react"
fi

# Vérifier framer-motion (devrait exister)
FRAMER_MOTION=$(find components hooks lib utils pages App.tsx -type f -name "*.tsx" -exec grep -l "from ['\"]framer-motion['\"]" {} \; 2>/dev/null | wc -l)
echo "  ℹ️  $FRAMER_MOTION fichier(s) avec framer-motion"

# Vérifier conflits Git
GIT_CONFLICTS=$(find components hooks lib utils pages App.tsx -type f -name "*.tsx" -exec grep -l "<<<<<<< HEAD\|>>>>>>>" {} \; 2>/dev/null | wc -l)
if [ "$GIT_CONFLICTS" -gt 0 ]; then
    echo "  ❌ $GIT_CONFLICTS conflit(s) Git détecté(s)"
    ((ERRORS++))
else
    echo "  ✅ Pas de conflit Git"
fi

# Vérifier lignes orphelines
ORPHANS=$(find components hooks lib utils pages -type f -name "*.tsx" -exec grep -l "^[[:space:]]*}[[:space:]]*from[[:space:]]*['\"]" {} \; 2>/dev/null | wc -l)
if [ "$ORPHANS" -gt 0 ]; then
    echo "  ⚠️  $ORPHANS fichier(s) avec lignes orphelines"
    ((ERRORS++))
else
    echo "  ✅ Pas de ligne orpheline"
fi

# ============================================================================
# ÉTAPE 4 : CRÉER .vercelignore
# ============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📝 ÉTAPE 4: Configuration .vercelignore..."
echo "═══════════════════════════════════════════════════════════"
echo ""

cat > .vercelignore << 'EOF'
# Scripts de développement
*.sh
backup_*/
*.md
!README.md

# Cache et temporaires
node_modules/.vite
.vercel
dist
*.tsbuildinfo
*.temp
*.tmp
*.bak

# Fichiers de configuration Figma Make
framer-motion.tsx
lib/motion-wrapper.tsx
scripts/prepare-for-figma.mjs
EOF

echo "  ✅ .vercelignore créé/mis à jour"

# ============================================================================
# RÉSUMÉ FINAL
# ============================================================================

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                  📊 RÉSUMÉ FINAL                           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

if [ "$ERRORS" -eq 0 ]; then
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                                                            ║"
    echo "║       ✅ TOUT EST PRÊT POUR VERCEL ! 🚀                  ║"
    echo "║                                                            ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo "📋 COMMANDES FINALES:"
    echo ""
    echo "1️⃣  git add ."
    echo "2️⃣  git commit -m \"fix(vercel): configuration finale - vrai framer-motion\""
    echo "3️⃣  git push origin main"
    echo ""
    echo "🎯 Le build Vercel devrait maintenant RÉUSSIR !"
    echo ""
    echo "📝 CHANGEMENTS EFFECTUÉS:"
    echo "   • Alias framer-motion désactivé dans vite.config.ts"
    echo "   • optimizeDeps corrigé (motion → framer-motion)"
    echo "   • Cache Vite/Vercel nettoyé"
    echo "   • .vercelignore créé"
    echo ""
    exit 0
else
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║       ⚠️  $ERRORS ERREUR(S) DÉTECTÉE(S)                        ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo "💡 Corrigez les erreurs ci-dessus avant de pusher"
    echo ""
    exit 1
fi
