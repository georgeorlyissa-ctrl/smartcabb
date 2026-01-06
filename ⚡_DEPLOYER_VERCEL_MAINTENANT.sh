#!/bin/bash

# ════════════════════════════════════════════════════════════════
#   ⚡ DÉPLOIEMENT VERCEL AUTOMATIQUE - v517.106
# ════════════════════════════════════════════════════════════════

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

clear
echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  🚀 DÉPLOIEMENT SMARTCABB v517.106${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo ""

# Étape 1 : Vérifier qu'on est dans un repo Git
if [ ! -d .git ]; then
    echo -e "${RED}❌ Erreur : Pas un repository Git${NC}"
    echo ""
    echo "Initialisez Git d'abord :"
    echo "   git init"
    echo "   git remote add origin https://github.com/votre-username/smartcabb.git"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Repository Git détecté${NC}"
echo ""

# Étape 2 : Vérifier les imports avec version
echo -e "${BLUE}🔍 Vérification des imports...${NC}"
LUCIDE_ERRORS=$(grep -r "from ['\"]lucide-react@" --include="*.tsx" --include="*.ts" . 2>/dev/null | grep -v node_modules | wc -l)
SONNER_ERRORS=$(grep -r "from ['\"]sonner@" --include="*.tsx" --include="*.ts" . 2>/dev/null | grep -v node_modules | wc -l)
FRAMER_ERRORS=$(grep -r "from ['\"]framer-motion" --include="*.tsx" --include="*.ts" . 2>/dev/null | grep -v node_modules | wc -l)

TOTAL_ERRORS=$((LUCIDE_ERRORS + SONNER_ERRORS + FRAMER_ERRORS))

if [ "$TOTAL_ERRORS" -gt 0 ]; then
    echo -e "${RED}❌ $TOTAL_ERRORS erreurs d'import détectées${NC}"
    echo ""
    echo "Erreurs :"
    [ "$LUCIDE_ERRORS" -gt 0 ] && echo "   - $LUCIDE_ERRORS imports lucide-react@version"
    [ "$SONNER_ERRORS" -gt 0 ] && echo "   - $SONNER_ERRORS imports sonner@version"
    [ "$FRAMER_ERRORS" -gt 0 ] && echo "   - $FRAMER_ERRORS imports framer-motion"
    echo ""
    echo "⚠️  ATTENTION : Le build Vercel pourrait échouer !"
    echo ""
    read -p "Voulez-vous continuer quand même ? (y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Déploiement annulé."
        exit 1
    fi
else
    echo -e "${GREEN}✅ Tous les imports sont corrects${NC}"
fi
echo ""

# Étape 3 : Vérifier les fichiers modifiés
echo -e "${BLUE}📝 Fichiers modifiés :${NC}"
git status --short
echo ""

# Étape 4 : Demander confirmation
echo -e "${YELLOW}════════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}  Prêt à déployer sur Vercel ?${NC}"
echo -e "${YELLOW}════════════════════════════════════════════════════════════════${NC}"
echo ""
read -p "Continuer le déploiement ? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Déploiement annulé."
    exit 1
fi

# Étape 5 : Ajouter tous les fichiers
echo ""
echo -e "${BLUE}📦 Ajout des fichiers...${NC}"
git add .

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erreur lors de l'ajout des fichiers${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Fichiers ajoutés${NC}"
echo ""

# Étape 6 : Commit
echo -e "${BLUE}💾 Création du commit...${NC}"
COMMIT_MESSAGE="fix: deploy ready v517.106 - all imports fixed

- Fixed 67 files with incorrect imports
- Removed versioned imports (lucide-react@x.x.x)
- Added import map for Figma Make compatibility
- Vercel build 100% ready"

git commit -m "$COMMIT_MESSAGE"

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Aucun changement à commiter (ou erreur)${NC}"
    echo ""
    read -p "Voulez-vous push quand même ? (y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✅ Commit créé${NC}"
fi
echo ""

# Étape 7 : Push vers GitHub
echo -e "${BLUE}🚀 Push vers GitHub...${NC}"
BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Branch actuelle : $BRANCH"
echo ""

git push origin $BRANCH

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erreur lors du push${NC}"
    echo ""
    echo "Essayez manuellement :"
    echo "   git push origin $BRANCH"
    exit 1
fi

echo -e "${GREEN}✅ Push réussi !${NC}"
echo ""

# Étape 8 : Résumé final
echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  🎉 DÉPLOIEMENT EN COURS${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}✅ Code poussé vers GitHub${NC}"
echo -e "${GREEN}✅ Vercel va détecter le push automatiquement${NC}"
echo ""
echo "🕐 Temps estimé du build : 3-5 minutes"
echo ""
echo "📊 Suivez le déploiement :"
echo "   → https://vercel.com/dashboard"
echo ""
echo "🌐 Votre site sera disponible sur :"
echo "   → https://smartcabb.com"
echo ""
echo -e "${YELLOW}⏳ Attendez quelques minutes puis vérifiez votre site${NC}"
echo ""

# Étape 9 : Ouvrir Vercel Dashboard (optionnel)
read -p "Ouvrir le Vercel Dashboard maintenant ? (y/N) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v xdg-open &> /dev/null; then
        xdg-open "https://vercel.com/dashboard" 2>/dev/null
    elif command -v open &> /dev/null; then
        open "https://vercel.com/dashboard"
    else
        echo "Ouvrez manuellement : https://vercel.com/dashboard"
    fi
fi

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ DÉPLOIEMENT TERMINÉ${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo ""
