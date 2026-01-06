#!/bin/bash

##############################################################################
# 🚀 SCRIPT DE DÉPLOIEMENT VERCEL ULTIME
# 
# Ce script effectue un déploiement complet et propre sur Vercel :
# 1. Nettoie les caches locaux
# 2. Transforme les imports pour Vercel
# 3. Commit et push sur GitHub
# 4. Vercel détecte le push et rebuild automatiquement
#
# USAGE:
#   bash DEPLOY_TO_VERCEL.sh
#   
# OU sur Windows (Git Bash):
#   ./DEPLOY_TO_VERCEL.sh
##############################################################################

set -e  # Arrêter en cas d'erreur

# Couleurs pour le terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "========================================================================"
echo -e "${BLUE}🚀 DÉPLOIEMENT SMARTCABB SUR VERCEL${NC}"
echo "========================================================================"
echo ""

# ============================================================================
# ÉTAPE 1 : NETTOYAGE DES CACHES
# ============================================================================

echo -e "${YELLOW}📦 ÉTAPE 1/5 : Nettoyage des caches locaux...${NC}"

if [ -d "node_modules/.vite" ]; then
    echo "   🗑️  Suppression de node_modules/.vite"
    rm -rf node_modules/.vite
fi

if [ -d "dist" ]; then
    echo "   🗑️  Suppression de dist/"
    rm -rf dist
fi

if [ -d ".vercel" ]; then
    echo "   🗑️  Suppression de .vercel/"
    rm -rf .vercel
fi

echo -e "${GREEN}   ✅ Caches nettoyés${NC}"
echo ""

# ============================================================================
# ÉTAPE 2 : TRANSFORMATION DES IMPORTS POUR VERCEL
# ============================================================================

echo -e "${YELLOW}🔧 ÉTAPE 2/5 : Transformation des imports pour Vercel...${NC}"

if [ -f "scripts/prepare-for-vercel.mjs" ]; then
    node scripts/prepare-for-vercel.mjs
    echo -e "${GREEN}   ✅ Imports transformés${NC}"
else
    echo -e "${RED}   ❌ Erreur : scripts/prepare-for-vercel.mjs introuvable${NC}"
    exit 1
fi

echo ""

# ============================================================================
# ÉTAPE 3 : VÉRIFICATION DES FICHIERS MODIFIÉS
# ============================================================================

echo -e "${YELLOW}📝 ÉTAPE 3/5 : Vérification des modifications...${NC}"

if [ -n "$(git status --porcelain)" ]; then
    echo -e "${GREEN}   ✅ Modifications détectées${NC}"
    git status --short
else
    echo -e "${YELLOW}   ⚠️  Aucune modification détectée${NC}"
    echo "   Les fichiers sont déjà à jour pour Vercel."
    echo ""
    read -p "   Voulez-vous forcer un rebuild quand même ? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}   Déploiement annulé.${NC}"
        exit 0
    fi
fi

echo ""

# ============================================================================
# ÉTAPE 4 : COMMIT ET PUSH SUR GITHUB
# ============================================================================

echo -e "${YELLOW}💾 ÉTAPE 4/5 : Commit et push sur GitHub...${NC}"

# Ajouter tous les fichiers modifiés
git add .

# Créer un commit avec timestamp
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
COMMIT_MESSAGE="deploy: SmartCabb production build - $TIMESTAMP"

git commit -m "$COMMIT_MESSAGE" || {
    echo -e "${YELLOW}   ⚠️  Rien à commiter (déjà committé)${NC}"
}

# Push vers GitHub
echo "   📤 Push vers GitHub..."
git push origin main || git push origin master || {
    echo -e "${RED}   ❌ Erreur lors du push${NC}"
    echo "   Vérifiez votre connexion et vos permissions GitHub"
    exit 1
}

echo -e "${GREEN}   ✅ Code pushé sur GitHub${NC}"
echo ""

# ============================================================================
# ÉTAPE 5 : ATTENTE DU BUILD VERCEL
# ============================================================================

echo -e "${YELLOW}🌐 ÉTAPE 5/5 : Déploiement Vercel en cours...${NC}"
echo ""
echo "   ⏳ Vercel a détecté le push et démarre le build..."
echo ""
echo "   📊 Suivez le build en temps réel :"
echo -e "   ${BLUE}https://vercel.com/dashboard${NC}"
echo ""
echo "   🌐 Votre site sera accessible sur :"
echo -e "   ${BLUE}https://smartcabb.com${NC}"
echo ""
echo "   ⏱️  Durée estimée du build : 2-3 minutes"
echo ""

# ============================================================================
# SUCCÈS !
# ============================================================================

echo "========================================================================"
echo -e "${GREEN}✅ DÉPLOIEMENT LANCÉ AVEC SUCCÈS !${NC}"
echo "========================================================================"
echo ""
echo "📋 PROCHAINES ÉTAPES :"
echo ""
echo "   1. Ouvrez https://vercel.com/dashboard"
echo "   2. Vérifiez que le build est en cours (status: Building)"
echo "   3. Attendez 2-3 minutes"
echo "   4. Le site sera automatiquement mis à jour sur smartcabb.com"
echo ""
echo "🔍 EN CAS D'ERREUR DE BUILD :"
echo ""
echo "   - Consultez les logs Vercel"
echo "   - Vérifiez les imports framer-motion (doivent être 'motion/react')"
echo "   - Vérifiez vite.config.ts (alias désactivé)"
echo ""
echo "========================================================================"
echo ""

# Optionnel : Ouvrir le dashboard Vercel dans le navigateur
read -p "Voulez-vous ouvrir le dashboard Vercel ? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v xdg-open > /dev/null; then
        xdg-open "https://vercel.com/dashboard"
    elif command -v open > /dev/null; then
        open "https://vercel.com/dashboard"
    elif command -v start > /dev/null; then
        start "https://vercel.com/dashboard"
    else
        echo "   Ouvrez manuellement : https://vercel.com/dashboard"
    fi
fi

echo ""
echo -e "${GREEN}🎉 DONE !${NC}"
echo ""
