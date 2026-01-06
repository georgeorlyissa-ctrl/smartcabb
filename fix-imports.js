#!/usr/bin/env node

/**
 * Script pour corriger automatiquement les imports de lucide-react et sonner
 * dans tous les fichiers .tsx
 * 
 * Usage: node fix-imports.js
 */

const fs = require('fs');
const path = require('path');

// Fonction récursive pour trouver tous les fichiers .tsx
function findTsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Ignorer node_modules et .git
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        findTsxFiles(filePath, fileList);
      }
    } else if (file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Fonction pour corriger les imports dans un fichier
function fixImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Corriger lucide-react sans version
  if (content.includes("from 'lucide-react'") || content.includes('from "lucide-react"')) {
    content = content.replace(/from ['"]lucide-react['"]/g, "from 'lucide-react@0.550.0'");
    modified = true;
  }
  
  // Corriger sonner sans version
  if (content.includes("from 'sonner'") || content.includes('from "sonner"')) {
    content = content.replace(/from ['"]sonner['"]/g, "from 'sonner@2.0.3'");
    modified = true;
  }
  
  // Corriger les versions incorrectes de lucide-react
  if (content.includes('lucide-react@0.562.0')) {
    content = content.replace(/lucide-react@0\.562\.0/g, 'lucide-react@0.550.0');
    modified = true;
  }
  
  // Corriger les versions incorrectes de sonner
  if (content.includes('sonner@1.0.0')) {
    content = content.replace(/sonner@1\.0\.0/g, 'sonner@2.0.3');
    modified = true;
  }
  
  // Sauvegarder si modifié
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
    return true;
  }
  
  return false;
}

// Main
function main() {
  console.log('🔍 Searching for .tsx files...\n');
  
  const rootDir = process.cwd();
  const files = findTsxFiles(rootDir);
  
  console.log(`📁 Found ${files.length} .tsx files\n`);
  console.log('🔧 Fixing imports...\n');
  
  let fixedCount = 0;
  
  files.forEach(file => {
    if (fixImports(file)) {
      fixedCount++;
    }
  });
  
  console.log(`\n✨ Done! Fixed ${fixedCount} files`);
}

main();
