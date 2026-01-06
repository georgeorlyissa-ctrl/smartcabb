#!/usr/bin/env node

/**
 * 🔧 Script de transformation des imports pour Vercel/GitHub
 * 
 * Ce script transforme TOUS les imports relatifs de framer-motion et lucide-react
 * en imports directs depuis node_modules.
 * 
 * USAGE:
 *   node scripts/prepare-for-vercel.mjs
 * 
 * AVANT (Figma Make):
 *   import { motion } from '../../framer-motion';
 *   import { Star } from '../../lucide-react';
 * 
 * APRÈS (Vercel):
 *   import { motion } from 'motion/react';
 *   import { Star } from 'lucide-react';
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Compteurs pour le rapport
let filesProcessed = 0;
let filesModified = 0;
let totalReplacements = 0;

/**
 * Parcourt récursivement tous les fichiers .tsx et .ts
 */
function getAllTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Ignorer node_modules, .git, etc.
      if (!['node_modules', '.git', '.next', 'dist', 'build', '.vercel'].includes(file)) {
        getAllTsFiles(filePath, fileList);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Transforme les imports dans un fichier
 */
function transformFile(filePath) {
  filesProcessed++;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let replacements = 0;

  // Pattern 1: import { ... } from '../framer-motion'
  // Pattern 2: import { ... } from '../../framer-motion'
  // Pattern 3: import { ... } from './framer-motion'
  const framerMotionPattern = /from\s+['"](\.\.\/)*(\.\/)?framer-motion['"]/g;
  
  if (framerMotionPattern.test(content)) {
    content = content.replace(framerMotionPattern, "from 'motion/react'");
    modified = true;
    replacements += (content.match(/from 'motion\/react'/g) || []).length;
  }

  // Pattern pour lucide-react
  const lucidePattern = /from\s+['"](\.\.\/)*(\.\/)?lucide-react['"]/g;
  
  if (lucidePattern.test(content)) {
    content = content.replace(lucidePattern, "from 'lucide-react'");
    modified = true;
    replacements += (content.match(/from 'lucide-react'/g) || []).length;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesModified++;
    totalReplacements += replacements;
    console.log(`✅ ${path.relative(ROOT_DIR, filePath)} (${replacements} imports)`);
  }

  return modified;
}

/**
 * Fonction principale
 */
function main() {
  console.log('🚀 Transformation des imports pour Vercel/GitHub...\n');

  const allFiles = getAllTsFiles(ROOT_DIR);
  
  console.log(`📁 ${allFiles.length} fichiers TypeScript trouvés\n`);

  allFiles.forEach(file => {
    transformFile(file);
  });

  console.log('\n' + '='.repeat(60));
  console.log('📊 RAPPORT DE TRANSFORMATION');
  console.log('='.repeat(60));
  console.log(`📄 Fichiers analysés    : ${filesProcessed}`);
  console.log(`✏️  Fichiers modifiés    : ${filesModified}`);
  console.log(`🔄 Imports transformés  : ${totalReplacements}`);
  console.log('='.repeat(60));

  if (filesModified > 0) {
    console.log('\n✅ Transformation réussie !');
    console.log('💡 Vous pouvez maintenant commit et push sur GitHub.');
    console.log('🌐 Le déploiement Vercel utilisera les imports corrects.\n');
  } else {
    console.log('\n ℹ️  Aucune modification nécessaire.\n');
  }
}

main();
