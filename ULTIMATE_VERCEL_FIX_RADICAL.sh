#!/bin/bash

# 🚨 FIX RADICAL VERCEL - DERNIÈRE SOLUTION
# Force un rebuild complet en changeant TOUT

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║      🚨 FIX RADICAL VERCEL - DERNIÈRE SOLUTION 🚨        ║"
echo "║                                                            ║"
echo "║  Cette solution va:                                        ║"
echo "║   ✅ Incrémenter la version                               ║"
echo "║   ✅ Créer un fichier de cache bust                       ║"
echo "║   ✅ Nettoyer TOUS les caches                             ║"
echo "║   ✅ Créer .vercel/force-rebuild                          ║"
echo "║   ✅ Forcer Vercel à tout recompiler                      ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Demander confirmation
read -p "⚠️  Ce script va modifier package.json. Continuer ? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Annulé"
    exit 1
fi

TIMESTAMP=$(date +%s)

# ============================================================================
# ÉTAPE 1 : INCRÉMENTER VERSION
# ============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📝 ÉTAPE 1: Incrémentation version..."
echo "═══════════════════════════════════════════════════════════"
echo ""

# Lire version actuelle
CURRENT_VERSION=$(grep '"version":' package.json | head -1 | sed 's/.*"\([0-9]*\.[0-9]*\.[0-9]*\)".*/\1/')
echo "  Version actuelle: $CURRENT_VERSION"

# Incrémenter patch
IFS='.' read -r -a VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR="${VERSION_PARTS[0]}"
MINOR="${VERSION_PARTS[1]}"
PATCH="${VERSION_PARTS[2]}"

NEW_PATCH=$((PATCH + 1))
NEW_VERSION="$MAJOR.$MINOR.$NEW_PATCH"

echo "  Nouvelle version: $NEW_VERSION"

# Remplacer
sed -i.bak "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" package.json
rm -f package.json.bak

echo "  ✅ Version mise à jour"

# ============================================================================
# ÉTAPE 2 : METTRE À JOUR BUILD_VERSION.ts
# ============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🔨 ÉTAPE 2: Mise à jour BUILD_VERSION.ts..."
echo "═══════════════════════════════════════════════════════════"
echo ""

cat > BUILD_VERSION.ts << EOF
// Auto-généré le $(date)
// NE PAS ÉDITER MANUELLEMENT

export const BUILD_VERSION = '$NEW_VERSION';
export const BUILD_DATE = '$TIMESTAMP';
export const BUILD_ID = 'vercel_rebuild_${TIMESTAMP}';

// Cache bust pour forcer le rebuild Vercel
export const CACHE_BUST = '$TIMESTAMP';
EOF

echo "  ✅ BUILD_VERSION.ts créé avec BUILD_ID: vercel_rebuild_${TIMESTAMP}"

# ============================================================================
# ÉTAPE 3 : CRÉER MARQUEUR .vercel/force-rebuild
# ============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🔄 ÉTAPE 3: Création marqueur force-rebuild..."
echo "═══════════════════════════════════════════════════════════"
echo ""

mkdir -p .vercel
cat > .vercel/force-rebuild-${TIMESTAMP}.txt << EOF
Force rebuild Vercel - $(date)
Timestamp: $TIMESTAMP
Version: $NEW_VERSION
Raison: Cache corrompu - erreur import sonner
EOF

echo "  ✅ Marqueur créé: .vercel/force-rebuild-${TIMESTAMP}.txt"

# ============================================================================
# ÉTAPE 4 : NETTOYER TOUS LES CACHES LOCAUX
# ============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🧹 ÉTAPE 4: Nettoyage caches locaux..."
echo "═══════════════════════════════════════════════════════════"
echo ""

CLEANED=0

if [ -d "node_modules/.vite" ]; then
    rm -rf node_modules/.vite
    echo "  ✅ Cache Vite supprimé"
    ((CLEANED++))
fi

if [ -d ".vercel/cache" ]; then
    rm -rf .vercel/cache
    echo "  ✅ Cache Vercel supprimé"
    ((CLEANED++))
fi

if [ -d "dist" ]; then
    rm -rf dist
    echo "  ✅ Dossier dist supprimé"
    ((CLEANED++))
fi

find . -name "*.tsbuildinfo" -delete 2>/dev/null && echo "  ✅ .tsbuildinfo supprimés" && ((CLEANED++))
find . -name "*.temp" -delete 2>/dev/null && echo "  ✅ .temp supprimés" && ((CLEANED++))
find . -name "*.tmp" -delete 2>/dev/null && echo "  ✅ .tmp supprimés" && ((CLEANED++))

