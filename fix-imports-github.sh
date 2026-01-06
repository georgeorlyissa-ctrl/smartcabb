#!/bin/bash

# 🔧 Script de correction automatique des imports pour SmartCabb
# Usage: ./fix-imports-github.sh

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  🔧 SMARTCABB - Correction automatique des imports            ║"
echo "║  lucide-react → lucide-react@0.550.0                          ║"
echo "║  sonner → sonner@2.0.3                                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Vérifier que Python est installé
if ! command -v python3 &> /dev/null; then
    echo "❌ Erreur: Python 3 n'est pas installé"
    echo "   Installez Python depuis https://www.python.org/downloads/"
    exit 1
fi

echo "✅ Python détecté: $(python3 --version)"
echo ""

# Vérifier que nous sommes dans un dépôt git
if [ ! -d .git ]; then
    echo "❌ Erreur: Ce script doit être exécuté à la racine du dépôt git"
    exit 1
fi

echo "✅ Dépôt git détecté"
echo ""

# Exécuter le script Python
echo "🔧 Exécution du script de correction..."
echo ""
python3 fix_all_now.py

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  📊 Vérification des modifications                            ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Vérifier s'il y a des changements
if [[ -n $(git status -s) ]]; then
    echo "✅ Des fichiers ont été modifiés !"
    echo ""
    echo "📋 Fichiers modifiés :"
    git status -s
    echo ""
    
    # Proposer de commiter et pusher
    read -p "❓ Voulez-vous commiter et pusher les changements ? (o/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Oo]$ ]]; then
        echo ""
        echo "🔧 Configuration git..."
        git config user.email "dev@smartcabb.com" 2>/dev/null || true
        git config user.name "SmartCabb Dev" 2>/dev/null || true
        
        echo "📝 Création du commit..."
        git add -A
        
        VERSION="v517.$(date +%s)"
        git commit -m "🔧 fix: Correction automatique des imports lucide-react@0.550.0 et sonner@2.0.3

- Remplace tous les imports 'lucide-react' par 'lucide-react@0.550.0'
- Remplace tous les imports 'sonner' par 'sonner@2.0.3'
- Correction automatique via script

Version: $VERSION
Build: Ready for Vercel deployment"
        
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
        echo "ℹ️  Changements non committés"
        echo "   Vous pouvez les commiter manuellement avec :"
        echo "   git add -A"
        echo "   git commit -m \"fix: Correction imports\""
        echo "   git push"
        echo ""
    fi
else
    echo "ℹ️  Aucune modification nécessaire"
    echo "✅ Tous les imports sont déjà corrects !"
    echo ""
fi

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  ✨ TERMINÉ                                                    ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
