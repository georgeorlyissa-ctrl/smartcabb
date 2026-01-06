#!/bin/bash
# 🔧 Script de correction automatique des erreurs de build SmartCabb
# Version: v517.104

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  🔧 SMARTCABB - FIX AUTOMATIQUE BUILD ERRORS                  ║"
echo "║  Correction des imports lucide-react et sonner                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Vérifier qu'on est dans le bon dossier
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: Veuillez exécuter ce script à la racine du projet"
    exit 1
fi

echo "✅ Dossier de travail: $(pwd)"
echo ""

# Essayer Node.js d'abord
if command -v node &> /dev/null; then
    echo "🔧 Correction avec Node.js..."
    node fix-imports-now.mjs
elif command -v python3 &> /dev/null; then
    echo "🔧 Correction avec Python3..."
    python3 fix_all_now.py
else
    echo "❌ Erreur: Ni Node.js ni Python3 n'est installé"
    echo "   Installez l'un des deux pour continuer"
    exit 1
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  ✅ CORRECTION TERMINÉE                                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Vérification
echo "🔍 Vérification des fichiers restants..."
REMAINING=$(grep -r "from 'lucide-react'" --include="*.tsx" --include="*.ts" . 2>/dev/null | grep -v "@0.550.0" | grep -v node_modules | wc -l)

if [ "$REMAINING" -eq 0 ]; then
    echo "✅ Tous les imports lucide-react sont corrects !"
else
    echo "⚠️  Il reste $REMAINING fichier(s) à corriger manuellement"
fi

REMAINING_SONNER=$(grep -r "from 'sonner'" --include="*.tsx" --include="*.ts" . 2>/dev/null | grep -v "@2.0.3" | grep -v node_modules | wc -l)

if [ "$REMAINING_SONNER" -eq 0 ]; then
    echo "✅ Tous les imports sonner sont corrects !"
else
    echo "⚠️  Il reste $REMAINING_SONNER fichier(s) sonner à corriger manuellement"
fi

echo ""
echo "📋 Prochaines étapes :"
echo "   1. git add -A"
echo "   2. git commit -m '🔧 fix: Correction imports lucide-react et sonner'"
echo "   3. git push origin main"
echo "   4. Vercel déploiera automatiquement ✅"
echo ""

# Proposer de commiter automatiquement
read -p "❓ Voulez-vous commiter et pusher maintenant ? (o/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Oo]$ ]]; then
    echo "📝 Création du commit..."
    git add -A
    git commit -m "🔧 fix: Correction imports lucide-react@0.550.0 et sonner@2.0.3

- Correction automatique de tous les imports sans version
- lucide-react → lucide-react@0.550.0
- sonner → sonner@2.0.3
- Fix build errors Vercel

Version: v517.104"
    
    echo ""
    echo "🚀 Push vers GitHub..."
    git push origin main
    
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║  ✅ SUCCÈS ! Changements poussés vers GitHub                  ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "🎉 Vercel va maintenant déployer automatiquement"
    echo "🌐 Vérifiez sur : https://vercel.com/dashboard"
    echo ""
else
    echo ""
    echo "ℹ️  Changements non committés."
    echo "   Commitez manuellement quand vous êtes prêt."
    echo ""
fi

echo "✨ Terminé !"