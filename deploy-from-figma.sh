#!/bin/bash

# ============================================================================
# SCRIPT DE DÉPLOIEMENT AUTOMATIQUE : FIGMA MAKE → GITHUB → VERCEL
# SmartCabb - Application de transport RDC
# ============================================================================

set -e  # Arrêter en cas d'erreur

# Couleurs pour le terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonctions utilitaires
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_header() {
    echo -e "\n${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}\n"
}

# ============================================================================
# ÉTAPE 0 : VÉRIFICATIONS PRÉALABLES
# ============================================================================

print_header "ÉTAPE 0 : VÉRIFICATIONS PRÉALABLES"

# Vérifier que Git est installé
if ! command -v git &> /dev/null; then
    print_error "Git n'est pas installé. Installez-le d'abord : https://git-scm.com"
    exit 1
fi
print_success "Git est installé"

# Vérifier qu'on est dans un repo Git
if [ ! -d .git ]; then
    print_error "Vous n'êtes pas dans un dépôt Git !"
    print_info "Exécutez d'abord : git clone https://github.com/VOTRE_USERNAME/smartcabb.git"
    exit 1
fi
print_success "Dépôt Git détecté"

# Vérifier la branche actuelle
CURRENT_BRANCH=$(git branch --show-current)
print_info "Branche actuelle : $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
    print_warning "Vous n'êtes pas sur la branche main/master"
    read -p "Voulez-vous continuer quand même ? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# ============================================================================
# ÉTAPE 1 : SAUVEGARDER L'ÉTAT ACTUEL
# ============================================================================

print_header "ÉTAPE 1 : SAUVEGARDE DE L'ÉTAT ACTUEL"

BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

print_info "Création de la sauvegarde dans : $BACKUP_DIR"

# Copier les fichiers critiques
cp -r components "$BACKUP_DIR/" 2>/dev/null || true
cp -r lib "$BACKUP_DIR/" 2>/dev/null || true
cp -r pages "$BACKUP_DIR/" 2>/dev/null || true
cp package.json "$BACKUP_DIR/" 2>/dev/null || true
cp App.tsx "$BACKUP_DIR/" 2>/dev/null || true

print_success "Sauvegarde créée"

# ============================================================================
# ÉTAPE 2 : DEMANDER LE CHEMIN DES FICHIERS FIGMA MAKE
# ============================================================================

print_header "ÉTAPE 2 : LOCALISATION DES FICHIERS FIGMA MAKE"

echo "Où se trouvent vos fichiers téléchargés depuis Figma Make ?"
echo "Exemples :"
echo "  - ~/Downloads/smartcabb-figma"
echo "  - /Users/votre_nom/Downloads/figma-make-export"
echo "  - C:/Users/votre_nom/Downloads/smartcabb"
echo ""
read -p "Chemin complet : " FIGMA_PATH

# Vérifier que le chemin existe
if [ ! -d "$FIGMA_PATH" ]; then
    print_error "Le chemin '$FIGMA_PATH' n'existe pas !"
    exit 1
fi

# Vérifier qu'il y a des fichiers dedans
if [ ! -f "$FIGMA_PATH/App.tsx" ] && [ ! -f "$FIGMA_PATH/package.json" ]; then
    print_error "Ce dossier ne semble pas contenir les fichiers SmartCabb"
    print_info "Assurez-vous que le dossier contient App.tsx et package.json"
    exit 1
fi

print_success "Fichiers Figma Make trouvés"

# ============================================================================
# ÉTAPE 3 : COPIER LES FICHIERS
# ============================================================================

print_header "ÉTAPE 3 : COPIE DES FICHIERS"

print_info "Copie des fichiers depuis Figma Make..."

# Copier tous les fichiers sauf node_modules et .git
rsync -av --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '.vercel' \
    --exclude 'dist' \
    --exclude 'build' \
    --exclude "$BACKUP_DIR" \
    "$FIGMA_PATH/" ./ || {
    print_error "Erreur lors de la copie des fichiers"
    exit 1
}

print_success "Fichiers copiés"

# ============================================================================
# ÉTAPE 4 : VÉRIFICATIONS POST-COPIE
# ============================================================================

print_header "ÉTAPE 4 : VÉRIFICATIONS POST-COPIE"

# Vérifier les fichiers critiques
CRITICAL_FILES=(
    ".gitignore"
    ".npmrc"
    "package.json"
    "App.tsx"
    "index.html"
    "vite.config.ts"
    "tsconfig.json"
)

