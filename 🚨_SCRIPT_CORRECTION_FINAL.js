#!/usr/bin/env node

/**
 * ========================================================
 * SCRIPT DE CORRECTION AUTOMATIQUE - SMARTCABB v517.109+
 * ========================================================
 * 
 * Ce script corrige TOUS les imports problématiques qui causent
 * l'erreur "[plugin: npm] Failed to fetch" sur Vercel
 * 
 * PROBLEMES CORRIGES:
 * - lucide-react@0.550.0 → lucide-react
 * - sonner@2.0.3 → sonner
 * - motion/react → framer-motion
 * - framer-motion@X.X.X → framer-motion
 * - react-hook-form@X.X.X → react-hook-form
 * 
 * COMMENT L'UTILISER:
 * 1. Copier ce fichier dans le repo GitHub
 * 2. Ouvrir le terminal dans GitHub Codespace
 * 3. Exécuter: node 🚨_SCRIPT_CORRECTION_FINAL.js
 * 4. Commit et push les changements
 * 5. Vercel rebuild automatiquement
 */

const fs = require('fs');
const path = require('path');

// Compteurs pour le rapport final
let stats = {
  filesScanned: 0,
  filesModified: 0,
  totalReplacements: 0,
  lucideReplacements: 0,
  sonnerReplacements: 0,
  motionReplacements: 0,
  framerReplacements: 0,
  reactHookFormReplacements: 0
};

/**
 * Définition des corrections à appliquer
 */
const CORRECTIONS = [
  {
    name: 'lucide-react',
    pattern: /from ['"]lucide-react@[^'"]*['"]/g,
    replacement: "from 'lucide-react'",
    counterKey: 'lucideReplacements'
  },
  {
    name: 'sonner',
    pattern: /from ['"]sonner@[^'"]*['"]/g,
    replacement: "from 'sonner'",
    counterKey: 'sonnerReplacements'
  },
  {
    name: 'motion/react',
    pattern: /from ['"]motion\/react['"]/g,
    replacement: "from 'framer-motion'",
    counterKey: 'motionReplacements'
  },
  {
    name: 'framer-motion',
    pattern: /from ['"]framer-motion@[^'"]*['"]/g,
    replacement: "from 'framer-motion'",
    counterKey: 'framerReplacements'
  },
  {
    name: 'react-hook-form',
    pattern: /from ['"]react-hook-form@[^'"]*['"]/g,
    replacement: "from 'react-hook-form'",
    counterKey: 'reactHookFormReplacements'
  }
];

/**
 * Correction d'un fichier individuel
 */
function correctFile(filePath) {
  stats.filesScanned++;
  
  const content = fs.readFileSync(filePath, 'utf8');
  let modifiedContent = content;
  let fileWasModified = false;
  
  // Appliquer chaque correction
  CORRECTIONS.forEach(({ name, pattern, replacement, counterKey }) => {
    const matches = modifiedContent.match(pattern);
    if (matches) {
      modifiedContent = modifiedContent.replace(pattern, replacement);
      stats[counterKey] += matches.length;
      stats.totalReplacements += matches.length;
      fileWasModified = true;
    }
  });
  
  // Sauvegarder le fichier modifié
  if (fileWasModified) {
    fs.writeFileSync(filePath, modifiedContent, 'utf8');
    stats.filesModified++;
    const relativePath = path.relative(process.cwd(), filePath);
    console.log(`  ✅ ${relativePath}`);
  }
  
  return fileWasModified;
}

/**
 * Scanner récursivement un répertoire
 */
function scanDirectory(dir) {
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    // Ignorer les répertoires inutiles
    const ignoredDirs = ['node_modules', 'dist', '.git', '.next', '.backup', '.vercel', 'build'];
    if (ignoredDirs.includes(item)) {
      return;
    }
    
    // Traiter récursivement les sous-répertoires
    if (stat.isDirectory()) {
      scanDirectory(fullPath);
    }
    // Traiter les fichiers TypeScript/React
    else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      correctFile(fullPath);
    }
  });
}

/**
 * Affichage du rapport final
 */
function printReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 RAPPORT DE CORRECTION');
  console.log('='.repeat(60));
  console.log(`\n✅ Fichiers scannés:           ${stats.filesScanned}`);
  console.log(`✅ Fichiers modifiés:          ${stats.filesModified}`);
  console.log(`✅ Remplacements totaux:       ${stats.totalReplacements}\n`);
  console.log('📦 DÉTAILS PAR TYPE:');
  console.log(`   • lucide-react@X.X.X:      ${stats.lucideReplacements} corrections`);
  console.log(`   • sonner@X.X.X:            ${stats.sonnerReplacements} corrections`);
  console.log(`   • motion/react:            ${stats.motionReplacements} corrections`);
  console.log(`   • framer-motion@X.X.X:     ${stats.framerReplacements} corrections`);
  console.log(`   • react-hook-form@X.X.X:   ${stats.reactHookFormReplacements} corrections`);
  console.log('\n' + '='.repeat(60));
  
  if (stats.filesModified === 0) {
    console.log('\n✨ Tous les imports sont déjà corrects! Aucune modification nécessaire.\n');
  } else {
    console.log('\n🎉 CORRECTION TERMINÉE AVEC SUCCÈS!\n');
    console.log('📋 PROCHAINES ÉTAPES:');
    console.log('   1. Vérifier les fichiers modifiés ci-dessus');
    console.log('   2. Tester localement: npm run build');
    console.log('   3. Commit et push:');
    console.log('      git add .');
    console.log('      git commit -m "fix: correction imports pour build Vercel"');
    console.log('      git push origin main');
    console.log('   4. Vercel va automatiquement rebuild le site\n');
  }
}

/**
 * Point d'entrée principal
 */
function main() {
  console.log('\n🔧 CORRECTION AUTOMATIQUE DES IMPORTS SMARTCABB');
  console.log('='.repeat(60));
  console.log('\n📂 Scan du répertoire en cours...\n');
  
  const startTime = Date.now();
  
  try {
    scanDirectory(process.cwd());
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    printReport();
    console.log(`⏱️  Durée d'exécution: ${duration}s\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERREUR DURANT LA CORRECTION:');
    console.error(error);
    process.exit(1);
  }
}

// Lancer le script
main();
