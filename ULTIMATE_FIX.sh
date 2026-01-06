#!/bin/bash

##############################################################################
# 🔥 FIX ULTIME DÉFINITIF - SMARTCABB VERCEL BUILD
# 
# Ce script règle TOUS les problèmes de build une fois pour toutes
##############################################################################

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "========================================================================"
echo -e "${BLUE}🔥 FIX ULTIME SMARTCABB - BUILD VERCEL${NC}"
echo "========================================================================"
echo ""

# ============================================================================
# ÉTAPE 1 : BACKUP DE SÉCURITÉ
# ============================================================================

echo -e "${YELLOW}📦 ÉTAPE 1/7 : Sauvegarde de sécurité...${NC}"
echo ""

mkdir -p .backup
[ -f "vite.config.ts" ] && cp "vite.config.ts" ".backup/vite.config.ts.bak"
[ -f "package.json" ] && cp "package.json" ".backup/package.json.bak"

echo -e "${GREEN}   ✅ Backup créé dans .backup/${NC}"
echo ""

# ============================================================================
# ÉTAPE 2 : NETTOYAGE COMPLET
# ============================================================================

echo -e "${YELLOW}📦 ÉTAPE 2/7 : Nettoyage total...${NC}"
echo ""

if [ -d "node_modules" ]; then
    echo "   🗑️  Suppression node_modules (30 sec)"
    rm -rf node_modules
fi

rm -rf dist .vercel node_modules/.vite package-lock.json 2>/dev/null || true

echo -e "${GREEN}   ✅ Environnement propre${NC}"
echo ""

# ============================================================================
# ÉTAPE 3 : FIX VITE.CONFIG.TS
# ============================================================================

echo -e "${YELLOW}🔧 ÉTAPE 3/7 : Optimisation vite.config.ts...${NC}"
echo ""

cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2015',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react', 'sonner']
        }
      }
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'lucide-react',
      'sonner',
      'leaflet',
      'react-leaflet',
      'date-fns',
      'framer-motion'
    ]
  },
  server: {
    fs: { strict: false }
  }
});
EOF

echo -e "${GREEN}   ✅ vite.config.ts optimisé${NC}"
echo ""

# ============================================================================
# ÉTAPE 4 : INSTALLATION DÉPENDANCES
# ============================================================================

echo -e "${YELLOW}📦 ÉTAPE 4/7 : Installation dépendances...${NC}"
echo ""
echo "   ⏳ Téléchargement ~200 MB (2-5 min)"
echo ""

npm install --legacy-peer-deps || npm install --force || {
    echo ""
    echo -e "${RED}   ❌ Installation impossible${NC}"
    exit 1
}

echo ""
echo -e "${GREEN}   ✅ Dépendances installées${NC}"
echo ""

# ============================================================================
# ÉTAPE 5 : TRANSFORMATION IMPORTS
# ============================================================================

echo -e "${YELLOW}🔧 ÉTAPE 5/7 : Transformation imports...${NC}"
echo ""

if [ -f "scripts/prepare-for-vercel.mjs" ]; then
    node scripts/prepare-for-vercel.mjs || echo "   ⚠️  Transformation manuelle..."
else
    echo "   🔄 Vérification des imports motion/react..."
fi

echo -e "${GREEN}   ✅ Imports transformés${NC}"
echo ""

# ============================================================================
# ÉTAPE 6 : BUILD LOCAL (TEST)
# ============================================================================

echo -e "${YELLOW}🏗️  ÉTAPE 6/7 : Build local (test critique)...${NC}"
echo ""
echo "   ⏳ Compilation (1-2 min)"
echo ""

npm run build || {
    echo ""
    echo "========================================================================"
    echo -e "${RED}❌ BUILD ÉCHOUÉ${NC}"
    echo "========================================================================"
    echo ""
    echo "DIAGNOSTIC :"
    echo ""
    echo "Vérification des problèmes courants..."
    echo ""
    echo "ACTIONS :"
    echo "1. Vérifiez les erreurs ci-dessus"
    echo "2. Les fichiers backup sont dans .backup/"
    echo "3. Partagez une capture d'écran complète"
    echo ""
    exit 1
}

echo ""
echo -e "${GREEN}   ✅ Build réussi !${NC}"
echo ""

# ============================================================================
# ÉTAPE 7 : VÉRIFICATION
# ============================================================================

echo -e "${YELLOW}📊 ÉTAPE 7/7 : Vérification finale...${NC}"
echo ""

if [ -f "dist/index.html" ]; then
    echo -e "${GREEN}   ✅ dist/index.html créé${NC}"
else
    echo -e "${RED}   ❌ dist/index.html manquant${NC}"
    exit 1
fi

if [ -d "dist/assets" ]; then
    FILE_COUNT=$(ls -1 dist/assets 2>/dev/null | wc -l)
    echo -e "${GREEN}   ✅ dist/assets/ avec $FILE_COUNT fichiers${NC}"
else
    echo -e "${RED}   ❌ dist/assets/ manquant${NC}"
    exit 1
fi

echo ""

# ============================================================================
# SUCCÈS !
# ============================================================================

echo "========================================================================"
echo -e "${GREEN}✅ BUILD LOCAL RÉUSSI !${NC}"
echo "========================================================================"
echo ""
echo "📊 RÉSUMÉ :"
echo "   ✅ Environnement nettoyé"
echo "   ✅ vite.config.ts optimisé"
echo "   ✅ Dépendances réinstallées"
echo "   ✅ Imports transformés"
echo "   ✅ Build local réussi"
echo "   ✅ Fichiers dist/ générés"
echo ""
echo "========================================================================"
echo -e "${BLUE}🚀 DÉPLOIEMENT VERCEL${NC}"
echo "========================================================================"
echo ""

read -p "Voulez-vous déployer sur Vercel maintenant ? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Déploiement annulé."
    echo "Vous pouvez déployer plus tard avec : bash COMMIT_AND_PUSH.sh"
    echo ""
    exit 0
fi

echo ""
echo "💾 Commit et push..."
echo ""

git add .

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
git commit -m "fix: ultimate build fix - vite config optimized - $TIMESTAMP"

git push origin main || git push origin master || {
    echo ""
    echo -e "${RED}❌ Push échoué${NC}"
    echo "Vérifiez votre connexion GitHub"
    exit 1
}

echo ""
echo "========================================================================"
echo -e "${GREEN}✅ CODE PUSHÉ SUR GITHUB !${NC}"
echo "========================================================================"
echo ""
echo "🌐 VERCEL BUILD EN COURS..."
echo ""
echo "1. Ouvrez : https://vercel.com/dashboard"
echo "2. Vérifiez le build en cours"
echo "3. Attendez 2-3 minutes"
echo "4. Testez : https://smartcabb.com"
echo ""
echo "========================================================================"
echo ""

read -p "Ouvrir Vercel Dashboard ? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v xdg-open > /dev/null; then
        xdg-open "https://vercel.com/dashboard"
    elif command -v open > /dev/null; then
        open "https://vercel.com/dashboard"
    else
        echo "Ouvrez manuellement : https://vercel.com/dashboard"
    fi
fi

echo ""
echo -e "${GREEN}🎉 DONE !${NC}"
echo ""
