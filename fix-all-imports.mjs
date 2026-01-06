#!/usr/bin/env node

/**
 * SCRIPT ULTIME DE CORRECTION - IMPORTS VERCEL
 * Corrige TOUS les imports problématiques pour compatibilité npm/Vercel
 * Version 2.0 - Plus complet et plus robuste
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

let filesModified = 0;
let totalReplacements = 0;
const modifiedFiles = [];

const CORRECTIONS = [
  {
    pattern: /from ['"]lucide-react@[^'"]*['"]/g,
    replacement: "from 'lucide-react'",
    name: 'lucide-react@X.X.X → lucide-react'
  },
  {
    pattern: /from ['"]sonner@[^'"]*['"]/g,
    replacement: "from 'sonner'",
    name: 'sonner@X.X.X → sonner'
  },
  {
    pattern: /from ['"]motion\/react['"]/g,
    replacement: "from 'framer-motion'",
    name: 'motion/react → framer-motion'
  },
  {
    pattern: /from ['"]framer-motion@[^'"]*['"]/g,
    replacement: "from 'framer-motion'",
    name: 'framer-motion@X.X.X → framer-motion'
  },
  {
    pattern: /from ['"]react-hook-form@[^'"]*['"]/g,
    replacement: "from 'react-hook-form'",
    name: 'react-hook-form@X.X.X → react-hook-form'
  }
];

function fixFile(filePath) {
  try {
    let content = readFileSync(filePath, 'utf8');
    let modified = false;
    let count = 0;
    const replacements = [];
    
    CORRECTIONS.forEach(({ pattern, replacement, name }) => {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, replacement);
        count += matches.length;
        modified = true;
        replacements.push(`${name} (${matches.length}x)`);
      }
    });
    
    if (modified) {
      writeFileSync(filePath, content, 'utf8');
      filesModified++;
      totalReplacements += count;
      const relPath = relative(process.cwd(), filePath);
      modifiedFiles.push({ path: relPath, replacements });
      console.log(`  ✅ ${relPath}`);
      replacements.forEach(r => console.log(`     → ${r}`));
    }
  } catch (error) {
    console.error(`  ❌ Erreur: ${filePath}`, error.message);
  }
}

function scanDirectory(dir) {
  try {
    const items = readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = join(dir, item);
      const ignored = ['node_modules', '.git', 'dist', '.next', '.backup', '.vercel', 'build'];
      
      if (ignored.includes(item)) return;
      
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (item.endsWith('.tsx') || item.endsWith('.ts') || item.endsWith('.jsx') || item.endsWith('.js')) {
        fixFile(fullPath);
      }
    });
  } catch (error) {
    console.error(`Erreur scan: ${dir}`, error.message);
  }
}

console.log('\n🚀 CORRECTION COMPLÈTE DES IMPORTS\n');
console.log('═'.repeat(80));

const startTime = Date.now();
scanDirectory(process.cwd());
const duration = ((Date.now() - startTime) / 1000).toFixed(2);

console.log('\n' + '═'.repeat(80));
console.log('📊 RÉSULTAT FINAL');
console.log('═'.repeat(80));
console.log(`✨ Fichiers modifiés:     ${filesModified}`);
console.log(`🔄 Remplacements totaux:  ${totalReplacements}`);
console.log(`⏱️  Durée:                ${duration}s`);
console.log('═'.repeat(80));

if (filesModified === 0) {
  console.log('\n✅ PARFAIT ! Tous les imports sont déjà corrects!\n');
} else {
  console.log('\n🎉 CORRECTION TERMINÉE AVEC SUCCÈS!\n');
  console.log('📋 Corrections effectuées:');
  CORRECTIONS.forEach(({ name }) => {
    console.log(`   ✓ ${name}`);
  });
  console.log('\n💡 Prochaines étapes:');
  console.log('   1. git add .');
  console.log('   2. git commit -m "fix: Correction imports pour Vercel build"');
  console.log('   3. git push origin main\n');
}
