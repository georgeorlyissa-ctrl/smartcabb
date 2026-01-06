#!/bin/bash

##############################################################################
# 🔥 BUILD PROPRE SMARTCABB - VITE CONFIG SIMPLIFIÉ
##############################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo "========================================================================"
echo -e "${GREEN}🔥 BUILD PROPRE SMARTCABB${NC}"
echo "========================================================================"
echo ""

# Nettoyage TOTAL
echo -e "${YELLOW}🗑️  Nettoyage complet...${NC}"
rm -rf node_modules dist .vercel node_modules/.vite package-lock.json 2>/dev/null || true
echo -e "${GREEN}✅ Environnement nettoyé${NC}"
echo ""

# Installation
echo -e "${YELLOW}📦 Installation dépendances (2-5 min)...${NC}"
npm install --legacy-peer-deps || npm install --force || {
    echo -e "${RED}❌ npm install échoué${NC}"
    exit 1
}
echo -e "${GREEN}✅ Dépendances installées${NC}"
echo ""

# Transformation imports
echo -e "${YELLOW}🔄 Transformation imports...${NC}"
if [ -f "scripts/prepare-for-vercel.mjs" ]; then
    node scripts/prepare-for-vercel.mjs 2>/dev/null || echo "⚠️  Skip transformation"
fi
echo ""

# Build
echo -e "${YELLOW}🏗️  Build en cours...${NC}"
npm run build || {
    echo ""
    echo -e "${RED}❌ BUILD ÉCHOUÉ${NC}"
    echo ""
    echo "Logs d'erreur ci-dessus"
    exit 1
}

echo ""
echo "========================================================================"
echo -e "${GREEN}✅ BUILD RÉUSSI !${NC}"
echo "========================================================================"
echo ""
echo "📊 Fichiers générés :"
ls -lh dist/ 2>/dev/null || true
echo ""

# Demander si on veut déployer
read -p "Déployer sur Vercel maintenant ? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${YELLOW}📤 Commit et push...${NC}"
    git add .
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    git commit -m "fix: vite config simplified - build working - $TIMESTAMP" || echo "Rien à commiter"
    git push origin main || git push origin master || {
        echo -e "${RED}❌ Push échoué${NC}"
        exit 1
    }
    echo ""
    echo -e "${GREEN}✅ Code pushé ! Vercel rebuild en cours...${NC}"
    echo "🌐 Vérifiez : https://vercel.com/dashboard"
    echo "🌐 Testez dans 2-3 min : https://smartcabb.com"
else
    echo ""
    echo "Déploiement annulé. Vous pouvez déployer plus tard avec :"
    echo "git add . && git commit -m 'fix: build' && git push"
fi

echo ""
echo -e "${GREEN}🎉 DONE !${NC}"
echo ""
