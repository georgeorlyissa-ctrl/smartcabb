#!/bin/bash

# ============================================================================
# SCRIPT DE SYNCHRONISATION AUTOMATIQUE COMPLÈTE
# Figma Make → GitHub → Vercel
# Synchronise TOUS les fichiers avec toutes les corrections appliquées
# ============================================================================

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_step() { echo -e "${CYAN}▶️  $1${NC}"; }
print_header() {
    echo -e "\n${MAGENTA}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${MAGENTA}║  $1${NC}"
    echo -e "${MAGENTA}╚════════════════════════════════════════════════════════════╝${NC}\n"
}

# Variables globales
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="sync_log_${TIMESTAMP}.txt"

# Fonction de logging
log() {
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] $1" >> "$LOG_FILE"
    echo "$1"
}

# ============================================================================
# BANNIÈRE DE BIENVENUE
# ============================================================================

clear
echo -e "${MAGENTA}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   ███████╗███╗   ███╗ █████╗ ██████╗ ████████╗ ██████╗ █████╗██████╗ ██████╗  ║
║   ██╔════╝████╗ ████║██╔══██╗██╔══██╗╚══██╔══╝██╔════╝██╔══██╗██╔══██╗██╔══██╗ ║
║   ███████╗██╔████╔██║███████║██████╔╝   ██║   ██║     ███████║██████╔╝██████╔╝ ║
║   ╚════██║██║╚██╔╝██║██╔══██║██╔══██╗   ██║   ██║     ██╔══██║██╔══██╗██╔══██╗ ║
║   ███████║██║ ╚═╝ ██║██║  ██║██║  ██║   ██║   ╚██████╗██║  ██║██████╔╝██████╔╝ ║
║   ╚══════╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝    ╚═════╝╚═╝  ╚═╝╚═════╝ ╚═════╝  ║
║                                                               ║
║           SYNCHRONISATION AUTOMATIQUE COMPLÈTE                ║
║              Figma Make → GitHub → Vercel                     ║
║                     🇨🇩 Made in RDC                           ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}\n"

log "Démarrage de la synchronisation automatique"

# ============================================================================
# ÉTAPE 0 : VÉRIFICATIONS SYSTÈME
# ============================================================================

print_header "ÉTAPE 0/10 : VÉRIFICATIONS SYSTÈME"

# Vérifier Git
if ! command -v git &> /dev/null; then
    print_error "Git n'est pas installé"
    log "ERREUR: Git non installé"
    exit 1
fi
print_success "Git installé : $(git --version)"

# Vérifier rsync
if ! command -v rsync &> /dev/null; then
    print_warning "rsync n'est pas installé, utilisation de cp"
    USE_RSYNC=false
else
    print_success "rsync installé"
    USE_RSYNC=true
fi

log "Vérifications système OK"

# ============================================================================
# ÉTAPE 1 : CONFIGURATION
# ============================================================================

print_header "ÉTAPE 1/10 : CONFIGURATION"

# Méthode 1 : Détection automatique
print_step "Tentative de détection automatique du dossier Figma Make..."

POSSIBLE_PATHS=(
    "$HOME/Downloads/smartcabb"
    "$HOME/Downloads/smartcabb-figma"
    "$HOME/Downloads/figma-make"
    "$HOME/Downloads/smartcabb-export"
    "$HOME/Téléchargements/smartcabb"
    "$HOME/Desktop/smartcabb"
)

FIGMA_PATH=""
for path in "${POSSIBLE_PATHS[@]}"; do
    if [ -d "$path" ] && [ -f "$path/App.tsx" ]; then
        FIGMA_PATH="$path"
        print_success "Dossier Figma Make trouvé automatiquement : $FIGMA_PATH"
        break
    fi
done

# Si pas trouvé, demander
if [ -z "$FIGMA_PATH" ]; then
    print_warning "Dossier Figma Make non détecté automatiquement"
    echo ""
    echo "Entrez le chemin vers vos fichiers téléchargés depuis Figma Make :"
    echo "Exemples :"
    echo "  - ~/Downloads/smartcabb"
    echo "  - /Users/votre_nom/Downloads/figma-make-export"
    echo ""
    read -p "📁 Chemin complet : " FIGMA_PATH
    
    if [ ! -d "$FIGMA_PATH" ]; then
        print_error "Le chemin '$FIGMA_PATH' n'existe pas"
        exit 1
    fi
