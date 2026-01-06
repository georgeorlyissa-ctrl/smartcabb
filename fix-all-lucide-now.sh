#!/bin/bash
# Script de correction ultra-rapide pour tous les imports lucide-react et sonner
# SmartCabb v517.105

echo "🔧 Correction automatique de TOUS les imports lucide-react et sonner..."
echo ""

# Compteurs
FIXED_LUCIDE=0
FIXED_SONNER=0

# Correction lucide-react dans tous les fichiers .tsx et .ts
echo "📂 Correction des imports lucide-react..."
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/dist/*" \
  ! -path "*/build/*" \
  -exec grep -l "from ['\"]lucide-react['\"]" {} \; 2>/dev/null | while read file; do
    # Vérifier si le fichier contient des imports sans version
    if grep -q "from ['\"]lucide-react['\"]" "$file" && ! grep -q "from ['\"]lucide-react@" "$file"; then
        # Remplacer les imports
        sed -i.bak "s/from ['\"]lucide-react['\"]/from 'lucide-react@0.550.0'/g" "$file"
        rm -f "$file.bak"
        echo "  ✅ $file"
        ((FIXED_LUCIDE++))
    fi
done

# Correction sonner dans tous les fichiers .tsx et .ts
echo ""
echo "📂 Correction des imports sonner..."
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/dist/*" \
  ! -path "*/build/*" \
  -exec grep -l "from ['\"]sonner['\"]" {} \; 2>/dev/null | while read file; do
    # Vérifier si le fichier contient des imports sans version
    if grep -q "from ['\"]sonner['\"]" "$file" && ! grep -q "from ['\"]sonner@" "$file"; then
        # Remplacer les imports
        sed -i.bak "s/from ['\"]sonner['\"]/from 'sonner@2.0.3'/g" "$file"
        rm -f "$file.bak"
        echo "  ✅ $file"
        ((FIXED_SONNER++))
    fi
done

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  ✅ CORRECTION TERMINÉE !                                      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Résumé :"
echo "   • Fichiers lucide-react corrigés: $FIXED_LUCIDE"
echo "   • Fichiers sonner corrigés: $FIXED_SONNER"
echo ""

# Vérification finale
echo "🔍 Vérification finale..."
REMAINING_LUCIDE=$(grep -r "from ['\"]lucide-react['\"]" --include="*.tsx" --include="*.ts" . 2>/dev/null | grep -v "@0.550.0" | grep -v node_modules | wc -l || echo 0)
REMAINING_SONNER=$(grep -r "from ['\"]sonner['\"]" --include="*.tsx" --include="*.ts" . 2>/dev/null | grep -v "@2.0.3" | grep -v node_modules | wc -l || echo 0)

if [ "$REMAINING_LUCIDE" -eq 0 ]; then
    echo "✅ Tous les imports lucide-react sont corrects !"
else
    echo "⚠️  Il reste $REMAINING_LUCIDE import(s) lucide-react à corriger"
fi

if [ "$REMAINING_SONNER" -eq 0 ]; then
    echo "✅ Tous les imports sonner sont corrects !"
else
    echo "⚠️  Il reste $REMAINING_SONNER import(s) sonner à corriger"
fi

echo ""
echo "✨ Terminé ! Vous pouvez maintenant commit et push."
