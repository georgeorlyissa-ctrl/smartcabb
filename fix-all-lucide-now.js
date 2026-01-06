#!/usr/bin/env node
/**
 * Script de correction automatique COMPLET pour SmartCabb
 * Corrige TOUS les imports lucide-react et sonner en une seule fois
 * Version: v517.105
 */

const fs = require('fs');
const path = require('path');

let fixedLucide = 0;
let fixedSonner = 0;

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Ignorer node_modules, .git, dist, build
      if (!['node_modules', '.git', 'dist', 'build', '.next'].includes(file)) {
        getAllFiles(filePath, fileList);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function fixImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    let changed = false;

    // Fix lucide-react imports
    const lucideRegex = /from\s+(['"])lucide-react\1/g;
    if (lucideRegex.test(content) && !content.includes('lucide-react@0.550.0')) {
      content = content.replace(/from\s+(['"])lucide-react\1/g, "from 'lucide-react@0.550.0'");
      fixedLucide++;
      changed = true;
    }

    // Fix sonner imports
    const sonnerRegex = /from\s+(['"])sonner\1/g;
    if (sonnerRegex.test(content) && !content.includes('sonner@2.0.3')) {
      content = content.replace(/from\s+(['"])sonner\1/g, "from 'sonner@2.0.3'");
      fixedSonner++;
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  ✅ ${path.relative(process.cwd(), filePath)}`);
      return true;
    }

    return false;
  } catch (err) {
    console.error(`  ❌ Erreur: ${filePath}`, err.message);
    return false;
  }
}

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║  🔧 CORRECTION AUTOMATIQUE - SMARTCABB v517.105               ║');
console.log('║  Correction de TOUS les imports lucide-react et sonner        ║');
console.log('╚════════════════════════════════════════════════════════════════╝');
console.log('');

const startTime = Date.now();
const allFiles = getAllFiles(process.cwd());

console.log(`📂 Fichiers trouvés: ${allFiles.length}`);
console.log('');
console.log('🔧 Correction en cours...');
console.log('');

allFiles.forEach(file => fixImports(file));

const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

console.log('');
console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║  ✅ CORRECTION TERMINÉE !                                      ║');
console.log('╚════════════════════════════════════════════════════════════════╝');
console.log('');
console.log('📊 Résumé :');
console.log(`   • Fichiers lucide-react corrigés: ${fixedLucide}`);
console.log(`   • Fichiers sonner corrigés: ${fixedSonner}`);
console.log(`   • Temps écoulé: ${elapsed}s`);
console.log('');
console.log('✨ Tous les imports ont été corrigés !');
console.log('');
console.log('📋 Prochaines étapes :');
console.log('   1. git add -A');
console.log('   2. git commit -m "🔧 fix: Correction imports lucide-react et sonner"');
console.log('   3. git push origin main');
console.log('');