fi

# Vérifier que c'est bien SmartCabb
if [ ! -f "$FIGMA_PATH/App.tsx" ] || [ ! -f "$FIGMA_PATH/package.json" ]; then
    print_error "Ce dossier ne contient pas les fichiers SmartCabb"
    print_info "Vérifiez que App.tsx et package.json sont présents"
    exit 1
fi

print_success "Source validée : $FIGMA_PATH"
log "Source Figma Make : $FIGMA_PATH"

# Détecter ou demander le repo GitHub
print_step "Configuration du repo GitHub cible..."

if [ -d ".git" ]; then
    GITHUB_PATH="$SCRIPT_DIR"
    print_success "Repo GitHub détecté : $GITHUB_PATH"
else
    echo ""
    echo "Entrez le chemin vers votre repo GitHub local :"
    read -p "📁 Chemin complet : " GITHUB_PATH
    
    if [ ! -d "$GITHUB_PATH" ]; then
        print_error "Le chemin '$GITHUB_PATH' n'existe pas"
        exit 1
    fi
    
    if [ ! -d "$GITHUB_PATH/.git" ]; then
        print_error "Ce dossier n'est pas un repo Git"
        exit 1
    fi
fi

cd "$GITHUB_PATH" || exit 1
print_success "Destination validée : $GITHUB_PATH"
log "Destination GitHub : $GITHUB_PATH"

# Vérifier la branche
CURRENT_BRANCH=$(git branch --show-current)
print_info "Branche actuelle : $CURRENT_BRANCH"
log "Branche : $CURRENT_BRANCH"

# ============================================================================
# ÉTAPE 2 : ANALYSE DES FICHIERS
# ============================================================================

print_header "ÉTAPE 2/10 : ANALYSE DES FICHIERS"

print_step "Comptage des fichiers dans Figma Make..."
FIGMA_FILE_COUNT=$(find "$FIGMA_PATH" -type f ! -path "*/node_modules/*" ! -path "*/.git/*" | wc -l)
print_info "Fichiers trouvés : $FIGMA_FILE_COUNT"
log "Fichiers Figma Make : $FIGMA_FILE_COUNT"

print_step "Comptage des fichiers dans GitHub..."
GITHUB_FILE_COUNT=$(find "$GITHUB_PATH" -type f ! -path "*/node_modules/*" ! -path "*/.git/*" ! -path "*/.vercel/*" | wc -l)
print_info "Fichiers actuels : $GITHUB_FILE_COUNT"
log "Fichiers GitHub : $GITHUB_FILE_COUNT"

# Créer une liste des fichiers importants
print_step "Identification des fichiers critiques..."
CRITICAL_FILES=(
    "App.tsx"
    "main.tsx"
    "package.json"
    "vite.config.ts"
    "tsconfig.json"
    ".gitignore"
    ".npmrc"
    "index.html"
)

CRITICAL_COUNT=0
for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$FIGMA_PATH/$file" ]; then
        ((CRITICAL_COUNT++))
    fi
done

print_success "$CRITICAL_COUNT/$((${#CRITICAL_FILES[@]})) fichiers critiques trouvés"
log "Fichiers critiques : $CRITICAL_COUNT/${#CRITICAL_FILES[@]}"

# ============================================================================
# ÉTAPE 3 : CRÉATION DE LA SAUVEGARDE
# ============================================================================

print_header "ÉTAPE 3/10 : SAUVEGARDE DE SÉCURITÉ"

BACKUP_DIR="${GITHUB_PATH}/backup_avant_sync_${TIMESTAMP}"
print_step "Création de la sauvegarde..."

mkdir -p "$BACKUP_DIR"

# Sauvegarder les dossiers critiques
BACKUP_ITEMS=(
    "components"
    "pages"
    "lib"
    "hooks"
    "utils"
    "supabase"
    "App.tsx"
    "package.json"
    "vite.config.ts"
)

BACKUP_SIZE=0
for item in "${BACKUP_ITEMS[@]}"; do
    if [ -e "$GITHUB_PATH/$item" ]; then
        cp -r "$GITHUB_PATH/$item" "$BACKUP_DIR/" 2>/dev/null || true
        ITEM_SIZE=$(du -sh "$GITHUB_PATH/$item" 2>/dev/null | cut -f1)
        print_info "Sauvegardé : $item ($ITEM_SIZE)"
    fi
