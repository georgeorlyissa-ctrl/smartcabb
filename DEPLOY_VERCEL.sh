#!/bin/bash

###############################################################################
# 🚀 SCRIPT ALL-IN-ONE : CORRECTION + DÉPLOIEMENT VERCEL
#
# Ce script fait TOUT en une seule commande :
# 1. Corrige tous les imports avec versions
# 2. Vérifie qu'il n'y a plus d'erreurs
# 3. Commit et push vers GitHub
# 4. Affiche les instructions pour Vercel
#
# Usage: bash DEPLOY_VERCEL.sh
###############################################################################

set -e  # Arrêter en cas d'erreur

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🚀 SMARTCABB - CORRECTION & DÉPLOIEMENT VERCEL           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Étape 1 : Vérifier qu'on est dans le bon répertoire
echo -e "${YELLOW}📁 Vérification du répertoire...${NC}"
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erreur: package.json non trouvé${NC}"
    echo -e "${RED}   Vous devez exécuter ce script depuis le répertoire racine du projet${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Répertoire OK${NC}"
echo ""

# Étape 2 : Corriger les imports
echo -e "${YELLOW}🔧 Correction des imports...${NC}"
node FIX_ALL_IMPORTS_GITHUB.cjs
echo ""

# Étape 3 : Vérifier les corrections
echo -e "${YELLOW}🔍 Vérification des corrections...${NC}"
if node VERIFY_IMPORTS.cjs; then
    echo -e "${GREEN}✅ Tous les imports sont corrects${NC}"
else
    echo -e "${RED}❌ Des problèmes persistent${NC}"
    exit 1
fi
echo ""

# Étape 4 : Vérifier s'il y a des changements
if [ -z "$(git status --porcelain)" ]; then
    echo -e "${GREEN}✨ Aucun changement à commit (déjà à jour)${NC}"
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}🎉 TOUT EST DÉJÀ À JOUR !${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${YELLOW}📝 PROCHAINES ÉTAPES :${NC}"
    echo -e "   1. Allez sur ${BLUE}https://vercel.com/dashboard${NC}"
    echo -e "   2. Sélectionnez le projet ${BLUE}smartcabb${NC}"
    echo -e "   3. Cliquez sur ${BLUE}Deployments${NC}"
    echo -e "   4. Cliquez sur ${BLUE}Redeploy${NC}"
    echo -e "   5. ${RED}DÉCOCHEZ${NC} ${YELLOW}\"Use existing Build Cache\"${NC}"
    echo -e "   6. Cliquez sur ${BLUE}Redeploy${NC}"
    echo ""
    exit 0
fi

# Étape 5 : Afficher les changements
echo -e "${YELLOW}📝 Changements détectés:${NC}"
git status --short
echo ""

# Étape 6 : Demander confirmation
read -p "$(echo -e ${YELLOW}Voulez-vous commit et push ces changements ? [y/N]: ${NC})" -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⏸️  Annulé par l'utilisateur${NC}"
    exit 0
fi

# Étape 7 : Git add
echo -e "${YELLOW}📦 Ajout des fichiers...${NC}"
git add .
echo -e "${GREEN}✅ Fichiers ajoutés${NC}"
echo ""

# Étape 8 : Git commit
echo -e "${YELLOW}💾 Création du commit...${NC}"
git commit -m "fix: remove all package versions for Vercel compatibility

- Replace lucide-react@0.550.0 with lucide-react
- Replace sonner@2.0.3 with sonner
- Fix all TypeScript/React files
- Ready for Vercel deployment"
echo -e "${GREEN}✅ Commit créé${NC}"
echo ""

# Étape 9 : Git push
echo -e "${YELLOW}🚀 Push vers GitHub...${NC}"
git push origin main
echo -e "${GREEN}✅ Push réussi${NC}"
echo ""

# Étape 10 : Afficher le résultat final
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 SUCCÈS ! TOUS LES CHANGEMENTS ONT ÉTÉ POUSSÉS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}📊 RÉSUMÉ :${NC}"
echo -e "   ✅ Imports corrigés"
echo -e "   ✅ Vérifications passées"
echo -e "   ✅ Commit créé"
echo -e "   ✅ Push vers GitHub réussi"
echo ""
echo -e "${YELLOW}📝 PROCHAINES ÉTAPES :${NC}"
echo -e "   1. ${BLUE}Vercel${NC} va automatiquement détecter les changements"
echo -e "   2. Un nouveau build va démarrer automatiquement"
echo -e "   3. Surveillez le build sur ${BLUE}https://vercel.com/dashboard${NC}"
echo ""
echo -e "${YELLOW}Si le build ne démarre pas automatiquement :${NC}"
echo -e "   1. Allez sur ${BLUE}https://vercel.com/dashboard${NC}"
echo -e "   2. Sélectionnez le projet ${BLUE}smartcabb${NC}"
echo -e "   3. Cliquez sur ${BLUE}Deployments${NC}"
echo -e "   4. Cliquez sur ${BLUE}Redeploy${NC}"
echo -e "   5. ${RED}DÉCOCHEZ${NC} ${YELLOW}\"Use existing Build Cache\"${NC}"
echo -e "   6. Cliquez sur ${BLUE}Redeploy${NC}"
echo ""
echo -e "${GREEN}🎊 VOTRE APPLICATION VA ÊTRE DÉPLOYÉE SUR smartcabb.com !${NC}"
echo ""
