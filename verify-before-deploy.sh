#!/bin/bash

# ============================================================================
# SCRIPT DE VÉRIFICATION AVANT DÉPLOIEMENT
# SmartCabb - Vérifications de sécurité et cohérence
# ============================================================================

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_header() {
    echo -e "\n${BLUE}════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}\n"
}

ERROR_COUNT=0
WARNING_COUNT=0

# ============================================================================
# 1. VÉRIFIER LES FICHIERS CRITIQUES
# ============================================================================

print_header "1. FICHIERS CRITIQUES"

check_file() {
    if [ -f "$1" ]; then
        print_success "$1 existe"
        return 0
    else
        print_error "$1 MANQUANT"
        ((ERROR_COUNT++))
        return 1
    fi
}

check_file ".gitignore"
check_file ".npmrc"
check_file "package.json"
check_file "vite.config.ts"
check_file "tsconfig.json"
check_file "index.html"
check_file "App.tsx"
check_file "main.tsx"

# ============================================================================
# 2. VÉRIFIER QU'AUCUN FICHIER SENSIBLE N'EST PRÉSENT
# ============================================================================

print_header "2. FICHIERS SENSIBLES (NE DOIVENT PAS ÊTRE PRÉSENTS)"

check_not_present() {
    if [ -f "$1" ] || [ -d "$1" ]; then
        print_error "$1 présent (À SUPPRIMER)"
        ((ERROR_COUNT++))
        return 1
    else
        print_success "$1 absent (OK)"
        return 0
    fi
}

check_not_present ".env"
check_not_present ".env.local"
check_not_present "node_modules"

# ============================================================================
# 3. VÉRIFIER LE CONTENU DE .gitignore
# ============================================================================

print_header "3. CONTENU DE .gitignore"

if [ -f ".gitignore" ]; then
    REQUIRED_PATTERNS=(
        "node_modules"
        ".env"
        ".vercel"
        "dist"
    )
    
    for pattern in "${REQUIRED_PATTERNS[@]}"; do
        if grep -q "$pattern" .gitignore; then
            print_success "Pattern '$pattern' trouvé"
        else
            print_warning "Pattern '$pattern' manquant dans .gitignore"
            ((WARNING_COUNT++))
        fi
    done
fi

# ============================================================================
# 4. VÉRIFIER package.json
# ============================================================================

print_header "4. VÉRIFICATION DE package.json"

if [ -f "package.json" ]; then
    # Vérifier que les dépendances critiques sont présentes
    REQUIRED_DEPS=(
        "react"
        "react-dom"
        "lucide-react"
        "tailwindcss"
    )
    
    for dep in "${REQUIRED_DEPS[@]}"; do
        if grep -q "\"$dep\"" package.json; then
            print_success "$dep présent"
        else
            print_warning "$dep manquant dans package.json"
            ((WARNING_COUNT++))
        fi
    done
    
    # Vérifier qu'il n'y a pas de versions avec @
    if grep -q '"lucide-react@' package.json; then
        print_warning "lucide-react a une version @X.X.X (peut causer des problèmes)"
        print_info "Devrait être : \"lucide-react\": \"^0.x.x\""
        ((WARNING_COUNT++))
    fi
fi

# ============================================================================
# 5. VÉRIFIER LES IMPORTS DANS App.tsx
# ============================================================================

print_header "5. VÉRIFICATION DES IMPORTS DANS App.tsx"

if [ -f "App.tsx" ]; then
    # Vérifier qu'il n'y a pas d'imports problématiques
    if grep -q "from 'figma:asset" App.tsx; then
        print_warning "Imports 'figma:asset' détectés (OK pour Figma Make, problème pour Vercel)"
        print_info "Ces imports devront être remplacés pour la production"
        ((WARNING_COUNT++))
    fi
    
    if grep -q "from 'motion/react'" App.tsx || grep -q "from 'framer-motion'" App.tsx; then
        print_success "Imports d'animation détectés"
    fi
    
    # Vérifier l'export par défaut
    if grep -q "export default" App.tsx; then
        print_success "Export par défaut présent"
    else
        print_error "Export par défaut manquant dans App.tsx"
        ((ERROR_COUNT++))
    fi
fi

# ============================================================================
# 6. VÉRIFIER LA STRUCTURE DES DOSSIERS
# ============================================================================

print_header "6. STRUCTURE DES DOSSIERS"