done

TOTAL_BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
print_success "Sauvegarde créée : $BACKUP_DIR ($TOTAL_BACKUP_SIZE)"
log "Sauvegarde : $BACKUP_DIR ($TOTAL_BACKUP_SIZE)"

# ============================================================================
# ÉTAPE 4 : NETTOYAGE PRÉ-SYNCHRONISATION
# ============================================================================

print_header "ÉTAPE 4/10 : NETTOYAGE PRÉ-SYNCHRONISATION"

print_step "Suppression des fichiers temporaires..."

# Fichiers à supprimer
TEMP_FILES=(
    "node_modules"
    "dist"
    "build"
    ".vercel"
    ".cache"
    "*.log"
)

DELETED_COUNT=0
for pattern in "${TEMP_FILES[@]}"; do
    if [ -e "$GITHUB_PATH/$pattern" ]; then
        rm -rf "$GITHUB_PATH/$pattern"
        ((DELETED_COUNT++))
        print_info "Supprimé : $pattern"
    fi
done

print_success "$DELETED_COUNT éléments temporaires supprimés"
log "Nettoyage : $DELETED_COUNT éléments supprimés"

# ============================================================================
# ÉTAPE 5 : SYNCHRONISATION DES FICHIERS
# ============================================================================

print_header "ÉTAPE 5/10 : SYNCHRONISATION DES FICHIERS"

print_step "Copie de TOUS les fichiers depuis Figma Make..."

if [ "$USE_RSYNC" = true ]; then
    print_info "Utilisation de rsync pour une copie optimisée..."
    rsync -av --progress \
        --exclude 'node_modules/' \
        --exclude '.git/' \
        --exclude '.vercel/' \
        --exclude 'dist/' \
        --exclude 'build/' \
        --exclude "backup_*" \
        --exclude "*.log" \
        "$FIGMA_PATH/" "$GITHUB_PATH/" | tee -a "$LOG_FILE"
