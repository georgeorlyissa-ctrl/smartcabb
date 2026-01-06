# 🔧 Guide de correction des imports pour Figma Make

## Problème

Il reste **78 fichiers** avec des imports directs vers:
- `framer-motion` (48 fichiers)
- `lucide-react@0.550.0` (30 fichiers)

Ces imports doivent utiliser les wrappers locaux `/framer-motion.tsx` et `/lucide-react.ts`.

## Solution rapide (< 1 minute)

### Option 1 : Script Node.js (recommandé)

Créez un fichier `fix-now.js` :

```javascript
const fs = require('fs');
const path = require('path');

function getRelativePath(filePath) {
  const depth = filePath.split('/').length - 1;
  return depth === 0 ? './' : '../'.repeat(depth);
}

function fixFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = getRelativePath(filePath);
  
  let fixed = content
    // Fix framer-motion
    .replace(/from\s+['"]framer-motion['"]/g, `from '${relativePath}framer-motion'`)
    // Fix lucide-react@version
    .replace(/from\s+['"]lucide-react@[^'"]+['"]/g, `from '${relativePath}lucide-react'`);
  
  if (fixed !== content) {
    fs.writeFileSync(filePath, fixed, 'utf8');
    console.log(`✅ ${filePath}`);
    return true;
  }
  return false;
}

function walkDir(dir) {
  let count = 0;
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !['node_modules', '.git', '.next', 'dist'].includes(file)) {
      count += walkDir(fullPath);
    } else if (file.match(/\.(tsx?|ts)$/) && !file.endsWith('.d.ts')) {
      if (fixFile(fullPath)) count++;
    }
  }
  return count;
}

console.log('🔧 Correction des imports...\n');
const fixed = walkDir('.');
console.log(`\n📊 ${fixed} fichiers corrigés`);
```

Exécutez :
```bash
node fix-now.js
```

### Option 2 : Commande sed (Linux/Mac)

```bash
# Fix framer-motion
find . -name "*.tsx" -o -name "*.ts" | while read file; do
  depth=$(echo "$file" | tr -cd '/' | wc -c)
  rel=$(printf '../%.0s' $(seq 1 $((depth-1))))
  sed -i "s|from ['\"

]framer-motion['\"]|from '${rel}framer-motion'|g" "$file"
done

# Fix lucide-react
find . -name "*.tsx" -o -name "*.ts" | while read file; do
  depth=$(echo "$file" | tr -cd '/' | wc -c)
  rel=$(printf '../%.0s' $(seq 1 $((depth-1))))
  sed -i "s|from ['\"]lucide-react@[^'\"]*['\"]|from '${rel}lucide-react'|g" "$file"
done
```

### Option 3 : VSCode Find & Replace (manuel mais contrôlé)

1. Ouvrez VSCode
2. Appuyez sur `Ctrl+Shift+H` (Find & Replace dans tous les fichiers)
3. Activez Regex (icône `.*`)

**Remplacements à faire :**

| Find (Regex) | Replace | Scope |
|--------------|---------|-------|
| `from ['"]framer-motion['"]` | Voir notes ci-dessous | `**/*.{ts,tsx}` |
| `from ['"]lucide-react@[^'"]+['"]` | Voir notes ci-dessous | `**/*.{ts,tsx}` |

**Notes pour Replace :**
- Pour `/components/*.tsx` → `from '../framer-motion'`
- Pour `/components/admin/*.tsx` → `from '../../framer-motion'`
- Pour `/components/passenger/*.tsx` → `from '../../framer-motion'`
- Pour `/pages/*.tsx` → `from '../framer-motion'`
- Pour `/*.tsx` (racine) → `from './framer-motion'`

## Vérification

Après correction, vérifiez qu'il ne reste aucun import direct :

```bash
# Vérifier framer-motion
grep -r "from ['\"]framer-motion['\"]" --include="*.tsx" --include="*.ts" .

# Vérifier lucide-react@
grep -r "from ['\"]lucide-react@" --include="*.tsx" --include="*.ts" .
```

Si les commandes ne retournent rien, c'est bon ! ✅

## Fichiers critiques à corriger en priorité

### Framer Motion (48 fichiers)
```
components/admin/SettingsScreen.tsx ✅ DÉJÀ CORRIGÉ
components/admin/StatsCharts.tsx
components/admin/SMSBalanceCard.tsx
components/auth/ResetPasswordByPhonePage.tsx
components/driver/ClientInfoScreen.tsx
components/driver/DriverDashboard.tsx
components/driver/DriverLoginScreenNew.tsx
components/driver/DriverProfileScreen.tsx
... et 40 autres
```

### Lucide React (30 fichiers)
```
components/ErrorBoundary.tsx ✅ DÉJÀ CORRIGÉ
components/InteractiveMapView.tsx
components/LandingScreen.tsx
components/PWAInstallPrompt.tsx
components/PassengerCountSelector.tsx
... et 25 autres
```

## Après la correction

1. **Testez dans Figma Make** - L'application devrait fonctionner
2. **Déployez sur Vercel** - Exécutez `/fix-vercel.sh` avant de pousser
3. **Vérifiez le build** - Assurez-vous qu'il n'y a pas d'erreurs

## Scripts disponibles

| Script | Description |
|--------|-------------|
| `/fix-figma-imports.py` | Correction Python (nécessite Python 3) |
| `/fix-all-figma-imports.sh` | Correction Bash (Linux/Mac) |
| `/fix-imports-massive.py` | Alternative Python optimisée |

---

**Note importante :** Ces corrections sont **UNIQUEMENT** pour Figma Make. Avant de déployer sur Vercel/smartcabb.com, vous DEVEZ exécuter `/fix-vercel.sh` qui reconvertira tous les imports vers `framer-motion` réel.
