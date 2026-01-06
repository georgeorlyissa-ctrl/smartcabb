#!/bin/bash

echo "🚀 CORRECTION GLOBALE - lucide-react + sonner"
echo "=============================================="
echo ""

# Fonction pour compter les occurrences
count_pattern() {
    local pattern="$1"
    local count=$(grep -r "$pattern" --include="*.tsx" --include="*.ts" . 2>/dev/null | wc -l)
    echo "$count"
}

# 1. LUCIDE-REACT
echo "📦 Étape 1/2 : Correction de lucide-react"
echo "----------------------------------------"

lucide_before=$(count_pattern "from ['\"]lucide-react['\"]")
echo "   Fichiers à corriger : $lucide_before"

if [ "$lucide_before" -gt 0 ]; then
    echo "   Correction en cours..."
    
    # Trouver et corriger tous les fichiers .tsx et .ts
    find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
        -not -path "*/node_modules/*" \
        -not -path "*/.git/*" \
        -not -path "*/dist/*" \
        -not -path "*/build/*" \
        -exec sed -i.bak -E "s/from ['\"]lucide-react['\"]/from 'lucide-react@0.550.0'/g" {} \;
    
    # Supprimer les fichiers de backup
    find . -type f -name "*.bak" -delete
    
    lucide_after=$(count_pattern "from ['\"]lucide-react['\"]")
    echo "   ✅ Terminé : $lucide_before → $lucide_after"
else
    echo "   ✅ Déjà corrigé"
fi

echo ""

# 2. SONNER
echo "📦 Étape 2/2 : Correction de sonner"
echo "-----------------------------------"

sonner_before=$(count_pattern "from ['\"]sonner['\"];")
echo "   Fichiers à corriger : $sonner_before"

if [ "$sonner_before" -gt 0 ]; then
    echo "   Correction en cours..."
    
    # Trouver et corriger tous les fichiers .tsx et .ts
    find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
        -not -path "*/node_modules/*" \
        -not -path "*/.git/*" \
        -not -path "*/dist/*" \
        -not -path "*/build/*" \
        -exec sed -i.bak -E "s/from ['\"]sonner['\"]\;/from 'sonner@2.0.3';/g" {} \;
    
    # Supprimer les fichiers de backup
    find . -type f -name "*.bak" -delete
    
    sonner_after=$(count_pattern "from ['\"]sonner['\"];")
    echo "   ✅ Terminé : $sonner_before → $sonner_after"
else
    echo "   ✅ Déjà corrigé"
fi

echo ""
echo "=============================================="
echo "🎉 CORRECTION TERMINÉE !"
echo ""
echo "📊 Vérification finale :"
echo "   - lucide-react sans version : $(count_pattern "from ['\"]lucide-react['\"]")"
echo "   - sonner sans version : $(count_pattern "from ['\"]sonner['\"];")"
echo ""
echo "✅ Si les deux montrent 0, vous êtes prêt pour le build !"
echo ""
echo "🚀 Prochaines étapes :"
echo "   1. Vérifier le build dans Figma Make"
echo "   2. git add ."
echo "   3. git commit -m '✅ Fix all imports: lucide-react@0.550.0 + sonner@2.0.3'"
echo "   4. git push origin main"
echo ""
