#!/bin/bash

# 🔧 SCRIPT DE CORRECTION - FRAMER MOTION IMPORTS
# Remplace motion/react par framer-motion pour Vercel

echo "╔════════════════════════════════════════════════════════════╗"
echo "║      🔧 CORRECTION IMPORTS FRAMER MOTION                  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Backup
BACKUP_DIR="backup_framer_$(date +%Y%m%d_%H%M%S)"
echo "📦 Création backup: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

TOTAL_FIXED=0

# Fonction pour corriger les imports
fix_framer_imports() {
    local file="$1"
    local temp="${file}.temp"
    
    # Backup du fichier
    cp "$file" "$BACKUP_DIR/$(basename "$file")"
    
    # Remplacer motion/react par framer-motion
    sed "s|from 'motion/react'|from 'framer-motion'|g" "$file" | \
    sed "s|from \"motion/react\"|from \"framer-motion\"|g" > "$temp"
    
    # Vérifier si changé
    if ! cmp -s "$file" "$temp"; then
        mv "$temp" "$file"
        echo "  ✅ Corrigé: $file"
        ((TOTAL_FIXED++))
        return 0
    else
        rm -f "$temp"
        return 1
    fi
}

# Trouver tous les fichiers avec motion/react
echo "🔍 Recherche des fichiers avec 'motion/react'..."
echo ""

FILES_TO_FIX=$(find components hooks lib utils pages App.tsx -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec grep -l "from ['\"]motion/react['\"]" {} \; 2>/dev/null)

if [ -z "$FILES_TO_FIX" ]; then
    echo "✅ Aucun fichier à corriger !"
    exit 0
fi

echo "📋 Fichiers à corriger:"
echo "$FILES_TO_FIX" | while read file; do echo "   - $file"; done
echo ""

# Corriger chaque fichier
echo "🔧 Correction en cours..."
echo ""

echo "$FILES_TO_FIX" | while read file; do
    fix_framer_imports "$file"
done

# Vérification finale
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                  ✅ VÉRIFICATION FINALE                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

REMAINING=$(find components hooks lib utils pages App.tsx -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "from ['\"]motion/react['\"]" {} \; 2>/dev/null | wc -l)

echo "📊 Résultats:"
echo "  🔧 Fichiers corrigés: $TOTAL_FIXED"
echo "  ⚠️  Fichiers restants avec motion/react: $REMAINING"
echo ""

if [ "$REMAINING" -eq 0 ]; then
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║       🎉 SUCCÈS ! TOUS LES IMPORTS CORRIGÉS ! 🚀          ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo "📋 Prochaines étapes:"
    echo ""
    echo "git add ."
    echo "git commit -m \"fix(imports): correction motion/react -> framer-motion pour Vercel\""
    echo "git push origin main"
    echo ""
    exit 0
else
    echo "❌ Erreur: Des fichiers n'ont pas été corrigés"
    echo ""
    echo "Fichiers problématiques:"
    find components hooks lib utils pages App.tsx -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "from ['\"]motion/react['\"]" {} \; 2>/dev/null
    exit 1
fi
