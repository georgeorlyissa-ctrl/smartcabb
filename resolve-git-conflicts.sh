#!/bin/bash

# ============================================
# 🔧 SCRIPT DE RÉSOLUTION AUTOMATIQUE DES CONFLITS GIT
# ============================================
# Résout automatiquement les conflits Git en gardant la version HEAD
#
# USAGE:
#   1. Rendez-le exécutable: chmod +x resolve-git-conflicts.sh
#   2. Exécutez-le: ./resolve-git-conflicts.sh
#
# SÉCURITÉ:
#   - Un backup automatique est créé avant toute modification
#   - Garde toujours la version HEAD (la plus récente)
#   - Vous pouvez annuler avec: ./resolve-git-conflicts.sh --restore
# ============================================

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Compteurs
TOTAL_FILES=0
TOTAL_CONFLICTS=0
ERRORS=0

# Timestamp pour le backup
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backup_conflicts_${TIMESTAMP}"

# ============================================
# FONCTION: Afficher le header
# ============================================
print_header() {
    echo -e "${CYAN}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                                                            ║"
    echo "║   🔧 RÉSOLUTION AUTOMATIQUE DES CONFLITS GIT              ║"
    echo "║                                                            ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# ============================================
# FONCTION: Créer un backup
# ============================================
create_backup() {
    echo -e "${YELLOW}📦 Création du backup...${NC}"
    
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
    fi
    
    # Trouver tous les fichiers avec conflits
    local conflict_files=$(grep -rl "<<<<<<< HEAD" components/ 2>/dev/null)
    
    if [ -z "$conflict_files" ]; then
        echo -e "${GREEN}✅ Aucun conflit détecté !${NC}\n"
        return 1
    fi
    
    # Backup des fichiers avec conflits
    echo "$conflict_files" | while read file; do
        if [ -f "$file" ]; then
            dir=$(dirname "$file")
            mkdir -p "$BACKUP_DIR/$dir"
            cp "$file" "$BACKUP_DIR/$file"
        fi
    done
    
    echo -e "${GREEN}✅ Backup créé dans: $BACKUP_DIR${NC}\n"
    return 0
}

# ============================================
# FONCTION: Restaurer depuis le backup
# ============================================
restore_backup() {
    echo -e "${YELLOW}🔄 Recherche du dernier backup...${NC}"
    
    LATEST_BACKUP=$(ls -dt backup_conflicts_* 2>/dev/null | head -1)
    
    if [ -z "$LATEST_BACKUP" ]; then
        echo -e "${RED}❌ Aucun backup trouvé!${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}📦 Restauration depuis: $LATEST_BACKUP${NC}"
    
    cp -r "$LATEST_BACKUP"/* .
    
    echo -e "${GREEN}✅ Restauration terminée!${NC}"
    exit 0
}

# ============================================
# FONCTION: Résoudre les conflits dans un fichier
# ============================================
resolve_conflicts() {
    local file=$1
    
    if [ ! -f "$file" ]; then
        echo -e "  ${RED}✗ Fichier introuvable${NC}"
        ((ERRORS++))
        return 1
    fi
    
    # Compter les conflits dans le fichier
    local conflict_count=$(grep -c "<<<<<<< HEAD" "$file" 2>/dev/null || echo "0")
    
    if [ "$conflict_count" -eq 0 ]; then
        return 0
    fi
    
    echo -e "  ${YELLOW}🔍 Conflits détectés: $conflict_count${NC}"
    
    # Créer un fichier temporaire
    local temp_file="${file}.tmp"
    
    # Utiliser Python pour résoudre les conflits (plus fiable que sed)
    python3 << 'PYTHON_SCRIPT' "$file" "$temp_file"
import sys
import re

input_file = sys.argv[1]
output_file = sys.argv[2]

with open(input_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern pour détecter un bloc de conflit complet
# Garde uniquement la partie HEAD (entre <<<<<<< HEAD et =======)
pattern = r'<<<<<<< HEAD\n(.*?)\n=======\n.*?\n>>>>>>>.*?\n'

# Remplacer chaque conflit par la version HEAD
resolved_content = re.sub(pattern, r'\1\n', content, flags=re.DOTALL)

# Vérifier s'il reste des marqueurs (conflits mal formés)
if '<<<<<<< HEAD' in resolved_content or '>>>>>>>' in resolved_content:
    print("WARNING: Certains marqueurs n'ont pas pu être supprimés automatiquement", file=sys.stderr)
    sys.exit(1)

with open(output_file, 'w', encoding='utf-8') as f:
    f.write(resolved_content)

sys.exit(0)
PYTHON_SCRIPT
    
    local python_exit=$?
    
    if [ $python_exit -eq 0 ] && [ -f "$temp_file" ]; then
        # Remplacer le fichier original
        mv "$temp_file" "$file"
        echo -e "  ${GREEN}✓ Conflits résolus (version HEAD conservée)${NC}"
        ((TOTAL_FILES++))
        ((TOTAL_CONFLICTS += conflict_count))
        return 0
    else
        # Si Python échoue, essayer avec sed (méthode de secours)
        echo -e "  ${YELLOW}⚠️  Méthode Python échouée, utilisation de sed...${NC}"
        
        # Supprimer les marqueurs ligne par ligne
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' '/^<<<<<<< HEAD$/,/^=======$/{ /^<<<<<<< HEAD$/d; /^=======$/d; }' "$file"
            sed -i '' '/^=======$/,/^>>>>>>>/d' "$file"
        else
            # Linux
            sed -i '/^<<<<<<< HEAD$/,/^=======$/{ /^<<<<<<< HEAD$/d; /^=======$/d; }' "$file"
            sed -i '/^=======$/,/^>>>>>>>/d' "$file"
        fi
        
        # Vérifier si les marqueurs ont été supprimés
        if grep -q "<<<<<<< HEAD\|>>>>>>>" "$file" 2>/dev/null; then
            echo -e "  ${RED}✗ Échec de la résolution automatique${NC}"
            echo -e "  ${YELLOW}→ Ce fichier nécessite une résolution manuelle${NC}"
            ((ERRORS++))
            return 1
        else
            echo -e "  ${GREEN}✓ Conflits résolus avec sed${NC}"
            ((TOTAL_FILES++))
            ((TOTAL_CONFLICTS += conflict_count))
            return 0
        fi
    fi
}

# ============================================
# FONCTION: Scanner et résoudre tous les conflits
# ============================================
scan_and_resolve() {
    echo -e "${BLUE}🔍 Recherche des fichiers avec conflits...${NC}\n"
    
    # Trouver tous les fichiers avec des marqueurs de conflit
    local conflict_files=$(grep -rl "<<<<<<< HEAD" components/ 2>/dev/null)
    
    if [ -z "$conflict_files" ]; then
        echo -e "${GREEN}✅ Aucun conflit détecté dans le projet !${NC}\n"
        return 0
    fi
    
    echo -e "${CYAN}📝 Fichiers avec conflits Git :${NC}\n"
    
    echo "$conflict_files" | while read file; do
        echo -e "${YELLOW}📄 $(basename "$file")${NC} (${BLUE}$file${NC})"
        resolve_conflicts "$file"
        echo ""
    done
}

# ============================================
# FONCTION: Afficher le rapport final
# ============================================
print_report() {
    echo -e "${CYAN}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                   📊 RAPPORT FINAL                         ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    echo -e "${GREEN}✅ Fichiers corrigés:${NC} $TOTAL_FILES"
    echo -e "${GREEN}✅ Conflits résolus:${NC} $TOTAL_CONFLICTS"
    
    if [ $ERRORS -gt 0 ]; then
        echo -e "${RED}❌ Erreurs:${NC} $ERRORS"
        echo -e "${YELLOW}   (Ces fichiers nécessitent une résolution manuelle)${NC}"
    fi
    
    echo ""
    echo -e "${YELLOW}📦 Backup sauvegardé dans:${NC} $BACKUP_DIR"
    echo -e "${YELLOW}🔄 Pour restaurer:${NC} ./resolve-git-conflicts.sh --restore"
    echo ""
    
    if [ $ERRORS -eq 0 ] && [ $TOTAL_FILES -gt 0 ]; then
        echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║  ✅ SUCCÈS ! Tous les conflits ont été résolus           ║${NC}"
        echo -e "${GREEN}║                                                            ║${NC}"
        echo -e "${GREEN}║  Prochaines étapes:                                        ║${NC}"
        echo -e "${GREEN}║  1. Vérifiez: ./verify-imports.sh                         ║${NC}"
        echo -e "${GREEN}║  2. Vérifiez: git diff                                    ║${NC}"
        echo -e "${GREEN}║  3. Commitez: git add . && git commit -m \"fix: conflicts\" ║${NC}"
        echo -e "${GREEN}║  4. Poussez: git push origin main                         ║${NC}"
        echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    elif [ $TOTAL_FILES -eq 0 ]; then
        echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║  ✅ PARFAIT ! Aucun conflit à résoudre                    ║${NC}"
        echo -e "${GREEN}║                                                            ║${NC}"
        echo -e "${GREEN}║  Vous pouvez passer directement au commit :               ║${NC}"
        echo -e "${GREEN}║  git add . && git commit -m \"fix: imports\" && git push    ║${NC}"
        echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    else
        echo -e "${YELLOW}⚠️  Certains conflits n'ont pas pu être résolus automatiquement.${NC}"
        echo -e "${YELLOW}   Ouvrez ces fichiers dans VSCode et résolvez-les manuellement.${NC}"
    fi
}

# ============================================
# FONCTION: Vérifier les prérequis
# ============================================
check_requirements() {
    if [ ! -d "components" ]; then
        echo -e "${RED}❌ ERREUR: Ce script doit être exécuté à la racine du projet${NC}"
        exit 1
    fi
    
    # Vérifier si Python3 est installé
    if ! command -v python3 &> /dev/null; then
        echo -e "${YELLOW}⚠️  Python3 n'est pas installé. Utilisation de la méthode sed (moins fiable).${NC}"
        echo -e "${YELLOW}   Pour de meilleurs résultats, installez Python3.${NC}"
        echo ""
    fi
}

# ============================================
# FONCTION PRINCIPALE
# ============================================
main() {
    print_header
    
    # Vérifier les arguments
    if [ "$1" = "--restore" ] || [ "$1" = "-r" ]; then
        restore_backup
    fi
    
    if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
        echo "USAGE:"
        echo "  ./resolve-git-conflicts.sh           Résoudre tous les conflits"
        echo "  ./resolve-git-conflicts.sh --restore  Restaurer depuis le backup"
        echo "  ./resolve-git-conflicts.sh --help     Afficher cette aide"
        exit 0
    fi
    
    check_requirements
    
    if ! create_backup; then
        exit 0
    fi
    
    scan_and_resolve
    print_report
}

# ============================================
# EXÉCUTION
# ============================================
main "$@"
