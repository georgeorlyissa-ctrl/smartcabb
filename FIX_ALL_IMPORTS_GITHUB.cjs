#!/usr/bin/env node

/**
 * 🚀 SCRIPT ULTRA-COMPLET DE CORRECTION DES IMPORTS
 * 
 * Corrige TOUS les imports avec versions dans TOUS les fichiers .ts et .tsx
 * - lucide-react@0.550.0 → lucide-react
 * - sonner@2.0.3 → sonner
 * 
 * Usage: node FIX_ALL_IMPORTS_GITHUB.cjs
 */

const fs = require('fs');
const path = require('path');

// Configuration
const ROOT_DIR = process.cwd();
const EXTENSIONS = ['.ts', '.tsx'];
const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', 'build', '.next', '.vercel'];

// Statistiques
let stats = {
  filesScanned: 0,
  filesModified: 0,
  lucideFixed: 0,
  sonnerFixed: 0,
  errors: []
};

/**
 * Vérifie si un répertoire doit être exclu
 */
function shouldExcludeDir(dirName) {
  return EXCLUDE_DIRS.includes(dirName);
}

/**
 * Vérifie si un fichier doit être traité
 */
function shouldProcessFile(fileName) {
  return EXTENSIONS.some(ext => fileName.endsWith(ext));
}

/**
 * Scanne récursivement un répertoire
 */
function scanDirectory(dirPath) {
  let files = [];
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!shouldExcludeDir(item)) {
          files = files.concat(scanDirectory(fullPath));
        }
      } else if (stat.isFile() && shouldProcessFile(item)) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    stats.errors.push(`Erreur lecture ${dirPath}: ${error.message}`);
  }
  
  return files;
}

/**
 * Corrige les imports dans un fichier
 */
function fixImportsInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    let newContent = content;
    let lucideCount = 0;
    let sonnerCount = 0;
    
    // Fix lucide-react@0.550.0 → lucide-react
    const lucideRegex = /lucide-react@0\.550\.0/g;
    const lucideMatches = newContent.match(lucideRegex);
    if (lucideMatches) {
      lucideCount = lucideMatches.length;
      newContent = newContent.replace(lucideRegex, 'lucide-react');
    }
    
    // Fix sonner@2.0.3 → sonner
    const sonnerRegex = /sonner@2\.0\.3/g;
    const sonnerMatches = newContent.match(sonnerRegex);
    if (sonnerMatches) {
      sonnerCount = sonnerMatches.length;
      newContent = newContent.replace(sonnerRegex, 'sonner');
    }
    
    // Si modifications, sauvegarder
    if (newContent !== originalContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      
      const relativePath = path.relative(ROOT_DIR, filePath);
      console.log(`✅ ${relativePath}`);
      
      if (lucideCount > 0) {
        console.log(`   📦 ${lucideCount} import(s) lucide-react corrigé(s)`);
        stats.lucideFixed += lucideCount;
      }
      if (sonnerCount > 0) {
        console.log(`   📦 ${sonnerCount} import(s) sonner corrigé(s)`);
        stats.sonnerFixed += sonnerCount;
      }
      
      stats.filesModified++;
      return true;
    }
    
    return false;
  } catch (error) {
    stats.errors.push(`Erreur traitement ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * MAIN
 */
function main() {
  console.log('🚀 DÉBUT DE LA CORRECTION DES IMPORTS\n');
  console.log(`📁 Répertoire racine: ${ROOT_DIR}`);
  console.log(`📝 Extensions: ${EXTENSIONS.join(', ')}`);
  console.log(`🚫 Répertoires exclus: ${EXCLUDE_DIRS.join(', ')}\n`);
  
  const startTime = Date.now();
  
  // 1. Scanner tous les fichiers
  console.log('🔍 Scan des fichiers...\n');
  const files = scanDirectory(ROOT_DIR);
  stats.filesScanned = files.length;
  
  console.log(`📊 ${files.length} fichiers trouvés\n`);
  console.log('🔧 Correction en cours...\n');
  
  // 2. Corriger chaque fichier
  files.forEach(file => {
    fixImportsInFile(file);
  });
  
  // 3. Afficher le rapport
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RAPPORT FINAL');
  console.log('='.repeat(60));
  console.log(`✅ Fichiers scannés:     ${stats.filesScanned}`);
  console.log(`✅ Fichiers modifiés:    ${stats.filesModified}`);
  console.log(`📦 Imports lucide-react: ${stats.lucideFixed}`);
  console.log(`📦 Imports sonner:       ${stats.sonnerFixed}`);
  console.log(`⏱️  Durée:               ${duration}s`);
  
  if (stats.errors.length > 0) {
    console.log('\n⚠️  ERREURS:');
    stats.errors.forEach(err => console.log(`   - ${err}`));
  }
  
  console.log('='.repeat(60));
  
  if (stats.filesModified > 0) {
    console.log('\n🎉 SUCCÈS ! Tous les imports ont été corrigés.');
    console.log('\n📝 PROCHAINES ÉTAPES:');
    console.log('   1. git add .');
    console.log('   2. git commit -m "fix: remove all package versions for Vercel compatibility"');
    console.log('   3. git push origin main');
  } else {
    console.log('\n✨ Aucune modification nécessaire. Tous les imports sont déjà corrects !');
  }
}

// Exécuter
main();
