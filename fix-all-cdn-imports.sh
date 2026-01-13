#!/bin/bash

# 🎯 CORRECTION MASSIVE DE TOUS LES IMPORTS CDN EXTERNES
# Ce script remplace tous les imports motion/react, framer-motion et sonner

echo "🔍 Recherche de tous les fichiers avec imports CDN externes..."

# Fonction pour corriger un fichier
fix_file() {
  file="$1"
  echo "  ✏️  Correction de: $file"
  
  # Calculer le chemin relatif vers /lib depuis le fichier
  dir=$(dirname "$file")
  depth=$(echo "$dir" | tr '/' '\n' | wc -l)
  
  # Construire le chemin relatif vers /lib
  if [ "$dir" = "." ] || [ "$dir" = "/" ]; then
    lib_path="./lib"
  elif [[ "$dir" == "/components"* ]]; then
    lib_path="../lib"
  elif [[ "$dir" == "/pages"* ]]; then
    lib_path="../lib"
  elif [[ "$dir" == "/hooks"* ]]; then
    lib_path="../lib"
  else
    # Pour les autres cas, calculer dynamiquement
    prefix=$(printf '../%.0s' $(seq 1 $((depth - 1))))
    lib_path="${prefix}lib"
  fi
  
  # Remplacer les imports
  sed -i \
    -e "s|from ['\"]motion/react['\"]|from '$lib_path/motion'|g" \
    -e "s|from ['\"]framer-motion['\"]|from '$lib_path/motion'|g" \
    -e "s|from ['\"]sonner['\"]|from '$lib_path/toast'|g" \
    "$file"
}

# Parcourir tous les fichiers .tsx
find . -name "*.tsx" -not -path "./node_modules/*" -not -path "./.git/*" | while read -r file; do
  # Vérifier si le fichier contient des imports CDN
  if grep -qE "from ['\"]motion/react['\"]|from ['\"]framer-motion['\"]|from ['\"]sonner['\"]" "$file"; then
    fix_file "$file"
  fi
done

echo "✅ Tous les fichiers ont été corrigés!"
echo ""
echo "📊 Vérification des imports restants..."
remaining=$(find . -name "*.tsx" -not -path "./node_modules/*" -not -path "./.git/*" -exec grep -l "from ['\"]motion/react\|from ['\"]framer-motion\|from ['\"]sonner" {} \; | wc -l)

if [ "$remaining" -eq 0 ]; then
  echo "✅ Aucun import CDN externe restant!"
else
  echo "⚠️  Il reste $remaining fichiers avec des imports CDN:"
  find . -name "*.tsx" -not -path "./node_modules/*" -not -path "./.git/*" -exec grep -l "from ['\"]motion/react\|from ['\"]framer-motion\|from ['\"]sonner" {} \;
fi
