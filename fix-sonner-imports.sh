#!/bin/bash

# Script pour remplacer tous les imports 'sonner' par 'sonner@2.0.3'
# À exécuter dans le terminal à la racine du projet

echo "🔧 Remplacement de tous les imports 'sonner' par 'sonner@2.0.3'..."

# Trouver tous les fichiers .tsx et remplacer
find . -name "*.tsx" -type f -exec sed -i "s/from 'sonner';/from 'sonner@2.0.3';/g" {} \;

echo "✅ Remplacement terminé!"
echo "📊 Vérification..."

# Compter combien de fichiers ont encore l'ancien import
OLD_COUNT=$(grep -r "from 'sonner';" --include="*.tsx" . 2>/dev/null | wc -l)
NEW_COUNT=$(grep -r "from 'sonner@2.0.3';" --include="*.tsx" . 2>/dev/null | wc -l)

echo "   Ancien format (from 'sonner';): $OLD_COUNT fichiers"
echo "   Nouveau format (from 'sonner@2.0.3';): $NEW_COUNT fichiers"

if [ "$OLD_COUNT" -eq 0 ]; then
  echo "🎉 Tous les imports ont été mis à jour avec succès!"
else
  echo "⚠️  Il reste encore des fichiers à mettre à jour manuellement"
fi
