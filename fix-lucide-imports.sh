#!/bin/bash

# 🔧 SCRIPT DE CORRECTION DES IMPORTS LUCIDE-REACT
# Ce script remplace TOUS les imports directs de lucide-react par des imports depuis /lib/icons.ts

echo "🔍 Recherche des fichiers avec imports lucide-react..."

# Compter le nombre de fichiers à corriger
total=$(grep -rl "from 'lucide-react'" --include="*.tsx" --include="*.ts" . | grep -v node_modules | grep -v .git | wc -l)

echo "📦 $total fichiers trouvés"

if [ $total -eq 0 ]; then
  echo "✅ Aucune correction nécessaire!"
  exit 0
fi

echo "🛠️ Correction en cours..."

# 1. Remplacer tous les imports dans les fichiers .tsx et .ts (sauf /lib/icons.ts lui-même)
find . -name "*.tsx" -o -name "*.ts" | \
  grep -v node_modules | \
  grep -v .git | \
  grep -v "/lib/icons.ts" | \
  while read file; do
    if grep -q "from 'lucide-react'" "$file" 2>/dev/null; then
      # Remplacer par un chemin temporaire pour éviter les conflits
      sed -i.bak "s|from 'lucide-react'|from '__LUCIDE_TEMP__|g" "$file"
    fi
  done

# 2. Corriger le chemin en fonction de la profondeur du fichier

# Fichiers à la racine (App.tsx, etc.)
find . -maxdepth 1 -name "*.tsx" -o -name "*.ts" | \
  while read file; do
    if [ -f "$file" ]; then
      sed -i.bak "s|from '__LUCIDE_TEMP__'|from './lib/icons'|g" "$file"
    fi
  done

# Fichiers dans /components/
find ./components -maxdepth 1 -name "*.tsx" | \
  while read file; do
    sed -i.bak "s|from '__LUCIDE_TEMP__'|from '../lib/icons'|g" "$file"
  done

# Fichiers dans /components/admin/
find ./components/admin -name "*.tsx" 2>/dev/null | \
  while read file; do
    sed -i.bak "s|from '__LUCIDE_TEMP__'|from '../../lib/icons'|g" "$file"
  done

# Fichiers dans /components/ui/
find ./components/ui -name "*.tsx" 2>/dev/null | \
  while read file; do
    sed -i.bak "s|from '__LUCIDE_TEMP__'|from '../../lib/icons'|g" "$file"
  done

# Fichiers dans /components/driver/
find ./components/driver -name "*.tsx" 2>/dev/null | \
  while read file; do
    sed -i.bak "s|from '__LUCIDE_TEMP__'|from '../../lib/icons'|g" "$file"
  done

# Fichiers dans /components/passenger/
find ./components/passenger -name "*.tsx" 2>/dev/null | \
  while read file; do
    sed -i.bak "s|from '__LUCIDE_TEMP__'|from '../../lib/icons'|g" "$file"
  done

# Fichiers dans /components/shared/
find ./components/shared -name "*.tsx" 2>/dev/null | \
  while read file; do
    sed -i.bak "s|from '__LUCIDE_TEMP__'|from '../../lib/icons'|g" "$file"
  done

# Fichiers dans d'autres sous-dossiers de /components/
find ./components -mindepth 2 -name "*.tsx" | \
  grep -v "/admin/" | \
  grep -v "/ui/" | \
  grep -v "/driver/" | \
  grep -v "/passenger/" | \
  grep -v "/shared/" | \
  while read file; do
    # Compter la profondeur
    depth=$(echo "$file" | tr -cd '/' | wc -c)
    if [ $depth -eq 2 ]; then
      sed -i.bak "s|from '__LUCIDE_TEMP__'|from '../../lib/icons'|g" "$file"
    elif [ $depth -eq 3 ]; then
      sed -i.bak "s|from '__LUCIDE_TEMP__'|from '../../../lib/icons'|g" "$file"
    fi
  done

# Nettoyer les fichiers .bak
find . -name "*.bak" -delete

echo "✅ Correction terminée!"

# Vérification
remaining=$(grep -rl "from 'lucide-react'" --include="*.tsx" --include="*.ts" . | grep -v node_modules | grep -v .git | grep -v "/lib/icons.ts" | wc -l)

if [ $remaining -eq 0 ]; then
  echo "🎉 Tous les imports ont été corrigés!"
  echo ""
  echo "📝 Prochaines étapes:"
  echo "   1. Vérifiez les changements: git diff"
  echo "   2. Testez le build: npm run build"
  echo "   3. Commitez: git add . && git commit -m 'fix: Replace all lucide-react imports with /lib/icons'"
  echo "   4. Push: git push origin main"
else
  echo "⚠️  $remaining fichiers n'ont pas pu être corrigés"
  echo "Fichiers restants:"
  grep -rl "from 'lucide-react'" --include="*.tsx" --include="*.ts" . | grep -v node_modules | grep -v .git | grep -v "/lib/icons.ts"
fi
