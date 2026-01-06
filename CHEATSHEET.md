# 📄 SmartCabb Deployment - Cheat Sheet

> Référence rapide des commandes et workflows

---

## ⚡ Quick Start (5 min)

```bash
# 1. Convert
bash convert-to-production.sh

# 2. Git
git init && git add . && git commit -m "Production ready"
git remote add origin https://github.com/USERNAME/smartcabb.git
git push -u origin main

# 3. Deploy on vercel.com (web interface)
```

---

## 🔧 Conversion Commands

### Automatic (Recommended)
```bash
bash convert-to-production.sh
```

### Manual
```bash
node fix-for-production.js
npm install
npm run build
```

### Verify
```bash
# Check for remaining @version imports
grep -r "@0\." --include="*.tsx" . | grep -v node_modules

# Should return: nothing
```

---

## 📦 NPM Commands

```bash
# Install dependencies
npm install

# Development
npm run dev              # Start dev server (port 3000)

# Production
npm run build            # Build for production
npm run preview          # Preview production build (port 4173)

# Fix imports only
node fix-for-production.js
```

---

## 🗂️ Git Commands

### Initial Setup
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/smartcabb.git
git branch -M main
git push -u origin main
```

### Daily Workflow
```bash
# Check status
git status

# Add all changes
git add .

# Commit with message
git commit -m "Description of changes"

# Push to GitHub (triggers auto-deploy)
git push

# View commit history
git log --oneline
```

### Undo Changes
```bash
# Discard local changes
git checkout -- .

# Revert last commit (keep changes)
git reset --soft HEAD~1

# Revert last commit (discard changes)
git reset --hard HEAD~1
```

---

## 🌐 Vercel Commands

### CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod

# View deployments
vercel ls
```

### Web Interface
1. vercel.com → Add New Project
2. Import from GitHub
3. Select `smartcabb`
4. Deploy

---

## 🔍 Debugging Commands

### Check Build
```bash
npm run build
# Look for errors in output
```

### Check Imports
```bash
# Find @version imports
grep -r "from ['\"].*@[0-9]" --include="*.tsx" --include="*.ts" . | grep -v node_modules

# Count occurrences
grep -r "from ['\"].*@[0-9]" --include="*.tsx" . | grep -v node_modules | wc -l
```

### Check Dependencies
```bash
# List installed packages
npm list --depth=0

# Check specific package
npm list framer-motion
npm list lucide-react

# Update packages
npm update
```

### View Logs
```bash
# Build logs
npm run build 2>&1 | tee build.log

# Dev server logs
npm run dev | tee dev.log
```

---

## 🔐 Environment Variables

### Local (.env)
```bash
# Create .env file
touch .env

# Add variables
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
AFRICAS_TALKING_API_KEY=xxx
AFRICAS_TALKING_USERNAME=sandbox
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxx
SENDGRID_API_KEY=SG.xxx
```

### Vercel (via CLI)
```bash
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
# ... etc
```

### Vercel (Web Interface)
1. Project → Settings → Environment Variables
2. Add each variable
3. Redeploy

---

## 📁 File Locations

### Configuration
```
package.json              # Dependencies
vite.config.ts            # Vite config
.gitignore                # Git ignore rules
.env                      # Environment variables (local)
```

### Source Code
```
App.tsx                   # Main app
index.html                # HTML entry point
components/               # React components
pages/                    # App pages
lib/                      # Utils
hooks/                    # Custom hooks
supabase/functions/       # Backend
```

### Generated
```
node_modules/             # Dependencies (gitignored)
dist/                     # Build output (gitignored)
.backup/                  # Backup files (created by script)
```

---

## 🔄 Import Patterns

### Before (esm.sh - FAILS on Vercel)
```typescript
import { motion } from 'framer-motion@10.16.4';
import { Mail } from 'lucide-react@0.550.0';
import { toast } from 'sonner@2.0.3';
```

### After (npm - WORKS on Vercel)
```typescript
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { toast } from 'sonner';
```

---

## 🆘 Common Issues

### Script Won't Run (Windows)
```bash
# Use Git Bash instead of CMD
bash convert-to-production.sh
```

