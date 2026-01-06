@echo off
REM ##########################################################################
REM 💾 COMMIT ET PUSH - DÉPLOIEMENT VERCEL MINIMAL
REM 
REM Ce script commit et push sur GitHub
REM Vercel rebuild SEULEMENT s'il détecte des changements significatifs
REM ##########################################################################

echo.
echo ========================================================================
echo 💾 COMMIT ET PUSH SUR GITHUB
echo ========================================================================
echo.

REM Vérifier si le build local a été fait
if not exist "dist\index.html" (
    echo ❌ ERREUR : Build local manquant
    echo.
    echo Vous devez d'abord exécuter : FIX_BUILD_LOCAL.bat
    echo.
    pause
    exit /b 1
)

echo ✅ Build local détecté
echo.

REM ============================================================================
REM VÉRIFICATION DES MODIFICATIONS
REM ============================================================================

echo 📝 Vérification des modifications...
echo.

git status --short

echo.

REM ============================================================================
REM COMMIT
REM ============================================================================

echo 💾 Commit des changements...
echo.

git add .

REM Créer un commit avec timestamp
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a:%%b)
set TIMESTAMP=%mydate% %mytime%

git commit -m "fix: rebuild dependencies and transform imports - %TIMESTAMP%"

if errorlevel 1 (
    echo.
    echo ℹ️  Rien à commiter (déjà à jour)
    echo.
)

REM ============================================================================
REM AVERTISSEMENT QUOTA VERCEL
REM ============================================================================

echo.
echo ========================================================================
echo ⚠️  AVERTISSEMENT - QUOTA VERCEL
echo ========================================================================
echo.
echo Vous avez atteint la limite de 100 déploiements/jour.
echo.
echo Le push sur GitHub déclenchera un nouveau build Vercel
echo SEULEMENT si Vercel détecte que le quota est disponible.
echo.
echo Si le quota est toujours atteint, le push sera fait mais
echo Vercel attendra le reset du quota (minuit UTC).
echo.
echo ========================================================================
echo.

set /p CONFIRM="Voulez-vous pusher sur GitHub maintenant ? (y/n) "
if /i not "%CONFIRM%"=="y" (
    echo.
    echo Push annulé.
    echo Vous pouvez pusher plus tard avec : git push origin main
    echo.
    pause
    exit /b 0
)

echo.

REM ============================================================================
REM PUSH SUR GITHUB
REM ============================================================================

echo 📤 Push sur GitHub...
echo.

git push origin main

if errorlevel 1 (
    git push origin master
    if errorlevel 1 (
        echo.
        echo ❌ Erreur lors du push
        echo Vérifiez votre connexion et vos permissions GitHub
        pause
        exit /b 1
    )
)

echo.
echo ✅ Code pushé sur GitHub
echo.

REM ============================================================================
REM INSTRUCTIONS POST-PUSH
REM ============================================================================

echo ========================================================================
echo ✅ PUSH RÉUSSI
echo ========================================================================
echo.
echo 🌐 CODE PUSHÉ SUR GITHUB
echo.
echo VÉRIFICATION VERCEL :
echo    1. Ouvrez : https://vercel.com/dashboard
echo    2. Vérifiez si un build démarre
echo.
echo SI LE BUILD DÉMARRE :
echo    ✅ Quota disponible
echo    ⏳ Attendez 2-3 minutes
echo    🌐 Testez : https://smartcabb.com
echo.
echo SI AUCUN BUILD :
echo    ⚠️  Quota toujours atteint
echo    ⏰ Attendez le reset (minuit UTC)
echo    💡 Continuez le développement Android
echo.
echo TEMPS RESTANT AVANT RESET :
echo    Vérifiez sur : https://vercel.com/dashboard
echo    (affiche le temps restant)
echo.
echo ========================================================================
echo.

set /p OPEN="Voulez-vous ouvrir Vercel Dashboard ? (y/n) "
if /i "%OPEN%"=="y" start https://vercel.com/dashboard

echo.
echo 🎉 DONE !
echo.
pause
