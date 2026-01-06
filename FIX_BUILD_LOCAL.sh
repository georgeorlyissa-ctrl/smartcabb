#!/bin/bash

##############################################################################
# 🔧 FIX BUILD LOCAL - SANS DÉPLOIEMENT VERCEL
# 
# Ce script répare les dépendances et teste le build LOCALEMENT
# AUCUN déploiement Vercel ne sera déclenché
##############################################################################

set -e  # Arrêter en cas d'erreur (sauf où géré)

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "========================================================================"
echo -e "${BLUE}🔧 FIX BUILD SMARTCABB (LOCAL SEULEMENT)${NC}"
echo "========================================================================"
echo ""

# ============================================================================
# ÉTAPE 1 : NETTOYAGE COMPLET
# ============================================================================

echo -e "${YELLOW}📦 ÉTAPE 1/5 : Nettoyage complet...${NC}"
echo ""

echo "   🗑️  Suppression de node_modules (peut prendre 30 sec)"
if [ -d "node_modules" ]; then
    rm -rf node_modules
    echo -e "${GREEN}   ✅ node_modules supprimé${NC}"
else
    echo "   ℹ️  node_modules déjà absent"
fi

echo "   🗑️  Suppression des caches"
rm -rf node_modules/.vite
rm -rf dist
rm -rf .vercel
rm -f package-lock.json

echo -e "${GREEN}   ✅ Nettoyage terminé${NC}"
echo ""

# ============================================================================
# ÉTAPE 2 : RÉINSTALLATION DES DÉPENDANCES
# ============================================================================

echo -e "${YELLOW}📦 ÉTAPE 2/5 : Réinstallation des dépendances...${NC}"
echo ""
echo "   ⏳ Téléchargement de ~200 MB (peut prendre 2-5 minutes)"
echo ""

npm install || {
    echo ""
    echo -e "${RED}   ❌ Erreur lors de l'installation des dépendances${NC}"
    echo "   Vérifiez votre connexion Internet et réessayez"
    exit 1
}

echo ""
echo -e "${GREEN}   ✅ Dépendances installées${NC}"
echo ""

# ============================================================================
# ÉTAPE 3 : TRANSFORMATION DES IMPORTS POUR VERCEL
# ============================================================================

echo -e "${YELLOW}🔧 ÉTAPE 3/5 : Transformation des imports...${NC}"
echo ""

node scripts/prepare-for-vercel.mjs || {
    echo ""
    echo -e "${RED}   ❌ Erreur lors de la transformation des imports${NC}"
    exit 1
}

echo -e "${GREEN}   ✅ Imports transformés${NC}"
echo ""

# ============================================================================
# ÉTAPE 4 : BUILD LOCAL (TEST)
# ============================================================================

echo -e "${YELLOW}🏗️  ÉTAPE 4/5 : Build local (test)...${NC}"
echo ""
echo "   ⏳ Compilation en cours (1-2 minutes)"
echo ""

npm run build || {
    echo ""
    echo "========================================================================"
    echo -e "${RED}❌ BUILD ÉCHOUÉ${NC}"
    echo "========================================================================"
    echo ""
    echo "Le build local a échoué. Vérifiez les erreurs ci-dessus."
    echo ""
    echo "AUCUN déploiement Vercel n'a été tenté (quota préservé)."
    echo ""
    exit 1
}

echo ""
echo -e "${GREEN}   ✅ Build réussi !${NC}"
echo ""

# ============================================================================
# ÉTAPE 5 : VÉRIFICATION DES FICHIERS GÉNÉRÉS
# ============================================================================

echo -e "${YELLOW}📊 ÉTAPE 5/5 : Vérification...${NC}"
echo ""

if [ -f "dist/index.html" ]; then
    echo -e "${GREEN}   ✅ dist/index.html créé${NC}"
else
    echo -e "${RED}   ❌ dist/index.html manquant${NC}"
    exit 1
fi

if [ -d "dist/assets" ]; then
    echo -e "${GREEN}   ✅ dist/assets/ créé${NC}"
else
    echo -e "${RED}   ❌ dist/assets/ manquant${NC}"
    exit 1
fi

# Compter les fichiers dans dist/assets
FILE_COUNT=$(ls -1 dist/assets 2>/dev/null | wc -l)
echo -e "${GREEN}   ✅ $FILE_COUNT fichiers dans dist/assets/${NC}"

echo ""

# ============================================================================
# SUCCÈS !
# ============================================================================

echo "========================================================================"
echo -e "${GREEN}✅ BUILD LOCAL RÉUSSI !${NC}"
echo "========================================================================"
echo ""
echo "📊 RÉSUMÉ :"
echo "   ✅ node_modules réinstallés"
echo "   ✅ Imports transformés pour Vercel"
echo "   ✅ Build local réussi"
echo "   ✅ Fichiers générés dans dist/"
echo ""
echo "========================================================================"
echo -e "${BLUE}🎯 PROCHAINES ÉTAPES${NC}"
echo "========================================================================"
echo ""
echo "OPTION A : DÉPLOYER SUR VERCEL (si quota disponible)"
echo "   1. Vérifiez votre quota : https://vercel.com/dashboard"
echo "   2. Si OK, exécutez : bash COMMIT_AND_PUSH.sh"
echo ""
echo "OPTION B : ATTENDRE LE RESET DU QUOTA"
echo "   1. Le quota se réinitialise à minuit UTC"
echo "   2. Vérifiez l'heure : https://time.is/UTC"
echo "   3. Revenez plus tard pour déployer"
echo ""
echo "OPTION C : CONTINUER LE DÉVELOPPEMENT ANDROID"
echo "   1. Le build web fonctionne (confirmé)"
echo "   2. Développez l'app Android en attendant"
echo "   3. Déployez Vercel quand le quota sera disponible"
echo ""
echo "========================================================================"
echo ""
echo -e "${GREEN}🎉 DONE !${NC}"
echo ""
