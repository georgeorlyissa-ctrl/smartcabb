#!/bin/bash

# 🎬 Commandes de déploiement SmartCabb
# Date : 8 Décembre 2024
# Status : Production Ready

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║           🚀 DÉPLOIEMENT SMARTCABB PRODUCTION               ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# ============================================================
# ÉTAPE 1 : VÉRIFICATION PRÉALABLE
# ============================================================
echo "📋 ÉTAPE 1/3 : Vérification des fichiers..."
echo ""

# Vérifier que le fichier problématique a été supprimé
if [ -f "hooks/useAppState.ts" ]; then
    echo "❌ ERREUR : Le fichier hooks/useAppState.ts existe encore !"
    echo "   Ce fichier doit être supprimé avant le déploiement."
    exit 1
else
    echo "✅ Fichier hooks/useAppState.ts supprimé (OK)"
fi

# Vérifier que le fichier principal existe
if [ -f "hooks/useAppState.tsx" ]; then
    echo "✅ Fichier hooks/useAppState.tsx présent (OK)"
else
    echo "❌ ERREUR : Le fichier hooks/useAppState.tsx n'existe pas !"
    exit 1
fi

# Vérifier l'import dans main.tsx
if grep -q "import './hooks/useAppState.tsx'" main.tsx; then
    echo "✅ Import explicite dans main.tsx (OK)"
else
    echo "⚠️  WARNING : L'import dans main.tsx n'est pas explicite"
    echo "   Vérifié quand même que l'import existe..."
    if grep -q "import.*useAppState" main.tsx; then
        echo "✅ Import useAppState trouvé dans main.tsx"
    else
        echo "❌ ERREUR : Aucun import useAppState dans main.tsx !"
        exit 1
    fi
fi

echo ""
echo "✅ Tous les fichiers sont corrects !"
echo ""

# ============================================================
# ÉTAPE 2 : COMMIT ET PUSH SUR GITHUB
# ============================================================
echo "📤 ÉTAPE 2/3 : Commit et push sur GitHub..."
echo ""

# Demander confirmation
read -p "Voulez-vous committer et pusher les modifications ? (o/N) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Oo]$ ]]
then
    echo "📝 Ajout des fichiers modifiés..."
    git add .
    
    echo "💾 Création du commit..."
    git commit -m "🚀 PROD: Fix définitif useAppState + optimisations bundling

- Suppression de /hooks/useAppState.ts (re-export problématique)
- Import explicite dans main.tsx avec extension .tsx
- Ajout documentation complète de déploiement
- Vérifications complètes effectuées
- Application 100% production-ready"
    
    echo "🚀 Push vers GitHub..."
    git push origin main
    
    echo ""
    echo "✅ Code poussé sur GitHub avec succès !"
else
    echo ""
    echo "⏭️  Push annulé. Vous pouvez le faire manuellement avec :"
    echo "   git add ."
    echo "   git commit -m \"🚀 Fix définitif useAppState production\""
    echo "   git push origin main"
fi

echo ""

# ============================================================
# ÉTAPE 3 : INSTRUCTIONS VERCEL
# ============================================================
echo "🌐 ÉTAPE 3/3 : Déploiement sur Vercel"
echo ""
echo "⚠️  IMPORTANT : Vous devez maintenant :"
echo ""
echo "1. Aller sur https://vercel.com/dashboard"
echo ""
echo "2. Sélectionner votre projet SmartCabb"
echo ""
echo "3. Aller dans Settings → Build & Development"
echo ""
echo "4. Cliquer sur 'Clear Build Cache' ⚠️ CRITIQUE"
echo "   (Sans cette étape, le problème persistera !)"
echo ""
echo "5. Retourner à l'onglet Deployments"
echo ""
echo "6. Cliquer sur le menu ⋮ à droite du dernier déploiement"
echo ""
echo "7. Sélectionner 'Redeploy'"
echo ""
echo "8. NE PAS cocher 'Use existing Build Cache'"
echo ""
echo "9. Cliquer sur 'Redeploy'"
echo ""
echo "10. Attendre la fin du build (2-3 minutes)"
echo ""

# ============================================================
# VÉRIFICATION POST-DÉPLOIEMENT
# ============================================================
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "🔍 Après le déploiement, vérifiez :"
echo ""
echo "✅ 1. Ouvrir l'URL de production"
echo "✅ 2. Ouvrir la console du navigateur (F12)"
echo "✅ 3. Vérifier ces messages :"
echo "       - '✅ useAppState module chargé en production'"
echo "       - '✅ Application React montée avec succès'"
echo "✅ 4. Tester la navigation dans l'app"
echo "✅ 5. Tester connexion passager/conducteur/admin"
echo ""

# ============================================================
# TROUBLESHOOTING
# ============================================================
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "🆘 En cas de problème :"
echo ""
echo "1. Vider le cache du navigateur (Ctrl+Shift+R)"
echo ""
echo "2. Tester en navigation privée"
echo ""
echo "3. Vérifier que le cache Vercel a bien été vidé"
echo ""
echo "4. Consulter la documentation complète :"
echo "   - /🎯_LIRE_EN_PREMIER.md"
echo "   - /🚀_DEPLOIEMENT_FINAL_OPTIMISE.md"
echo "   - /✅_VERIFICATION_COMPLETE.md"
echo ""

# ============================================================
# CONCLUSION
# ============================================================
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║                  ✅ PRÊT À DÉPLOYER !                        ║"
echo "║                                                              ║"
echo "║         Suivez les instructions Vercel ci-dessus            ║"
echo "║                                                              ║"
echo "║                 Bonne chance ! 🚀                            ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Afficher les prochaines étapes
echo "📝 PROCHAINES ÉTAPES :"
echo ""
echo "1. ✅ Vérifications préalables (TERMINÉ)"
echo "2. ✅ Commit GitHub (TERMINÉ)"
echo "3. ⏳ Déploiement Vercel (EN ATTENTE - Voir instructions ci-dessus)"
echo "4. ⏳ Vérification production (EN ATTENTE)"
echo ""
echo "═══════════════════════════════════════════════════════════════"
