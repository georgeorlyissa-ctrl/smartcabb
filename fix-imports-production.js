#!/usr/bin/env node

/**
 * 🚀 SCRIPT DE CORRECTION DES IMPORTS POUR PRODUCTION VERCEL
 * 
 * Ce script corrige automatiquement tous les imports pour la production :
 * - Enlève les versions @0.550.0 de lucide-react
 * - Enlève les versions @2.0.3 de sonner
 * - Garde motion/react tel quel (avec alias vite.config.ts)
 */

const fs = require('fs');
const path = require('path');

// Compteurs
let filesProcessed = 0;
let filesModified = 0;
let totalReplacements = 0;

// Fonction pour traiter un fichier
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let modified = false;
    let replacements = 0;

    // Remplacement 1: lucide-react@0.550.0 -> lucide-react
    const lucideRegex1 = /from ['"]lucide-react@0\.550\.0['"]/g;
    if (lucideRegex1.test(content)) {
      newContent = newContent.replace(lucideRegex1, "from 'lucide-react'");
      modified = true;
      replacements += (content.match(lucideRegex1) || []).length;
    }

    // Remplacement 2: sonner@2.0.3 -> sonner
    const sonnerRegex = /from ['"]sonner@2\.0\.3['"]/g;
    if (sonnerRegex.test(content)) {
      newContent = newContent.replace(sonnerRegex, "from 'sonner'");
      modified = true;
      replacements += (content.match(sonnerRegex) || []).length;
    }

    // Écrire le fichier si modifié
    if (modified) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      filesModified++;
      totalReplacements += replacements;
      console.log(`✅ ${filePath} - ${replacements} remplacement(s)`);
    }

    filesProcessed++;
  } catch (error) {
    console.error(`❌ Erreur avec ${filePath}:`, error.message);
  }
}

// Fonction pour parcourir récursivement les dossiers
function processDirectory(dirPath, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
  const items = fs.readdirSync(dirPath);

  items.forEach(item => {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Ignorer node_modules, dist, .git, etc.
      if (!['node_modules', 'dist', '.git', '.next', 'build'].includes(item)) {
        processDirectory(fullPath, extensions);
      }
    } else if (stat.isFile()) {
      const ext = path.extname(fullPath);
      if (extensions.includes(ext)) {
        processFile(fullPath);
      }
    }
  });
}

// Lancer le script
console.log('🚀 CORRECTION DES IMPORTS POUR PRODUCTION VERCEL\n');

const rootDir = process.cwd();
const dirsToProcess = ['components', 'pages', 'lib', 'hooks', 'App.tsx'];

dirsToProcess.forEach(dir => {
  const fullPath = path.join(rootDir, dir);
  if (fs.existsSync(fullPath)) {
    console.log(`📁 Traitement de /${dir}...`);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else {
      processFile(fullPath);
    }
  }
});

console.log('\n' + '='.repeat(60));
console.log(`✅ TERMINÉ !`);
console.log(`📊 Fichiers traités : ${filesProcessed}`);
console.log(`📝 Fichiers modifiés : ${filesModified}`);
console.log(`🔄 Total remplacements : ${totalReplacements}`);
console.log('='.repeat(60));

if (filesModified > 0) {
  console.log('\n✨ Tous les imports sont maintenant compatibles avec Vercel !');
  console.log('💡 Vous pouvez maintenant lancer : npm run build');
} else {
  console.log('\n✅ Aucune modification nécessaire - tout est déjà correct !');
}
