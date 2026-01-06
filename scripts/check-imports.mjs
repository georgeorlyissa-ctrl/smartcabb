#!/usr/bin/env node

/**
 * 🔍 Script de vérification des imports
 * 
 * Vérifie quel environnement est actuellement utilisé dans le code.
 * 
 * USAGE:
 *   node scripts/check-imports.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

let figmaImports = 0;
let vercelImports = 0;
let mixedFiles = [];

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
      if (!file.includes('framer-motion') && !file.includes('lucide-react')) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(ROOT_DIR, filePath);
  
  let hasFigma = false;
  let hasVercel = false;

  // Détection imports Figma Make
  if (/from\s+['"](\.\.\/)*(\.\/)?framer-motion['"]/.test(content)) {
    hasFigma = true;
    figmaImports++;
  }
  if (/from\s+['"](\.\.\/)*(\.\/)?lucide-react['"]/.test(content)) {
    hasFigma = true;
    figmaImports++;
  }

  // Détection imports Vercel
  if (/from\s+['"]motion\/react['"]/.test(content)) {
    hasVercel = true;
    vercelImports++;
  }
  if (/from\s+['"]lucide-react['"](?!['"])/.test(content)) {
    // Vérifier que ce n'est pas un import relatif
    if (!/from\s+['"]\./.test(content.match(/from\s+['"]lucide-react['"]/)?.[0] || '')) {
      hasVercel = true;
      vercelImports++;
    }
  }

  if (hasFigma && hasVercel) {
    mixedFiles.push(relativePath);
  }
}

function main() {
  console.log('🔍 Vérification des imports...\n');

  const allFiles = getAllTsFiles(ROOT_DIR);
  
  allFiles.forEach(file => checkFile(file));

  console.log('='.repeat(60));
  console.log('📊 RAPPORT DE VÉRIFICATION');
  console.log('='.repeat(60));
  console.log(`🎨 Imports Figma Make  : ${figmaImports}`);
  console.log(`🌐 Imports Vercel      : ${vercelImports}`);
  console.log('='.repeat(60));

  if (mixedFiles.length > 0) {
    console.log('\n⚠️  ATTENTION : Fichiers avec imports mixtes détectés !');
    console.log('Ces fichiers mélangent imports Figma Make ET Vercel :\n');
    mixedFiles.forEach(file => console.log(`  - ${file}`));
    console.log('\n💡 Solution : Exécutez un des scripts de transformation.\n');
  }

  if (figmaImports > 0 && vercelImports === 0) {
    console.log('\n✅ Environnement détecté : FIGMA MAKE');
    console.log('💡 Pour déployer sur Vercel : npm run prepare:vercel\n');
  } else if (vercelImports > 0 && figmaImports === 0) {
    console.log('\n✅ Environnement détecté : VERCEL/GITHUB');
    console.log('💡 Pour revenir à Figma Make : npm run prepare:figma\n');
  } else if (figmaImports === 0 && vercelImports === 0) {
    console.log('\n ℹ️  Aucun import Motion/Lucide détecté.\n');
  } else {
    console.log('\n❌ ENVIRONNEMENT MIXTE - Action requise !');
    console.log('💡 Exécutez npm run prepare:vercel OU npm run prepare:figma\n');
  }
}

main();
