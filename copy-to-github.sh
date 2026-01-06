#!/bin/bash

# ============================================================================
# SCRIPT SIMPLE : COPIER LES FICHIERS VERS GITHUB
# Pour ceux qui veulent juste copier sans automatisation complète
# ============================================================================

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════╗"
echo "║   COPIE RAPIDE VERS GITHUB - SmartCabb    ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Demander les chemins
read -p "📁 Chemin vers les fichiers Figma Make : " SOURCE
read -p "📁 Chemin vers votre repo GitHub local : " DEST

echo ""
echo -e "${BLUE}📋 Vérification...${NC}"

# Vérifier que les chemins existent
if [ ! -d "$SOURCE" ]; then
    echo -e "${YELLOW}❌ Le dossier source n'existe pas : $SOURCE${NC}"
    exit 1
fi

if [ ! -d "$DEST" ]; then
    echo -e "${YELLOW}❌ Le dossier de destination n'existe pas : $DEST${NC}"
    exit 1
fi

if [ ! -d "$DEST/.git" ]; then
    echo -e "${YELLOW}❌ Le dossier de destination n'est pas un repo Git${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Chemins valides${NC}"
echo ""

# Copier les fichiers
echo -e "${BLUE}📦 Copie des fichiers...${NC}"
rsync -av --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '.vercel' \
    --exclude 'dist' \
    --exclude 'build' \
    "$SOURCE/" "$DEST/"

echo ""
echo -e "${GREEN}✅ Fichiers copiés !${NC}"
echo ""

# Changer de dossier
cd "$DEST" || exit

# Voir les modifications
echo -e "${BLUE}📊 Modifications détectées :${NC}"
git status --short | head -20
TOTAL=$(git status --short | wc -l)
echo ""
echo -e "${BLUE}Total : $TOTAL fichiers modifiés${NC}"
echo ""

# Demander confirmation
read -p "Voulez-vous commiter et pousser ? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${BLUE}📝 Commit en cours...${NC}"
    git add .
    git commit -m "feat: update from Figma Make - $(date +%Y-%m-%d)"
    
    echo ""
    echo -e "${BLUE}🚀 Push vers GitHub...${NC}"
    git push origin main
    
    echo ""
    echo -e "${GREEN}"
    echo "╔════════════════════════════════════════════╗"
    echo "║          ✅ DÉPLOIEMENT RÉUSSI !          ║"
    echo "╚════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    echo "🌐 Vérifiez sur : https://vercel.com/dashboard"
    echo "🚀 Production : https://smartcabb.com"
else
    echo ""
    echo -e "${YELLOW}⚠️  Modifications copiées mais pas commitées${NC}"
    echo "Pour commiter manuellement :"
    echo "  cd $DEST"
    echo "  git add ."
    echo "  git commit -m \"update from Figma Make\""
    echo "  git push origin main"
fi

echo ""
echo -e "${GREEN}✅ Terminé !${NC}"
