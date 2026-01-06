#!/bin/bash

# ============================================
# 🔍 SCRIPT DE VÉRIFICATION DES IMPORTS
# ============================================
# Vérifie l'état des imports dans le projet SmartCabb
# ============================================

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║         🔍 VÉRIFICATION DES IMPORTS - SMARTCABB           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}\n"

# Vérifier qu'on est à la racine du projet
if [ ! -d "components" ]; then
    echo -e "${RED}❌ ERREUR: Exécutez ce script à la racine du projet${NC}"
    exit 1
fi

# ============================================
# VÉRIFICATION 1 : Imports framer-motion incorrects
# ============================================
echo -e "${BLUE}📊 Vérification des imports framer-motion...${NC}"

FRAMER_INCORRECT=$(grep -r "from ['\"]../../framer-motion['\"]" components/ 2>/dev/null | wc -l)
FRAMER_CORRECT=$(grep -r "from ['\"]framer-motion['\"]" components/ 2>/dev/null | wc -l)

echo -e "  ${RED}❌ Imports INCORRECTS (../../framer-motion):${NC} $FRAMER_INCORRECT"
echo -e "  ${GREEN}✅ Imports CORRECTS (framer-motion):${NC} $FRAMER_CORRECT"

if [ $FRAMER_INCORRECT -gt 0 ]; then
    echo -e "\n  ${YELLOW}📝 Fichiers avec imports incorrects :${NC}"
    grep -rl "from ['\"]../../framer-motion['\"]" components/ 2>/dev/null | head -10 | while read file; do
        echo -e "     - $file"
    done
    if [ $FRAMER_INCORRECT -gt 10 ]; then
        echo -e "     ${YELLOW}... et $((FRAMER_INCORRECT - 10)) autres fichiers${NC}"
    fi
fi

echo ""

# ============================================
# VÉRIFICATION 2 : Imports lucide-react incorrects
# ============================================
echo -e "${BLUE}📊 Vérification des imports lucide-react...${NC}"

LUCIDE_INCORRECT=$(grep -r "from ['\"]../../lucide-react['\"]" components/ 2>/dev/null | wc -l)
LUCIDE_CORRECT=$(grep -r "from ['\"]lucide-react['\"]" components/ 2>/dev/null | wc -l)

echo -e "  ${RED}❌ Imports INCORRECTS (../../lucide-react):${NC} $LUCIDE_INCORRECT"
echo -e "  ${GREEN}✅ Imports CORRECTS (lucide-react):${NC} $LUCIDE_CORRECT"

if [ $LUCIDE_INCORRECT -gt 0 ]; then
    echo -e "\n  ${YELLOW}📝 Fichiers avec imports incorrects :${NC}"
    grep -rl "from ['\"]../../lucide-react['\"]" components/ 2>/dev/null | while read file; do
        echo -e "     - $file"
    done
fi

echo ""

# ============================================
# VÉRIFICATION 3 : Marqueurs de conflit Git
# ============================================
echo -e "${BLUE}📊 Vérification des marqueurs de conflit Git...${NC}"

CONFLICTS=$(grep -r "<<<<<<< HEAD" components/ 2>/dev/null | wc -l)

if [ $CONFLICTS -gt 0 ]; then
    echo -e "  ${RED}❌ Conflits Git détectés:${NC} $CONFLICTS"
    echo -e "\n  ${YELLOW}📝 Fichiers avec conflits :${NC}"
    grep -rl "<<<<<<< HEAD" components/ 2>/dev/null | while read file; do
        echo -e "     - $file"
    done
else
    echo -e "  ${GREEN}✅ Aucun conflit Git détecté${NC}"
fi

echo ""

# ============================================
# RÉSUMÉ FINAL
# ============================================
echo -e "${CYAN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    📊 RÉSUMÉ                               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

TOTAL_ERRORS=$((FRAMER_INCORRECT + LUCIDE_INCORRECT + CONFLICTS))

echo -e "Total d'erreurs détectées: ${RED}$TOTAL_ERRORS${NC}"
echo ""

if [ $TOTAL_ERRORS -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✅ PARFAIT ! Tous les imports sont corrects              ║${NC}"
    echo -e "${GREEN}║                                                            ║${NC}"
    echo -e "${GREEN}║  Votre projet est prêt pour Vercel ! 🚀                   ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
else
    echo -e "${YELLOW}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║  ⚠️  DES CORRECTIONS SONT NÉCESSAIRES                     ║${NC}"
    echo -e "${YELLOW}║                                                            ║${NC}"
    echo -e "${YELLOW}║  Exécutez le script de correction :                       ║${NC}"
    echo -e "${YELLOW}║  ./fix-imports-for-vercel.sh                              ║${NC}"
    echo -e "${YELLOW}╚════════════════════════════════════════════════════════════╝${NC}"
fi

echo ""

# ============================================
# STATISTIQUES DÉTAILLÉES
# ============================================
if [ "$1" = "--detailed" ] || [ "$1" = "-d" ]; then
    echo -e "${CYAN}📈 STATISTIQUES DÉTAILLÉES${NC}\n"
    
    echo -e "${BLUE}Répartition par dossier :${NC}"
    
    for dir in "components/driver" "components/passenger" "components/admin" "components/auth"; do
        if [ -d "$dir" ]; then
            count=$(grep -r "from ['\"]../../\(framer-motion\|lucide-react\)['\"]" "$dir" 2>/dev/null | wc -l)
            dirname=$(basename "$dir")
            if [ $count -gt 0 ]; then
                echo -e "  ${RED}$dirname:${NC} $count imports incorrects"
            else
                echo -e "  ${GREEN}$dirname:${NC} ✅ OK"
            fi
        fi
    done
    
    echo ""
fi

exit $TOTAL_ERRORS
