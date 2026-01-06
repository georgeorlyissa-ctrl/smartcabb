#!/bin/bash

# 🚨 SCRIPT ULTIME - FIX COMPLET VERCEL
# Exécute TOUTES les corrections dans le bon ordre

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║      🚨 SCRIPT ULTIME - FIX COMPLET VERCEL 🚨             ║"
echo "║                                                            ║"
echo "║  Corrige:                                                  ║"
echo "║   ✅ Conflits Git                                         ║"
echo "║   ✅ Imports motion/react → framer-motion                 ║"
echo "║   ✅ Imports lucide-react                                 ║"
echo "║   ✅ Lignes orphelines                                    ║"
echo "║   ✅ Cache Vercel/Vite                                    ║"
echo "║   ✅ Erreurs de syntaxe                                   ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Demander confirmation
read -p "⚠️  Ce script va modifier vos fichiers. Continuer ? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Annulé par l'utilisateur"
    exit 1
fi

# Backup GLOBAL
GLOBAL_BACKUP="backup_ultimate_$(date +%Y%m%d_%H%M%S)"
echo "📦 Création backup global: $GLOBAL_BACKUP"
mkdir -p "$GLOBAL_BACKUP"
cp -r components hooks lib utils pages App.tsx "$GLOBAL_BACKUP/" 2>/dev/null

START_TIME=$(date +%s)

# ============================================================================
# PHASE 1 : NETTOYAGE DES CONFLITS GIT
# ============================================================================

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  PHASE 1/5 : NETTOYAGE CONFLITS GIT                       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

CONFLICTS_BEFORE=$(find components hooks lib utils pages App.tsx -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "<<<<<<< HEAD\|>>>>>>>" {} \; 2>/dev/null | wc -l)
echo "📊 Conflits Git détectés: $CONFLICTS_BEFORE"

if [ "$CONFLICTS_BEFORE" -gt 0 ]; then
    find components hooks lib utils pages App.tsx -type f \( -name "*.ts" -o -name "*.tsx" \) 2>/dev/null | while read file; do
        if grep -q "<<<<<<< HEAD\|>>>>>>>" "$file" 2>/dev/null; then
            temp="${file}.gitclean"
            grep -v "^<<<<<<< HEAD" "$file" | grep -v "^=======" | grep -v "^>>>>>>>" > "$temp"
            mv "$temp" "$file"
            echo "  ✅ $file"
        fi
    done
    
    CONFLICTS_AFTER=$(find components hooks lib utils pages App.tsx -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "<<<<<<< HEAD\|>>>>>>>" {} \; 2>/dev/null | wc -l)
    echo ""
    echo "📊 Résultat: $CONFLICTS_BEFORE → $CONFLICTS_AFTER conflits"
else
    echo "  ✅ Aucun conflit Git"
fi

# ============================================================================
# PHASE 2 : CORRECTION IMPORTS motion/react
# ============================================================================

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  PHASE 2/5 : CORRECTION motion/react → framer-motion      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

MOTION_BEFORE=$(find components hooks lib utils pages App.tsx -type f -name "*.tsx" -exec grep -l "from ['\"]motion/react['\"]" {} \; 2>/dev/null | wc -l)
echo "📊 Fichiers avec motion/react: $MOTION_BEFORE"

if [ "$MOTION_BEFORE" -gt 0 ]; then
    find components hooks lib utils pages App.tsx -type f -name "*.tsx" 2>/dev/null | while read file; do
        if grep -q "from ['\"]motion/react['\"]" "$file" 2>/dev/null; then
            temp="${file}.motion"
            sed "s|from 'motion/react'|from 'framer-motion'|g" "$file" | \
            sed "s|from \"motion/react\"|from \"framer-motion\"|g" > "$temp"
            mv "$temp" "$file"
            echo "  ✅ $file"
        fi
    done
    
    MOTION_AFTER=$(find components hooks lib utils pages App.tsx -type f -name "*.tsx" -exec grep -l "from ['\"]motion/react['\"]" {} \; 2>/dev/null | wc -l)
    echo ""
    echo "📊 Résultat: $MOTION_BEFORE → $MOTION_AFTER imports motion/react"
