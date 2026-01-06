#!/bin/bash

# 🪝 Configuration des Git Hooks pour SmartCabb
# Ce script configure automatiquement la transformation des imports avant chaque commit

echo "🔧 Configuration des Git Hooks pour SmartCabb..."

# Créer le dossier .git/hooks s'il n'existe pas
mkdir -p .git/hooks

# Créer le pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

echo "🔄 Transformation automatique des imports pour Vercel/GitHub..."

# Exécuter le script de transformation
node scripts/prepare-for-vercel.mjs

# Vérifier le code de sortie
if [ $? -eq 0 ]; then
  echo "✅ Transformation réussie !"
  
  # Ajouter les fichiers modifiés au commit
  git add -u
  
  echo "📦 Fichiers ajoutés au commit"
else
  echo "❌ Erreur lors de la transformation !"
  exit 1
fi

exit 0
EOF

# Rendre le hook exécutable
chmod +x .git/hooks/pre-commit

echo "✅ Git Hooks configurés avec succès !"
echo ""
echo "📋 Ce qui se passera maintenant :"
echo "  1. À chaque 'git commit', les imports seront automatiquement transformés"
echo "  2. Les fichiers modifiés seront ajoutés au commit"
echo "  3. Le commit continuera normalement"
echo ""
echo "⚠️  Pour désactiver temporairement :"
echo "  git commit --no-verify"
echo ""
echo "🎉 Vous pouvez maintenant commit sans vous soucier des imports !"
