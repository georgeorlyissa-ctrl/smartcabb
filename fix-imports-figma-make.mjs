#!/usr/bin/env node
/**
 * 🚀 Script de correction des imports pour FIGMA MAKE
 * Convertit tous les imports vers les wrappers locaux
 * v517.122 - SmartCabb Figma Make Fix
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🎨 SmartCabb Figma Make Import Fixer v517.122\n');
console.log('='.repeat(60));
console.log('🎯 Objectif: Corriger les imports pour Figma Make');
console.log('📦 Utilisation des wrappers locaux');
console.log('='.repeat(60) + '\n');

let filesFixed = 0;
let totalReplacements = 0;
const fixedFiles = [];

// Dossiers à ignorer
const IGNORED_DIRS = ['node_modules', '.git', '.next', 'dist', 'build', '.vercel', 'supabase', 'imports'];

// Fonction pour calculer le chemin relatif vers la racine
function getRelativePathToRoot(filePath) {
  const relativePath = path.relative(__dirname, path.dirname(filePath));
  const depth = relativePath === '' ? 0 : relativePath.split(path.sep).length;
  return depth === 0 ? '.' : '../'.repeat(depth).slice(0, -1);
}

// Fonction pour traiter un fichier
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let fileModified = false;
    let replacementCount = 0;
    
    // Calculer le chemin relatif vers les wrappers
    const pathToRoot = getRelativePathToRoot(filePath);
    const framerMotionPath = `${pathToRoot}/framer-motion`;
    const lucideReactPath = `${pathToRoot}/lucide-react`;
    
    // Pattern 1: from 'framer-motion' → from './framer-motion' ou '../framer-motion'
    const framerPattern = /from ['"]framer-motion['"]/g;
    if (framerPattern.test(content)) {
      newContent = newContent.replace(framerPattern, `from '${framerMotionPath}'`);
      replacementCount++;
      fileModified = true;
    }
    
    // Pattern 2: from 'motion/react' → from './framer-motion'
    const motionPattern = /from ['"]motion\/react['"]/g;
    if (motionPattern.test(newContent)) {
      newContent = newContent.replace(motionPattern, `from '${framerMotionPath}'`);
      replacementCount++;
      fileModified = true;
    }
    
    // Pattern 3: from 'framer-motion@version' → from './framer-motion'
    const framerVersionPattern = /from ['"]framer-motion@[^'"]*['"]/g;
    if (framerVersionPattern.test(newContent)) {
      newContent = newContent.replace(framerVersionPattern, `from '${framerMotionPath}'`);
      replacementCount++;
      fileModified = true;
    }
    
    // Pattern 4: from 'lucide-react' → from './lucide-react'
    const lucidePattern = /from ['"]lucide-react['"]/g;
    if (lucidePattern.test(newContent)) {
      newContent = newContent.replace(lucidePattern, `from '${lucideReactPath}'`);
      replacementCount++;
      fileModified = true;
    }
    
    // Pattern 5: from 'lucide-react@version' → from './lucide-react'
    const lucideVersionPattern = /from ['"]lucide-react@[^'"]*['"]/g;
    if (lucideVersionPattern.test(newContent)) {
      newContent = newContent.replace(lucideVersionPattern, `from '${lucideReactPath}'`);
      replacementCount++;
      fileModified = true;
    }
    
    // Écrire le fichier si modifié
    if (fileModified) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      filesFixed++;
      totalReplacements += replacementCount;
      const shortPath = path.relative(__dirname, filePath);
      fixedFiles.push(shortPath);
      console.log(`✅ ${shortPath} (${replacementCount} changement${replacementCount > 1 ? 's' : ''})`);
    }
    
  } catch (error) {
    console.error(`❌ Erreur sur ${filePath}: ${error.message}`);
  }
}

// Fonction pour parcourir récursivement les dossiers
function walkDirectory(dir) {
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      // Ignorer les dossiers système et les wrappers eux-mêmes
      if (IGNORED_DIRS.includes(item) || item === 'framer-motion.tsx' || item === 'lucide-react.ts') continue;
      
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        walkDirectory(fullPath);
      } else if (/\.(tsx?|jsx?)$/.test(item)) {
        processFile(fullPath);
      }
    }
  } catch (error) {
    console.error(`❌ Erreur lecture dossier ${dir}: ${error.message}`);
  }
}

// Démarrer le traitement
console.log('🔍 Recherche des fichiers à corriger...\n');
walkDirectory(__dirname);

// Afficher le résumé
console.log('\n' + '='.repeat(60));
console.log(`✨ RÉSULTAT FINAL`);
console.log('='.repeat(60));
console.log(`📁 Fichiers corrigés: ${filesFixed}`);
console.log(`🔄 Total remplacements: ${totalReplacements}`);
console.log('='.repeat(60));

if (filesFixed > 0) {
  console.log('\n📋 Fichiers modifiés (premiers 20):');
  fixedFiles.slice(0, 20).forEach((file, index) => {
    console.log(`   ${index + 1}. ${file}`);
  });
  
  if (fixedFiles.length > 20) {
    console.log(`   ... et ${fixedFiles.length - 20} autres fichiers`);
  }
  
  console.log('\n✅ Tous les imports ont été corrigés pour Figma Make!');
  console.log('🎨 L\'application devrait maintenant se compiler sans erreurs.');
} else {
  console.log('\n✅ Aucun fichier à corriger - tout est déjà bon pour Figma Make!');
}

console.log('\n');
