#!/usr/bin/env node

/**
 * SCRIPT DE CORRECTION AUTOMATIQUE - IMPORTS VERCEL
 * Corrige tous les imports problématiques en une seule exécution
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

let filesModified = 0;
let totalReplacements = 0;

const CORRECTIONS = [
  {
    pattern: /from ['\"]lucide-react@[^'\"]*['\"]/g,
    replacement: "from 'lucide-react'",
    name: 'lucide-react@X.X.X'
  },
  {
    pattern: /from ['\"]sonner@[^'\"]*['\"]/g,
    replacement: "from 'sonner'",
    name: 'sonner@X.X.X'
  },
  {
    pattern: /from ['"]motion\/react['"]/g,
    replacement: "from 'framer-motion'",
    name: 'motion/react'
  },
  {
    pattern: /from ['\"]framer-motion@[^'\"]*['\"]/g,
    replacement: "from 'framer-motion'",
    name: 'framer-motion@X.X.X'
  },
  {
    pattern: /from ['\"]react-hook-form@[^'\"]*['\"]/g,
    replacement: "from 'react-hook-form'",
    name: 'react-hook-form@X.X.X'
  }
];

function fixFile(filePath) {
  try {
    let content = readFileSync(filePath, 'utf8');
    let modified = false;
    let count = 0;
    
    CORRECTIONS.forEach(({ pattern, replacement, name }) => {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, replacement);
        count += matches.length;
        modified = true;
      }
    });
    
    if (modified) {
      writeFileSync(filePath, content, 'utf8');
      filesModified++;
      totalReplacements += count;
      console.log(`  ✅ ${relative(process.cwd(), filePath)}`);
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
      const ignored = ['node_modules', '.git', 'dist', '.next', '.backup', '.vercel'];
      
      if (ignored.includes(item)) return;
      
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        fixFile(fullPath);
      }
    });
  } catch (error) {
    console.error(`Erreur scan: ${dir}`, error.message);
  }
}

console.log('\n🔧 Correction des imports en cours...\n');

const startTime = Date.now();
scanDirectory(process.cwd());
const duration = ((Date.now() - startTime) / 1000).toFixed(2);

console.log('\n' + '='.repeat(60));
console.log('📊 RÉSULTAT');
console.log('='.repeat(60));
console.log(`Fichiers modifiés:   ${filesModified}`);
console.log(`Remplacements:       ${totalReplacements}`);
console.log(`Durée:               ${duration}s`);
console.log('='.repeat(60));

if (filesModified === 0) {
  console.log('\n✨ Tous les imports sont déjà corrects!\n');
} else {
  console.log('\n🎉 CORRECTION TERMINÉE AVEC SUCCÈS!\n');
  console.log('📋 Les imports suivants ont été corrigés:');
  console.log('   • lucide-react@X.X.X  → lucide-react');
  console.log('   • sonner@X.X.X        → sonner');
  console.log('   • motion/react        → framer-motion');
  console.log('   • framer-motion@X.X.X → framer-motion\n');
}