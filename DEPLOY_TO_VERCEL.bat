@echo off
REM ##########################################################################
REM 🚀 SCRIPT DE DÉPLOIEMENT VERCEL ULTIME (Windows)
REM 
REM Ce script effectue un déploiement complet et propre sur Vercel
REM ##########################################################################

echo.
echo ========================================================================
echo 🚀 DÉPLOIEMENT SMARTCABB SUR VERCEL
echo ========================================================================
echo.

REM ============================================================================
REM ÉTAPE 1 : NETTOYAGE DES CACHES
REM ============================================================================

echo 📦 ÉTAPE 1/5 : Nettoyage des caches locaux...

if exist "node_modules\.vite" (
    echo    🗑️  Suppression de node_modules\.vite
    rmdir /s /q "node_modules\.vite"
)

if exist "dist" (
    echo    🗑️  Suppression de dist\
    rmdir /s /q "dist"
)

if exist ".vercel" (
    echo    🗑️  Suppression de .vercel\
    rmdir /s /q ".vercel"
)

echo    ✅ Caches nettoyés
echo.

REM ============================================================================
REM ÉTAPE 2 : TRANSFORMATION DES IMPORTS POUR VERCEL
REM ============================================================================

echo 🔧 ÉTAPE 2/5 : Transformation des imports pour Vercel...

if exist "scripts\prepare-for-vercel.mjs" (
    node scripts\prepare-for-vercel.mjs
    echo    ✅ Imports transformés
) else (
    echo    ❌ Erreur : scripts\prepare-for-vercel.mjs introuvable
    pause
    exit /b 1
)

echo.

REM ============================================================================
REM ÉTAPE 3 : VÉRIFICATION DES FICHIERS MODIFIÉS
REM ============================================================================

echo 📝 ÉTAPE 3/5 : Vérification des modifications...

git status --short

echo.

REM ============================================================================
REM ÉTAPE 4 : COMMIT ET PUSH SUR GITHUB
REM ============================================================================

echo 💾 ÉTAPE 4/5 : Commit et push sur GitHub...

REM Ajouter tous les fichiers modifiés
git add .

REM Créer un commit avec timestamp
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a:%%b)
set TIMESTAMP=%mydate% %mytime%

git commit -m "deploy: SmartCabb production build - %TIMESTAMP%"

REM Push vers GitHub
echo    📤 Push vers GitHub...
git push origin main
if errorlevel 1 (
    git push origin master
    if errorlevel 1 (
        echo    ❌ Erreur lors du push
        echo    Vérifiez votre connexion et vos permissions GitHub
        pause
        exit /b 1
    )
)

echo    ✅ Code pushé sur GitHub
echo.

REM ============================================================================
REM ÉTAPE 5 : ATTENTE DU BUILD VERCEL
REM ============================================================================

echo 🌐 ÉTAPE 5/5 : Déploiement Vercel en cours...
echo.
echo    ⏳ Vercel a détecté le push et démarre le build...
echo.
echo    📊 Suivez le build en temps réel :
echo    https://vercel.com/dashboard
echo.
echo    🌐 Votre site sera accessible sur :
echo    https://smartcabb.com
echo.
echo    ⏱️  Durée estimée du build : 2-3 minutes
echo.

REM ============================================================================
REM SUCCÈS !
REM ============================================================================

echo ========================================================================
echo ✅ DÉPLOIEMENT LANCÉ AVEC SUCCÈS !
echo ========================================================================
echo.
echo 📋 PROCHAINES ÉTAPES :
echo.
echo    1. Ouvrez https://vercel.com/dashboard
echo    2. Vérifiez que le build est en cours (status: Building)
echo    3. Attendez 2-3 minutes
echo    4. Le site sera automatiquement mis à jour sur smartcabb.com
echo.
echo 🔍 EN CAS D'ERREUR DE BUILD :
echo.
echo    - Consultez les logs Vercel
echo    - Vérifiez les imports framer-motion (doivent être 'motion/react')
echo    - Vérifiez vite.config.ts (alias désactivé)
echo.
echo ========================================================================
echo.

REM Ouvrir le dashboard Vercel
set /p OPEN_BROWSER="Voulez-vous ouvrir le dashboard Vercel ? (y/n) "
if /i "%OPEN_BROWSER%"=="y" start https://vercel.com/dashboard

echo.
echo 🎉 DONE !
echo.
pause