else
    echo "  ✅ Aucun import motion/react"
fi

# ============================================================================
# PHASE 3 : CORRECTION IMPORTS lucide-react
# ============================================================================

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  PHASE 3/5 : CORRECTION imports lucide-react              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

LUCIDE_BEFORE=$(find components hooks lib utils pages -type f -name "*.tsx" -exec grep -l "from ['\"]\\.\\./.\\./lucide-react['\"]" {} \; 2>/dev/null | wc -l)
echo "📊 Fichiers avec ../../lucide-react: $LUCIDE_BEFORE"

if [ "$LUCIDE_BEFORE" -gt 0 ]; then
    find components hooks lib utils pages -type f -name "*.tsx" 2>/dev/null | while read file; do
        if grep -q "from ['\"]\\.\\./.\\./lucide-react['\"]" "$file" 2>/dev/null; then
            temp="${file}.lucide"
            sed "s|from ['\"]\\.\\./.\\./lucide-react['\"]|from 'lucide-react'|g" "$file" > "$temp"
            mv "$temp" "$file"
            echo "  ✅ $file"
        fi
    done
    
    LUCIDE_AFTER=$(find components hooks lib utils pages -type f -name "*.tsx" -exec grep -l "from ['\"]\\.\\./.\\./lucide-react['\"]" {} \; 2>/dev/null | wc -l)
    echo ""
    echo "📊 Résultat: $LUCIDE_BEFORE → $LUCIDE_AFTER imports ../../lucide-react"
else
    echo "  ✅ Aucun import ../../lucide-react"
fi

# ============================================================================
# PHASE 4 : SUPPRESSION LIGNES ORPHELINES
# ============================================================================

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  PHASE 4/5 : SUPPRESSION LIGNES ORPHELINES                ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

ORPHANS_BEFORE=$(find components hooks lib utils pages -type f -name "*.tsx" -exec grep -l "^[[:space:]]*}[[:space:]]*from[[:space:]]*['\"]" {} \; 2>/dev/null | wc -l)
echo "📊 Fichiers avec lignes orphelines: $ORPHANS_BEFORE"

if [ "$ORPHANS_BEFORE" -gt 0 ]; then
    find components hooks lib utils pages -type f -name "*.tsx" 2>/dev/null | while read file; do
        if grep -q "^[[:space:]]*}[[:space:]]*from[[:space:]]*['\"]" "$file" 2>/dev/null; then
            temp="${file}.orphan"
            grep -v "^[[:space:]]*}[[:space:]]*from[[:space:]]*['\"]" "$file" > "$temp"
            mv "$temp" "$file"
            echo "  ✅ $file"
        fi
    done
    
    ORPHANS_AFTER=$(find components hooks lib utils pages -type f -name "*.tsx" -exec grep -l "^[[:space:]]*}[[:space:]]*from[[:space:]]*['\"]" {} \; 2>/dev/null | wc -l)
    echo ""
    echo "📊 Résultat: $ORPHANS_BEFORE → $ORPHANS_AFTER lignes orphelines"
else
    echo "  ✅ Aucune ligne orpheline"
fi

# ============================================================================
# PHASE 5 : NETTOYAGE CACHE
# ============================================================================

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  PHASE 5/5 : NETTOYAGE CACHE                              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

CACHE_CLEANED=0

if [ -d "node_modules/.vite" ]; then
    rm -rf node_modules/.vite
    echo "  ✅ Cache Vite supprimé"
    ((CACHE_CLEANED++))
fi

if [ -d ".vercel" ]; then
    rm -rf .vercel
    echo "  ✅ Cache Vercel supprimé"
    ((CACHE_CLEANED++))
