#!/bin/bash

###############################################################################
# ✅ SCRIPT DE VÉRIFICATION POST-RÉSOLUTION
# SmartCabb v517.161.3
# 
# Vérifie que tous les conflits ont été résolus correctement
###############################################################################

echo "✅ VÉRIFICATION POST-RÉSOLUTION DES CONFLITS"
echo "=============================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. Vérifier les conflits restants
echo "🔍 1. Vérification des conflits restants..."
CONFLICTS=$(git diff --name-only --diff-filter=U 2>/dev/null)
CONFLICT_COUNT=$(echo "$CONFLICTS" | grep -c '^' 2>/dev/null || echo "0")

if [ "$CONFLICT_COUNT" -eq 0 ]; then
    echo -e "${GREEN}   ✓ Aucun conflit détecté${NC}"
else
    echo -e "${RED}   ✗ $CONFLICT_COUNT conflit(s) restant(s):${NC}"
    echo "$CONFLICTS" | while read file; do
        echo -e "     ${RED}•${NC} $file"
    done
fi
echo ""

# 2. Vérifier les marqueurs de conflit dans les fichiers
echo "🔍 2. Recherche de marqueurs de conflit dans les fichiers..."
MARKER_FILES=$(grep -r "<<<<<<< HEAD" . --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" 2>/dev/null | cut -d: -f1 | sort -u)
MARKER_COUNT=$(echo "$MARKER_FILES" | grep -c '^' 2>/dev/null || echo "0")

if [ -z "$MARKER_FILES" ] || [ "$MARKER_COUNT" -eq 0 ]; then
    echo -e "${GREEN}   ✓ Aucun marqueur de conflit trouvé${NC}"
else
    echo -e "${RED}   ✗ Marqueurs trouvés dans $MARKER_COUNT fichier(s):${NC}"
    echo "$MARKER_FILES" | while read file; do
        echo -e "     ${RED}•${NC} $file"
    done
fi
echo ""

# 3. Vérifier l'état Git
echo "🔍 3. État du repository Git..."
UNSTAGED=$(git diff --name-only 2>/dev/null | wc -l)
STAGED=$(git diff --cached --name-only 2>/dev/null | wc -l)

echo -e "   Fichiers non stagés: ${YELLOW}$UNSTAGED${NC}"
echo -e "   Fichiers stagés: ${BLUE}$STAGED${NC}"
echo ""

# 4. Vérifier s'il y a un merge en cours
if [ -f .git/MERGE_HEAD ]; then
    echo -e "${YELLOW}⚠️  4. Merge en cours détecté${NC}"
    echo "   Vous devez finaliser le merge avec:"
    echo -e "   ${BLUE}git commit -m \"Merge: Résolution des conflits\"${NC}"
else
    echo -e "${GREEN}✓ 4. Pas de merge en cours${NC}"
fi
echo ""

# 5. Résumé final
echo "=============================================="
echo "📊 RÉSUMÉ FINAL"
echo "=============================================="

ALL_CLEAR=true

if [ "$CONFLICT_COUNT" -gt 0 ]; then
    echo -e "${RED}❌ Conflits Git restants: $CONFLICT_COUNT${NC}"
    ALL_CLEAR=false
else
    echo -e "${GREEN}✅ Conflits Git: 0${NC}"
fi

if [ "$MARKER_COUNT" -gt 0 ]; then
    echo -e "${RED}❌ Marqueurs de conflit dans les fichiers: $MARKER_COUNT${NC}"
    ALL_CLEAR=false
else
    echo -e "${GREEN}✅ Marqueurs de conflit: 0${NC}"
fi

echo ""

if [ "$ALL_CLEAR" = true ]; then
    echo -e "${GREEN}🎉 TOUS LES CONFLITS SONT RÉSOLUS !${NC}"
    echo ""
    echo "🎯 Prochaines étapes:"
    echo ""
    
    if [ -f .git/MERGE_HEAD ]; then
        echo "1. Finaliser le merge:"
        echo -e "   ${BLUE}git commit -m \"Merge: Résolution des conflits - v517.161.3\"${NC}"
        echo ""
        echo "2. Pousser les changements:"
        echo -e "   ${BLUE}git push origin main${NC}"
    else
        echo "1. Vérifier l'état:"
        echo -e "   ${BLUE}git status${NC}"
        echo ""
        echo "2. Commiter si nécessaire:"
        echo -e "   ${BLUE}git commit -m \"Fix: Corrections post-merge\"${NC}"
        echo ""
        echo "3. Pousser:"
        echo -e "   ${BLUE}git push origin main${NC}"
    fi
    echo ""
else
    echo -e "${RED}⚠️  ATTENTION: Il reste des conflits à résoudre${NC}"
    echo ""
    echo "🔧 Actions recommandées:"
    echo ""
    
    if [ "$CONFLICT_COUNT" -gt 0 ]; then
        echo "1. Résoudre les conflits Git:"
        echo -e "   ${BLUE}node 🔧_RESOLVE_ALL_CONFLICTS.js${NC}"
        echo "   OU"
        echo -e "   ${BLUE}git checkout --ours .${NC}"
        echo -e "   ${BLUE}git add .${NC}"
        echo ""
    fi
    
    if [ "$MARKER_COUNT" -gt 0 ]; then
        echo "2. Éditer manuellement les fichiers avec marqueurs"
        echo "   Rechercher et supprimer:"
        echo "   - <<<<<<< HEAD"
        echo "   - ======="
        echo "   - >>>>>>> branch-name"
        echo ""
    fi
fi

echo "=============================================="
echo ""

# Code de sortie
if [ "$ALL_CLEAR" = true ]; then
    exit 0
else
    exit 1
fi
