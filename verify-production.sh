#!/bin/bash

# 🔍 Script de vérification avant déploiement production

echo ""
echo "🔍 VÉRIFICATION AVANT DÉPLOIEMENT - SmartCabb Production"
echo "=========================================================="
echo ""

# Compteurs
errors=0
warnings=0

# 1. Vérifier les imports avec versions
echo "📝 1. Vérification des imports avec versions..."

lucide_count=$(grep -r "from ['\"]lucide-react@" --include="*.tsx" --include="*.ts" --exclude-dir=node_modules --exclude-dir=dist . 2>/dev/null | wc -l)
sonner_count=$(grep -r "from ['\"]sonner@" --include="*.tsx" --include="*.ts" --exclude-dir=node_modules --exclude-dir=dist . 2>/dev/null | wc -l)

if [ "$lucide_count" -gt 0 ]; then
    echo "   ❌ $lucide_count fichier(s) avec 'lucide-react@x.x.x' trouvé(s)"
    errors=$((errors + 1))
else
    echo "   ✅ Aucun import lucide-react avec version"
fi

if [ "$sonner_count" -gt 0 ]; then
    echo "   ❌ $sonner_count fichier(s) avec 'sonner@x.x.x' trouvé(s)"
    errors=$((errors + 1))
else
    echo "   ✅ Aucun import sonner avec version"
fi

# 2. Vérifier que package.json existe
echo ""
echo "📦 2. Vérification de package.json..."

if [ ! -f "package.json" ]; then
    echo "   ❌ package.json introuvable !"
    errors=$((errors + 1))
else
    echo "   ✅ package.json existe"
    
    # Vérifier les dépendances critiques
    if grep -q '"framer-motion"' package.json; then
        echo "   ✅ framer-motion présent"
    else
        echo "   ❌ framer-motion manquant"
        errors=$((errors + 1))
    fi
    
    if grep -q '"lucide-react"' package.json; then
        echo "   ✅ lucide-react présent"
    else
        echo "   ❌ lucide-react manquant"
        errors=$((errors + 1))
    fi
    
    if grep -q '"sonner"' package.json; then
        echo "   ✅ sonner présent"
    else
        echo "   ❌ sonner manquant"
        errors=$((errors + 1))
    fi
    
    if grep -q '"react-resizable-panels"' package.json; then
        echo "   ✅ react-resizable-panels présent"
    else
        echo "   ⚠️  react-resizable-panels manquant (optionnel)"
        warnings=$((warnings + 1))
    fi
fi

# 3. Vérifier vite.config.ts
echo ""
echo "⚙️  3. Vérification de vite.config.ts..."

if [ ! -f "vite.config.ts" ]; then
    echo "   ❌ vite.config.ts introuvable !"
    errors=$((errors + 1))
else
    echo "   ✅ vite.config.ts existe"
    
    if grep -q "motion/react" vite.config.ts; then
        echo "   ✅ Alias motion/react configuré"
    else
        echo "   ⚠️  Alias motion/react non configuré"
        warnings=$((warnings + 1))
    fi
fi

# 4. Vérifier node_modules
echo ""
echo "📚 4. Vérification de node_modules..."

if [ ! -d "node_modules" ]; then
    echo "   ⚠️  node_modules absent - Lancez 'npm install'"
    warnings=$((warnings + 1))
else
    echo "   ✅ node_modules existe"
    
    if [ -d "node_modules/framer-motion" ]; then
        echo "   ✅ framer-motion installé"
    else
        echo "   ❌ framer-motion non installé - Lancez 'npm install'"
        errors=$((errors + 1))
    fi
    
    if [ -d "node_modules/lucide-react" ]; then
        echo "   ✅ lucide-react installé"
    else
        echo "   ❌ lucide-react non installé - Lancez 'npm install'"
        errors=$((errors + 1))
    fi
fi

# 5. Vérifier les fichiers de build
echo ""
echo "🏗️  5. Vérification du répertoire de build..."

if [ -d "dist" ]; then
    echo "   ℹ️  Dossier dist existe (ancien build)"
    echo "   💡 Recommandé : Lancez 'npm run build' pour vérifier"
else
    echo "   ℹ️  Aucun build précédent"
    echo "   💡 Recommandé : Lancez 'npm run build' avant de push"
fi

# Résumé
echo ""
echo "=========================================================="
echo "📊 RÉSUMÉ"
echo "=========================================================="
echo ""

if [ $errors -eq 0 ] && [ $warnings -eq 0 ]; then
    echo "🎉 TOUT EST BON ! Vous pouvez déployer en toute sécurité !"
    echo ""
    echo "Prochaines étapes :"
    echo "  1. npm run build      (tester le build local)"
    echo "  2. git add ."
    echo "  3. git commit -m 'fix: correction imports production'"
    echo "  4. git push origin main"
    echo ""
    exit 0
elif [ $errors -eq 0 ]; then
    echo "⚠️  $warnings avertissement(s) - Vérifiez avant de déployer"
    echo ""
    echo "Recommandations :"
    echo "  - Lancez 'npm install' si node_modules manque"
    echo "  - Lancez 'npm run build' pour tester"
    echo ""
    exit 0
else
    echo "❌ $errors erreur(s) détectée(s) - CORRECTION NÉCESSAIRE !"
    echo ""
    echo "Actions à effectuer :"
    
    if [ "$lucide_count" -gt 0 ] || [ "$sonner_count" -gt 0 ]; then
        echo "  📝 Corriger les imports avec versions (voir GUIDE_CORRECTION_FINAL.md)"
    fi
    
    if [ ! -d "node_modules" ] || [ ! -d "node_modules/framer-motion" ]; then
        echo "  📦 Lancer 'npm install'"
    fi
    
    echo ""
    echo "Consultez : GUIDE_CORRECTION_FINAL.md pour les instructions détaillées"
    echo ""
    exit 1
fi
