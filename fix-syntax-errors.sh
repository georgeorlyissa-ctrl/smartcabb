#!/bin/bash

# 🔧 SCRIPT DE CORRECTION - ERREURS DE SYNTAXE
# Détecte et corrige les erreurs de syntaxe courantes

echo "╔════════════════════════════════════════════════════════════╗"
echo "║      🔧 DÉTECTION ERREURS DE SYNTAXE                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Backup
BACKUP_DIR="backup_syntax_$(date +%Y%m%d_%H%M%S)"
echo "📦 Création backup: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

TOTAL_ERRORS=0
TOTAL_FIXED=0

# ============================================================================
# ÉTAPE 1 : VÉRIFIER LES IMPORTS NON FERMÉS
# ============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🔍 ÉTAPE 1: Vérification des imports non fermés..."
echo "═══════════════════════════════════════════════════════════"
echo ""

check_unclosed_imports() {
    local file="$1"
    
    # Vérifier si un import { ... } n'a pas de }
    local in_import=0
    local line_num=0
    local import_start=0
    
    while IFS= read -r line; do
        ((line_num++))
        
        # Détecter début d'import avec {
        if [[ "$line" =~ ^import[[:space:]]+\{ ]]; then
            in_import=1
            import_start=$line_num
        fi
        
        # Détecter fin d'import avec }
        if [[ $in_import -eq 1 ]] && [[ "$line" =~ \}[[:space:]]*from ]]; then
            in_import=0
        fi
        
        # Si on trouve export alors qu'on est dans un import
        if [[ $in_import -eq 1 ]] && [[ "$line" =~ ^export ]]; then
            echo "  ❌ Import non fermé dans $file ligne $import_start"
            ((TOTAL_ERRORS++))
            return 1
        fi
    done < "$file"
    
    return 0
}

find components hooks lib utils pages -type f -name "*.tsx" 2>/dev/null | while read file; do
    check_unclosed_imports "$file"
done

# ============================================================================
# ÉTAPE 2 : SUPPRIMER LES LIGNES VIDES AVANT } from
# ============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🧹 ÉTAPE 2: Nettoyage lignes vides dans imports..."
echo "═══════════════════════════════════════════════════════════"
echo ""

fix_import_spacing() {
    local file="$1"
    local temp="${file}.spacing"
    
    cp "$file" "$BACKUP_DIR/$(basename "$file")"
    
    # Supprimer lignes vides entre les imports
    awk '
    BEGIN { in_import = 0; buffer = ""; }
    /^import[[:space:]]+\{/ { in_import = 1; buffer = $0; next; }
    in_import && /^[[:space:]]*$/ { next; }
    in_import && /\}[[:space:]]*from/ { print buffer; print $0; in_import = 0; next; }
    in_import { buffer = buffer "\n" $0; next; }
    !in_import { print; }
    ' "$file" > "$temp"
    
    if ! cmp -s "$file" "$temp"; then
        mv "$temp" "$file"
        echo "  ✅ Espacement corrigé: $file"
        ((TOTAL_FIXED++))
    else
        rm -f "$temp"
    fi
}

find components hooks lib utils pages -type f -name "*.tsx" 2>/dev/null | while read file; do
    fix_import_spacing "$file"
done

# ============================================================================
# ÉTAPE 3 : VÉRIFIER LES ACCOLADES ÉQUILIBRÉES
# ============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🔍 ÉTAPE 3: Vérification accolades équilibrées..."
echo "═══════════════════════════════════════════════════════════"
echo ""

check_braces() {
    local file="$1"
    
    # Compter { et }
    local open_braces=$(grep -o "{" "$file" 2>/dev/null | wc -l)
    local close_braces=$(grep -o "}" "$file" 2>/dev/null | wc -l)
    
    if [ "$open_braces" -ne "$close_braces" ]; then
        echo "  ⚠️  $file : { = $open_braces, } = $close_braces (DÉSÉQUILIBRE)"
        ((TOTAL_ERRORS++))
        return 1
    fi
    
    return 0
}

find components hooks lib utils pages -type f -name "*.tsx" 2>/dev/null | while read file; do
    check_braces "$file"
done

# ============================================================================
# ÉTAPE 4 : NETTOYER CACHE ET TEMPORAIRES
# ============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🧹 ÉTAPE 4: Nettoyage cache build..."
echo "═══════════════════════════════════════════════════════════"
echo ""

if [ -d "node_modules/.vite" ]; then
    rm -rf node_modules/.vite
    echo "  ✅ Cache Vite supprimé"
fi

if [ -d "dist" ]; then
    rm -rf dist
    echo "  ✅ Dossier dist supprimé"
fi

if [ -d ".vercel" ]; then
    rm -rf .vercel
    echo "  ✅ Cache Vercel supprimé"
fi

# Fichiers temporaires
find . -name "*.temp" -o -name "*.tmp" -o -name "*.bak" | while read file; do
    rm -f "$file"
    echo "  ✅ Supprimé: $file"
done

# ============================================================================
# ÉTAPE 5 : VÉRIFICATION SPÉCIFIQUE LandingScreen.tsx
# ============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🔍 ÉTAPE 5: Vérification spécifique LandingScreen.tsx..."
echo "═══════════════════════════════════════════════════════════"
echo ""

if [ -f "components/LandingScreen.tsx" ]; then
    # Vérifier que l'import lucide-react est bien fermé
    if grep -A 5 "import {" components/LandingScreen.tsx | grep -q "} from 'lucide-react'"; then
        echo "  ✅ Import lucide-react correct"
    else
        echo "  ❌ Import lucide-react potentiellement mal fermé"
        ((TOTAL_ERRORS++))
    fi
    
    # Vérifier export function
    if grep -q "^export function LandingScreen()" components/LandingScreen.tsx; then
        echo "  ✅ Export function LandingScreen trouvé"
    else
        echo "  ❌ Export function LandingScreen non trouvé"
        ((TOTAL_ERRORS++))
    fi
    
    # Afficher les lignes 1-15 pour diagnostic
    echo ""
    echo "  📋 Lignes 1-15 de LandingScreen.tsx:"
    head -n 15 components/LandingScreen.tsx | cat -n
    echo ""
fi

# ============================================================================
# RÉSUMÉ FINAL
# ============================================================================

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                  📊 RÉSUMÉ FINAL                           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

echo "  🔧 Fichiers corrigés: $TOTAL_FIXED"
echo "  ⚠️  Erreurs détectées: $TOTAL_ERRORS"
echo ""

if [ "$TOTAL_ERRORS" -eq 0 ]; then
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║       ✅ AUCUNE ERREUR DE SYNTAXE DÉTECTÉE !              ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo "📋 Le problème peut venir de:"
    echo "   1. Cache build Vercel (corrigé par ce script)"
    echo "   2. Problème de configuration ESBuild"
    echo "   3. Erreur dans un autre fichier"
    echo ""
    echo "🔄 Essayez maintenant:"
    echo "   git add ."
    echo "   git commit -m \"fix: nettoyage cache et syntaxe\""
    echo "   git push origin main"
    echo ""
    exit 0
else
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║       ⚠️  ERREURS DÉTECTÉES                               ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo "💡 Vérifiez les fichiers listés ci-dessus"
    echo ""
    exit 1
fi
