#!/bin/bash

# Script pour réparer tous les fichiers corrompus avec imports Lucide

echo "🔧 RÉPARATION DES FICHIERS CORROMPUS"
echo "====================================="
echo ""

# Fonction pour normaliser les imports lucide dans un fichier
fix_lucide_imports() {
    local file="$1"
    echo "🔍 Vérification: $file"
    
    # Vérifier si le fichier contient un import lucide incomplet
    if grep -q "from 'lucide-react';" "$file" 2>/dev/null; then
        # Le fichier semble OK, vérifier s'il y a un problème de syntaxe avant
        if ! node -c "$file" 2>/dev/null; then
            echo "  ⚠️  Erreur de syntaxe détectée, reconversion UTF-8..."
            # Forcer la conversion en UTF-8
            iconv -f UTF-8 -t UTF-8 -c "$file" > "${file}.tmp" 2>/dev/null && mv "${file}.tmp" "$file"
            
            # Supprimer les BOM et caractères invisibles
            sed -i 's/\xEF\xBB\xBF//g' "$file" 2>/dev/null
            sed -i 's/\r//g' "$file" 2>/dev/null
            
            echo "  ✅ Fichier nettoyé"
        else
            echo "  ✅ OK"
        fi
    else
        echo "  ⏭️  Pas d'import Lucide"
    fi
}

# Trouver tous les fichiers .tsx
echo "📂 Recherche des fichiers TypeScript React..."
find . -name "*.tsx" -type f | while read -r file; do
    fix_lucide_imports "$file"
done

echo ""
echo "✅ RÉPARATION TERMINÉE"
echo ""
echo "Maintenant, lancez:"
echo "  rm -rf node_modules/.vite dist .vercel"
echo "  npm run build"
