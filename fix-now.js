const fs = require('fs');
const path = require('path');

function getRelativePath(filePath) {
  // Enlever le './' du début
  const cleanPath = filePath.replace(/^\.\//, '');
  const depth = cleanPath.split('/').length - 1;
  
  if (depth === 0) return './';
  return '../'.repeat(depth);
}

function fixFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = getRelativePath(filePath);
    
    let fixed = content;
    
    // Fix 1: from 'framer-motion' → from '../framer-motion'
    fixed = fixed.replace(/from\s+['"]framer-motion['"]/g, `from '${relativePath}framer-motion'`);
    
    // Fix 2: from 'lucide-react@0.550.0' → from '../lucide-react'
    fixed = fixed.replace(/from\s+['"]lucide-react@[^'"]+['"]/g, `from '${relativePath}lucide-react'`);
    
    // Sauvegarder si modifié
    if (fixed !== content) {
      fs.writeFileSync(filePath, fixed, 'utf8');
      console.log(`✅ ${filePath}`);
      return true;
    }
    
    return false;
  } catch (err) {
    console.error(`❌ Erreur dans ${filePath}:`, err.message);
    return false;
  }
}

function walkDir(dir, count = { fixed: 0, total: 0 }) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    // Ignorer certains dossiers
    if (stat.isDirectory()) {
      if (['node_modules', '.git', '.next', 'dist', 'build'].includes(file)) {
        continue;
      }
      walkDir(fullPath, count);
    } 
    // Traiter les fichiers .ts et .tsx (sauf .d.ts)
    else if (file.match(/\.(tsx?|ts)$/) && !file.endsWith('.d.ts')) {
      count.total++;
      if (fixFile(fullPath)) {
        count.fixed++;
      }
    }
  }
  
  return count;
}

// Main
console.log('🔧 Correction automatique des imports pour Figma Make\n');

const result = walkDir('.');

console.log(`\n📊 Résumé:`);
console.log(`   Fichiers analysés: ${result.total}`);
console.log(`   Fichiers corrigés: ${result.fixed}`);
console.log(`\n✅ Terminé!`);

if (result.fixed > 0) {
  console.log(`\n🎯 Prochaines étapes:`);
  console.log(`   1. Testez l'application dans Figma Make`);
  console.log(`   2. Si tout fonctionne, commitez les changements`);
  console.log(`   3. Avant de déployer sur Vercel, exécutez: bash fix-vercel.sh`);
}
