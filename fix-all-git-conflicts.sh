#!/bin/bash

# 🚀 SCRIPT MASSIF DE NETTOYAGE GIT + IMPORTS - SMARTCABB
# Résout TOUS les problèmes : conflits Git ET imports incorrects

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   🚀 FIX COMPLET : CONFLITS GIT + IMPORTS - SMARTCABB     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Compteurs
TOTAL_CONFLICTS=0
TOTAL_IMPORTS=0
FIXED_FILES=0

# Créer backup horodaté
BACKUP_DIR="backup_final_fix_$(date +%Y%m%d_%H%M%S)"
echo "📦 Création du backup: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# ============================================================================
# PARTIE 1 : NETTOYER LES CONFLITS GIT
# ============================================================================

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║              🧹 PARTIE 1 : CONFLITS GIT                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Fonction pour nettoyer les conflits Git
clean_git_conflicts() {
    local file="$1"
    local temp_file="${file}.tmp_git"
    
    # Sauvegarder
    cp "$file" "$BACKUP_DIR/$(basename "$file").git_conflict"
    
    # Variables
    local in_conflict=false
    local keep_section=false
    local conflict_found=false
    
    > "$temp_file"  # Créer fichier vide
    
    while IFS= read -r line || [[ -n "$line" ]]; do
        if [[ "$line" =~ ^\<\<\<\<\<\<\<[[:space:]] ]]; then
            # Début conflit - garder section OURS (locale)
            in_conflict=true
            keep_section=true
            conflict_found=true
            ((TOTAL_CONFLICTS++))
            continue
        elif [[ "$line" =~ ^=======[[:space:]]*$ ]] && [ "$in_conflict" = true ]; then
            # Milieu conflit - ignorer section THEIRS
            keep_section=false
            continue
        elif [[ "$line" =~ ^\>\>\>\>\>\>\>[[:space:]] ]]; then
            # Fin conflit
            in_conflict=false
            keep_section=false
            continue
        fi
        
        # Écrire ligne si pas dans conflit OU si on garde cette section
        if [ "$in_conflict" = false ] || [ "$keep_section" = true ]; then
            echo "$line" >> "$temp_file"
        fi
    done < "$file"
    
    if [ "$conflict_found" = true ]; then
        mv "$temp_file" "$file"
        echo "  ✅ Conflits Git nettoyés: $file"
        ((FIXED_FILES++))
        return 0
    else
        rm -f "$temp_file"
        return 1
    fi
}

# Chercher et nettoyer les fichiers avec conflits Git
FILES_WITH_GIT_CONFLICTS=$(grep -rl "<<<<<<< HEAD" components/ hooks/ lib/ utils/ pages/ 2>/dev/null || true)

if [ -n "$FILES_WITH_GIT_CONFLICTS" ]; then
    echo "📄 Fichiers avec conflits Git trouvés:"
    echo "$FILES_WITH_GIT_CONFLICTS"
    echo ""
    
    while IFS= read -r file; do
        if [ -f "$file" ]; then
            echo "🔧 Nettoyage: $file"
            clean_git_conflicts "$file"
        fi
    done <<< "$FILES_WITH_GIT_CONFLICTS"
else
    echo "✅ Aucun conflit Git détecté"
fi

# ============================================================================
# PARTIE 2 : CORRIGER LES IMPORTS
# ============================================================================

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║           🔧 PARTIE 2 : CORRECTION DES IMPORTS             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Fonction pour corriger les imports
fix_imports_in_file() {
    local file="$1"
    local temp_file="${file}.tmp_imports"
    local changed=false
    
    # Sauvegarder
    cp "$file" "$BACKUP_DIR/$(basename "$file").imports"
    
    # Corriger les imports via sed
    sed -e "s|from ['\"]\\.\\./.\\./framer-motion['\"]|from 'motion/react'|g" \
        -e "s|from ['\"]\\.\\./.\\./lucide-react['\"]|from 'lucide-react'|g" \
        -e "s|from 'framer-motion'|from 'motion/react'|g" \
        "$file" > "$temp_file"
    
    # Vérifier si changé
    if ! cmp -s "$file" "$temp_file"; then
        mv "$temp_file" "$file"
        echo "  ✅ Imports corrigés: $file"
        ((FIXED_FILES++))
        ((TOTAL_IMPORTS++))
        changed=true
    else
        rm -f "$temp_file"
    fi
    
    return 0
}

