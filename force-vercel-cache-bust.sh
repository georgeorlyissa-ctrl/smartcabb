#!/bin/bash

# 🔨 FORCE VERCEL CACHE BUST
# Change la version du build pour forcer Vercel à rebuilder complètement

echo "╔════════════════════════════════════════════════════════════╗"
echo "║      🔨 FORCE VERCEL CACHE BUST                           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# ============================================================================
# ÉTAPE 1 : INCRÉMENTER LA VERSION
# ============================================================================

echo "═══════════════════════════════════════════════════════════"
echo "📝 ÉTAPE 1: Incrémentation version package.json..."
echo "═══════════════════════════════════════════════════════════"
echo ""

# Lire la version actuelle
CURRENT_VERSION=$(grep '"version":' package.json | head -1 | sed 's/.*"\([0-9]*\.[0-9]*\.[0-9]*\)".*/\1/')
echo "  Version actuelle: $CURRENT_VERSION"

# Incrémenter le patch
IFS='.' read -r -a VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR="${VERSION_PARTS[0]}"
MINOR="${VERSION_PARTS[1]}"
PATCH="${VERSION_PARTS[2]}"

NEW_PATCH=$((PATCH + 1))
NEW_VERSION="$MAJOR.$MINOR.$NEW_PATCH"

echo "  Nouvelle version: $NEW_VERSION"

# Remplacer dans package.json
sed -i.bak "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" package.json
rm -f package.json.bak

echo "  ✅ Version mise à jour"

# ============================================================================
# ÉTAPE 2 : CRÉER UN FICHIER CACHE BUSTER
# ============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🔨 ÉTAPE 2: Création fichier cache buster..."
echo "═══════════════════════════════════════════════════════════"
echo ""

TIMESTAMP=$(date +%s)
cat > BUILD_VERSION.ts << EOF
// Auto-généré - Ne pas éditer manuellement
export const BUILD_VERSION = '$NEW_VERSION';
export const BUILD_DATE = '$TIMESTAMP';
export const BUILD_ID = '${TIMESTAMP}_vercel_rebuild';
EOF

echo "  ✅ BUILD_VERSION.ts créé avec BUILD_ID: ${TIMESTAMP}_vercel_rebuild"

# ============================================================================
# ÉTAPE 3 : TOUCHER App.tsx
# ============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "👆 ÉTAPE 3: Modification App.tsx..."
echo "═══════════════════════════════════════════════════════════"
echo ""

if [ -f "App.tsx" ]; then
    # Ajouter un commentaire temporaire pour forcer le rebuild
    echo "" >> App.tsx
    echo "// Cache bust: $TIMESTAMP" >> App.tsx
    echo "  ✅ App.tsx modifié (commentaire ajouté)"
else
    echo "  ⚠️  App.tsx non trouvé"
fi

# ============================================================================
# ÉTAPE 4 : NETTOYER TOUS LES CACHES LOCAUX
# ============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🧹 ÉTAPE 4: Nettoyage caches locaux..."
echo "═══════════════════════════════════════════════════════════"
echo ""

rm -rf node_modules/.vite && echo "  ✅ Cache Vite supprimé"
rm -rf .vercel && echo "  ✅ Cache Vercel supprimé"
rm -rf dist && echo "  ✅ Dossier dist supprimé"
find . -name "*.tsbuildinfo" -delete && echo "  ✅ .tsbuildinfo supprimés"

# ============================================================================
# ÉTAPE 5 : CRÉER .env.production (au cas où)
# ============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🔐 ÉTAPE 5: Vérification .env.production..."
echo "═══════════════════════════════════════════════════════════"
echo ""

if [ ! -f ".env.production" ]; then
    cat > .env.production << 'EOF'
# Variables d'environnement pour Vercel
VITE_BUILD_ID=${BUILD_ID}
VITE_ENABLE_LOGS=false
EOF
    echo "  ✅ .env.production créé"
else
    echo "  ✅ .env.production existe déjà"
fi

# ============================================================================
# RÉSUMÉ
# ============================================================================

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                  ✅ CACHE BUST TERMINÉ !                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 CHANGEMENTS:"
echo "   • Version: $CURRENT_VERSION → $NEW_VERSION"
echo "   • BUILD_ID: ${TIMESTAMP}_vercel_rebuild"
echo "   • App.tsx modifié"
echo "   • Caches nettoyés"
echo ""
echo "📋 COMMANDES FINALES:"
echo ""
echo "1️⃣  git add ."
echo "2️⃣  git commit -m \"fix(vercel): cache bust v$NEW_VERSION - force rebuild\""
echo "3️⃣  git push origin main"
echo ""
echo "🎯 Vercel sera FORCÉ de rebuilder depuis zéro !"
echo ""
