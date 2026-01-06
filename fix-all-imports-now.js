#!/usr/bin/env node

/**
 * Script de correction IMMÉDIATE de tous les imports avec versions
 * Corrige lucide-react@X.X.X, sonner@X.X.X, framer-motion@X.X.X, motion/react
 */

const fs = require('fs');
const path = require('path');

let filesModified = 0;
let totalReplacements = 0;

function fixImportsInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let modified = content;
  let fileChanged = false;
  
  const replacements = [
    // lucide-react avec toutes les versions possibles
    { from: /from ['"]lucide-react@[^'"]*['"]/g, to: "from 'lucide-react'" },
    
    // sonner avec toutes les versions
    { from: /from ['"]sonner@[^'"]*['"]/g, to: "from 'sonner'" },
    
    // framer-motion avec toutes les versions
    { from: /from ['"]framer-motion@[^'"]*['"]/g, to: "from 'framer-motion'" },
    
    // motion/react → framer-motion
    { from: /from ['"]motion\/react['"]/g, to: "from 'framer-motion'" },
    
    // react-hook-form avec version
    { from: /from ['"]react-hook-form@[^'"]*['"]/g, to: "from 'react-hook-form'" },
  ];
  
  replacements.forEach(({ from, to }) => {
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
    const relativePath = path.relative(process.cwd(), filePath);
    console.log(`  ✓ ${relativePath}`);
  }
  
  return fileChanged;
}

function processDirectory(dir) {
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (item === 'node_modules' || item === 'dist' || item === '.git' || item === '.next' || item === '.backup') {
      return;
    }
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      fixImportsInFile(fullPath);
    }
  });
}

console.log('🔧 Correction de TOUS les imports avec @version...\n');

const startTime = Date.now();
processDirectory(process.cwd());
const duration = ((Date.now() - startTime) / 1000).toFixed(2);

console.log('\n✅ Correction terminée!');
console.log(`   Fichiers modifiés: ${filesModified}`);
console.log(`   Remplacements: ${totalReplacements}`);
console.log(`   Durée: ${duration}s`);

if (filesModified === 0) {
  console.log('\n✨ Tous les imports sont déjà corrects!');
} else {
  console.log('\n📦 Prochaines étapes:');
  console.log('   1. Vérifier: grep -r "@0\\." --include="*.tsx" . | grep -v node_modules');
  console.log('   2. Rebuilder: npm run build');
}