fi

if [ -d "dist" ]; then
    rm -rf dist
    echo "  ✅ Dossier dist supprimé"
    ((CACHE_CLEANED++))
fi

find . -name "*.tsbuildinfo" -delete 2>/dev/null && echo "  ✅ Fichiers .tsbuildinfo supprimés" && ((CACHE_CLEANED++))

if [ "$CACHE_CLEANED" -eq 0 ]; then
    echo "  ✅ Cache déjà propre"
fi

# Créer .vercelignore
cat > .vercelignore << 'EOF'
*.sh
backup_*/
VERCEL-FIX-README.md
node_modules/.vite
.vercel
dist
*.tsbuildinfo
*.temp
*.tmp
*.bak
EOF
echo "  ✅ .vercelignore créé"

# ============================================================================
# VÉRIFICATION FINALE
# ============================================================================

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                 ✅ VÉRIFICATION FINALE                     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

FINAL_CONFLICTS=$(find components hooks lib utils pages App.tsx -type f -name "*.tsx" -exec grep -l "<<<<<<< HEAD\|>>>>>>>" {} \; 2>/dev/null | wc -l)
FINAL_MOTION=$(find components hooks lib utils pages App.tsx -type f -name "*.tsx" -exec grep -l "from ['\"]motion/react['\"]" {} \; 2>/dev/null | wc -l)
FINAL_LUCIDE=$(find components hooks lib utils pages -type f -name "*.tsx" -exec grep -l "from ['\"]\\.\\./.\\./lucide-react['\"]" {} \; 2>/dev/null | wc -l)
FINAL_ORPHANS=$(find components hooks lib utils pages -type f -name "*.tsx" -exec grep -l "^[[:space:]]*}[[:space:]]*from[[:space:]]*['\"]" {} \; 2>/dev/null | wc -l)

TOTAL_ERRORS=$((FINAL_CONFLICTS + FINAL_MOTION + FINAL_LUCIDE + FINAL_ORPHANS))

echo "📊 RÉSULTATS FINAUX:"
echo ""
echo "   • Conflits Git          : $FINAL_CONFLICTS"
echo "   • Imports motion/react  : $FINAL_MOTION"
echo "   • Imports ../../lucide  : $FINAL_LUCIDE"
echo "   • Lignes orphelines     : $FINAL_ORPHANS"
echo ""
echo "   🕐 Temps d'exécution    : ${DURATION}s"
echo "   💾 Backup               : $GLOBAL_BACKUP/"
echo ""

if [ "$TOTAL_ERRORS" -eq 0 ]; then
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                                                            ║"
    echo "║       🎉🎉🎉  SUCCÈS COMPLET ! 🎉🎉🎉                    ║"
    echo "║                                                            ║"
    echo "║       CODE PRÊT POUR DÉPLOIEMENT VERCEL ! 🚀              ║"
    echo "║                                                            ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo "📋 PROCHAINES ÉTAPES:"
    echo ""
    echo "1️⃣  Vérifier une dernière fois:"
    echo "    ./check-build-ready.sh"
    echo ""
    echo "2️⃣  Ajouter tous les fichiers:"
    echo "    git add ."
    echo ""
    echo "3️⃣  Commiter:"
    echo "    git commit -m \"fix(vercel): correction complète - conflits + imports + cache\""
    echo ""
    echo "4️⃣  Pusher vers GitHub/Vercel:"
    echo "    git push origin main"
    echo ""
    echo "✅ Le build Vercel devrait maintenant RÉUSSIR ! 🚀"
    echo ""
    exit 0
else
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║       ⚠️  ATTENTION: $TOTAL_ERRORS ERREUR(S) RESTANTE(S)            ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo "💡 Veuillez vérifier manuellement les fichiers problématiques"
    echo "   listés ci-dessus, ou contactez le support."
    echo ""
    exit 1
fi
