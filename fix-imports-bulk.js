#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

let totalFixed = 0;

const replacements = [
  { pattern: /from ['"]lucide-react@[^'"]*['"]/g, replacement: "from 'lucide-react'" },
  { pattern: /from ['"]sonner@[^'"]*['"]/g, replacement: "from 'sonner'" },
  { pattern: /from ['"]framer-motion@[^'"]*['"]/g, replacement: "from 'framer-motion'" },
  { pattern: /from ['"]motion\/react['"]/g, replacement: "from 'framer-motion'" },
];

function fixFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  let changed = false;
  
  replacements.forEach(({ pattern, replacement }) => {
    if (pattern.test(newContent)) {
      newContent = newContent.replace(pattern, replacement);
      changed = true;
    }
  });
  
  if (changed) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    totalFixed++;
    console.log(`✓ Fixed: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!['node_modules', 'dist', '.git', '.next', '.backup'].includes(file)) {
        walkDir(filePath);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fixFile(filePath);
    }
  });
}

console.log('🔧 Fixing all imports...\n');
walkDir(process.cwd());
console.log(`\n✅ Fixed ${totalFixed} files`);