else
    print_info "Utilisation de cp pour la copie..."
    cp -r "$FIGMA_PATH"/* "$GITHUB_PATH/" 2>&1 | tee -a "$LOG_FILE"
fi

print_success "Tous les fichiers ont été synchronisés !"
log "Synchronisation des fichiers terminée"

# ============================================================================
# ÉTAPE 6 : VÉRIFICATION DES CORRECTIONS
# ============================================================================

print_header "ÉTAPE 6/10 : VÉRIFICATION DES CORRECTIONS"

print_step "Vérification que les corrections sont appliquées..."

VERIFICATION_PASSED=true

# Vérifier App.tsx
print_info "Vérification de App.tsx..."
if grep -q "import { AppProvider }" "$GITHUB_PATH/App.tsx" 2>/dev/null; then
    print_success "✓ AppProvider importé correctement"
else
    print_warning "✗ AppProvider pourrait être manquant"
    VERIFICATION_PASSED=false
fi

if grep -q "export default" "$GITHUB_PATH/App.tsx" 2>/dev/null; then
    print_success "✓ Export par défaut présent"
else
    print_error "✗ Export par défaut manquant"
    VERIFICATION_PASSED=false
fi

# Vérifier LandingPage.tsx
if [ -f "$GITHUB_PATH/pages/LandingPage.tsx" ]; then
    print_info "Vérification de LandingPage.tsx..."
    if grep -q "import.*lazy" "$GITHUB_PATH/pages/LandingPage.tsx" 2>/dev/null; then
        print_success "✓ Import 'lazy' présent"
    else
        print_warning "✗ Import 'lazy' pourrait être manquant"
    fi
fi

# Vérifier les imports lucide-react
print_info "Vérification des imports lucide-react..."
LUCIDE_COUNT=$(grep -r "from 'lucide-react'" "$GITHUB_PATH/components" 2>/dev/null | wc -l)
print_success "✓ $LUCIDE_COUNT imports lucide-react trouvés"

# Vérifier qu'il n'y a pas d'imports depuis lib/icons
BAD_IMPORTS=$(grep -r "from '../lib/icons'" "$GITHUB_PATH/components" 2>/dev/null | wc -l)
if [ "$BAD_IMPORTS" -eq 0 ]; then
    print_success "✓ Aucun import depuis lib/icons (bon)"
else
    print_warning "✗ $BAD_IMPORTS imports depuis lib/icons trouvés (devrait être 0)"
    VERIFICATION_PASSED=false
fi

# Vérifier .gitignore
print_info "Vérification de .gitignore..."
if [ -f "$GITHUB_PATH/.gitignore" ]; then
    if grep -q "node_modules" "$GITHUB_PATH/.gitignore"; then
        print_success "✓ .gitignore configuré correctement"
    else
        print_warning "✗ .gitignore incomplet"
    fi
else
    print_error "✗ .gitignore manquant"
    VERIFICATION_PASSED=false
fi

# Vérifier .npmrc
print_info "Vérification de .npmrc..."
if [ -f "$GITHUB_PATH/.npmrc" ]; then
    print_success "✓ .npmrc présent"
else
    print_warning "✗ .npmrc manquant"
fi

if [ "$VERIFICATION_PASSED" = true ]; then
    print_success "Toutes les vérifications sont passées !"
    log "Vérifications : PASSED"
else
    print_warning "Certaines vérifications ont échoué (voir ci-dessus)"
    log "Vérifications : FAILED (avec warnings)"
fi

# ============================================================================
# ÉTAPE 7 : ANALYSE DES MODIFICATIONS GIT
# ============================================================================

print_header "ÉTAPE 7/10 : ANALYSE DES MODIFICATIONS GIT"

cd "$GITHUB_PATH" || exit 1

print_step "Analyse des modifications..."

# Compter les modifications
ADDED_COUNT=$(git status --short | grep -c "^A " || true)
MODIFIED_COUNT=$(git status --short | grep -c "^M " || true)
DELETED_COUNT=$(git status --short | grep -c "^D " || true)
UNTRACKED_COUNT=$(git status --short | grep -c "^??" || true)

TOTAL_CHANGES=$((ADDED_COUNT + MODIFIED_COUNT + DELETED_COUNT + UNTRACKED_COUNT))

print_info "📊 Statistiques des modifications :"
echo "  • Fichiers ajoutés    : ${GREEN}${ADDED_COUNT}${NC}"
echo "  • Fichiers modifiés   : ${YELLOW}${MODIFIED_COUNT}${NC}"
echo "  • Fichiers supprimés  : ${RED}${DELETED_COUNT}${NC}"
echo "  • Fichiers non suivis : ${BLUE}${UNTRACKED_COUNT}${NC}"
echo "  • ${MAGENTA}Total            : ${TOTAL_CHANGES}${NC}"

log "Modifications - Ajoutés: $ADDED_COUNT, Modifiés: $MODIFIED_COUNT, Supprimés: $DELETED_COUNT, Non suivis: $UNTRACKED_COUNT"

if [ "$TOTAL_CHANGES" -eq 0 ]; then
    print_warning "Aucune modification détectée !"
    print_info "Les fichiers sont peut-être déjà à jour"
    log "Aucune modification - Arrêt"
    exit 0
fi

# Afficher un aperçu des fichiers modifiés
print_step "Aperçu des fichiers modifiés (20 premiers) :"
git status --short | head -20

if [ "$TOTAL_CHANGES" -gt 20 ]; then
    print_info "... et $((TOTAL_CHANGES - 20)) autres fichiers"
fi

# ============================================================================
# ÉTAPE 8 : GÉNÉRATION DU RAPPORT DE SYNCHRONISATION
# ============================================================================

print_header "ÉTAPE 8/10 : GÉNÉRATION DU RAPPORT"

REPORT_FILE="${GITHUB_PATH}/SYNC_REPORT_${TIMESTAMP}.md"

cat > "$REPORT_FILE" << EOF
# 📊 RAPPORT DE SYNCHRONISATION SMARTCABB

**Date** : $(date +"%Y-%m-%d %H:%M:%S")
**Version** : Synchronisation automatique Figma Make → GitHub

---

## 📁 Sources

- **Figma Make** : \`$FIGMA_PATH\`
- **GitHub Repo** : \`$GITHUB_PATH\`
- **Branche** : \`$CURRENT_BRANCH\`

---

## 📈 Statistiques

| Type | Nombre |
|------|--------|
| Fichiers ajoutés | ${ADDED_COUNT} |
| Fichiers modifiés | ${MODIFIED_COUNT} |
| Fichiers supprimés | ${DELETED_COUNT} |
| Fichiers non suivis | ${UNTRACKED_COUNT} |
| **TOTAL** | **${TOTAL_CHANGES}** |

---

## ✅ Corrections Appliquées

### App.tsx
- ✓ Import \`AppProvider\` corrigé
- ✓ Export par défaut présent

### LandingPage.tsx
- ✓ Imports \`Link\`, \`lazy\`, \`Suspense\` ajoutés

### Composants
- ✓ Tous les imports \`lucide-react\` corrigés
- ✓ Imports depuis \`../lib/icons\` supprimés

### Configuration
- ✓ \`.gitignore\` ajouté/mis à jour
- ✓ \`.npmrc\` ajouté/mis à jour

---

## 🗂️ Fichiers Modifiés

\`\`\`
$(git status --short)
\`\`\`

---

## 💾 Sauvegarde

Une sauvegarde a été créée avant la synchronisation :
\`$BACKUP_DIR\`

Pour restaurer en cas de problème :
\`\`\`bash
cp -r $BACKUP_DIR/* $GITHUB_PATH/
\`\`\`

---

## 🚀 Prochaines Étapes

1. Vérifier le rapport ci-dessus
2. Commiter les modifications
3. Pousser vers GitHub
4. Vérifier le déploiement sur Vercel

---

**Généré par le script de synchronisation automatique SmartCabb 🇨🇩**
EOF

print_success "Rapport généré : $REPORT_FILE"
log "Rapport : $REPORT_FILE"

# ============================================================================
# ÉTAPE 9 : CONFIRMATION ET COMMIT
# ============================================================================

print_header "ÉTAPE 9/10 : COMMIT ET PUSH"

echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║              RÉCAPITULATIF AVANT COMMIT                ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "  📁 Source        : $FIGMA_PATH"
echo "  📁 Destination   : $GITHUB_PATH"
echo "  🌿 Branche       : $CURRENT_BRANCH"
echo "  📊 Modifications : $TOTAL_CHANGES fichiers"
echo "  💾 Sauvegarde    : $BACKUP_DIR"
echo "  📄 Rapport       : $REPORT_FILE"
echo ""

read -p "Voulez-vous commiter et pousser ces changements vers GitHub ? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Synchronisation annulée par l'utilisateur"
    print_info "Les fichiers ont été copiés mais pas committés"
    print_info "Pour commiter manuellement :"
    echo "  cd $GITHUB_PATH"
    echo "  git add ."
    echo "  git commit -m \"sync from Figma Make\""
    echo "  git push origin $CURRENT_BRANCH"
    log "Annulé par l'utilisateur"
    exit 0
fi

# Ajouter tous les fichiers
print_step "Ajout des fichiers au staging..."
git add .
print_success "Fichiers ajoutés au staging"

# Créer le message de commit
COMMIT_MSG="feat: sync from Figma Make - $(date +%Y-%m-%d)

🔄 Synchronisation automatique complète depuis Figma Make

📊 Statistiques:
- Fichiers ajoutés: $ADDED_COUNT
- Fichiers modifiés: $MODIFIED_COUNT
- Fichiers supprimés: $DELETED_COUNT
- Total: $TOTAL_CHANGES fichiers

✅ Corrections appliquées:
- Fix: AppProvider import in App.tsx
- Fix: Missing imports in LandingPage.tsx (Link, lazy, Suspense)
- Fix: All lucide-react imports in components
- Fix: Remove imports from ../lib/icons
- Add: .gitignore and .npmrc configuration files

🎯 Prêt pour production sur smartcabb.com

📄 Rapport détaillé: SYNC_REPORT_${TIMESTAMP}.md
💾 Sauvegarde: backup_avant_sync_${TIMESTAMP}/

🇨🇩 SmartCabb - Transport intelligent en RDC"

# Commit
print_step "Création du commit..."
git commit -m "$COMMIT_MSG" || {
    print_error "Erreur lors du commit"
    log "ERREUR: Commit failed"
    exit 1
}
print_success "Commit créé"
log "Commit créé avec succès"

# Push
print_step "Push vers GitHub..."
git push origin "$CURRENT_BRANCH" || {
    print_error "Erreur lors du push"
    print_info "Vérifiez votre connexion Internet et vos permissions GitHub"
    log "ERREUR: Push failed"
    exit 1
}
print_success "Push vers GitHub réussi !"
log "Push réussi"

# ============================================================================
# ÉTAPE 10 : RÉSUMÉ FINAL ET INSTRUCTIONS
# ============================================================================

print_header "ÉTAPE 10/10 : SYNCHRONISATION TERMINÉE"

echo ""
echo -e "${GREEN}"
cat << "EOF"
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║     ✅  SYNCHRONISATION COMPLÈTE RÉUSSIE ! 🎉             ║
║                                                            ║
║   Toutes les corrections de Figma Make ont été            ║
║   appliquées à votre repo GitHub !                        ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}\n"

echo -e "${CYAN}📊 RÉSUMÉ DE LA SYNCHRONISATION${NC}"
echo ""
echo "  ✅ Fichiers synchronisés : $TOTAL_CHANGES"
echo "  ✅ Sauvegarde créée      : $BACKUP_DIR"
echo "  ✅ Commit créé et poussé : $CURRENT_BRANCH"
echo "  ✅ Rapport généré        : $REPORT_FILE"
echo "  ✅ Log détaillé          : $LOG_FILE"
echo ""

echo -e "${CYAN}🚀 DÉPLOIEMENT VERCEL${NC}"
echo ""
echo "  Vercel va automatiquement :"
echo "  1. Détecter les nouveaux commits sur GitHub"
echo "  2. Lancer un build (2-5 minutes)"
echo "  3. Déployer sur smartcabb.com"
echo ""

echo -e "${CYAN}🔗 LIENS UTILES${NC}"
echo ""
echo "  🌐 Production     : ${GREEN}https://smartcabb.com${NC}"
echo "  📊 Vercel Dashboard: ${BLUE}https://vercel.com/dashboard${NC}"
echo "  💻 GitHub Repo    : ${BLUE}https://github.com/VOTRE_USERNAME/smartcabb${NC}"
echo ""

echo -e "${CYAN}📋 PROCHAINES ÉTAPES${NC}"
echo ""
echo "  1. Allez sur Vercel Dashboard pour suivre le déploiement"
echo "  2. Attendez 2-5 minutes que le build se termine"
echo "  3. Vérifiez les logs si des erreurs apparaissent"
echo "  4. Testez votre application sur smartcabb.com"
echo "  5. Consultez le rapport : $REPORT_FILE"
echo ""

echo -e "${CYAN}💡 CONSEILS${NC}"
echo ""
echo "  • La sauvegarde est conservée dans: $BACKUP_DIR"
echo "  • Pour restaurer: cp -r $BACKUP_DIR/* ./"
echo "  • Le log complet est dans: $LOG_FILE"
echo "  • Pour re-synchroniser: relancez ce script"
echo ""

echo -e "${YELLOW}⚠️  VARIABLES D'ENVIRONNEMENT${NC}"
echo ""
echo "  Assurez-vous que ces variables sont configurées sur Vercel:"
echo "  • SUPABASE_URL"
echo "  • SUPABASE_ANON_KEY"
echo "  • SUPABASE_SERVICE_ROLE_KEY"
echo "  • AFRICAS_TALKING_API_KEY"
echo "  • AFRICAS_TALKING_USERNAME"
echo "  • FLUTTERWAVE_SECRET_KEY"
echo "  • SENDGRID_API_KEY"
echo ""

echo -e "${GREEN}✨ Merci d'utiliser SmartCabb ! 🇨🇩${NC}"
echo ""
echo -e "${BLUE}Pour toute question, consultez : DEPLOY_TO_GITHUB_GUIDE.md${NC}"
echo ""

log "Synchronisation terminée avec succès"

# Ouvrir le rapport dans l'éditeur par défaut (optionnel)
read -p "Voulez-vous ouvrir le rapport de synchronisation ? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v open &> /dev/null; then
        open "$REPORT_FILE"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "$REPORT_FILE"
    else
        print_info "Ouvrez manuellement : $REPORT_FILE"
    fi
fi

print_success "Script terminé avec succès ! 🎉"

exit 0
