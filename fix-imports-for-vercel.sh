#!/bin/bash

# ============================================
# 🔧 SCRIPT DE CORRECTION DES IMPORTS POUR VERCEL
# ============================================
# Ce script corrige automatiquement tous les imports incorrects
# pour que Vercel puisse builder SmartCabb sans erreurs
#
# USAGE:
#   1. Copiez ce script à la racine de votre projet GitHub
#   2. Rendez-le exécutable: chmod +x fix-imports-for-vercel.sh
#   3. Exécutez-le: ./fix-imports-for-vercel.sh
#
# SÉCURITÉ:
#   - Un backup automatique est créé avant toute modification
#   - Vous pouvez annuler avec: ./fix-imports-for-vercel.sh --restore
# ============================================

# Couleurs pour le terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Compteurs
TOTAL_FILES=0
FRAMER_FIXED=0
LUCIDE_FIXED=0
ERRORS=0

# Timestamp pour le backup
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backup_imports_${TIMESTAMP}"

# ============================================
# FONCTION: Afficher le header
# ============================================
print_header() {
    echo -e "${CYAN}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                                                            ║"
    echo "║   🔧 SMARTCABB - CORRECTEUR D'IMPORTS POUR VERCEL        ║"
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
    
    # Backup de tous les fichiers .tsx et .ts
    find components -name "*.tsx" -o -name "*.ts" | while read file; do
        # Créer la structure de dossiers dans le backup
        dir=$(dirname "$file")
        mkdir -p "$BACKUP_DIR/$dir"
        cp "$file" "$BACKUP_DIR/$file"
    done
    
    echo -e "${GREEN}✅ Backup créé dans: $BACKUP_DIR${NC}\n"
}

