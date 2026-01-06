#!/bin/bash

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🔧 CORRECTION AUTOMATIQUE - SMARTCABB                     ║"
echo "║  Correction de TOUS les imports lucide-react et sonner    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Fonction de correction
fix_imports() {
    local file=$1
    local changed=0
    
    # Vérifier si le fichier contient des imports à corriger
    if grep -q "from ['\"]lucide-react['\"]" "$file" 2>/dev/null; then
        sed -i.bak "s/from ['\"]lucide-react['\"];/from 'lucide-react@0.550.0';/g" "$file"
        sed -i.bak "s/from ['\"]lucide-react['\"] /from 'lucide-react@0.550.0' /g" "$file"
        changed=1
    fi
    
    if grep -q "from ['\"]sonner['\"]" "$file" 2>/dev/null; then
        sed -i.bak "s/from ['\"]sonner['\"];/from 'sonner@2.0.3';/g" "$file"
        sed -i.bak "s/from ['\"]sonner['\"] /from 'sonner@2.0.3' /g" "$file"
        changed=1
    fi
    
    # Supprimer le fichier de backup
    rm -f "$file.bak"
    
    return $changed
}

# Compteur
total=0

# Trouver et corriger tous les fichiers
echo "📂 Recherche des fichiers à corriger..."
echo ""

for file in $(find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/.git/*" \
    -not -path "*/dist/*" \
    -not -path "*/build/*" \
    2>/dev/null); do
    
    if fix_imports "$file"; then
        echo "✅ $file"
        ((total++))
    fi
done

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  ✅ TERMINÉ !                                              ║"
echo "║  $total fichier(s) corrigé(s)                              "
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Résumé des corrections :"
echo "   • from 'lucide-react' → from 'lucide-react@0.550.0'"
echo "   • from \"lucide-react\" → from \"lucide-react@0.550.0\""
echo "   • from 'sonner' → from 'sonner@2.0.3'"
echo "   • from \"sonner\" → from \"sonner@2.0.3\""
echo ""
echo "🚀 Prochaines étapes :"
echo "   1. Les fichiers sont maintenant corrigés dans Figma Make"
echo "   2. Copiez-les vers votre dépôt GitHub"
echo "   3. Commit + Push vers GitHub"
echo "   4. Vercel déploiera automatiquement"
echo ""