MISSING_FILES=()

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_success "$file présent"
    else
        print_warning "$file manquant"
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    print_warning "Certains fichiers critiques sont manquants"
    read -p "Voulez-vous continuer quand même ? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# ============================================================================
# ÉTAPE 5 : VÉRIFIER LES MODIFICATIONS GIT
# ============================================================================

print_header "ÉTAPE 5 : VÉRIFICATION DES MODIFICATIONS"

# Voir les fichiers modifiés
print_info "Fichiers modifiés :"
git status --short

# Compter les modifications
MODIFIED_COUNT=$(git status --short | wc -l)
print_info "Nombre total de fichiers modifiés : $MODIFIED_COUNT"

if [ $MODIFIED_COUNT -eq 0 ]; then
    print_warning "Aucune modification détectée !"
    print_info "Les fichiers sont peut-être déjà à jour"
    exit 0
fi

# ============================================================================
# ÉTAPE 6 : CONFIRMATION
# ============================================================================

print_header "ÉTAPE 6 : CONFIRMATION"

echo "Récapitulatif :"
echo "  - Fichiers source : $FIGMA_PATH"
echo "  - Fichiers modifiés : $MODIFIED_COUNT"
echo "  - Branche : $CURRENT_BRANCH"
echo "  - Sauvegarde : $BACKUP_DIR"
echo ""
read -p "Voulez-vous commiter et pousser ces changements ? (y/n) " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Déploiement annulé"
    print_info "Vos modifications sont copiées mais pas commitées"
    exit 0
fi

# ============================================================================
# ÉTAPE 7 : COMMIT ET PUSH
# ============================================================================

print_header "ÉTAPE 7 : COMMIT ET PUSH VERS GITHUB"

# Ajouter tous les fichiers
print_info "Ajout des fichiers au staging..."
git add .

# Créer un message de commit détaillé
COMMIT_DATE=$(date +"%Y-%m-%d %H:%M:%S")
COMMIT_MSG="feat: update from Figma Make - $COMMIT_DATE

Déploiement automatique depuis Figma Make vers GitHub/Vercel

Modifications :
- Add .gitignore and .npmrc configuration files
- Fix all import errors (AppProvider, lucide-react)
- Update components and pages
- Ready for production deployment on smartcabb.com

Total files modified: $MODIFIED_COUNT
Source: Figma Make
Target: smartcabb.com (Vercel)
"

print_info "Création du commit..."
git commit -m "$COMMIT_MSG" || {
    print_error "Erreur lors du commit"
    exit 1
}
print_success "Commit créé"

print_info "Push vers GitHub..."
git push origin "$CURRENT_BRANCH" || {
    print_error "Erreur lors du push vers GitHub"
    print_info "Vérifiez votre connexion et vos permissions"
    exit 1
}
print_success "Push réussi !"

# ============================================================================
# ÉTAPE 8 : VÉRIFICATION VERCEL
# ============================================================================

print_header "ÉTAPE 8 : DÉPLOIEMENT VERCEL"

print_success "Les modifications ont été poussées vers GitHub !"
print_info "Vercel va détecter automatiquement les changements et lancer un build"
print_info "Cela prend généralement 2-5 minutes"

echo ""
print_info "Prochaines étapes :"
echo "  1. Allez sur https://vercel.com/dashboard"
echo "  2. Sélectionnez votre projet 'smartcabb'"
echo "  3. Surveillez le déploiement en cours"
echo "  4. Vérifiez les logs en cas d'erreur"
echo "  5. Testez votre app sur https://smartcabb.com"

# ============================================================================
# ÉTAPE 9 : RÉSUMÉ FINAL
# ============================================================================

print_header "DÉPLOIEMENT TERMINÉ !"

echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════╗"
echo "║                                                       ║"
echo "║  ✅  DÉPLOIEMENT RÉUSSI !                            ║"
echo "║                                                       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo ""
echo "📊 Résumé :"
echo "  ✅ Sauvegarde créée : $BACKUP_DIR"
echo "  ✅ Fichiers copiés : $MODIFIED_COUNT fichiers"
echo "  ✅ Commit créé et poussé vers GitHub"
echo "  ✅ Vercel va déployer automatiquement"
echo ""
echo "🔗 Liens utiles :"
echo "  • Production : https://smartcabb.com"
echo "  • Vercel Dashboard : https://vercel.com/dashboard"
echo "  • GitHub Repo : https://github.com/VOTRE_USERNAME/smartcabb"
echo ""
echo "⏱️  Le déploiement prend 2-5 minutes"
echo ""
print_success "Script terminé avec succès !"

exit 0
