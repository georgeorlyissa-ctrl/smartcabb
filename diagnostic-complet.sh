#!/bin/bash

# 🔍 DIAGNOSTIC COMPLET - ERREUR BUILD PERSISTANTE

echo "🔍 DIAGNOSTIC COMPLET DE L'ERREUR BUILD"
echo "========================================"
echo ""

# 1. Vérifier que les fichiers requis EXISTENT
echo "1️⃣  Vérification des fichiers requis..."
echo ""

if [ -f "components/InteractiveMapView.tsx" ]; then
    echo "✅ components/InteractiveMapView.tsx existe"
    echo "   Taille: $(wc -c < components/InteractiveMapView.tsx) bytes"
else
    echo "❌ components/InteractiveMapView.tsx MANQUANT !"
    echo "   C'est probablement la cause de l'erreur."
fi

if [ -f "lib/icons.ts" ]; then
    echo "✅ lib/icons.ts existe"
    
    # Vérifier le contenu
    if grep -q "export { Loader2 }" lib/icons.ts; then
        echo "   ✅ Contient 'export { Loader2 }' (CORRECT)"
    elif grep -q "export { Loader as Loader2 }" lib/icons.ts; then
        echo "   ❌ Contient 'export { Loader as Loader2 }' (INCORRECT)"
    else
        echo "   ⚠️  Export Loader2 non trouvé"
    fi
else
    echo "❌ lib/icons.ts MANQUANT !"
fi

echo ""
echo "2️⃣  Vérification des fichiers à supprimer..."
echo ""

if [ -f "lib/route-calculator.ts" ]; then
    echo "❌ lib/route-calculator.ts existe encore (DOIT ÊTRE SUPPRIMÉ)"
else
    echo "✅ lib/route-calculator.ts supprimé"
fi

if [ -f "components/InteractiveRouteMap.tsx" ]; then
    echo "❌ components/InteractiveRouteMap.tsx existe encore (DOIT ÊTRE SUPPRIMÉ)"
else
    echo "✅ components/InteractiveRouteMap.tsx supprimé"
fi

echo ""
echo "3️⃣  Vérification des imports dans MapScreen.tsx..."
echo ""

if [ -f "components/passenger/MapScreen.tsx" ]; then
    echo "Imports trouvés:"
    grep "import.*InteractiveMapView" components/passenger/MapScreen.tsx || echo "  Aucun import de InteractiveMapView"
    grep "import.*InteractiveRouteMap" components/passenger/MapScreen.tsx || echo "  Aucun import de InteractiveRouteMap"
else
    echo "❌ components/passenger/MapScreen.tsx n'existe pas"
fi

echo ""
echo "4️⃣  Vérification du statut Git..."
echo ""
git status --short | head -20

echo ""
echo "5️⃣  Vérification des fichiers trackés par Git..."
echo ""
git ls-files | grep -E "(InteractiveMapView|InteractiveRouteMap|route-calculator|icons\.ts)" || echo "Aucun fichier problématique tracké"

echo ""
echo "========================================"
echo "FIN DU DIAGNOSTIC"
echo ""
