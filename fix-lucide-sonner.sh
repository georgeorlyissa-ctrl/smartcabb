#!/bin/bash

echo "🔧 Correction automatique des imports lucide-react et sonner..."
echo ""

# Compteur
count=0

# Trouver et corriger tous les fichiers .tsx et .ts
for file in $(find . -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/dist/*" -not -path "*/build/*"); do
  # Vérifier si le fichier contient les imports à corriger
  if grep -q "from ['\"]lucide-react['\"]" "$file" || grep -q "from ['\"]sonner['\"]" "$file"; then
    # Corriger lucide-react
    sed -i.bak -E "s/from ['\"]lucide-react['\"]/from 'lucide-react@0.550.0'/g" "$file"
    # Corriger sonner
    sed -i.bak -E "s/from ['\"]sonner['\"]/from 'sonner@2.0.3'/g" "$file"
    # Supprimer le backup
    rm -f "$file.bak"
    echo "✅ $file"
    ((count++))
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Terminé ! $count fichier(s) corrigé(s)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Résumé des corrections :"
echo "   • lucide-react → lucide-react@0.550.0"
echo "   • sonner → sonner@2.0.3"
echo ""
