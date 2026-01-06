#!/bin/bash

# 🚀 Script de correction MASSIVE des imports pour Figma Make
# Corrige tous les imports framer-motion et lucide-react

echo "🔧 SmartCabb - Correction massive des imports"
echo "================================================"
echo ""

# Compteurs
total_files=0
fixed_files=0

# Fonction pour corriger un fichier
fix_file() {
  local file="$1"
  local depth=$(echo "$file" | grep -o "/" | wc -l)
  local prefix=""
  
  # Calculer le chemin relatif
  for ((i=1; i<$depth; i++)); do
    prefix="../$prefix"
  done
  
  # Si le fichier est à la racine
  if [ $depth -eq 0 ]; then
    prefix="./"
  fi
  
  # Sauvegarder l'original
  cp "$file" "$file.bak"
  
  # Appliquer les corrections
  sed -i "s|from 'framer-motion'|from '${prefix}framer-motion'|g" "$file"
  sed -i "s|from 'motion/react'|from '${prefix}framer-motion'|g" "$file"
  sed -i 's|from "framer-motion"|from "'"${prefix}"'framer-motion"|g' "$file"
  sed -i 's|from "motion/react"|from "'"${prefix}"'framer-motion"|g' "$file"
  
  # Vérifier si le fichier a changé
  if ! diff -q "$file" "$file.bak" > /dev/null; then
    echo "✅ Corrigé: $file"
    ((fixed_files++))
    rm "$file.bak"
  else
    # Restaurer l'original si aucun changement
    mv "$file.bak" "$file"
  fi
  
  ((total_files++))
}

# Trouver tous les fichiers .tsx et .ts
echo "🔍 Recherche des fichiers à corriger..."
echo ""

# Fichiers dans /components/driver/
for file in components/driver/*.tsx components/driver/*.ts; do
  if [ -f "$file" ] && [[ "$file" != */framer-motion.* ]] && [[ "$file" != */lucide-react.* ]]; then
    if grep -q "from ['\"]framer-motion['\"]" "$file" || grep -q "from ['\"]motion/react['\"]" "$file"; then
      fix_file "$file"
    fi
  fi
done

# Fichiers dans /components/passenger/
for file in components/passenger/*.tsx components/passenger/*.ts; do
  if [ -f "$file" ] && [[ "$file" != */framer-motion.* ]] && [[ "$file" != */lucide-react.* ]]; then
    if grep -q "from ['\"]framer-motion['\"]" "$file" || grep -q "from ['\"]motion/react['\"]" "$file"; then
      fix_file "$file"
    fi
  fi
done

# Fichiers dans /components/admin/
for file in components/admin/*.tsx components/admin/*.ts; do
  if [ -f "$file" ] && [[ "$file" != */framer-motion.* ]] && [[ "$file" != */lucide-react.* ]]; then
    if grep -q "from ['\"]framer-motion['\"]" "$file" || grep -q "from ['\"]motion/react['\"]" "$file"; then
      fix_file "$file"
    fi
  fi
done

echo ""
echo "================================================"
echo "✨ RÉSULTAT"
echo "================================================"
echo "📁 Fichiers analysés: $total_files"
echo "🔄 Fichiers corrigés: $fixed_files"
echo "================================================"
echo ""

if [ $fixed_files -gt 0 ]; then
  echo "✅ Corrections appliquées avec succès!"
  echo ""
  echo "🎯 Prochaines étapes:"
  echo "  1. Tester l'application dans Figma Make"
  echo "  2. Vérifier qu'il n'y a plus d'erreurs de build"
else
  echo "✅ Aucun fichier à corriger - tout est déjà bon!"
fi

echo ""
