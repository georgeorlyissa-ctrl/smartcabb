#!/usr/bin/env node

/**
 * 🚀 Script de conversion Figma Make → Production Vercel
 * 
 * Convertit tous les imports avec versions (esm.sh) en imports normaux (npm)
 * 
 * AVANT (esm.sh):
 * - from 'lucide-react@0.550.0'
 * - from 'sonner@2.0.3'
 * - from 'framer-motion@10.16.4'
 * 
 * APRÈS (npm):
 * - from 'lucide-react'
 * - from 'sonner'
 * - from 'framer-motion'
 */

const fs = require('fs');
const path = require('path');

// Compteurs
let filesModified = 0;
let totalReplacements = 0;

/**
 * Remplace tous les imports avec versions par des imports sans version
 */
function fixImportsInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let modified = content;
  let fileChanged = false;
  
  // Pattern pour capturer: from 'package@version'
  const patterns = [
    // lucide-react@version → lucide-react
    { from: /from ['"]lucide-react@[^'"]*['"]/g, to: "from 'lucide-react'" },
    
    // sonner@version → sonner
    { from: /from ['"]sonner@[^'"]*['"]/g, to: "from 'sonner'" },
    
    // framer-motion@version → framer-motion
    { from: /from ['"]framer-motion@[^'"]*['"]/g, to: "from 'framer-motion'" },
    
    // motion/react → framer-motion (au cas où)
    { from: /from ['"]motion\/react['"]/g, to: "from 'framer-motion'" },
    
    // react-hook-form@version → react-hook-form (sans version pour npm)
    { from: /from ['"]react-hook-form@[^'"]*['"]/g, to: "from 'react-hook-form'" },
  ];
  
  patterns.forEach(({ from, to }) => {
    const matches = modified.match(from);
    if (matches) {
      modified = modified.replace(from, to);
      totalReplacements += matches.length;
      fileChanged = true;
    }
  });
  
  if (fileChanged) {
    fs.writeFileSync(filePath, modified, 'utf8');
    filesModified++;
    console.log(`  ✓ ${path.relative(process.cwd(), filePath)}`);
  }
  
  return fileChanged;
}

/**
 * Parcourt récursivement tous les fichiers .tsx et .ts
 */
function processDirectory(dir) {
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    // Ignorer node_modules, dist, .git, etc.
    if (item === 'node_modules' || item === 'dist' || item === '.git' || item === '.next') {
      return;
    }
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      fixImportsInFile(fullPath);
    }
  });
}

// Exécution
console.log('🔧 Conversion des imports pour production Vercel...\n');

const startTime = Date.now();
processDirectory(process.cwd());
const duration = ((Date.now() - startTime) / 1000).toFixed(2);

console.log('\n✅ Conversion terminée!');
console.log(`   Fichiers modifiés: ${filesModified}`);
console.log(`   Remplacements: ${totalReplacements}`);
console.log(`   Durée: ${duration}s`);
console.log('\n📦 Prochaines étapes:');
console.log('   1. Vérifier que package.json contient les bonnes dépendances');
console.log('   2. npm install');
console.log('   3. npm run build');
console.log('   4. git add .');
console.log('   5. git commit -m "Fix: Convert esm.sh imports to npm imports"');
console.log('   6. git push origin main');