# Fichiers avec imports incorrects
FILES_WITH_BAD_IMPORTS=$(grep -rl "from ['\"]\\.\\./.\\./\\(framer-motion\\|lucide-react\\)" components/ hooks/ lib/ utils/ pages/ 2>/dev/null || true)

if [ -n "$FILES_WITH_BAD_IMPORTS" ]; then
    echo "📄 Fichiers avec imports incorrects trouvés:"
    echo "$FILES_WITH_BAD_IMPORTS"
    echo ""
    
    while IFS= read -r file; do
        if [ -f "$file" ]; then
            echo "🔧 Correction: $file"
            fix_imports_in_file "$file"
        fi
    done <<< "$FILES_WITH_BAD_IMPORTS"
else
    echo "✅ Tous les imports sont corrects"
fi

# ============================================================================
# PARTIE 3 : VÉRIFICATION FINALE
# ============================================================================

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║            ✅ PARTIE 3 : VÉRIFICATION FINALE               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Compter les erreurs restantes
REMAINING_GIT_CONFLICTS=$(grep -r "<<<<<<< HEAD" components/ hooks/ lib/ utils/ pages/ 2>/dev/null | wc -l)
REMAINING_BAD_IMPORTS=$(grep -r "from ['\"]\\.\\./.\\./\\(framer-motion\\|lucide-react\\)" components/ hooks/ lib/ utils/ pages/ 2>/dev/null | wc -l)

echo "📊 Résultats:"
echo "  🧹 Conflits Git résolus: $TOTAL_CONFLICTS"
echo "  🔧 Imports corrigés: $TOTAL_IMPORTS"
echo "  📁 Fichiers modifiés: $FIXED_FILES"
echo ""
echo "📊 Vérification finale:"
echo "  ⚠️  Conflits Git restants: $REMAINING_GIT_CONFLICTS"
echo "  ⚠️  Imports incorrects restants: $REMAINING_BAD_IMPORTS"
echo ""

# ============================================================================
# RÉSULTAT FINAL
# ============================================================================

TOTAL_ERRORS=$((REMAINING_GIT_CONFLICTS + REMAINING_BAD_IMPORTS))

if [ "$TOTAL_ERRORS" -eq 0 ]; then
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║  🎉 PARFAIT ! TOUS LES PROBLÈMES SONT RÉSOLUS !           ║"
    echo "║  Votre code est prêt pour Vercel ! 🚀                     ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo "📋 Prochaines étapes:"
    echo ""
    echo "1. Ajouter les changements:"
    echo "   git add ."
    echo ""
    echo "2. Commiter:"
    echo "   git commit -m \"fix: résolution complète conflits Git + correction imports pour Vercel\""
    echo ""
    echo "3. Pusher vers GitHub:"
    echo "   git push origin main"
    echo ""
    echo "4. Surveiller le déploiement Vercel !"
    echo ""
    exit 0
else
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║  ⚠️  ATTENTION : $TOTAL_ERRORS erreur(s) restante(s)                  ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    
    if [ "$REMAINING_GIT_CONFLICTS" -gt 0 ]; then
        echo "❌ Conflits Git restants dans:"
        grep -r "<<<<<<< HEAD" components/ hooks/ lib/ utils/ pages/ 2>/dev/null | cut -d: -f1 | sort -u
        echo ""
    fi
    
    if [ "$REMAINING_BAD_IMPORTS" -gt 0 ]; then
        echo "❌ Imports incorrects restants dans:"
        grep -r "from ['\"]\\.\\./.\\./\\(framer-motion\\|lucide-react\\)" components/ hooks/ lib/ utils/ pages/ 2>/dev/null | cut -d: -f1 | sort -u
        echo ""
    fi
    
    echo "💡 Vous pouvez ré-exécuter ce script ou corriger manuellement."
    exit 1
fi
