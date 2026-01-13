@echo off
REM ###############################################################################
REM 🔧 SCRIPT DE RÉSOLUTION AUTOMATIQUE DES CONFLITS GIT (Windows)
REM SmartCabb v517.161.3
REM 
REM Ce script résout automatiquement les conflits de merge en acceptant
REM toujours la version locale (HEAD) pour tous les fichiers
REM ###############################################################################

echo.
echo 🔧 RÉSOLUTION AUTOMATIQUE DES CONFLITS GIT
echo ===========================================
echo.

REM Vérifier si on est dans un repo git
if not exist .git (
    echo ❌ Erreur: Pas de dossier .git trouvé
    echo Ce script doit être exécuté à la racine du projet git
    pause
    exit /b 1
)

REM Compter les conflits
for /f %%i in ('git diff --name-only --diff-filter=U ^| find /c /v ""') do set CONFLICT_COUNT=%%i

if %CONFLICT_COUNT%==0 (
    echo ✅ Aucun conflit détecté
    echo.
    echo Vérification du statut git:
    git status
    pause
    exit /b 0
)

echo ⚠️  %CONFLICT_COUNT% fichier(s) en conflit détectés
echo.
echo Liste des fichiers en conflit:
git diff --name-only --diff-filter=U
echo.

echo ⚠️  ATTENTION:
echo Ce script va résoudre TOUS les conflits en acceptant la version LOCALE (HEAD)
echo Les modifications de la branche distante seront ÉCRASÉES
echo.
set /p CONFIRM="Êtes-vous sûr de vouloir continuer? (oui/non) "

if /i not "%CONFIRM%"=="oui" (
    echo ℹ️  Opération annulée
    pause
    exit /b 0
)

echo.
echo 🔄 Résolution des conflits en cours...
echo.

REM Résoudre chaque conflit
for /f "delims=" %%f in ('git diff --name-only --diff-filter=U') do (
    echo Résolution de: %%f
    git checkout --ours "%%f" >nul 2>&1
    git add "%%f" >nul 2>&1
)

echo.
echo ===========================================
echo ✅ Résolution terminée
echo.

REM Afficher le résumé
echo 📊 Résumé:
git status --short

echo.
echo 🎯 Prochaines étapes:
echo.
echo 1. Vérifier les modifications:
echo    git status
echo.
echo 2. Finaliser le merge:
echo    git commit -m "Merge: Résolution automatique des conflits - Version locale conservée"
echo.
echo 3. Pousser les changements:
echo    git push origin main
echo.
echo ===========================================
echo.

pause
