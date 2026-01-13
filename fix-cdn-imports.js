/**
 * 🎯 SCRIPT DE CORRECTION MASSIVE DES IMPORTS CDN
 * 
 * Remplace automatiquement tous les imports motion/react, framer-motion et sonner
 * par nos implémentations locales dans /lib
 */

const fs = require('fs');
const path = require('path');

// Fonction pour calculer le chemin relatif vers /lib depuis un fichier
function getRelativeLibPath(filePath) {
  const dir = path.dirname(filePath);
  const depth = dir.split(path.sep).filter(p => p && p !== '.').length;
  
  if (depth === 0 || dir === '.' || dir === '/') {
    return './lib';
  }
  
  // Générer le bon nombre de ../
  const prefix = '../'.repeat(depth);
  return `${prefix}lib`;
}

// Fonction pour corriger un fichier
function fixFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Vérifier si le fichier contient des imports CDN
  const hasMotionReact = content.includes("from 'motion/react'") || content.includes('from "motion/react"');
  const hasFramerMotion = content.includes("from 'framer-motion'") || content.includes('from "framer-motion"');
  const hasSonner = content.includes("from 'sonner'") || content.includes('from "sonner"');
  
  if (!hasMotionReact && !hasFramerMotion && !hasSonner) {
    return false; // Pas de changement nécessaire
  }
  
  const libPath = getRelativeLibPath(filePath);
  
  // Remplacer les imports
  let newContent = content
    .replace(/from ['"]motion\/react['"]/g, `from '${libPath}/motion'`)
    .replace(/from ['"]framer-motion['"]/g, `from '${libPath}/motion'`)
    .replace(/from ['"]sonner['"]/g, `from '${libPath}/toast'`);
  
  // Écrire le fichier corrigé
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`  ✅ Corrigé: ${filePath}`);
  return true;
}

// Fonction pour parcourir récursivement tous les fichiers .tsx
function findAndFixFiles(dir, stats = { total: 0, fixed: 0 }) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Ignorer node_modules, .git, etc.
      if (file === 'node_modules' || file === '.git' || file === 'dist' || file === 'build') {
        continue;
      }
      findAndFixFiles(filePath, stats);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      stats.total++;
      if (fixFile(filePath)) {
        stats.fixed++;
      }
    }
  }
  
  return stats;
}

// Exécution
console.log('🔍 Recherche et correction de tous les imports CDN externes...\n');

const stats = findAndFixFiles('.');

console.log('\n📊 Résumé:');
console.log(`  Total de fichiers analysés: ${stats.total}`);
console.log(`  Fichiers corrigés: ${stats.fixed}`);

if (stats.fixed > 0) {
  console.log('\n✅ Tous les imports CDN ont été corrigés!');
} else {
  console.log('\n✅ Aucune correction nécessaire - tous les imports sont déjà corrects!');
}
