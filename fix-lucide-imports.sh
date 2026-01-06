#!/bin/bash

# 🔧 Script de correction des imports lucide-react
# Remplace tous les imports 'lucide-react' par 'lucide-react@0.550.0'

echo "🔍 Recherche des fichiers avec imports lucide-react..."

# Compter les fichiers à corriger
count=$(grep -rl "from ['\"]lucide-react['\"]" --include="*.tsx" --include="*.ts" . 2>/dev/null | wc -l)
echo "📊 $count fichiers trouvés"

echo ""
echo "🔧 Correction en cours..."

# Utiliser find + sed pour corriger tous les fichiers
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "*/node_modules/*" -not -path "*/.git/*" -exec sed -i.bak "s/from ['\"]lucide-react['\"]/from 'lucide-react@0.550.0'/g" {} \;

# Supprimer les fichiers de backup .bak
find . -type f -name "*.bak" -delete

echo ""
echo "✅ Correction terminée !"
echo ""
echo "🔍 Vérification..."
remaining=$(grep -rl "from ['\"]lucide-react['\"]" --include="*.tsx" --include="*.ts" . 2>/dev/null | wc -l)
echo "📊 $remaining fichiers restants (devrait être 0)"

echo ""
echo "💡 Prochaine étape : Corriger les imports sonner"
echo "   Rechercher : from 'sonner';"
echo "   Remplacer par : from 'sonner@2.0.3';"
echo ""
echo "🚀 Vous pouvez aussi utiliser le remplacement global dans VS Code :"
echo "   CTRL + SHIFT + H"
echo "   Rechercher : from 'sonner';"
echo "   Remplacer par : from 'sonner@2.0.3';"
