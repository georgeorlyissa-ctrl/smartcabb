#!/bin/bash

# Script de nettoyage COMPLET pour résoudre l'erreur 107

echo "🧹 NETTOYAGE TOTAL DE SMARTCABB"
echo "================================"
echo ""

# Supprimer TOUS les caches possibles
rm -rf node_modules
rm -rf .vite
rm -rf .vite-cache
rm -rf node_modules/.vite
rm -rf dist
rm -rf .vercel
rm -rf .turbo
rm -rf .cache
rm -rf .npm
rm -rf .yarn
rm -f package-lock.json
rm -f yarn.lock
rm -f npm-debug.log*
rm -f .DS_Store

# Chercher et supprimer tous les dossiers cachés de Vite
find . -name ".vite*" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "*.vite" -type d -exec rm -rf {} + 2>/dev/null || true

echo "✅ Nettoyage terminé"
echo ""
echo "Lancez maintenant:"
echo "  npm install --legacy-peer-deps"
echo "  npm run build"
