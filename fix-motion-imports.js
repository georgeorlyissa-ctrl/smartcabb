#!/usr/bin/env node

/**
 * Script de correction automatique pour remplacer tous les imports
 * - from 'motion/react' → from 'framer-motion'
 * - from 'framer-motion@X.X.X' → from 'framer-motion'
 * 
 * Pour build Vite/Vercel (imports SANS version)
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
    const stat = fs.statSync(filePath);
    
    // Ignorer node_modules et dist
    if (file === 'node_modules' || file === 'dist' || file === '.git') {
      return;
    }
    
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
  
  // Remplacer tous les imports motion/react
  modified = modified.replace(/from ['"]motion\/react['"]/g, "from 'framer-motion'");
  
  // Remplacer tous les imports framer-motion@version
  modified = modified.replace(/from ['"]framer-motion@[^'"]+['"]/g, "from 'framer-motion'");
  
  if (modified !== content) {
    fs.writeFileSync(filePath, modified, 'utf8');
    filesModified++;
    console.log(`✅ ${path.relative(DIR, filePath)}`);
    return true;
  }
  
  return false;
}

console.log('🔧 Correction des imports framer-motion...\n');

const files = getAllFiles(DIR);
files.forEach(processFile);

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📊 Résumé:`);
console.log(`   Fichiers analysés: ${filesProcessed}`);
console.log(`   Fichiers modifiés: ${filesModified}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n✅ Correction terminée!');
console.log('\nProchaines étapes:');
console.log('  1. npm install');
console.log('  2. npm run build');
console.log('  3. git add . && git commit -m "fix: framer-motion imports for Vite"');
console.log('  4. git push origin main\n');
