#!/bin/bash

# 🚀 SCRIPT FORCE REBUILD VERCEL
# Force un rebuild complet en nettoyant TOUT

echo "╔════════════════════════════════════════════════════════════╗"
echo "║      🚀 FORCE REBUILD VERCEL - NETTOYAGE TOTAL            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# ============================================================================
# ÉTAPE 1 : NETTOYER TOUS LES CACHES
# ============================================================================

echo "═══════════════════════════════════════════════════════════"
echo "🧹 ÉTAPE 1: Suppression de TOUS les caches..."
echo "═══════════════════════════════════════════════════════════"
echo ""

# Cache Vite
if [ -d "node_modules/.vite" ]; then
    rm -rf node_modules/.vite
    echo "  ✅ Cache Vite supprimé"
fi

# Cache Vercel local
if [ -d ".vercel" ]; then
    rm -rf .vercel
    echo "  ✅ Cache Vercel local supprimé"
fi

# Dossier dist
if [ -d "dist" ]; then
    rm -rf dist
    echo "  ✅ Dossier dist supprimé"
fi

# Fichiers temporaires TypeScript
find . -name "*.tsbuildinfo" -delete 2>/dev/null && echo "  ✅ Fichiers .tsbuildinfo supprimés"

# Lock files temporaires
rm -f package-lock.json.* yarn.lock.* 2>/dev/null && echo "  ✅ Lock files temporaires supprimés"

# Fichiers de backup des scripts
rm -f components/**/*.temp components/**/*.tmp hooks/**/*.temp utils/**/*.temp 2>/dev/null && echo "  ✅ Fichiers .temp supprimés"

# ============================================================================
# ÉTAPE 2 : CRÉER .vercelignore POUR FORCER REBUILD
# ============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📝 ÉTAPE 2: Configuration .vercelignore..."
echo "═══════════════════════════════════════════════════════════"
echo ""

cat > .vercelignore << 'EOF'
# Scripts de correction (ne pas déployer)
*.sh
backup_*/
VERCEL-FIX-README.md

# Cache et temporaires
node_modules/.vite
.vercel
dist
*.tsbuildinfo
*.temp
*.tmp
*.bak
EOF

echo "  ✅ .vercelignore créé/mis à jour"

# ============================================================================
# ÉTAPE 3 : CRÉER UN FICHIER .vercel/force-rebuild
# ============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🔄 ÉTAPE 3: Création marqueur force-rebuild..."
echo "═══════════════════════════════════════════════════════════"
echo ""

mkdir -p .vercel
echo "$(date +%s)" > .vercel/force-rebuild-$(date +%Y%m%d_%H%M%S).txt
echo "  ✅ Marqueur force-rebuild créé"

# ============================================================================
# ÉTAPE 4 : TOUCHER LES FICHIERS PRINCIPAUX
# ============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "👆 ÉTAPE 4: Touch des fichiers principaux..."
echo "═══════════════════════════════════════════════════════════"
echo ""

# Toucher les fichiers principaux pour forcer leur recompilation
if [ -f "App.tsx" ]; then
    touch App.tsx
    echo "  ✅ App.tsx touché"
fi

if [ -f "vite.config.ts" ]; then
    touch vite.config.ts
    echo "  ✅ vite.config.ts touché"
fi

if [ -f "components/LandingScreen.tsx" ]; then
    touch components/LandingScreen.tsx
    echo "  ✅ LandingScreen.tsx touché"
fi

# ============================================================================
# ÉTAPE 5 : VÉRIFIER GIT STATUS
# ============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📊 ÉTAPE 5: Vérification Git..."
echo "═══════════════════════════════════════════════════════════"
echo ""

# Afficher les fichiers modifiés
echo "  📋 Fichiers modifiés/ajoutés:"
git status --short

# ============================================================================
# RÉSUMÉ ET INSTRUCTIONS
# ============================================================================

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║       ✅ NETTOYAGE COMPLET TERMINÉ !                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 PROCHAINES ÉTAPES POUR FORCER LE REBUILD VERCEL:"
echo ""
echo "1️⃣  Ajouter les changements:"
echo "    git add ."
echo ""
echo "2️⃣  Commiter avec message explicite:"
echo "    git commit -m \"fix(vercel): force rebuild - nettoyage cache complet\""
echo ""
echo "3️⃣  Pusher vers GitHub:"
echo "    git push origin main"
echo ""
echo "4️⃣  Sur Vercel Dashboard:"
echo "    • Aller sur https://vercel.com/dashboard"
echo "    • Cliquer sur votre projet SmartCabb"
echo "    • Cliquer sur 'Deployments'"
echo "    • Le nouveau build devrait démarrer automatiquement"
echo "    • Si ça ne marche toujours pas, cliquer sur 'Redeploy'"
echo ""
echo "💡 ASTUCE: Vercel peut prendre 1-2 min pour détecter le push"
echo ""
echo "🎯 Le nettoyage du cache devrait résoudre l'erreur de syntaxe"
echo "   qui était probablement due à un cache corrompu."
echo ""
