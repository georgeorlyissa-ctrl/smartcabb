#!/bin/bash

echo "════════════════════════════════════════════════════════════════"
echo "  🔍 VÉRIFICATION DES IMPORTS AVEC VERSION"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteurs
TOTAL_ERRORS=0

echo "Recherche des imports avec version explicite..."
echo ""

# 1. Vérifier lucide-react@version
echo "1️⃣ Vérification lucide-react..."
LUCIDE_ERRORS=$(grep -r "from ['\"]lucide-react@" --include="*.tsx" --include="*.ts" . 2>/dev/null | grep -v node_modules | wc -l)
if [ "$LUCIDE_ERRORS" -gt 0 ]; then
    echo -e "${RED}❌ $LUCIDE_ERRORS fichiers avec lucide-react@version${NC}"
    grep -r "from ['\"]lucide-react@" --include="*.tsx" --include="*.ts" . 2>/dev/null | grep -v node_modules | head -5
    TOTAL_ERRORS=$((TOTAL_ERRORS + LUCIDE_ERRORS))
else
    echo -e "${GREEN}✅ Aucun import lucide-react@version${NC}"
fi
echo ""

# 2. Vérifier sonner@version
echo "2️⃣ Vérification sonner..."
SONNER_ERRORS=$(grep -r "from ['\"]sonner@" --include="*.tsx" --include="*.ts" . 2>/dev/null | grep -v node_modules | wc -l)
if [ "$SONNER_ERRORS" -gt 0 ]; then
    echo -e "${RED}❌ $SONNER_ERRORS fichiers avec sonner@version${NC}"
    grep -r "from ['\"]sonner@" --include="*.tsx" --include="*.ts" . 2>/dev/null | grep -v node_modules | head -5
    TOTAL_ERRORS=$((TOTAL_ERRORS + SONNER_ERRORS))
else
    echo -e "${GREEN}✅ Aucun import sonner@version${NC}"
fi
echo ""

# 3. Vérifier framer-motion (ancien package)
echo "3️⃣ Vérification framer-motion (ancien)..."
FRAMER_ERRORS=$(grep -r "from ['\"]framer-motion" --include="*.tsx" --include="*.ts" . 2>/dev/null | grep -v node_modules | wc -l)
if [ "$FRAMER_ERRORS" -gt 0 ]; then
    echo -e "${RED}❌ $FRAMER_ERRORS fichiers avec framer-motion${NC}"
    grep -r "from ['\"]framer-motion" --include="*.tsx" --include="*.ts" . 2>/dev/null | grep -v node_modules | head -5
    TOTAL_ERRORS=$((TOTAL_ERRORS + FRAMER_ERRORS))
else
    echo -e "${GREEN}✅ Aucun import framer-motion${NC}"
fi
echo ""

# 4. Vérifier motion/react (bon package)
echo "4️⃣ Vérification motion/react (bon)..."
MOTION_COUNT=$(grep -r "from ['\"]motion/react" --include="*.tsx" --include="*.ts" . 2>/dev/null | grep -v node_modules | wc -l)
echo -e "${GREEN}✅ $MOTION_COUNT imports motion/react corrects${NC}"
echo ""

# 5. Vérifier recharts@version
echo "5️⃣ Vérification recharts..."
RECHARTS_ERRORS=$(grep -r "from ['\"]recharts@" --include="*.tsx" --include="*.ts" . 2>/dev/null | grep -v node_modules | wc -l)
if [ "$RECHARTS_ERRORS" -gt 0 ]; then
    echo -e "${RED}❌ $RECHARTS_ERRORS fichiers avec recharts@version${NC}"
    grep -r "from ['\"]recharts@" --include="*.tsx" --include="*.ts" . 2>/dev/null | grep -v node_modules | head -5
    TOTAL_ERRORS=$((TOTAL_ERRORS + RECHARTS_ERRORS))
else
    echo -e "${GREEN}✅ Aucun import recharts@version${NC}"
fi
echo ""

# Résumé final
echo "════════════════════════════════════════════════════════════════"
if [ "$TOTAL_ERRORS" -gt 0 ]; then
    echo -e "${RED}❌ ÉCHEC : $TOTAL_ERRORS erreurs d'import détectées${NC}"
    echo ""
    echo "🔧 CORRECTION NÉCESSAIRE :"
    echo "   Exécutez ce script pour corriger automatiquement :"
    echo "   ./fix-all-imports.sh"
    echo ""
    exit 1
else
    echo -e "${GREEN}✅ SUCCÈS : Tous les imports sont corrects !${NC}"
    echo ""
    echo "🚀 Vous pouvez déployer sur Vercel en toute sécurité."
    echo ""
    echo "Commandes Git :"
    echo "   git add ."
    echo "   git commit -m \"fix: deploy ready v517.106 - all imports verified\""
    echo "   git push origin main"
    echo ""
    exit 0
fi
