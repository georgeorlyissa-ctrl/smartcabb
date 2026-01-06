#!/bin/bash
# Script de correction automatique des imports pour Figma Make
# Corrige framer-motion et lucide-react@version dans tous les fichiers

echo "🔧 Correction automatique des imports pour Figma Make"
echo ""

# Compteurs
total=0
fixed=0

# Fonction pour corriger un fichier
fix_file() {
    local file="$1"
    local depth=$(echo "$file" | tr -cd '/' | wc -c)
    local relative_path=""
    
    # Construire le chemin relatif basé sur la profondeur
    for ((i=1; i<depth; i++)); do
        relative_path="${relative_path}../"
    done
    
    # Si à la racine, utiliser ./
    if [ $depth -eq 1 ]; then
        relative_path="./"
    fi
    
    # Vérifier si le fichier contient les patterns à corriger
    if grep -qE "from ['\"]framer-motion['\"]|from ['\"]lucide-react@" "$file" 2>/dev/null; then
        # Créer une copie temporaire
        tmp_file=$(mktemp)
        
        # Corriger framer-motion
        sed "s|from ['\"]framer-motion['\"]|from '${relative_path}framer-motion'|g" "$file" > "$tmp_file"
        
        # Corriger lucide-react@version
        sed -i "s|from ['\"]lucide-react@[^'\"]*['\"]|from '${relative_path}lucide-react'|g" "$tmp_file"
        
        # Remplacer le fichier original
        mv "$tmp_file" "$file"
        
        echo "✅ Corrigé: $file (depth=$depth, path=${relative_path})"
        fixed=$((fixed + 1))
    fi
    
    total=$((total + 1))
}

# Exporter la fonction pour l'utiliser avec find
export -f fix_file

# Parcourir tous les fichiers .tsx et .ts
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
    ! -path "*/node_modules/*" \
    ! -path "*/.git/*" \
    ! -path "*/.next/*" \
    ! -path "*/dist/*" \
    ! -name "*.d.ts" \
    -exec bash -c 'fix_file "$0"' {} \;

echo ""
echo "📊 Résumé:"
echo "   Fichiers analysés: $total"
echo "   Fichiers corrigés: $fixed"
echo ""
echo "✅ Terminé!"
