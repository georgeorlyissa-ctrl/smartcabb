#!/bin/bash

# ========================================
# SMARTCABB - FIX IMPORTS VERCEL
# ========================================
# Copier-coller ces 3 lignes dans le terminal GitHub Codespace
# ========================================

echo "🚀 Correction des imports SmartCabb..."

# LIGNE 1: Créer et exécuter le script de correction
node -e "
const fs = require('fs');
const path = require('path');

const fixes = [
  [/from ['\\x22]lucide-react@[^'\\x22]*['\\x22]/g, \\\"from 'lucide-react'\\\"],
  [/from ['\\x22]sonner@[^'\\x22]*['\\x22]/g, \\\"from 'sonner'\\\"],
  [/from ['\\x22]motion\\/react['\\x22]/g, \\\"from 'framer-motion'\\\"],
  [/from ['\\x22]framer-motion@[^'\\x22]*['\\x22]/g, \\\"from 'framer-motion'\\\"],
  [/from ['\\x22]react-hook-form@[^'\\x22]*['\\x22]/g, \\\"from 'react-hook-form'\\\"]
];

let count = 0;

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  fixes.forEach(([regex, replacement]) => {
    if (regex.test(content)) {
      content = content.replace(regex, replacement);
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    count++;
    console.log('  ✅', path.relative(process.cwd(), filePath));
  }
}

function scanDir(dir) {
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const ignored = ['node_modules', '.git', 'dist', '.next', '.backup', '.vercel'];
    
    if (ignored.includes(item)) return;
    
    if (fs.statSync(fullPath).isDirectory()) {
      scanDir(fullPath);
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      fixFile(fullPath);
    }
  });
}

console.log('');
console.log('🔧 Correction des imports en cours...');
console.log('');

const startTime = Date.now();
scanDir(process.cwd());
const duration = ((Date.now() - startTime) / 1000).toFixed(2);

console.log('');
console.log('='.repeat(60));
console.log('📊 RÉSULTAT');
console.log('='.repeat(60));
console.log('Fichiers corrigés:', count);
console.log('Durée:', duration + 's');
console.log('='.repeat(60));

if (count === 0) {
  console.log('');
  console.log('✨ Tous les imports sont déjà corrects!');
  console.log('');
} else {
  console.log('');
  console.log('🎉 CORRECTION RÉUSSIE!');
  console.log('');
}
"

echo ""
echo "=========================================="
echo "✅ ÉTAPE 1/3 TERMINÉE"
echo "=========================================="
echo ""

# Vérification
echo "🔍 Vérification des imports restants..."
LUCIDE=$(grep -r "lucide-react@" --include="*.tsx" --include="*.ts" . 2>/dev/null | grep -v node_modules | wc -l | tr -d ' ')
SONNER=$(grep -r "sonner@" --include="*.tsx" --include="*.ts" . 2>/dev/null | grep -v node_modules | wc -l | tr -d ' ')
MOTION=$(grep -r "from ['\"]motion/react" --include="*.tsx" --include="*.ts" . 2>/dev/null | grep -v node_modules | wc -l | tr -d ' ')

echo "   lucide-react@ restants: $LUCIDE"
echo "   sonner@ restants:       $SONNER"
echo "   motion/react restants:  $MOTION"
echo ""

if [ "$LUCIDE" = "0" ] && [ "$SONNER" = "0" ] && [ "$MOTION" = "0" ]; then
  echo "✅ Vérification réussie! Tous les imports sont corrects."
  echo ""
  echo "=========================================="
  echo "📦 PROCHAINES ÉTAPES:"
  echo "=========================================="
  echo ""
  echo "Exécuter ces commandes pour commit et push:"
  echo ""
  echo "  git add ."
  echo "  git commit -m \"fix: correction imports pour build Vercel\""
  echo "  git push origin main"
  echo ""
  echo "Puis Vercel va automatiquement rebuilder le site ✅"
  echo ""
else
  echo "⚠️  Attention: Il reste des imports problématiques"
  echo "   Relancer le script ou corriger manuellement"
  echo ""
fi

echo "=========================================="
echo "✅ SCRIPT TERMINÉ"
echo "=========================================="
