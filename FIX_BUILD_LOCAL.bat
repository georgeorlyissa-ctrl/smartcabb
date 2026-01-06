@echo off
REM ##########################################################################
REM 🔧 FIX BUILD LOCAL - SANS DÉPLOIEMENT VERCEL
REM 
REM Ce script répare les dépendances et teste le build LOCALEMENT
REM AUCUN déploiement Vercel ne sera déclenché
REM ##########################################################################

echo.
echo ========================================================================
echo 🔧 FIX BUILD SMARTCABB (LOCAL SEULEMENT)
echo ========================================================================
echo.

REM ============================================================================
REM ÉTAPE 1 : NETTOYAGE COMPLET
REM ============================================================================

echo 📦 ÉTAPE 1/5 : Nettoyage complet...
echo.

echo    🗑️  Suppression de node_modules (peut prendre 30 sec)
if exist "node_modules" (
    rmdir /s /q "node_modules"
    echo    ✅ node_modules supprimé
) else (
    echo    ℹ️  node_modules déjà absent
)

echo    🗑️  Suppression des caches
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite"
if exist "dist" rmdir /s /q "dist"
if exist ".vercel" rmdir /s /q ".vercel"
if exist "package-lock.json" del /q "package-lock.json"

echo    ✅ Nettoyage terminé
echo.

REM ============================================================================
REM ÉTAPE 2 : RÉINSTALLATION DES DÉPENDANCES
REM ============================================================================

echo 📦 ÉTAPE 2/5 : Réinstallation des dépendances...
echo.
echo    ⏳ Téléchargement de ~200 MB (peut prendre 2-5 minutes)
echo.

npm install

if errorlevel 1 (
    echo.
    echo    ❌ Erreur lors de l'installation des dépendances
    echo    Vérifiez votre connexion Internet et réessayez
    pause
    exit /b 1
)

echo.
echo    ✅ Dépendances installées
echo.

REM ============================================================================
REM ÉTAPE 3 : TRANSFORMATION DES IMPORTS POUR VERCEL
REM ============================================================================

echo 🔧 ÉTAPE 3/5 : Transformation des imports...
echo.

node scripts/prepare-for-vercel.mjs

if errorlevel 1 (
    echo.
    echo    ❌ Erreur lors de la transformation des imports
    pause
    exit /b 1
)

echo    ✅ Imports transformés
echo.

REM ============================================================================
REM ÉTAPE 4 : BUILD LOCAL (TEST)
REM ============================================================================

echo 🏗️  ÉTAPE 4/5 : Build local (test)...
echo.
echo    ⏳ Compilation en cours (1-2 minutes)
echo.

npm run build

if errorlevel 1 (
    echo.
    echo ========================================================================
    echo ❌ BUILD ÉCHOUÉ
    echo ========================================================================
    echo.
    echo Le build local a échoué. Vérifiez les erreurs ci-dessus.
    echo.
    echo AUCUN déploiement Vercel n'a été tenté (quota préservé).
    echo.
    pause
    exit /b 1
)

echo.
echo    ✅ Build réussi !
echo.

REM ============================================================================
REM ÉTAPE 5 : VÉRIFICATION DES FICHIERS GÉNÉRÉS
REM ============================================================================

echo 📊 ÉTAPE 5/5 : Vérification...
echo.

if exist "dist\index.html" (
    echo    ✅ dist/index.html créé
) else (
    echo    ❌ dist/index.html manquant
    pause
    exit /b 1
)

if exist "dist\assets" (
    echo    ✅ dist/assets/ créé
) else (
    echo    ❌ dist/assets/ manquant
    pause
    exit /b 1
)

REM Compter les fichiers dans dist/assets
for /f %%A in ('dir /b /a-d "dist\assets" 2^>nul ^| find /c /v ""') do set FILE_COUNT=%%A
echo    ✅ %FILE_COUNT% fichiers dans dist/assets/

echo.

REM ============================================================================
REM SUCCÈS !
REM ============================================================================

echo ========================================================================
echo ✅ BUILD LOCAL RÉUSSI !
echo ========================================================================
echo.
echo 📊 RÉSUMÉ :
echo    ✅ node_modules réinstallés
echo    ✅ Imports transformés pour Vercel
echo    ✅ Build local réussi
echo    ✅ Fichiers générés dans dist/
echo.
echo ========================================================================
echo 🎯 PROCHAINES ÉTAPES
echo ========================================================================
echo.
echo OPTION A : DÉPLOYER SUR VERCEL (si quota disponible)
echo    1. Vérifiez votre quota : https://vercel.com/dashboard
echo    2. Si OK, exécutez : COMMIT_AND_PUSH.bat
echo.
echo OPTION B : ATTENDRE LE RESET DU QUOTA
echo    1. Le quota se réinitialise à minuit UTC
echo    2. Vérifiez l'heure : https://time.is/UTC
echo    3. Revenez plus tard pour déployer
echo.
echo OPTION C : CONTINUER LE DÉVELOPPEMENT ANDROID
echo    1. Le build web fonctionne (confirmé)
echo    2. Développez l'app Android en attendant
echo    3. Déployez Vercel quand le quota sera disponible
echo.
echo ========================================================================
echo.

set /p NEXT="Voulez-vous voir les fichiers générés ? (y/n) "
if /i "%NEXT%"=="y" explorer dist

echo.
echo 🎉 DONE !
echo.
pause
