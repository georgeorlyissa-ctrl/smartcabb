/**
 * 🚀 Script de correction des imports pour VERCEL/GITHUB
 * Convertit tous les imports vers les packages npm standards
 * v517.121 - SmartCabb Vercel Fix
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🚀 SmartCabb Vercel Import Fixer v517.121\n');
console.log('='.repeat(60));
console.log('🎯 Objectif: Corriger les imports pour Vercel/GitHub');
console.log('📦 Packages npm standards (sans wrappers)');
console.log('='.repeat(60) + '\n');

let filesFixed = 0;
let totalReplacements = 0;
const fixedFiles = [];

// Dossiers à ignorer
const IGNORED_DIRS = ['node_modules', '.git', '.next', 'dist', 'build', '.vercel', 'supabase'];

// Fonction pour traiter un fichier
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let fileModified = false;
    let replacementCount = 0;
    
    // Pattern 1: from './framer-motion' ou '../framer-motion' → from 'framer-motion'
    const framerLocalPattern = /from ['"]\.\.?\/+framer-motion['"]/g;
    if (framerLocalPattern.test(content)) {
      newContent = newContent.replace(framerLocalPattern, `from 'framer-motion'`);
      replacementCount++;
      fileModified = true;
    }
    
    // Pattern 2: from 'motion/react' → from 'framer-motion'
    const motionPattern = /from ['"]motion\/react['"]/g;
    if (motionPattern.test(newContent)) {
      newContent = newContent.replace(motionPattern, `from 'framer-motion'`);
      replacementCount++;
      fileModified = true;
    }
    
    // Pattern 3: from 'framer-motion@version' → from 'framer-motion'
    const framerVersionPattern = /from ['"]framer-motion@[^'"]*['"]/g;
    if (framerVersionPattern.test(newContent)) {
      newContent = newContent.replace(framerVersionPattern, `from 'framer-motion'`);
      replacementCount++;
      fileModified = true;
    }
    
    // Pattern 4: from './lucide-react' ou '../lucide-react' → from 'lucide-react'
    const lucideLocalPattern = /from ['"]\.\.?\/+lucide-react['"]/g;
    if (lucideLocalPattern.test(newContent)) {
      newContent = newContent.replace(lucideLocalPattern, `from 'lucide-react'`);
      replacementCount++;
      fileModified = true;
    }
    
    // Pattern 5: from 'lucide-react@version' → from 'lucide-react'
    const lucideVersionPattern = /from ['"]lucide-react@[^'"]*['"]/g;
    if (lucideVersionPattern.test(newContent)) {
      newContent = newContent.replace(lucideVersionPattern, `from 'lucide-react'`);
      replacementCount++;
      fileModified = true;
    }
    
    // Pattern 6: from 'sonner@version' → from 'sonner'
    const sonnerVersionPattern = /from ['"]sonner@[^'"]*['"]/g;
    if (sonnerVersionPattern.test(newContent)) {
      newContent = newContent.replace(sonnerVersionPattern, `from 'sonner'`);
      replacementCount++;
      fileModified = true;
    }
    
    // Pattern 7: from 'react-hook-form@version' → from 'react-hook-form'
    const hookFormVersionPattern = /from ['"]react-hook-form@[^'"]*['"]/g;
    if (hookFormVersionPattern.test(newContent)) {
      newContent = newContent.replace(hookFormVersionPattern, `from 'react-hook-form'`);
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
      // Ignorer les dossiers système
      if (IGNORED_DIRS.includes(item)) continue;
      
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
  console.log('\n📋 Fichiers modifiés:');
  fixedFiles.slice(0, 20).forEach((file, index) => {
    console.log(`   ${index + 1}. ${file}`);
  });
  
  if (fixedFiles.length > 20) {
    console.log(`   ... et ${fixedFiles.length - 20} autres fichiers`);
  }
  
  console.log('\n🚀 PROCHAINES ÉTAPES:');
  console.log('   1. Vérifier que package.json contient framer-motion et lucide-react');
  console.log('   2. git add .');
  console.log('   3. git commit -m "fix: Correction imports pour déploiement Vercel"');
  console.log('   4. git push origin main');
  console.log('   5. Vercel déploiera automatiquement');
} else {
  console.log('\n✅ Aucun fichier à corriger - tout est déjà bon pour Vercel!');
}

console.log('\n');
