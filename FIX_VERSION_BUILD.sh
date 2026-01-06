#!/bin/bash

##############################################################################
# 🔧 FIX VERSION + BUILD SMARTCABB
# Corrige l'erreur "Invalid loader value: 107"
##############################################################################

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo "========================================================================"
echo -e "${GREEN}🔧 FIX VERSION SMARTCABB${NC}"
echo "========================================================================"
echo ""

# 1. Afficher la version actuelle
echo -e "${YELLOW}📋 Version actuelle :${NC}"
grep '"version"' package.json
echo ""

# 2. Nettoyage
echo -e "${YELLOW}🗑️  Nettoyage...${NC}"
rm -rf node_modules dist .vercel node_modules/.vite package-lock.json npm-debug.log* 2>/dev/null || true
echo -e "${GREEN}✅ Nettoyage terminé${NC}"
echo ""

# 3. Installation
echo -e "${YELLOW}📦 Installation npm (3-5 min)...${NC}"
npm cache clean --force 2>/dev/null || true
npm install --legacy-peer-deps || {
    echo -e "${RED}❌ Installation échouée${NC}"
    exit 1
}
echo -e "${GREEN}✅ Installation réussie${NC}"
echo ""

# 4. Vérifier versions
echo -e "${YELLOW}🔍 Versions installées :${NC}"
echo "React: $(node -p "require('./node_modules/react/package.json').version")"
echo "Vite: $(node -p "require('./node_modules/vite/package.json').version")"
echo ""

# 5. Build
echo -e "${YELLOW}🏗️  Build Vite...${NC}"
npm run build 2>&1 | tee build.log

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================================================"
    echo -e "${GREEN}✅✅✅ BUILD RÉUSSI ! ✅✅✅${NC}"
    echo "========================================================================"
    echo ""
    echo "📂 Fichiers générés :"
    ls -lh dist/ | head -n 15
    echo ""
    echo "📊 Taille dist/ : $(du -sh dist/ | cut -f1)"
    echo ""
    
    # Proposer déploiement
    read -p "Déployer sur Vercel maintenant ? (y/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo -e "${YELLOW}📤 Commit et push...${NC}"
        git add .
        git commit -m "fix: change version to 1.0.0 - resolve esbuild loader error" || echo "Rien à commiter"
        git push origin main || git push origin master
        echo ""
        echo -e "${GREEN}✅ Code pushé sur GitHub !${NC}"
        echo "🌐 Vercel rebuild en cours..."
        echo "🌐 Vérifiez dans 2-3 min : https://smartcabb.com"
    fi
else
    echo ""
    echo "========================================================================"
    echo -e "${RED}❌ BUILD ÉCHOUÉ${NC}"
    echo "========================================================================"
    echo ""
    echo "📋 Dernières lignes d'erreur :"
    tail -n 30 build.log
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 TERMINÉ !${NC}"
echo ""
