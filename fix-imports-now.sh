#!/bin/bash

# 🔧 Script de correction automatique des imports lucide-react et sonner
# Version: Ultra-rapide pour Figma Make

echo "🚀 Correction des imports en cours..."

# Trouver tous les fichiers .tsx et .ts (sauf node_modules)
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "*/node_modules/*" -not -path "*/.git/*" | while read file; do
  # Remplacer lucide-react sans version par lucide-react@0.550.0
  sed -i.bak "s/from 'lucide-react';/from 'lucide-react@0.550.0';/g" "$file"
  
  # Remplacer sonner sans version par sonner@2.0.3
  sed -i.bak "s/from 'sonner';/from 'sonner@2.0.3';/g" "$file"
  
  # Supprimer le fichier de backup
  rm -f "$file.bak"
done

echo "✅ Corrections terminées !"
echo ""
echo "📊 Résumé :"
echo "   - lucide-react → lucide-react@0.550.0"
echo "   - sonner → sonner@2.0.3"
