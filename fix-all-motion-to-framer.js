#!/usr/bin/env node

/**
 * 🔧 Script de correction pour Figma Make (esm.sh)
 * Remplace tous les imports:
 * - from 'motion/react' → from 'framer-motion@10.16.4'
 * - from "motion/react" → from 'framer-motion@10.16.4'
 */

const fs = require('fs');
const path = require('path');

const DIR = process.cwd();
const EXTENSIONS = ['.tsx', '.ts'];
let filesProcessed = 0;
let filesModified = 0;

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    
    // Ignorer node_modules, dist, .git
    if (file === 'node_modules' || file === 'dist' || file === '.git') {
      return;
    }
    
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (EXTENSIONS.some(ext => file.endsWith(ext))) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function processFile(filePath) {
  filesProcessed++;
  
  const content = fs.readFileSync(filePath, 'utf8');
  let modified = content;
  
  // Remplacer motion/react par framer-motion@10.16.4 (guillemets simples)
  modified = modified.replace(/from ['"]motion\/react['"]/g, "from 'framer-motion@10.16.4'");
  
  if (modified !== content) {
    fs.writeFileSync(filePath, modified, 'utf8');
    filesModified++;
    const relativePath = path.relative(DIR, filePath);
    console.log(`  ✅ ${relativePath}`);
    return true;
  }
  
  return false;
}

console.log('🔧 Correction des imports motion/react → framer-motion@10.16.4\n');
console.log('📁 Environnement: Figma Make (esm.sh)\n');

const files = getAllFiles(DIR);
console.log(`📊 ${files.length} fichiers TypeScript/React trouvés\n`);

console.log('🔄 Correction en cours...\n');
files.forEach(processFile);

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📊 Résumé:`);
console.log(`   Fichiers analysés: ${filesProcessed}`);
console.log(`   Fichiers modifiés: ${filesModified}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (filesModified > 0) {
  console.log('✅ Correction terminée!\n');
  console.log('Tous les imports utilisent maintenant:');
  console.log(`   import { motion } from 'framer-motion@10.16.4';\n`);
} else {
  console.log('✅ Aucune modification nécessaire - Tous les imports sont déjà corrects!\n');
}
