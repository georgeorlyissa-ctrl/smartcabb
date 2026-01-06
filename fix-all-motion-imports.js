#!/usr/bin/env node

/**
 * 🔥 v517.108 - Script de correction automatique des imports motion/react
 * 
 * Ce script remplace tous les imports 'motion/react' par 'framer-motion'
 * dans tous les fichiers TypeScript/React du projet.
 * 
 * Usage: node fix-all-motion-imports.js
 */

const fs = require('fs');
const path = require('path');

// Couleurs pour le terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

console.log(`${colors.bright}${colors.blue}
╔════════════════════════════════════════════════════════════════╗
║  🔥 Fix Motion/React Imports - v517.108                       ║
║  Remplace 'motion/react' par 'framer-motion'                  ║
╚════════════════════════════════════════════════════════════════╝
${colors.reset}\n`);

let filesProcessed = 0;
let filesModified = 0;
let errors = 0;

/**
 * Parcourt récursivement un répertoire et traite les fichiers .tsx et .ts
 */
function processDirectory(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    // Ignorer node_modules, dist, .git, etc.
    if (entry.name === 'node_modules' || 
        entry.name === 'dist' || 
        entry.name === '.git' ||
        entry.name === '.next' ||
        entry.name === 'build') {
      continue;
    }

    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
      processFile(fullPath);
    }
  }
}

/**
 * Traite un fichier individuel
 */
function processFile(filePath) {
  try {
    filesProcessed++;
    
    // Lire le contenu du fichier
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Vérifier si le fichier contient 'motion/react'
    if (!content.includes("from 'motion/react'") && !content.includes('from "motion/react"')) {
      return; // Aucun changement nécessaire
    }

    // Remplacer les imports
    let newContent = content;
    newContent = newContent.replace(/from ['"]motion\/react['"]/g, "from 'framer-motion'");
    
    // Vérifier si des changements ont été effectués
    if (newContent !== content) {
      // Sauvegarder le fichier modifié
      fs.writeFileSync(filePath, newContent, 'utf8');
      filesModified++;
      
      console.log(`${colors.green}✅ Modifié:${colors.reset} ${filePath.replace(process.cwd(), '.')}`);
    }
    
  } catch (error) {
    errors++;
    console.error(`${colors.red}❌ Erreur:${colors.reset} ${filePath}`);
    console.error(`   ${error.message}`);
  }
}

// Démarrer le traitement depuis le répertoire courant
const startTime = Date.now();
processDirectory(process.cwd());
const duration = Date.now() - startTime;

// Afficher le résumé
console.log(`\n${colors.bright}${colors.blue}════════════════════════════════════════════════════════════════${colors.reset}`);
console.log(`${colors.bright}Résumé:${colors.reset}`);
console.log(`  📁 Fichiers analysés:  ${filesProcessed}`);
console.log(`  ${colors.green}✅ Fichiers modifiés:  ${filesModified}${colors.reset}`);
console.log(`  ${errors > 0 ? colors.red : colors.green}${errors > 0 ? '❌' : '✅'} Erreurs:           ${errors}${colors.reset}`);
console.log(`  ⏱️  Durée:             ${duration}ms`);
console.log(`${colors.bright}${colors.blue}════════════════════════════════════════════════════════════════${colors.reset}\n`);

if (filesModified > 0) {
  console.log(`${colors.yellow}📋 Prochaines étapes:${colors.reset}`);
  console.log(`  1. Vérifier les changements: ${colors.bright}git diff${colors.reset}`);
  console.log(`  2. Installer framer-motion:  ${colors.bright}npm install${colors.reset}`);
  console.log(`  3. Tester le build:          ${colors.bright}npm run build${colors.reset}`);
  console.log(`  4. Commit et push:           ${colors.bright}git add . && git commit -m "fix: motion/react → framer-motion (v517.108)" && git push${colors.reset}\n`);
}

// Code de sortie
process.exit(errors > 0 ? 1 : 0);
