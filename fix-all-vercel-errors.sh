#!/bin/bash

# 🚨 SCRIPT MAÎTRE - CORRECTION TOTALE VERCEL
# Corrige TOUS les problèmes connus en une seule exécution

echo "╔════════════════════════════════════════════════════════════╗"
echo "║      🚨 CORRECTION COMPLÈTE - BUILD VERCEL                ║"
echo "║         (Conflits Git + Imports + Lignes orphelines)      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Backup global
BACKUP_DIR="backup_complete_$(date +%Y%m%d_%H%M%S)"
echo "📦 Création backup complet: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

TOTAL_FIXED=0
ERRORS=0

# ============================================================================
# ÉTAPE 1 : SUPPRIMER LES MARQUEURS DE CONFLIT GIT
# ============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🧹 ÉTAPE 1: Suppression des marqueurs Git..."
echo "═══════════════════════════════════════════════════════════"
echo ""

clean_git_markers() {
    local file="$1"
    local temp="${file}.gitclean"
    
    cp "$file" "$BACKUP_DIR/$(basename "$file").git"
    
    # Supprimer toutes les lignes de marqueurs Git
    grep -v "^<<<<<<< HEAD" "$file" | \
    grep -v "^=======" | \
    grep -v "^>>>>>>>" > "$temp"
    
    if ! cmp -s "$file" "$temp"; then
        mv "$temp" "$file"
        echo "  ✅ Conflit Git nettoyé: $file"
        ((TOTAL_FIXED++))
    else
        rm -f "$temp"
    fi
}

find components hooks lib utils pages App.tsx -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) 2>/dev/null | while read file; do
    if grep -q "<<<<<<< HEAD\|=======\|>>>>>>>" "$file" 2>/dev/null; then
        clean_git_markers "$file"
    fi
done

# ============================================================================
# ÉTAPE 2 : CORRIGER LES IMPORTS motion/react → framer-motion
# ============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🔧 ÉTAPE 2: Correction motion/react → framer-motion..."
echo "═══════════════════════════════════════════════════════════"
echo ""

fix_motion_imports() {
    local file="$1"
    local temp="${file}.motion"
    
    cp "$file" "$BACKUP_DIR/$(basename "$file").motion"
    
    # Remplacer motion/react par framer-motion
    sed "s|from 'motion/react'|from 'framer-motion'|g" "$file" | \
    sed "s|from \"motion/react\"|from \"framer-motion\"|g" > "$temp"
    
    if ! cmp -s "$file" "$temp"; then
        mv "$temp" "$file"
        echo "  ✅ Import motion corrigé: $file"
        ((TOTAL_FIXED++))
    else
        rm -f "$temp"
    fi
}

find components hooks lib utils pages App.tsx -type f \( -name "*.ts" -o -name "*.tsx" \) 2>/dev/null | while read file; do
    if grep -q "from ['\"]motion/react['\"]" "$file" 2>/dev/null; then
        fix_motion_imports "$file"
    fi
done

# ============================================================================
# ÉTAPE 3 : CORRIGER LES IMPORTS ../../lucide-react → lucide-react
# ============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🔧 ÉTAPE 3: Correction imports lucide-react..."
echo "═══════════════════════════════════════════════════════════"
echo ""

fix_lucide_imports() {
    local file="$1"
    local temp="${file}.lucide"
    
    cp "$file" "$BACKUP_DIR/$(basename "$file").lucide"
    
    # Remplacer ../../lucide-react par lucide-react
    sed "s|from ['\"]\\.\\./.\\./lucide-react['\"]|from 'lucide-react'|g" "$file" > "$temp"
    
    if ! cmp -s "$file" "$temp"; then
        mv "$temp" "$file"
        echo "  ✅ Import lucide corrigé: $file"
        ((TOTAL_FIXED++))
    else
        rm -f "$temp"
    fi
}

find components hooks lib utils pages -type f \( -name "*.ts" -o -name "*.tsx" \) 2>/dev/null | while read file; do
    if grep -q "from ['\"]\\.\\./.\\./lucide-react['\"]" "$file" 2>/dev/null; then
        fix_lucide_imports "$file"
    fi
done

# ============================================================================
# ÉTAPE 4 : SUPPRIMER LES LIGNES ORPHELINES (} from '...')
# ============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🧹 ÉTAPE 4: Suppression des lignes orphelines..."
echo "═══════════════════════════════════════════════════════════"
echo ""

