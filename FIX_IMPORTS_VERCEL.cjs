#!/usr/bin/env node

/**
 * ========================================================
 * FIX IMPORTS POUR VERCEL - SmartCabb
 * ========================================================
 * 
 * Corrige TOUS les imports avec versions qui causent des erreurs sur Vercel
 * 
 * AVANT (esm.sh compatible):
 * - from 'sonner@2.0.3'
 * - from 'lucide-react@0.550.0'
 * 
 * APRÈS (Vercel compatible):
 * - from 'sonner'
 * - from 'lucide-react'
 */

const fs = require('fs');
const path = require('path');

let stats = {
  filesScanned: 0,
  filesModified: 0,
  sonnerFixed: 0,
  lucideFixed: 0
};

function fixFile(filePath) {
  stats.filesScanned++;
  
  const content = fs.readFileSync(filePath, 'utf8');
  let modified = content;
  let hasChanges = false;
  
  // Fix sonner@2.0.3 → sonner
  const sonnerBefore = (modified.match(/sonner@2\.0\.3/g) || []).length;
  modified = modified.replace(/from ['"]sonner@2\.0\.3['"]/g, "from 'sonner'");
  if (sonnerBefore > 0) {
    stats.sonnerFixed += sonnerBefore;
    hasChanges = true;
  }
  
  // Fix lucide-react@0.550.0 → lucide-react
  const lucideBefore = (modified.match(/lucide-react@0\.550\.0/g) || []).length;
  modified = modified.replace(/from ['"]lucide-react@0\.550\.0['"]/g, "from 'lucide-react'");
  if (lucideBefore > 0) {
    stats.lucideFixed += lucideBefore;
    hasChanges = true;
  }
  
  if (hasChanges) {
    fs.writeFileSync(filePath, modified, 'utf8');
    stats.filesModified++;
    console.log(`  ✅ ${path.relative(process.cwd(), filePath)}`);
  }
}

function scanDir(dir) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    // Skip ignorés
    if (['node_modules', 'dist', '.git', '.next', 'build', '.vercel'].includes(item)) {
      continue;
    }
    
    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (fullPath.match(/\.(tsx?|jsx?)$/)) {
      fixFile(fullPath);
    }
  }
}

console.log('\n🔧 CORRECTION DES IMPORTS POUR VERCEL\n');
console.log('=' .repeat(60));

const start = Date.now();
scanDir(process.cwd());
const duration = ((Date.now() - start) / 1000).toFixed(2);

console.log('\n' + '='.repeat(60));
console.log('📊 RAPPORT FINAL\n');
console.log(`  Fichiers scannés:    ${stats.filesScanned}`);
console.log(`  Fichiers modifiés:   ${stats.filesModified}`);
console.log(`  sonner corrigés:     ${stats.sonnerFixed}`);
console.log(`  lucide corrigés:     ${stats.lucideFixed}`);
console.log(`  Durée:               ${duration}s\n`);

if (stats.filesModified > 0) {
  console.log('🎉 CORRECTION TERMINÉE!\n');
  console.log('📋 PROCHAINES ÉTAPES:\n');
  console.log('   git add .');
  console.log('   git commit -m "fix: remove package versions for Vercel build compatibility"');
  console.log('   git push origin main\n');
} else {
  console.log('✅ Aucune modification nécessaire!\n');
}