### Build Fails
```bash
# Check for @version imports
grep -r "@0\." --include="*.tsx" . | grep -v node_modules

# Clean and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Git Push Fails (Auth)
```bash
# Use Personal Access Token
# GitHub → Settings → Developer settings → Tokens
# Use token as password when prompted
```

### Vercel Deploy Fails
```bash
# Check environment variables are set
# Vercel Dashboard → Settings → Environment Variables
# Then redeploy
```

---

## 📊 Verification Checklist

### Before Deploy
- [ ] `bash convert-to-production.sh` successful
- [ ] No `@version` imports: `grep -r "@0\." --include="*.tsx" .`
- [ ] Build works: `npm run build`
- [ ] Preview works: `npm run preview`

### After Deploy
- [ ] Site loads
- [ ] Login page displays
- [ ] Backend responds
- [ ] Map displays
- [ ] Payments work (test mode)

---

## 🔗 Useful URLs

### Development
- Local dev: `http://localhost:3000`
- Local preview: `http://localhost:4173`

### Production
- Vercel: `https://smartcabb-xxx.vercel.app`
- Custom: `https://smartcabb.com`

### Dashboards
- GitHub: `https://github.com/USERNAME/smartcabb`
- Vercel: `https://vercel.com/USERNAME/smartcabb`
- Supabase: `https://supabase.com/dashboard/project/PROJECT_ID`

---

## 📚 Quick File Reference

| File | Purpose | Edit? |
|------|---------|-------|
| `START_HERE.md` | Entry point | No |
| `GUIDE_RAPIDE_PRODUCTION.md` | Quick guide | No |
| `README_DEPLOIEMENT.md` | Full guide | No |
| `ERREUR_RESOLUE.md` | Error diagnosis | No |
| `convert-to-production.sh` | Main script | No |
| `fix-for-production.js` | Import fixer | No |
| `package.json` | Dependencies | Rarely |
| `vite.config.ts` | Vite config | Rarely |
| `.env` | Secrets (local) | Yes |
| `App.tsx` | Main component | Yes |
| `components/*.tsx` | Components | Yes |

---

## 🎯 Deployment Flow

```
1. Figma Make
   ↓ (download code)
2. Local Machine
   ↓ (convert: bash convert-to-production.sh)
3. Git
   ↓ (git push)
4. GitHub
   ↓ (auto-trigger)
5. Vercel
   ↓ (build & deploy)
6. Internet
   ✅ Live!
```

---

## 💾 Backup & Restore

### Create Backup
```bash
# Manual
cp -r . ../smartcabb-backup

# Automated (by convert script)
# Creates .backup/ folder
```

### Restore from Backup
```bash
# From manual backup
cp -r ../smartcabb-backup/* .

# From .backup/ folder
cp .backup/package.json.figma-make package.json
```

---

## 🔬 Testing

### Unit Tests (if added later)
```bash
npm test
npm run test:watch
npm run test:coverage
```

### E2E Tests (if added later)
```bash
npm run test:e2e
```

### Manual Testing
```bash
npm run preview
# Open http://localhost:4173
# Test all features manually
```

---

## 📈 Performance

### Analyze Bundle
```bash
npm run build
# Check dist/ folder size
```

### Lighthouse (Browser)
1. Open site in Chrome
2. F12 → Lighthouse tab
3. Generate report

---

## 🔒 Security

### Check Vulnerabilities
```bash
npm audit
npm audit fix
```

### Update Dependencies
```bash
npm update
npm outdated
```

---

## 📱 Mobile Testing

### Local Network Testing
```bash
# Find your IP
ipconfig      # Windows
ifconfig      # Mac/Linux

# Dev server exposes to network
npm run dev
# Access from phone: http://YOUR_IP:3000
```

---

## ⚙️ VS Code Shortcuts

- `Ctrl+Shift+P`: Command palette
- `Ctrl+Shift+H`: Find and replace in files
- `Ctrl+` `: Open terminal
- `Ctrl+B`: Toggle sidebar
- `Ctrl+P`: Quick file open

---

## 🎓 Resources

- [Vite Docs](https://vitejs.dev/)
- [Vercel Docs](https://vercel.com/docs)
- [Git Docs](https://git-scm.com/doc)
- [React Docs](https://react.dev/)
- [Supabase Docs](https://supabase.com/docs)

---

**Version**: 1.0  
**Last Updated**: January 3, 2026  
**Print**: Ctrl+P → Save as PDF for offline reference
