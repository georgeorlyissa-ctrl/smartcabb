#!/bin/bash

# 🚀 Script de déploiement du backend SmartCabb
# Ce script déploie la fonction Edge sur Supabase

echo "🚀 Déploiement du backend SmartCabb..."
echo ""

# Vérifier si Supabase CLI est installé
if ! command -v supabase &> /dev/null
then
    echo "❌ Supabase CLI n'est pas installé"
    echo ""
    echo "📦 Installation avec npm :"
    echo "   npm install -g supabase"
    echo ""
    echo "📦 Ou avec Homebrew (Mac) :"
    echo "   brew install supabase/tap/supabase"
    echo ""
    exit 1
fi

# Vérifier si l'utilisateur est connecté
echo "🔑 Vérification de la connexion Supabase..."
if ! supabase functions list &> /dev/null; then
    echo "❌ Vous n'êtes pas connecté à Supabase"
    echo "🔐 Connexion..."
    supabase login
fi

# Déployer la fonction
echo ""
echo "📤 Déploiement de la fonction make-server-2eb02e52..."
echo ""

supabase functions deploy make-server-2eb02e52

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ BACKEND DÉPLOYÉ AVEC SUCCÈS !"
    echo ""
    echo "🎉 Vous pouvez maintenant :"
    echo "   1. Recharger votre application (Ctrl+R)"
    echo "   2. Essayer de vous inscrire côté conducteur"
    echo ""
else
    echo ""
    echo "❌ ÉCHEC DU DÉPLOIEMENT"
    echo ""
    echo "🔧 Vérifiez :"
    echo "   1. Que vous êtes connecté : supabase login"
    echo "   2. Que votre projet est lié : supabase link"
    echo "   3. Les logs d'erreur ci-dessus"
    echo ""
    exit 1
fi
