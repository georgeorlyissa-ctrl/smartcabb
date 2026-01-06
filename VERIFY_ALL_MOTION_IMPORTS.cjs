#!/usr/bin/env node

/**
 * 🔍 VÉRIFICATION COMPLÈTE DES IMPORTS MOTION
 * 
 * Vérifie que tous les fichiers utilisant motion l'importent correctement
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = process.cwd();
const EXTENSIONS = ['.ts', '.tsx'];
const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', 'build', '.next', '.vercel'];

let issues = [];
let filesChecked = 0;

function shouldExcludeDir(dirName) {
  return EXCLUDE_DIRS.includes(dirName);
}

function shouldProcessFile(fileName) {
  return EXTENSIONS.some(ext => fileName.endsWith(ext));
}

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
    console.error(`Erreur lecture ${dirPath}: ${error.message}`);
  }
  
  return files;
}

function checkMotionImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(ROOT_DIR, filePath);
    filesChecked++;
    
    // Vérifier si le fichier utilise motion
    const usesMotion = content.match(/<motion\.|motion\./);
    
    if (usesMotion) {
      // Vérifier s'il importe motion
      const hasMotionImport = content.match(/import\s*{\s*motion\s*}\s*from\s*['"].*framer-motion/);
      
      if (!hasMotionImport) {
        issues.push({
          file: relativePath,
          type: 'MISSING_MOTION_IMPORT',
          message: 'Utilise motion mais ne l\'importe pas'
        });
      } else {
        // Vérifier le chemin d'import
        const importMatch = content.match(/import\s*{\s*motion\s*}\s*from\s*['"](.*framer-motion.*)['"]/);
        if (importMatch) {
          const importPath = importMatch[1];
          // Doit être '../framer-motion' ou '../../framer-motion' etc.
          if (!importPath.match(/^\.\.?\/.*(framer-motion|motion-wrapper)/)) {
            issues.push({
              file: relativePath,
              type: 'WRONG_MOTION_PATH',
              message: `Import motion incorrect: ${importPath} (doit être relatif comme '../framer-motion')`
            });
          }
        }
      }
    }
    
  } catch (error) {
    console.error(`Erreur traitement ${filePath}: ${error.message}`);
  }
}

function main() {
  console.log('🔍 VÉRIFICATION DES IMPORTS MOTION\n');
  console.log(`📁 Répertoire: ${ROOT_DIR}\n`);
  
  const files = scanDirectory(ROOT_DIR);
  console.log(`📊 ${files.length} fichiers à vérifier...\n`);
  
  files.forEach(file => checkMotionImports(file));
  
  console.log('='.repeat(60));
  console.log('📊 RAPPORT DE VÉRIFICATION MOTION');
  console.log('='.repeat(60));
  console.log(`\n📄 Fichiers vérifiés: ${filesChecked}`);
  
  if (issues.length === 0) {
    console.log('\n✅ AUCUN PROBLÈME DÉTECTÉ !');
    console.log('✅ Tous les imports motion sont corrects');
    console.log('✅ Le code est prêt pour l\'exécution\n');
    process.exit(0);
  }
  
  console.log(`\n❌ ${issues.length} PROBLÈME(S) DÉTECTÉ(S)\n`);
  
  issues.forEach(issue => {
    console.log(`📄 ${issue.file}`);
    console.log(`   ${issue.message}\n`);
  });
  
  console.log('='.repeat(60));
  console.log('\n🔧 CORRECTION SUGGÉRÉE:');
  console.log('   Ajoutez en haut de chaque fichier:');
  console.log('   import { motion } from \'../framer-motion\';');
  console.log('   (ajustez le nombre de ../ selon la profondeur)\n');
  
  process.exit(1);
}

main();
