#!/usr/bin/env node

/**
 * 🔍 SCRIPT DE VÉRIFICATION POST-CORRECTION
 * 
 * Ce script vérifie qu'il n'y a plus d'imports CDN problématiques
 * Version: v517.161.1
 * Date: 13/01/2026
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 VÉRIFICATION POST-CORRECTION - SmartCabb v517.161.1');
console.log('=========================================================\n');

// Patterns à rechercher
const problematicPatterns = [
  { pattern: /from ['"]motion\/react['"]/g, name: "motion/react" },
  { pattern: /from ['"]framer-motion['"]/g, name: "framer-motion" },
  { pattern: /from ['"]sonner['"]/g, name: "sonner" },
];

// Icônes requises
const requiredIcons = [
  'Maximize2',
  'Award',
  'Split',
  'Edit',
  'LogOut',
  'Twitter',
  'Facebook'
];

let totalIssues = 0;
const issuesByFile = {};

// Fonction pour rechercher récursivement
function searchDirectory(dir, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Ignorer certains dossiers
      if (!file.startsWith('.') && 
          file !== 'node_modules' && 
          file !== 'dist' && 
          file !== 'build') {
        searchDirectory(filePath, extensions);
      }
    } else if (extensions.some(ext => file.endsWith(ext))) {
      checkFile(filePath);
    }
  });
}

// Vérifier un fichier
function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    // Vérifier chaque pattern
    problematicPatterns.forEach(({ pattern, name }) => {
      const matches = content.match(pattern);
      if (matches) {
        issues.push({
          type: 'cdn_import',
          pattern: name,
          count: matches.length
        });
        totalIssues += matches.length;
      }
    });
    
    // Si des problèmes sont trouvés, les enregistrer
    if (issues.length > 0) {
      issuesByFile[filePath] = issues;
    }
  } catch (error) {
    console.log(`⚠️  Impossible de lire ${filePath}: ${error.message}`);
  }
}

// Vérifier les icônes
function checkIcons() {
  console.log('📦 VÉRIFICATION DES ICÔNES');
  console.log('----------------------------');
  
  try {
    const iconsContent = fs.readFileSync('/lib/icons.tsx', 'utf8');
    const missingIcons = [];
    
    requiredIcons.forEach(icon => {
      const pattern = new RegExp(`export const ${icon} =`, 'g');
      if (!pattern.test(iconsContent)) {
        missingIcons.push(icon);
      }
    });
    
    if (missingIcons.length === 0) {
      console.log('✅ Toutes les icônes requises sont présentes\n');
      return true;
    } else {
      console.log('❌ Icônes manquantes:');
      missingIcons.forEach(icon => console.log(`   - ${icon}`));
      console.log('');
      return false;
    }
  } catch (error) {
    console.log(`❌ Impossible de vérifier /lib/icons.tsx: ${error.message}\n`);
    return false;
  }
}

// Lancer la vérification
console.log('🔍 Recherche des imports CDN problématiques...\n');
searchDirectory('/');

// Vérifier les icônes
const iconsOk = checkIcons();

// Afficher les résultats
console.log('📊 RÉSULTATS');
console.log('============\n');

if (totalIssues === 0) {
  console.log('✅ AUCUN IMPORT CDN PROBLÉMATIQUE TROUVÉ !');
  console.log('✅ L\'application est 100% autonome\n');
} else {
  console.log(`❌ ${totalIssues} imports CDN problématiques trouvés dans ${Object.keys(issuesByFile).length} fichiers:\n`);
  
  Object.entries(issuesByFile).forEach(([file, issues]) => {
    console.log(`📄 ${file}`);
    issues.forEach(issue => {
      console.log(`   ❌ ${issue.count}x ${issue.pattern}`);
    });
    console.log('');
  });
}

// Statut final
console.log('=========================================================');
if (totalIssues === 0 && iconsOk) {
  console.log('🎉 BUILD STATUS: PRÊT POUR LA PRODUCTION');
  console.log('✅ Tous les imports CDN ont été corrigés');
  console.log('✅ Toutes les icônes sont disponibles');
  process.exit(0);
} else {
  console.log('⚠️  BUILD STATUS: CORRECTIONS NÉCESSAIRES');
  if (totalIssues > 0) {
    console.log(`❌ ${totalIssues} imports CDN à corriger`);
  }
  if (!iconsOk) {
    console.log('❌ Icônes manquantes à ajouter');
  }
  process.exit(1);
}