check_dir() {
    if [ -d "$1" ]; then
        FILE_COUNT=$(find "$1" -type f | wc -l)
        print_success "$1/ existe ($FILE_COUNT fichiers)"
        return 0
    else
        print_warning "$1/ manquant"
        ((WARNING_COUNT++))
        return 1
    fi
}

check_dir "components"
check_dir "pages"
check_dir "lib"
check_dir "hooks"
check_dir "utils"
check_dir "styles"
check_dir "supabase"

# ============================================================================
# 7. VÉRIFIER LES VARIABLES D'ENVIRONNEMENT NÉCESSAIRES
# ============================================================================

print_header "7. VARIABLES D'ENVIRONNEMENT"

print_info "Variables nécessaires sur Vercel :"
REQUIRED_ENV_VARS=(
    "SUPABASE_URL"
    "SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
    "AFRICAS_TALKING_API_KEY"
    "AFRICAS_TALKING_USERNAME"
    "FLUTTERWAVE_SECRET_KEY"
    "SENDGRID_API_KEY"
)

for var in "${REQUIRED_ENV_VARS[@]}"; do
    echo "  - $var"
done

print_warning "Assurez-vous que ces variables sont configurées sur Vercel Dashboard"

# ============================================================================
# 8. VÉRIFIER GIT
# ============================================================================

print_header "8. STATUT GIT"

if [ -d .git ]; then
    print_success "Dépôt Git initialisé"
    
    # Branche actuelle
    CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "inconnue")
    print_info "Branche actuelle : $CURRENT_BRANCH"
    
    # Fichiers modifiés
    MODIFIED_COUNT=$(git status --short 2>/dev/null | wc -l)
    print_info "Fichiers modifiés : $MODIFIED_COUNT"
    
    # Vérifier le remote
    REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "non configuré")
    print_info "Remote origin : $REMOTE_URL"
    
    if [[ $REMOTE_URL == *"github.com"* ]]; then
        print_success "Remote GitHub configuré"
    else
        print_error "Remote GitHub non configuré ou invalide"
        ((ERROR_COUNT++))
    fi
else
    print_error "Pas de dépôt Git (.git manquant)"
    ((ERROR_COUNT++))
fi

# ============================================================================
# 9. RÉSUMÉ ET RECOMMANDATIONS
# ============================================================================

print_header "RÉSUMÉ DE LA VÉRIFICATION"

echo ""
if [ $ERROR_COUNT -eq 0 ] && [ $WARNING_COUNT -eq 0 ]; then
    echo -e "${GREEN}"
    echo "╔════════════════════════════════════════════╗"
    echo "║                                            ║"
    echo "║  ✅  TOUT EST PARFAIT !                   ║"
    echo "║                                            ║"
    echo "║  Vous pouvez déployer en toute sécurité   ║"
    echo "║                                            ║"
    echo "╚════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    print_success "Aucune erreur détectée"
    print_success "Aucun avertissement"
    echo ""
    print_info "Prochaine étape : Exécutez ./deploy-from-figma.sh"
    exit 0
    
elif [ $ERROR_COUNT -eq 0 ]; then
    echo -e "${YELLOW}"
    echo "╔════════════════════════════════════════════╗"
    echo "║                                            ║"
    echo "║  ⚠️   AVERTISSEMENTS DÉTECTÉS             ║"
    echo "║                                            ║"
    echo "║  Vous pouvez déployer mais vérifiez       ║"
    echo "║  les avertissements ci-dessus             ║"
    echo "║                                            ║"
    echo "╚════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    print_warning "$WARNING_COUNT avertissement(s) détecté(s)"
    echo ""
    print_info "Vous pouvez continuer, mais vérifiez les points ci-dessus"
    exit 0
    
else
    echo -e "${RED}"
    echo "╔════════════════════════════════════════════╗"
    echo "║                                            ║"
    echo "║  ❌  ERREURS DÉTECTÉES                    ║"
    echo "║                                            ║"
    echo "║  Corrigez les erreurs avant de déployer   ║"
    echo "║                                            ║"
    echo "╚════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    print_error "$ERROR_COUNT erreur(s) détectée(s)"
    print_warning "$WARNING_COUNT avertissement(s) détecté(s)"
    echo ""
    print_info "Corrigez les erreurs ci-dessus avant de déployer"
    exit 1
fi
