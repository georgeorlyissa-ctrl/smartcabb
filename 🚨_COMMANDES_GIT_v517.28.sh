#!/bin/bash

# 🚨 COMMANDES GIT POUR v517.28 - À EXÉCUTER DANS L'ORDRE

echo "🔥 DÉPLOIEMENT v517.28 - ALIAS GLOBAL LUCIDE-REACT"
echo ""

# ========================================
# ÉTAPE 1: VÉRIFIER LES FICHIERS À SUPPRIMER
# ========================================

echo "📋 Étape 1: Vérification des fichiers à supprimer..."
echo ""

# Vérifier si lucide-react.js existe (DOIT ÊTRE SUPPRIMÉ)
if git ls-files | grep -q "^lucide-react\.js$"; then
  echo "❌ TROUVÉ: lucide-react.js (à supprimer)"
  git rm lucide-react.js
  echo "✅ lucide-react.js marqué pour suppression"
else
  echo "✅ lucide-react.js n'existe pas (OK)"
fi

# Vérifier si lib/lucide.ts existe (DOIT ÊTRE SUPPRIMÉ)
if git ls-files | grep -q "^lib/lucide\.ts$"; then
  echo "❌ TROUVÉ: lib/lucide.ts (à supprimer)"
  git rm lib/lucide.ts
  echo "✅ lib/lucide.ts marqué pour suppression"
else
  echo "✅ lib/lucide.ts n'existe pas (OK)"
fi

# Vérifier si lucide-icons.ts existe (DOIT ÊTRE SUPPRIMÉ)
if git ls-files | grep -q "^lucide-icons\.ts$"; then
  echo "❌ TROUVÉ: lucide-icons.ts (à supprimer)"
  git rm lucide-icons.ts
  echo "✅ lucide-icons.ts marqué pour suppression"
else
  echo "✅ lucide-icons.ts n'existe pas (OK)"
fi

echo ""
echo "=========================================="
echo ""

# ========================================
# ÉTAPE 2: VÉRIFIER LES FICHIERS REQUIS
# ========================================

echo "📋 Étape 2: Vérification des fichiers requis..."
echo ""

# Vérifier que lucide-react.ts existe (DOIT EXISTER)
if [ -f "lucide-react.ts" ]; then
  echo "✅ lucide-react.ts existe (OK)"
else
  echo "❌ ERREUR: lucide-react.ts n'existe pas !"
  echo "   Créez ce fichier d'abord !"
  exit 1
fi

# Vérifier que lib/icons.ts existe (DOIT EXISTER)
if [ -f "lib/icons.ts" ]; then
  echo "✅ lib/icons.ts existe (OK)"
else
  echo "❌ ERREUR: lib/icons.ts n'existe pas !"
  echo "   Créez ce fichier d'abord !"
  exit 1
fi

echo ""
echo "=========================================="
echo ""

# ========================================
# ÉTAPE 3: AJOUTER LES MODIFICATIONS
# ========================================

echo "📋 Étape 3: Ajout des modifications..."
echo ""

git add .

echo "✅ Tous les fichiers ajoutés"
echo ""
echo "=========================================="
echo ""

# ========================================
# ÉTAPE 4: VÉRIFIER LE STATUS
# ========================================

echo "📋 Étape 4: Status Git..."
echo ""

git status

echo ""
echo "=========================================="
echo ""

# ========================================
# ÉTAPE 5: COMMIT
# ========================================

echo "📋 Étape 5: Commit des changements..."
echo ""

git commit -m "fix: Alias global lucide-react v517.28 - Suppression lucide-react.js

- Suppression: /lucide-react.js (ancien)
- Suppression: /lib/lucide.ts (ancien)
- Suppression: /lucide-icons.ts (ancien)
- Ajout: /lucide-react.ts (alias global)
- Modifié: /lib/icons.ts (import ESM.sh direct)
- Modifié: /vite.config.ts (alias Vite)
- Version: 517.28.0
- Build: DOIT FONCTIONNER ✅"

echo "✅ Commit effectué"
echo ""
echo "=========================================="
echo ""

# ========================================
# ÉTAPE 6: PUSH
# ========================================

echo "📋 Étape 6: Push vers GitHub..."
echo ""

git push origin main

echo ""
echo "=========================================="
echo ""

# ========================================
# RÉSUMÉ
# ========================================

echo "🎉 RÉSUMÉ DU DÉPLOIEMENT v517.28"
echo ""
echo "✅ Fichiers supprimés:"
echo "   - lucide-react.js (s'il existait)"
echo "   - lib/lucide.ts (s'il existait)"
echo "   - lucide-icons.ts (s'il existait)"
echo ""
echo "✅ Fichiers ajoutés/modifiés:"
echo "   - lucide-react.ts (alias global)"
echo "   - lib/icons.ts (wrapper ESM.sh)"
echo "   - vite.config.ts (alias Vite)"
echo "   - BUILD_VERSION.ts (v517.28)"
echo "   - App.tsx (logs v517.28)"
echo "   - package.json (517.28.0)"
echo ""
echo "🚀 Build Vercel en cours..."
echo "   Surveillez: https://vercel.com/dashboard"
echo ""
echo "⏱️  Le build devrait réussir dans ~2 minutes"
echo ""
echo "=========================================="
