#!/usr/bin/env node

/**
 * 🔍 SCRIPT DE VÉRIFICATION COMPLÈTE DES IMPORTS
 * 
 * Vérifie tous les imports dans le projet et détecte:
 * - Imports vers des fichiers inexistants
 * - Fichiers manquant des imports React
 * - Imports avec des versions (déjà traité mais on vérifie)
 * 
 * Usage: node CHECK_ALL_IMPORTS.cjs
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = process.cwd();
const EXTENSIONS = ['.ts', '.tsx'];
const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', 'build', '.next', '.vercel'];

let issues = [];

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

function checkFileImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(ROOT_DIR, filePath);
    
    // 1. Vérifier les imports avec versions
    if (content.match(/from ['"]lucide-react@|from ['"]sonner@|from ['"]framer-motion@/)) {
      issues.push({
        file: relativePath,
        type: 'VERSION_IN_IMPORT',
        line: 'Multiple',
        message: 'Import avec version détecté (lucide-react@x.x.x, sonner@x.x.x, etc.)'
      });
    }
    
    // 2. Vérifier les imports vers des fichiers inexistants
    const importRegex = /import\s+(?:[\w{},\s*]+)\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      
      // Ignorer les imports de packages npm
      if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
        continue;
      }
      
      // Résoudre le chemin relatif
      const fileDir = path.dirname(filePath);
      const resolvedPath = path.resolve(fileDir, importPath);
      
      // Vérifier si le fichier existe (avec ou sans extension)
      const possiblePaths = [
        resolvedPath,
        resolvedPath + '.ts',
        resolvedPath + '.tsx',
        resolvedPath + '.js',
        resolvedPath + '.jsx',
        path.join(resolvedPath, 'index.ts'),
        path.join(resolvedPath, 'index.tsx')
      ];
      
      const exists = possiblePaths.some(p => {
        try {
          return fs.existsSync(p);
        } catch {
          return false;
        }
      });
      
      if (!exists) {
        issues.push({
          file: relativePath,
          type: 'MISSING_FILE',
          line: match.index,
          message: `Import vers fichier inexistant: ${importPath}`
        });
      }
    }
    
    // 3. Vérifier si le fichier utilise des hooks React sans les importer
    const usesReactHooks = content.match(/\b(useState|useEffect|useRef|useCallback|useMemo|useContext)\(/);
    const hasReactImport = content.match(/import\s+(?:[\w{},\s*]+)\s+from\s+['"]react['"]/);
    
    if (usesReactHooks && !hasReactImport) {
      issues.push({
        file: relativePath,
        type: 'MISSING_REACT_IMPORT',
        line: 'Top',
        message: 'Utilise des hooks React mais n\'importe pas React'
      });
    }
    
  } catch (error) {
    console.error(`Erreur traitement ${filePath}: ${error.message}`);
  }
}

function main() {
  console.log('🔍 VÉRIFICATION COMPLÈTE DES IMPORTS\n');
  console.log(`📁 Répertoire: ${ROOT_DIR}\n`);
  
  const files = scanDirectory(ROOT_DIR);
  console.log(`📊 ${files.length} fichiers à vérifier...\n`);
  
  files.forEach(file => checkFileImports(file));
  
  console.log('='.repeat(60));
  console.log('📊 RAPPORT DE VÉRIFICATION');
  console.log('='.repeat(60));
  
  if (issues.length === 0) {
    console.log('\n✅ AUCUN PROBLÈME DÉTECTÉ !');
    console.log('✅ Tous les imports sont corrects');
    console.log('✅ Le code est prêt pour le build Vercel\n');
    process.exit(0);
  }
  
  // Grouper par type
  const grouped = {};
  issues.forEach(issue => {
    if (!grouped[issue.type]) {
      grouped[issue.type] = [];
    }
    grouped[issue.type].push(issue);
  });
  
  console.log(`\n❌ ${issues.length} PROBLÈME(S) DÉTECTÉ(S)\n`);
  
  Object.keys(grouped).forEach(type => {
    const typeIssues = grouped[type];
    let title = '';
    
    switch (type) {
      case 'VERSION_IN_IMPORT':
        title = '📦 IMPORTS AVEC VERSIONS';
        break;
      case 'MISSING_FILE':
        title = '📁 FICHIERS MANQUANTS';
        break;
      case 'MISSING_REACT_IMPORT':
        title = '⚛️ IMPORTS REACT MANQUANTS';
        break;
      default:
        title = type;
    }
    
    console.log(`\n${title} (${typeIssues.length}):`);
    typeIssues.forEach(issue => {
      console.log(`  📄 ${issue.file}`);
      console.log(`     ${issue.message}\n`);
    });
  });
  
  console.log('='.repeat(60));
  console.log('\n⚠️ ACTION REQUISE:');
  console.log('   Corrigez les problèmes ci-dessus avant de déployer\n');
  
  process.exit(1);
}

main();