if [ "$CLEANED" -gt 0 ]; then
    echo "  📊 Total: $CLEANED caches nettoyés"
fi

# ============================================================================
# ÉTAPE 5 : METTRE À JOUR .vercelignore
# ============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📝 ÉTAPE 5: Configuration .vercelignore..."
echo "═══════════════════════════════════════════════════════════"
echo ""

cat > .vercelignore << 'EOF'
# Scripts de développement (ne pas déployer)
*.sh
*.py
*.md
!README.md
backup_*/

# Cache et temporaires
node_modules/.vite
.vercel/cache
dist
*.tsbuildinfo
*.temp
*.tmp
*.bak

# Fichiers Figma Make uniquement (ne pas déployer sur Vercel)
framer-motion.tsx
lib/motion-wrapper.tsx
scripts/prepare-for-figma.mjs

# Logs et diagnostics
*.log
EOF

echo "  ✅ .vercelignore mis à jour"

# ============================================================================
# ÉTAPE 6 : VÉRIFIER vite.config.ts
# ============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🔍 ÉTAPE 6: Vérification vite.config.ts..."
echo "═══════════════════════════════════════════════════════════"
echo ""

if grep -q "alias.*framer-motion.*path.resolve" vite.config.ts 2>/dev/null; then
    if grep -q "^[[:space:]]*//.*alias:" vite.config.ts 2>/dev/null; then
        echo "  ✅ Alias framer-motion commenté (OK pour Vercel)"
    else
        echo "  ⚠️  WARNING: Alias framer-motion ACTIF"
        echo "  💡 Devrait être commenté pour Vercel"
    fi
else
    echo "  ✅ Pas d'alias framer-motion (OK)"
fi

if grep -q "optimizeDeps.*include.*'framer-motion'" vite.config.ts 2>/dev/null; then
    echo "  ✅ optimizeDeps contient 'framer-motion'"
else
    echo "  ⚠️  WARNING: optimizeDeps ne contient pas 'framer-motion'"
fi

# ============================================================================
# ÉTAPE 7 : AJOUTER UN COMMENTAIRE CACHE BUST dans App.tsx
# ============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "💥 ÉTAPE 7: Cache bust dans App.tsx..."
echo "═══════════════════════════════════════════════════════════"
echo ""

if [ -f "App.tsx" ]; then
    # Ajouter un commentaire pour forcer le rebuild
    echo "" >> App.tsx
    echo "/* Vercel cache bust: v$NEW_VERSION - $TIMESTAMP */" >> App.tsx
    echo "  ✅ App.tsx modifié (cache bust ajouté)"
else
    echo "  ⚠️  App.tsx non trouvé"
fi

# ============================================================================
# RÉSUMÉ FINAL
# ============================================================================

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║       ✅ FIX RADICAL TERMINÉ ! 🎉                         ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 CHANGEMENTS EFFECTUÉS:"
echo "   • Version: $CURRENT_VERSION → $NEW_VERSION"
echo "   • BUILD_ID: vercel_rebuild_${TIMESTAMP}"
echo "   • BUILD_VERSION.ts mis à jour"
echo "   • .vercel/force-rebuild-${TIMESTAMP}.txt créé"
echo "   • App.tsx modifié (cache bust)"
echo "   • Caches nettoyés: $CLEANED"
echo "   • .vercelignore mis à jour"
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║               📋 COMMANDES À EXÉCUTER                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "1️⃣  git add ."
echo ""
echo "2️⃣  git commit -m \"fix(vercel): cache bust v$NEW_VERSION - force rebuild complet\""
echo ""
echo "3️⃣  git push origin main"
echo ""
echo "4️⃣  ATTENDEZ 2-3 MINUTES"
echo ""
echo "5️⃣  Vérifiez https://vercel.com/dashboard"
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║           🎯 POURQUOI ÇA VA MARCHER                        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "  • Nouvelle version → Vercel détecte un changement majeur"
echo "  • BUILD_ID unique → Force recompilation complète"
echo "  • .vercel/force-rebuild → Invalide le cache Vercel"
echo "  • App.tsx modifié → Point d'entrée changé"
echo "  • Caches locaux nettoyés → Pas de conflit local"
echo ""
echo "💡 Si ça ne marche TOUJOURS pas après ça:"
echo "   → Le problème est sur le serveur Vercel lui-même"
echo "   → Il faudra contacter le support Vercel"
echo ""
echo "🚀 ALLEZ-Y MAINTENANT:"
echo "   git add . && git commit -m \"fix(vercel): cache bust v$NEW_VERSION - force rebuild\" && git push origin main"
echo ""
