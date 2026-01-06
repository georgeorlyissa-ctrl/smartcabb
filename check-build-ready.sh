#!/bin/bash

# 🔍 SCRIPT DE VÉRIFICATION RAPIDE
# Vérifie si le code est prêt pour Vercel

echo "🔍 Vérification du code SmartCabb..."
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# 1. Vérifier conflits Git
echo "1️⃣  Vérification conflits Git..."
GIT_CONFLICTS=$(find components hooks lib utils pages -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec grep -l "<<<<<<< HEAD\|=======\|>>>>>>>" {} \; 2>/dev/null)

if [ -z "$GIT_CONFLICTS" ]; then
    echo -e "   ${GREEN}✅ Aucun conflit Git${NC}"
else
    echo -e "   ${RED}❌ Conflits Git détectés:${NC}"
    echo "$GIT_CONFLICTS" | while read line; do echo "      - $line"; done
    ((ERRORS++))
fi

echo ""

# 2. Vérifier imports motion/react (DOIT ÊTRE framer-motion pour Vercel)
echo "2️⃣  Vérification imports motion/react..."
MOTION_IMPORTS=$(find components hooks lib utils pages App.tsx -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "from ['\"]motion/react['\"]" {} \; 2>/dev/null)

if [ -z "$MOTION_IMPORTS" ]; then
    echo -e "   ${GREEN}✅ Pas d'imports motion/react (bon pour Vercel)${NC}"
else
    echo -e "   ${RED}❌ Imports motion/react détectés (incompatible Vercel):${NC}"
    echo "$MOTION_IMPORTS" | while read line; do echo "      - $line"; done
    echo -e "   ${YELLOW}   💡 Solution: ./fix-framer-motion-imports.sh${NC}"
    ((ERRORS++))
fi

echo ""

# 3. Vérifier imports framer-motion corrects
echo "3️⃣  Vérification imports framer-motion..."
FRAMER_COUNT=$(find components hooks lib utils pages App.tsx -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "from ['\"]framer-motion['\"]" {} \; 2>/dev/null | wc -l)
echo -e "   ${GREEN}✅ $FRAMER_COUNT fichiers utilisent framer-motion${NC}"

echo ""

# 4. Vérifier imports lucide-react
echo "4️⃣  Vérification imports lucide-react..."
LUCIDE_IMPORTS=$(find components hooks lib utils pages -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "from ['\"]\\.\\./.\\./lucide-react['\"]" {} \; 2>/dev/null)

if [ -z "$LUCIDE_IMPORTS" ]; then
    echo -e "   ${GREEN}✅ Imports lucide-react corrects${NC}"
else
    echo -e "   ${RED}❌ Imports lucide-react incorrects:${NC}"
    echo "$LUCIDE_IMPORTS" | while read line; do echo "      - $line"; done
    ((ERRORS++))
fi

echo ""

# 5. Vérifier lignes orphelines
echo "5️⃣  Vérification lignes orphelines..."
ORPHAN_LINES=$(find components hooks lib utils pages -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "^[[:space:]]*}[[:space:]]*from[[:space:]]*['\"]" {} \; 2>/dev/null)

if [ -z "$ORPHAN_LINES" ]; then
    echo -e "   ${GREEN}✅ Aucune ligne orpheline${NC}"
else
    echo -e "   ${YELLOW}⚠️  Lignes orphelines détectées:${NC}"
    echo "$ORPHAN_LINES" | while read line; do echo "      - $line"; done
    ((ERRORS++))
fi

echo ""

# 6. Vérifier état Git
echo "6️⃣  Vérification état Git..."
if git diff --quiet && git diff --cached --quiet; then
    echo -e "   ${GREEN}✅ Aucun changement non commité${NC}"
else
    echo -e "   ${YELLOW}⚠️  Changements non commités détectés${NC}"
    echo "      Utilisez: git status pour voir les détails"
fi

echo ""

# RÉSULTAT FINAL
echo "════════════════════════════════════════════════════════════"

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║          ✅ CODE PRÊT POUR VERCEL ! 🚀                    ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    echo "📋 Vous pouvez maintenant:"
    echo "   git add ."
    echo "   git commit -m \"fix: code prêt pour déploiement Vercel\""
    echo "   git push origin main"
    echo ""
    exit 0
else
    echo -e "${RED}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║          ❌ ERREURS DÉTECTÉES: $ERRORS                           ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    echo "🔧 Pour corriger automatiquement:"
    echo "   ./fix-framer-motion-imports.sh    # Corrige motion/react"
    echo "   ./emergency-fix-vercel.sh         # Corrige conflits Git"
    echo ""
    exit 1
fi