clean_orphan_lines() {
    local file="$1"
    local temp="${file}.orphan"
    
    cp "$file" "$BACKUP_DIR/$(basename "$file").orphan"
    
    # Supprimer les lignes qui commencent par juste "} from"
    grep -v "^[[:space:]]*}[[:space:]]*from[[:space:]]*['\"]" "$file" > "$temp"
    
    if ! cmp -s "$file" "$temp"; then
        mv "$temp" "$file"
        echo "  ✅ Lignes orphelines supprimées: $file"
        ((TOTAL_FIXED++))
    else
        rm -f "$temp"
    fi
}

find components hooks lib utils pages -type f \( -name "*.ts" -o -name "*.tsx" \) 2>/dev/null | while read file; do
    if grep -q "^[[:space:]]*}[[:space:]]*from[[:space:]]*['\"]" "$file" 2>/dev/null; then
        clean_orphan_lines "$file"
    fi
done

# ============================================================================
# VÉRIFICATION FINALE COMPLÈTE
# ============================================================================

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                  ✅ VÉRIFICATION FINALE                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

GIT_CONFLICTS=$(find components hooks lib utils pages App.tsx -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "<<<<<<< HEAD\|>>>>>>>" {} \; 2>/dev/null | wc -l)
MOTION_IMPORTS=$(find components hooks lib utils pages App.tsx -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "from ['\"]motion/react['\"]" {} \; 2>/dev/null | wc -l)
LUCIDE_IMPORTS=$(find components hooks lib utils pages -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "from ['\"]\\.\\./.\\./lucide-react['\"]" {} \; 2>/dev/null | wc -l)
ORPHAN_LINES=$(find components hooks lib utils pages -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "^[[:space:]]*}[[:space:]]*from[[:space:]]*['\"]" {} \; 2>/dev/null | wc -l)

echo "📊 Résultats finaux:"
echo ""
echo "  🔧 Total fichiers modifiés: $TOTAL_FIXED"
echo ""
echo "  📋 Vérifications:"
echo "     • Conflits Git restants: $GIT_CONFLICTS"
echo "     • Imports motion/react restants: $MOTION_IMPORTS"
echo "     • Imports ../../lucide-react: $LUCIDE_IMPORTS"
echo "     • Lignes orphelines: $ORPHAN_LINES"
echo ""

# Compter les erreurs
TOTAL_ERRORS=$((GIT_CONFLICTS + MOTION_IMPORTS + LUCIDE_IMPORTS + ORPHAN_LINES))

if [ "$TOTAL_ERRORS" -eq 0 ]; then
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║       🎉 SUCCÈS TOTAL ! CODE PRÊT POUR VERCEL ! 🚀        ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo "📋 PROCHAINES ÉTAPES:"
    echo ""
    echo "   1️⃣  Vérifier: ./check-build-ready.sh"
    echo ""
    echo "   2️⃣  Commiter et pusher:"
    echo "       git add ."
    echo "       git commit -m \"fix(vercel): correction complète build - imports + conflits\""
    echo "       git push origin main"
    echo ""
    echo "✅ Le build Vercel devrait maintenant réussir !"
    echo ""
    exit 0
else
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║          ⚠️  ATTENTION: $TOTAL_ERRORS ERREUR(S) RESTANTE(S)         ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    
    if [ "$GIT_CONFLICTS" -gt 0 ]; then
        echo "❌ Conflits Git restants:"
        find components hooks lib utils pages App.tsx -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "<<<<<<< HEAD\|>>>>>>>" {} \; 2>/dev/null
        echo ""
    fi
    
    if [ "$MOTION_IMPORTS" -gt 0 ]; then
        echo "❌ Imports motion/react restants:"
        find components hooks lib utils pages App.tsx -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "from ['\"]motion/react['\"]" {} \; 2>/dev/null
        echo ""
    fi
    
    if [ "$LUCIDE_IMPORTS" -gt 0 ]; then
        echo "❌ Imports ../../lucide-react restants:"
        find components hooks lib utils pages -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "from ['\"]\\.\\./.\\./lucide-react['\"]" {} \; 2>/dev/null
        echo ""
    fi
    
    if [ "$ORPHAN_LINES" -gt 0 ]; then
        echo "❌ Lignes orphelines restantes:"
        find components hooks lib utils pages -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "^[[:space:]]*}[[:space:]]*from[[:space:]]*['\"]" {} \; 2>/dev/null
        echo ""
    fi
    
    echo "💡 Réexécutez le script ou corrigez manuellement ces fichiers."
    echo ""
    exit 1
fi
