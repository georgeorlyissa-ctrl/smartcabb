#!/bin/bash

##############################################################################
# 💾 COMMIT ET PUSH - DÉPLOIEMENT VERCEL MINIMAL
# 
# Ce script commit et push sur GitHub
# Vercel rebuild SEULEMENT s'il détecte des changements significatifs
##############################################################################

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "========================================================================"
echo -e "${BLUE}💾 COMMIT ET PUSH SUR GITHUB${NC}"
echo "========================================================================"
echo ""

# Vérifier si le build local a été fait
if [ ! -f "dist/index.html" ]; then
    echo -e "${RED}❌ ERREUR : Build local manquant${NC}"
    echo ""
    echo "Vous devez d'abord exécuter : bash FIX_BUILD_LOCAL.sh"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Build local détecté${NC}"
echo ""

# ============================================================================
# VÉRIFICATION DES MODIFICATIONS
# ============================================================================

echo "📝 Vérification des modifications..."
echo ""

git status --short

echo ""

# ============================================================================
# COMMIT
# ============================================================================

echo "💾 Commit des changements..."
echo ""

git add .

# Créer un commit avec timestamp
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
git commit -m "fix: rebuild dependencies and transform imports - $TIMESTAMP" || {
    echo ""
    echo "ℹ️  Rien à commiter (déjà à jour)"
    echo ""
}

# ============================================================================
# AVERTISSEMENT QUOTA VERCEL
# ============================================================================

echo ""
echo "========================================================================"
echo -e "${YELLOW}⚠️  AVERTISSEMENT - QUOTA VERCEL${NC}"
echo "========================================================================"
echo ""
echo "Vous avez atteint la limite de 100 déploiements/jour."
echo ""
echo "Le push sur GitHub déclenchera un nouveau build Vercel"
echo "SEULEMENT si Vercel détecte que le quota est disponible."
echo ""
echo "Si le quota est toujours atteint, le push sera fait mais"
echo "Vercel attendra le reset du quota (minuit UTC)."
echo ""
echo "========================================================================"
echo ""

read -p "Voulez-vous pusher sur GitHub maintenant ? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Push annulé."
    echo "Vous pouvez pusher plus tard avec : git push origin main"
    echo ""
    exit 0
fi

echo ""

# ============================================================================
# PUSH SUR GITHUB
# ============================================================================

echo "📤 Push sur GitHub..."
echo ""

git push origin main || git push origin master || {
    echo ""
    echo -e "${RED}❌ Erreur lors du push${NC}"
    echo "Vérifiez votre connexion et vos permissions GitHub"
    exit 1
}

echo ""
echo -e "${GREEN}✅ Code pushé sur GitHub${NC}"
echo ""

# ============================================================================
# INSTRUCTIONS POST-PUSH
# ============================================================================

echo "========================================================================"
echo -e "${GREEN}✅ PUSH RÉUSSI${NC}"
echo "========================================================================"
echo ""
echo "🌐 CODE PUSHÉ SUR GITHUB"
echo ""
echo "VÉRIFICATION VERCEL :"
echo "   1. Ouvrez : https://vercel.com/dashboard"
echo "   2. Vérifiez si un build démarre"
echo ""
echo "SI LE BUILD DÉMARRE :"
echo "   ✅ Quota disponible"
echo "   ⏳ Attendez 2-3 minutes"
echo "   🌐 Testez : https://smartcabb.com"
echo ""
echo "SI AUCUN BUILD :"
echo "   ⚠️  Quota toujours atteint"
echo "   ⏰ Attendez le reset (minuit UTC)"
echo "   💡 Continuez le développement Android"
echo ""
echo "TEMPS RESTANT AVANT RESET :"
echo "   Vérifiez sur : https://vercel.com/dashboard"
echo "   (affiche le temps restant)"
echo ""
echo "========================================================================"
echo ""

read -p "Voulez-vous ouvrir Vercel Dashboard ? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v xdg-open > /dev/null; then
        xdg-open "https://vercel.com/dashboard"
    elif command -v open > /dev/null; then
        open "https://vercel.com/dashboard"
    else
        echo "Ouvrez manuellement : https://vercel.com/dashboard"
    fi
fi

echo ""
echo -e "${GREEN}🎉 DONE !${NC}"
echo ""
