#!/usr/bin/env node

/**
 * 🔧 Script de transformation des imports pour Figma Make
 * 
 * Ce script transforme TOUS les imports directs de framer-motion et lucide-react
 * en imports relatifs vers les wrappers locaux.
 * 
 * USAGE:
 *   node scripts/prepare-for-figma.mjs
 * 
 * AVANT (Vercel):
 *   import { motion } from 'motion/react';
 *   import { Star } from 'lucide-react';
 * 
 * APRÈS (Figma Make):
 *   import { motion } from './framer-motion';
 *   import { Star } from './lucide-react';
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

let filesProcessed = 0;
let filesModified = 0;
let totalReplacements = 0;

/**
 * Calcule le chemin relatif correct vers les wrappers
 */
function getRelativePath(filePath) {
  const relativePath = path.relative(path.dirname(filePath), ROOT_DIR);
  return relativePath || '.';
}

/**
 * Parcourt récursivement tous les fichiers .tsx et .ts
 */
function getAllTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!['node_modules', '.git', '.next', 'dist', 'build', '.vercel', 'scripts'].includes(file)) {
        getAllTsFiles(filePath, fileList);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      // Ne pas traiter les wrappers eux-mêmes
      if (!file.includes('framer-motion') && !file.includes('lucide-react')) {
        fileList.push(filePath);
      }
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

  // Calculer le chemin relatif vers la racine
  const relPath = getRelativePath(filePath);
  const wrapperPath = relPath === '.' ? '.' : relPath;

  // Pattern pour motion/react
  const motionPattern = /from\s+['"]motion\/react['"]/g;
  
  if (motionPattern.test(content)) {
    content = content.replace(motionPattern, `from '${wrapperPath}/framer-motion'`);
    modified = true;
    replacements++;
  }

  // Pattern pour lucide-react (imports directs uniquement, pas les wrappers)
  const lucidePattern = /from\s+['"]lucide-react['"]/g;
  
  if (lucidePattern.test(content)) {
    content = content.replace(lucidePattern, `from '${wrapperPath}/lucide-react'`);
    modified = true;
    replacements++;
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
  console.log('🎨 Transformation des imports pour Figma Make...\n');

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
    console.log('💡 Les imports utilisent maintenant les wrappers Figma Make.\n');
  } else {
    console.log('\n ℹ️  Aucune modification nécessaire.\n');
  }
}

main();
