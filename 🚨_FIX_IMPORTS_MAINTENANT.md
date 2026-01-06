# 🚨 ACTION IMMÉDIATE : Correction des imports

## ❌ Problème actuel

```
Error: Build failed with 63 errors:
npm-modules:https://esm.sh/framer-motion:2:7: ERROR: [plugin: npm] Failed to fetch
```

**Cause :** 78 fichiers importent encore directement `framer-motion` et `lucide-react@0.550.0` au lieu d'utiliser les wrappers locaux.

## ✅ Solution (CHOISISSEZ UNE OPTION)

### Option 1 : Script Node.js (⚡ RAPIDE - 30 secondes)

```bash
# Dans le terminal (à la racine du projet)
node fix-now.js
```

### Option 2 : Script Python (⚡ RAPIDE - 30 secondes)

```bash
# Dans le terminal (à la racine du projet)
python3 fix-now.py
```

### Option 3 : Copier-coller le code Node.js

Si les fichiers `fix-now.js` et `fix-now.py` ne sont pas présents, créez `fix-now.js` :

```javascript
const fs = require('fs');
const path = require('path');

function getRelativePath(filePath) {
  const cleanPath = filePath.replace(/^\.\//, '');
  const depth = cleanPath.split('/').length - 1;
  if (depth === 0) return './';
  return '../'.repeat(depth);
}

function fixFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = getRelativePath(filePath);
    
    let fixed = content
      .replace(/from\s+['"]framer-motion['"]/g, `from '${relativePath}framer-motion'`)
      .replace(/from\s+['"]lucide-react@[^'"]+['"]/g, `from '${relativePath}lucide-react'`);
    
    if (fixed !== content) {
      fs.writeFileSync(filePath, fixed, 'utf8');
      console.log(`✅ ${filePath}`);
      return true;
    }
    return false;
  } catch (err) {
    console.error(`❌ ${filePath}:`, err.message);
    return false;
  }
}

function walkDir(dir, count = { fixed: 0, total: 0 }) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', '.next', 'dist', 'build'].includes(file)) {
        walkDir(fullPath, count);
      }
    } else if (file.match(/\.(tsx?|ts)$/) && !file.endsWith('.d.ts')) {
      count.total++;
      if (fixFile(fullPath)) count.fixed++;
    }
  }
  return count;
}

console.log('🔧 Correction des imports...\n');
const result = walkDir('.');
console.log(`\n📊 ${result.total} fichiers analysés`);
console.log(`✅ ${result.fixed} fichiers corrigés\n`);
```

Puis exécutez :
```bash
node fix-now.js
```

## 🔍 Vérification

Après l'exécution, vérifiez qu'il ne reste aucun import problématique :

```bash
# Linux/Mac/Git Bash
grep -r "from ['\"]framer-motion['\"]" --include="*.tsx" --include="*.ts" . | wc -l
grep -r "from ['\"]lucide-react@" --include="*.tsx" --include="*.ts" . | wc -l

# Les deux commandes doivent retourner 0
```

**PowerShell (Windows) :**
```powershell
(Get-ChildItem -Recurse -Include *.tsx,*.ts | Select-String "from ['\"]framer-motion['\"]").Count
(Get-ChildItem -Recurse -Include *.tsx,*.ts | Select-String "from ['\"]lucide-react@").Count
```

## 📊 Résultat attendu

```
🔧 Correction des imports...

✅ components/admin/SettingsScreen.tsx
✅ components/admin/StatsCharts.tsx
✅ components/admin/SMSBalanceCard.tsx
... (75 autres fichiers)

📊 Résumé:
   Fichiers analysés: 450
   Fichiers corrigés: 78

✅ Terminé!
```

## 🎯 Après la correction

1. **Testez dans Figma Make** - Rechargez la page
2. **Vérifiez qu'il n'y a plus d'erreurs** - Regardez la console
3. **Commitez les changements**
   ```bash
   git add .
   git commit -m "fix: Imports compatibles Figma Make (framer-motion + lucide-react)"
   git push origin main
   ```

## ⚠️ IMPORTANT : Déploiement sur Vercel

Avant de déployer sur smartcabb.com/Vercel, vous DEVEZ exécuter :

```bash
bash fix-vercel.sh
```

Ce script reconvertira tous les imports vers le vrai `framer-motion` (npm) au lieu du wrapper local.

## 🆘 Si ça ne fonctionne pas

1. **Vérifiez que vous êtes à la racine du projet**
   ```bash
   ls -la | grep -E "(package.json|App.tsx)"
   ```

2. **Vérifiez que Node.js est installé**
   ```bash
   node --version  # Doit afficher v16+ ou v18+
   ```

3. **Vérifiez que Python est installé** (si vous utilisez Python)
   ```bash
   python3 --version  # Doit afficher 3.x
   ```

4. **Permissions** (Linux/Mac seulement)
   ```bash
   chmod +x fix-now.py
   chmod +x fix-vercel.sh
   ```

## 📋 Fichiers créés pour vous

| Fichier | Description |
|---------|-------------|
| `/fix-now.js` | Script Node.js de correction |
| `/fix-now.py` | Script Python de correction |
| `/fix-vercel.sh` | Script de reconversion pour Vercel |
| `/FIX_FIGMA_IMPORTS_GUIDE.md` | Guide complet |

---

**TL;DR - Action immédiate :**
```bash
node fix-now.js
# OU
python3 fix-now.py
```

Puis rechargez Figma Make. Les erreurs devraient disparaître ! ✅
