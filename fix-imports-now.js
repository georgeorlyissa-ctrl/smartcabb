#!/usr/bin/env node
/**
 * Script de correction automatique des imports lucide-react et sonner
 * pour SmartCabb v517.104
 */

const fs = require('fs');
const path = require('path');

// Fonction pour parcourir récursivement les fichiers
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    
    if (fs.statSync(filePath).isDirectory()) {
      // Ignorer certains dossiers
      if (!['node_modules', '.git', 'dist', 'build', '.next'].includes(file)) {
        arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
      }
    } else {
      // Ne traiter que les fichiers .ts et .tsx
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        arrayOfFiles.push(filePath);
      }
    }
  });

  return arrayOfFiles;
}

// Fonction pour corriger un fichier
function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Pattern 1: from 'lucide-react'; (avec point-virgule)
    content = content.replace(/from\s+['"]lucide-react['"];/g, "from 'lucide-react@0.550.0';");

    // Pattern 2: from 'lucide-react' (sans point-virgule, pour multilignes)
    content = content.replace(/from\s+['"]lucide-react['"](?!@)/g, "from 'lucide-react@0.550.0'");

    // Pattern 3: from 'sonner'; (avec point-virgule)
    content = content.replace(/from\s+['"]sonner['"];/g, "from 'sonner@2.0.3';");

    // Pattern 4: from 'sonner' (sans point-virgule)
    content = content.replace(/from\s+['"]sonner['"](?!@)/g, "from 'sonner@2.0.3'");

    // Si le contenu a changé, écrire le fichier
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Erreur dans ${filePath}:`, error.message);
    return false;
  }
}

// Main
function main() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║  🔧 CORRECTION AUTOMATIQUE - SMARTCABB                         ║');
  console.log('║  Correction de TOUS les imports lucide-react et sonner        ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log();

  const startDir = process.cwd();
  console.log(`📂 Dossier de travail: ${startDir}`);
  console.log();

  // Obtenir tous les fichiers
  const files = getAllFiles(startDir);
  console.log(`📂 Fichiers trouvés: ${files.length}`);
  console.log();

  // Corriger chaque fichier
  let fixedCount = 0;
  const fixedFiles = [];

  files.forEach((file) => {
    if (fixFile(file)) {
      fixedCount++;
      fixedFiles.push(file);
      console.log(`✅ ${path.relative(startDir, file)}`);
    }
  });

  console.log();
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log(`║  ✅ TERMINÉ ! ${fixedCount} fichier(s) corrigé(s)                      ║`);
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log();

  if (fixedCount > 0) {
    console.log('📋 Résumé des corrections :');
    console.log("   • from 'lucide-react' → from 'lucide-react@0.550.0'");
    console.log("   • from 'sonner' → from 'sonner@2.0.3'");
    console.log();
  } else {
    console.log('ℹ️  Aucune correction nécessaire. Tous les imports sont déjà corrects !');
    console.log();
  }
}

// Exécuter
main();
