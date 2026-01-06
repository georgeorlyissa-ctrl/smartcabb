import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🔧 Correction automatique des imports...\n');

let filesFixed = 0;
let totalReplacements = 0;

const replacements = [
  { pattern: /from ['"](\.\/)?framer-motion['"]/g, replacement: "from './framer-motion'", name: 'framer-motion → ./framer-motion' },
  { pattern: /from ['"](\.\/)?lucide-react['"]/g, replacement: "from './lucide-react'", name: 'lucide-react → ./lucide-react' },
  { pattern: /from ['"](\.\/)?motion\/react['"]/g, replacement: "from './framer-motion'", name: 'motion/react → ./framer-motion' },
  { pattern: /from ['"]lucide-react@[^'"]*['"]/g, replacement: "from './lucide-react'", name: 'lucide-react@X → ./lucide-react' },
  { pattern: /from ['"]sonner@[^'"]*['"]/g, replacement: "from 'sonner'", name: 'sonner@X → sonner' },
  { pattern: /from ['"]framer-motion@[^'"]*['"]/g, replacement: "from './framer-motion'", name: 'framer-motion@X → ./framer-motion' },
  { pattern: /from ['"]react-hook-form@[^'"]*['"]/g, replacement: "from 'react-hook-form'", name: 'react-hook-form@X → react-hook-form' },
];

function processDirectory(dir) {
  const ignored = ['node_modules', '.git', '.next', 'dist', 'build', '.vercel'];
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    if (ignored.includes(item)) continue;
    
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (/\.(tsx?|jsx?)$/.test(item)) {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let fileReplacements = 0;
    
    for (const { pattern, replacement } of replacements) {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, replacement);
        fileReplacements += matches.length;
        modified = true;
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      filesFixed++;
      totalReplacements += fileReplacements;
      console.log(`✅ ${path.relative(process.cwd(), filePath)}`);
    }
  } catch (err) {
    console.error(`❌ ${filePath}: ${err.message}`);
  }
}

// Start processing
processDirectory(process.cwd());

console.log('\n' + '='.repeat(60));
console.log(`✨ ${filesFixed} fichiers corrigés`);
console.log(`🔄 ${totalReplacements} remplacements effectués`);
console.log('='.repeat(60));
console.log('\n📋 Prochaines étapes:');
console.log('   git add .');
console.log('   git commit -m "fix: Correction imports pour Vercel"');
console.log('   git push origin main\n');
