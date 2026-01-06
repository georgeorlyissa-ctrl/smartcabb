#!/bin/bash

# 🚨 SCRIPT D'URGENCE - FIX VERCEL BUILD
# Corrige TOUS les problèmes de build en une seule fois

echo "╔════════════════════════════════════════════════════════════╗"
echo "║      🚨 CORRECTION D'URGENCE - BUILD VERCEL               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Backup
BACKUP_DIR="backup_emergency_$(date +%Y%m%d_%H%M%S)"
echo "📦 Création backup: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Compteurs
TOTAL_FIXED=0

# ============================================================================
# ÉTAPE 1 : ANNULER TOUS LES CONFLITS GIT
# ============================================================================

echo ""
echo "🧹 ÉTAPE 1: Nettoyage conflits Git..."
echo ""

# Fonction pour nettoyer un fichier avec conflits
clean_file() {
    local file="$1"
    local temp="${file}.clean"
    
    cp "$file" "$BACKUP_DIR/$(basename "$file")"
    
    # Supprimer toutes les lignes de marqueurs Git
    grep -v "^<<<<<<< HEAD" "$file" | \
    grep -v "^=======" | \
    grep -v "^>>>>>>>" > "$temp"
    
    # Si le fichier est différent, le remplacer
    if ! cmp -s "$file" "$temp"; then
        mv "$temp" "$file"
        echo "  ✅ Nettoyé: $file"
        ((TOTAL_FIXED++))
    else
        rm -f "$temp"
    fi
}

# Chercher tous les fichiers TypeScript/TSX/JS/JSX
find components hooks lib utils pages -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) 2>/dev/null | while read file; do
    if grep -q "<<<<<<< HEAD\|=======\|>>>>>>>" "$file" 2>/dev/null; then
        echo "🔧 Nettoyage: $file"
        clean_file "$file"
    fi
done

# ============================================================================
# ÉTAPE 2 : CORRIGER LES IMPORTS
# ============================================================================

echo ""
echo "🔧 ÉTAPE 2: Correction des imports..."
echo ""

# Fonction pour corriger les imports d'un fichier
fix_imports() {
    local file="$1"
    local temp="${file}.imports"
    
    # Pattern 1: ../../framer-motion → motion/react
    # Pattern 2: ../../lucide-react → lucide-react  
    # Pattern 3: toast depuis lucide-react (ERREUR!) → sonner
    
    sed -e "s|from ['\"]\\.\\./.\\./framer-motion['\"]|from 'motion/react'|g" \
        -e "s|from 'framer-motion'|from 'motion/react'|g" \
        -e "s|from ['\"]\\.\\./.\\./lucide-react['\"]|from 'lucide-react'|g" \
        "$file" > "$temp"
    
    # Vérifier si changé
    if ! cmp -s "$file" "$temp"; then
        mv "$temp" "$file"
        echo "  ✅ Imports corrigés: $file"
        ((TOTAL_FIXED++))
    else
        rm -f "$temp"
    fi
}

# Corriger tous les fichiers avec mauvais imports
find components hooks lib utils pages -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) 2>/dev/null | while read file; do
    if grep -q "from ['\"]\\.\\./.\\./\\(framer-motion\\|lucide-react\\)" "$file" 2>/dev/null || \
       grep -q "from 'framer-motion'" "$file" 2>/dev/null; then
        echo "🔧 Correction: $file"
        fix_imports "$file"
    fi
done

# ============================================================================
# ÉTAPE 3 : SUPPRIMER LES LIGNES ORPHELINES
# ============================================================================

echo ""
echo "🧹 ÉTAPE 3: Suppression lignes orphelines..."
echo ""

# Fonction pour nettoyer les lignes orphelines (ex: } from 'lucide-react';)
clean_orphans() {
    local file="$1"
    local temp="${file}.orphans"
    
    # Supprimer les lignes qui commencent par juste "} from"
    grep -v "^[[:space:]]*}[[:space:]]*from[[:space:]]*['\"]" "$file" > "$temp"
    
    if ! cmp -s "$file" "$temp"; then
        mv "$temp" "$file"
        echo "  ✅ Orphelins supprimés: $file"
        ((TOTAL_FIXED++))
    else
        rm -f "$temp"
    fi
}

find components hooks lib utils pages -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) 2>/dev/null | while read file; do
    if grep -q "^[[:space:]]*}[[:space:]]*from[[:space:]]*['\"]" "$file" 2>/dev/null; then
        echo "🔧 Nettoyage: $file"
        clean_orphans "$file"
    fi
done

# ============================================================================
# ÉTAPE 4 : VÉRIFICATION FINALE
# ============================================================================

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                  ✅ VÉRIFICATION FINALE                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

CONFLICTS=$(find components hooks lib utils pages -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec grep -l "<<<<<<< HEAD\|>>>>>>>" {} \; 2>/dev/null | wc -l)
BAD_IMPORTS=$(find components hooks lib utils pages -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec grep -l "from ['\"]\\.\\./.\\./\\(framer-motion\\|lucide-react\\)" {} \; 2>/dev/null | wc -l)

echo "📊 Résultats:"
echo "  🔧 Fichiers corrigés: $TOTAL_FIXED"
echo "  ⚠️  Conflits Git restants: $CONFLICTS"
echo "  ⚠️  Imports incorrects restants: $BAD_IMPORTS"
echo ""

if [ "$CONFLICTS" -eq 0 ] && [ "$BAD_IMPORTS" -eq 0 ]; then
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║       🎉 SUCCÈS ! BUILD VERCEL PRÊT ! 🚀                  ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo "📋 Prochaines étapes:"
    echo ""
    echo "git add ."
    echo "git commit -m \"fix(vercel): correction urgente build - conflits + imports\""
    echo "git push origin main --force"
    echo ""
    echo "⚠️  Note: --force est utilisé car nous avons nettoyé le code"
    echo ""
    exit 0
else
    echo "❌ Erreurs restantes. Fichiers problématiques:"
    echo ""
    if [ "$CONFLICTS" -gt 0 ]; then
        echo "Conflits Git:"
        find components hooks lib utils pages -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "<<<<<<< HEAD\|>>>>>>>" {} \; 2>/dev/null
    fi
    if [ "$BAD_IMPORTS" -gt 0 ]; then
        echo ""
        echo "Imports incorrects:"
        find components hooks lib utils pages -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "from ['\"]\\.\\./.\\./\\(framer-motion\\|lucide-react\\)" {} \; 2>/dev/null
    fi
    exit 1
fi