# ============================================
# FONCTION: Restaurer depuis le backup
# ============================================
restore_backup() {
    echo -e "${YELLOW}🔄 Recherche du dernier backup...${NC}"
    
    # Trouver le backup le plus récent
    LATEST_BACKUP=$(ls -dt backup_imports_* 2>/dev/null | head -1)
    
    if [ -z "$LATEST_BACKUP" ]; then
        echo -e "${RED}❌ Aucun backup trouvé!${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}📦 Restauration depuis: $LATEST_BACKUP${NC}"
    
    # Restaurer tous les fichiers
    cp -r "$LATEST_BACKUP"/* .
    
    echo -e "${GREEN}✅ Restauration terminée!${NC}"
    exit 0
}

# ============================================
# FONCTION: Corriger un fichier
# ============================================
fix_file() {
    local file=$1
    local has_changes=false
    
    # Vérifier si le fichier contient des imports à corriger
    if grep -q "from ['\"]../../framer-motion['\"]" "$file" 2>/dev/null; then
        # Corriger l'import framer-motion
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s|from ['\"]../../framer-motion['\"]|from 'framer-motion'|g" "$file"
        else
            # Linux
            sed -i "s|from ['\"]../../framer-motion['\"]|from 'framer-motion'|g" "$file"
        fi
        ((FRAMER_FIXED++))
        has_changes=true
        echo -e "  ${GREEN}✓${NC} framer-motion"
    fi
    
    if grep -q "from ['\"]../../lucide-react['\"]" "$file" 2>/dev/null; then
        # Corriger l'import lucide-react
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s|from ['\"]../../lucide-react['\"]|from 'lucide-react'|g" "$file"
        else
            # Linux
            sed -i "s|from ['\"]../../lucide-react['\"]|from 'lucide-react'|g" "$file"
        fi
        ((LUCIDE_FIXED++))
        has_changes=true
        echo -e "  ${GREEN}✓${NC} lucide-react"
    fi
    
    if [ "$has_changes" = true ]; then
        ((TOTAL_FILES++))
        return 0
    fi
    
    return 1
}

# ============================================
# FONCTION: Scanner et corriger tous les fichiers
# ============================================
scan_and_fix() {
    echo -e "${BLUE}🔍 Scan des fichiers...${NC}\n"
    
    # Liste des dossiers à scanner
    DIRECTORIES=("components/driver" "components/passenger" "components/admin" "components/auth" "components")
    
    for dir in "${DIRECTORIES[@]}"; do
        if [ ! -d "$dir" ]; then
            continue
        fi
        
        echo -e "${CYAN}📁 Dossier: $dir${NC}"
        
        # Trouver tous les fichiers .tsx et .ts
        find "$dir" -maxdepth 1 -type f \( -name "*.tsx" -o -name "*.ts" \) | while read file; do
            filename=$(basename "$file")
            
            # Vérifier si le fichier nécessite des corrections
            if grep -q "from ['\"]../../\(framer-motion\|lucide-react\)['\"]" "$file" 2>/dev/null; then
                echo -e "${YELLOW}  📝 $filename${NC}"
                
                if ! fix_file "$file"; then
                    echo -e "  ${RED}✗${NC} Erreur lors de la correction"
                    ((ERRORS++))
                fi
            fi
        done
        
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
    
    echo -e "${GREEN}✅ Fichiers modifiés:${NC} $TOTAL_FILES"
    echo -e "${GREEN}✅ Corrections framer-motion:${NC} $FRAMER_FIXED"
    echo -e "${GREEN}✅ Corrections lucide-react:${NC} $LUCIDE_FIXED"
    
    if [ $ERRORS -gt 0 ]; then
        echo -e "${RED}❌ Erreurs:${NC} $ERRORS"
    fi
    
    echo ""
    echo -e "${YELLOW}📦 Backup sauvegardé dans:${NC} $BACKUP_DIR"
    echo -e "${YELLOW}🔄 Pour restaurer:${NC} ./fix-imports-for-vercel.sh --restore"
    echo ""
    
    if [ $ERRORS -eq 0 ]; then
        echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║  ✅ SUCCÈS ! Tous les imports ont été corrigés            ║${NC}"
        echo -e "${GREEN}║                                                            ║${NC}"
        echo -e "${GREEN}║  Prochaines étapes:                                        ║${NC}"
        echo -e "${GREEN}║  1. Vérifiez les changements: git diff                    ║${NC}"
        echo -e "${GREEN}║  2. Testez localement: npm run dev                        ║${NC}"
        echo -e "${GREEN}║  3. Commitez: git add . && git commit -m \"fix: imports\"  ║${NC}"
        echo -e "${GREEN}║  4. Poussez: git push origin main                         ║${NC}"
        echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    else
        echo -e "${RED}⚠️  Certaines erreurs sont survenues. Vérifiez les fichiers manuellement.${NC}"
    fi
}

# ============================================
# FONCTION: Vérifier les prérequis
# ============================================
check_requirements() {
    # Vérifier qu'on est bien à la racine du projet
    if [ ! -d "components" ]; then
        echo -e "${RED}❌ ERREUR: Ce script doit être exécuté à la racine du projet SmartCabb${NC}"
        echo -e "${YELLOW}   (le dossier 'components' est introuvable)${NC}"
        exit 1
    fi
    
    # Vérifier que git est installé
    if ! command -v git &> /dev/null; then
        echo -e "${YELLOW}⚠️  WARNING: Git n'est pas installé. Le backup sera votre seule sauvegarde.${NC}"
    else
        # Vérifier s'il y a des modifications non commitées
        if ! git diff-index --quiet HEAD -- 2>/dev/null; then
            echo -e "${YELLOW}⚠️  WARNING: Vous avez des modifications non commitées.${NC}"
            echo -e "${YELLOW}   Il est recommandé de commit ou stash vos changements avant de continuer.${NC}"
            read -p "   Voulez-vous continuer quand même? (y/N) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                echo -e "${RED}❌ Opération annulée${NC}"
                exit 1
            fi
        fi
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
        echo "  ./fix-imports-for-vercel.sh           Corriger tous les imports"
        echo "  ./fix-imports-for-vercel.sh --restore  Restaurer depuis le backup"
        echo "  ./fix-imports-for-vercel.sh --help     Afficher cette aide"
        exit 0
    fi
    
    # Vérifier les prérequis
    check_requirements
    
    # Créer un backup
    create_backup
    
    # Scanner et corriger
    scan_and_fix
    
    # Afficher le rapport
    print_report
}

# ============================================
# EXÉCUTION
# ============================================
main "$@"
