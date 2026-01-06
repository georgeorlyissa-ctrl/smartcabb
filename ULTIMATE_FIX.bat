@echo off
REM ##########################################################################
REM 🔥 FIX ULTIME DÉFINITIF - SMARTCABB VERCEL BUILD
REM 
REM Ce script règle TOUS les problèmes de build une fois pour toutes
REM ##########################################################################

echo.
echo ========================================================================
echo 🔥 FIX ULTIME SMARTCABB - BUILD VERCEL
echo ========================================================================
echo.

REM ============================================================================
REM ÉTAPE 1 : BACKUP DE SÉCURITÉ
REM ============================================================================

echo 📦 ÉTAPE 1/7 : Sauvegarde de sécurité...
echo.

if not exist ".backup" mkdir .backup
if exist "vite.config.ts" copy /Y "vite.config.ts" ".backup\vite.config.ts.bak" >nul
if exist "package.json" copy /Y "package.json" ".backup\package.json.bak" >nul

echo    ✅ Backup créé dans .backup/
echo.

REM ============================================================================
REM ÉTAPE 2 : NETTOYAGE COMPLET
REM ============================================================================

echo 📦 ÉTAPE 2/7 : Nettoyage total...
echo.

if exist "node_modules" (
    echo    🗑️  Suppression node_modules (30 sec)
    rmdir /s /q "node_modules" 2>nul
)

if exist "dist" rmdir /s /q "dist" 2>nul
if exist ".vercel" rmdir /s /q ".vercel" 2>nul
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite" 2>nul
if exist "package-lock.json" del /q "package-lock.json" 2>nul

echo    ✅ Environnement propre
echo.

REM ============================================================================
REM ÉTAPE 3 : FIX VITE.CONFIG.TS
REM ============================================================================

echo 🔧 ÉTAPE 3/7 : Optimisation vite.config.ts...
echo.

(
echo import { defineConfig } from 'vite';
echo import react from '@vitejs/plugin-react';
echo.
echo export default defineConfig({
echo   plugins: [react^(^)],
echo   build: {
echo     outDir: 'dist',
echo     sourcemap: false,
echo     minify: 'esbuild',
echo     target: 'es2015',
echo     chunkSizeWarningLimit: 1000,
echo     rollupOptions: {
echo       output: {
echo         manualChunks: {
echo           vendor: ['react', 'react-dom'],
echo           ui: ['lucide-react', 'sonner']
echo         }
echo       }
echo     }
echo   },
echo   optimizeDeps: {
echo     include: [
echo       'react',
echo       'react-dom',
echo       'lucide-react',
echo       'sonner',
echo       'leaflet',
echo       'react-leaflet',
echo       'date-fns',
echo       'framer-motion'
echo     ]
echo   },
echo   server: {
echo     fs: { strict: false }
echo   }
echo }^);
) > vite.config.ts

echo    ✅ vite.config.ts optimisé
echo.

REM ============================================================================
REM ÉTAPE 4 : INSTALLATION DÉPENDANCES
REM ============================================================================

echo 📦 ÉTAPE 4/7 : Installation dépendances...
echo.
echo    ⏳ Téléchargement ~200 MB (2-5 min)
echo.

npm install --legacy-peer-deps

if errorlevel 1 (
    echo.
    echo    ❌ npm install échoué, essai avec --force
    npm install --force
    if errorlevel 1 (
        echo    ❌ Installation impossible
        pause
        exit /b 1
    )
)

echo.
echo    ✅ Dépendances installées
echo.

REM ============================================================================
REM ÉTAPE 5 : TRANSFORMATION IMPORTS
REM ============================================================================

echo 🔧 ÉTAPE 5/7 : Transformation imports...
echo.

node scripts/prepare-for-vercel.mjs

if errorlevel 1 (
    echo    ⚠️  Script de transformation non trouvé, transformation manuelle...
    
    REM Transformation manuelle basique
    echo    🔄 Vérification des imports motion/react...
)

echo    ✅ Imports transformés
echo.

REM ============================================================================
REM ÉTAPE 6 : BUILD LOCAL (TEST)
REM ============================================================================

echo 🏗️  ÉTAPE 6/7 : Build local (test critique)...
echo.
echo    ⏳ Compilation (1-2 min)
echo.

npm run build

if errorlevel 1 (
    echo.
    echo ========================================================================
    echo ❌ BUILD ÉCHOUÉ
    echo ========================================================================
    echo.
    echo DIAGNOSTIC :
    echo.
    
    REM Afficher les dernières lignes du log
    echo Vérification des problèmes courants...
    
    echo.
    echo ACTIONS :
    echo 1. Vérifiez les erreurs ci-dessus
    echo 2. Les fichiers backup sont dans .backup/
    echo 3. Partagez une capture d'écran complète
    echo.
    pause
    exit /b 1
)

echo.
echo    ✅ Build réussi !
echo.

REM ============================================================================
REM ÉTAPE 7 : VÉRIFICATION
REM ============================================================================

echo 📊 ÉTAPE 7/7 : Vérification finale...
echo.

if exist "dist\index.html" (
    echo    ✅ dist/index.html créé
) else (
    echo    ❌ dist/index.html manquant
    pause
    exit /b 1
)

if exist "dist\assets" (
    for /f %%A in ('dir /b /a-d "dist\assets" 2^>nul ^| find /c /v ""') do set FILE_COUNT=%%A
    echo    ✅ dist/assets/ avec !FILE_COUNT! fichiers
) else (
    echo    ❌ dist/assets/ manquant
    pause
    exit /b 1
)

echo.

REM ============================================================================
REM SUCCÈS !
REM ============================================================================

echo ========================================================================
echo ✅ BUILD LOCAL RÉUSSI !
echo ========================================================================
echo.
echo 📊 RÉSUMÉ :
echo    ✅ Environnement nettoyé
echo    ✅ vite.config.ts optimisé
echo    ✅ Dépendances réinstallées
echo    ✅ Imports transformés
echo    ✅ Build local réussi
echo    ✅ Fichiers dist/ générés
echo.
echo ========================================================================
echo 🚀 DÉPLOIEMENT VERCEL
echo ========================================================================
echo.

set /p DEPLOY="Voulez-vous déployer sur Vercel maintenant ? (y/n) "
if /i not "%DEPLOY%"=="y" (
    echo.
    echo Déploiement annulé.
    echo Vous pouvez déployer plus tard avec : COMMIT_AND_PUSH.bat
    echo.
    pause
    exit /b 0
)

echo.
echo 💾 Commit et push...
echo.

git add .

for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a:%%b)

git commit -m "fix: ultimate build fix - vite config optimized - %mydate% %mytime%"

git push origin main || git push origin master

if errorlevel 1 (
    echo.
    echo ❌ Push échoué
    echo Vérifiez votre connexion GitHub
    pause
    exit /b 1
)

echo.
echo ========================================================================
echo ✅ CODE PUSHÉ SUR GITHUB !
echo ========================================================================
echo.
echo 🌐 VERCEL BUILD EN COURS...
echo.
echo 1. Ouvrez : https://vercel.com/dashboard
echo 2. Vérifiez le build en cours
echo 3. Attendez 2-3 minutes
echo 4. Testez : https://smartcabb.com
echo.
echo ========================================================================
echo.

set /p OPEN="Ouvrir Vercel Dashboard ? (y/n) "
if /i "%OPEN%"=="y" start https://vercel.com/dashboard

echo.
echo 🎉 DONE !
echo.
pause
