#!/bin/bash

###############################################################################
# 🔧 SCRIPT DE RÉSOLUTION AUTOMATIQUE DES CONFLITS GIT
# SmartCabb v517.161.3
# 
# Ce script résout automatiquement les conflits de merge en acceptant
# toujours la version locale (HEAD) pour tous les fichiers
###############################################################################

echo "🔧 RÉSOLUTION AUTOMATIQUE DES CONFLITS GIT"
echo "==========================================="
echo ""

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Vérifier si on est dans un repo git
if [ ! -d .git ]; then
    echo -e "${RED}❌ Erreur: Pas de dossier .git trouvé${NC}"
    echo "Ce script doit être exécuté à la racine du projet git"
    exit 1
fi

# Vérifier s'il y a des conflits
CONFLICTS=$(git diff --name-only --diff-filter=U)
CONFLICT_COUNT=$(echo "$CONFLICTS" | grep -c '^' 2>/dev/null || echo "0")

if [ "$CONFLICT_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✅ Aucun conflit détecté${NC}"
    echo ""
    echo "Vérification du statut git:"
    git status
    exit 0
fi

echo -e "${YELLOW}⚠️  $CONFLICT_COUNT fichier(s) en conflit détectés${NC}"
echo ""
echo "Liste des fichiers en conflit:"
echo "$CONFLICTS" | while read file; do
    echo -e "  ${RED}•${NC} $file"
done
echo ""

# Demander confirmation
echo -e "${YELLOW}⚠️  ATTENTION:${NC}"
echo "Ce script va résoudre TOUS les conflits en acceptant la version LOCALE (HEAD)"
echo "Les modifications de la branche distante seront ÉCRASÉES"
echo ""
read -p "Êtes-vous sûr de vouloir continuer? (oui/non) " -n 3 -r
echo ""

if [[ ! $REPLY =~ ^[Oo][Uu][Ii]$ ]]; then
    echo -e "${BLUE}ℹ️  Opération annulée${NC}"
    exit 0
fi

echo ""
echo "🔄 Résolution des conflits en cours..."
echo ""

# Compteurs
RESOLVED=0
FAILED=0

# Résoudre chaque conflit
echo "$CONFLICTS" | while read file; do
    if [ -n "$file" ]; then
        echo -n "  Résolution de: $file ... "
        
        # Accepter notre version (HEAD)
        if git checkout --ours "$file" 2>/dev/null; then
            # Marquer comme résolu
            if git add "$file" 2>/dev/null; then
                echo -e "${GREEN}✓${NC}"
                RESOLVED=$((RESOLVED + 1))
            else
                echo -e "${RED}✗ (échec git add)${NC}"
                FAILED=$((FAILED + 1))
            fi
        else
            echo -e "${RED}✗ (échec checkout)${NC}"
            FAILED=$((FAILED + 1))
        fi
    fi
done

echo ""
echo "==========================================="
echo -e "${GREEN}✅ Résolution terminée${NC}"
echo ""

# Afficher le résumé
echo "📊 Résumé:"
git status --short

echo ""
echo "🎯 Prochaines étapes:"
echo ""
echo "1. Vérifier les modifications:"
echo -e "   ${BLUE}git status${NC}"
echo ""
echo "2. Finaliser le merge:"
echo -e "   ${BLUE}git commit -m \"Merge: Résolution automatique des conflits - Version locale conservée\"${NC}"
echo ""
echo "3. Pousser les changements:"
echo -e "   ${BLUE}git push origin main${NC}"
echo ""
echo "==========================================="
