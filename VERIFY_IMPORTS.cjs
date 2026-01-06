#!/usr/bin/env node

/**
 * 🔍 SCRIPT DE VÉRIFICATION DES IMPORTS
 * 
 * Vérifie qu'il ne reste AUCUN import avec version dans le code
 * 
 * Usage: node VERIFY_IMPORTS.cjs
 */

const fs = require('fs');
const path = require('path');

// Configuration
const ROOT_DIR = process.cwd();
const EXTENSIONS = ['.ts', '.tsx'];
const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', 'build', '.next', '.vercel'];

// Patterns à rechercher
const PROBLEMATIC_PATTERNS = [
  { name: 'lucide-react@0.550.0', regex: /lucide-react@0\.550\.0/g },
  { name: 'sonner@2.0.3', regex: /sonner@2\.0\.3/g }
];

// Résultats
let results = {
  filesScanned: 0,
  problemsFound: [],
  isClean: true
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
    console.error(`❌ Erreur lecture ${dirPath}: ${error.message}`);
  }
  
  return files;
}

/**
 * Vérifie un fichier
 */
function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(ROOT_DIR, filePath);
    
    for (const pattern of PROBLEMATIC_PATTERNS) {
      const matches = content.match(pattern.regex);
      
      if (matches) {
        results.isClean = false;
        results.problemsFound.push({
          file: relativePath,
          pattern: pattern.name,
          count: matches.length
        });
      }
    }
    
    results.filesScanned++;
  } catch (error) {
    console.error(`❌ Erreur lecture ${filePath}: ${error.message}`);
  }
}

/**
 * MAIN
 */
function main() {
  console.log('🔍 VÉRIFICATION DES IMPORTS\n');
  console.log(`📁 Répertoire racine: ${ROOT_DIR}`);
  console.log(`📝 Extensions: ${EXTENSIONS.join(', ')}`);
  console.log(`🚫 Répertoires exclus: ${EXCLUDE_DIRS.join(', ')}\n`);
  
  const startTime = Date.now();
  
  // 1. Scanner tous les fichiers
  console.log('🔍 Scan des fichiers...\n');
  const files = scanDirectory(ROOT_DIR);
  
  console.log(`📊 ${files.length} fichiers trouvés\n`);
  console.log('🔍 Vérification en cours...\n');
  
  // 2. Vérifier chaque fichier
  files.forEach(file => {
    checkFile(file);
  });
  
  // 3. Afficher le rapport
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log('='.repeat(60));
  console.log('📊 RAPPORT DE VÉRIFICATION');
  console.log('='.repeat(60));
  console.log(`✅ Fichiers scannés: ${results.filesScanned}`);
  console.log(`⏱️  Durée:           ${duration}s\n`);
  
  if (results.isClean) {
    console.log('🎉 SUCCÈS ! Aucun import avec version trouvé.');
    console.log('✅ Le code est prêt pour le build Vercel.\n');
    console.log('='.repeat(60));
    process.exit(0);
  } else {
    console.log(`❌ PROBLÈMES TROUVÉS : ${results.problemsFound.length} fichier(s)\n`);
    
    // Grouper par pattern
    const grouped = {};
    results.problemsFound.forEach(problem => {
      if (!grouped[problem.pattern]) {
        grouped[problem.pattern] = [];
      }
      grouped[problem.pattern].push(problem);
    });
    
    // Afficher par pattern
    Object.keys(grouped).forEach(pattern => {
      console.log(`📦 ${pattern}:`);
      grouped[pattern].forEach(problem => {
        console.log(`   - ${problem.file} (${problem.count} occurrence(s))`);
      });
      console.log('');
    });
    
    console.log('='.repeat(60));
    console.log('\n⚠️  ACTION REQUISE:');
    console.log('   Exécutez: node FIX_ALL_IMPORTS_GITHUB.cjs\n');
    process.exit(1);
  }
}

// Exécuter
main();
