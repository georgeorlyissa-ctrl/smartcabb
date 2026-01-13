@echo off
chcp 65001 >nul
title SmartCabb - Menu de Résolution des Conflits

:MENU
cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║     🔧 SMARTCABB - RÉSOLUTION DES CONFLITS GIT v517.161.3     ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo   Que voulez-vous faire ?
echo.
echo   [1] 🔧 Résoudre TOUS les conflits (version LOCALE)
echo   [2] 🔧 Résoudre TOUS les conflits (version DISTANTE)
echo   [3] 📊 Voir l'état actuel
echo   [4] ✅ Vérifier si tout est résolu
echo   [5] 📖 Ouvrir le guide complet
echo   [6] 🚨 Annuler le merge en cours
echo   [7] 🆘 Aide rapide
echo   [0] ❌ Quitter
echo.
echo ════════════════════════════════════════════════════════════════
echo.

set /p choice="   Votre choix (0-7) : "

if "%choice%"=="1" goto RESOLVE_OURS
if "%choice%"=="2" goto RESOLVE_THEIRS
if "%choice%"=="3" goto STATUS
if "%choice%"=="4" goto VERIFY
if "%choice%"=="5" goto GUIDE
if "%choice%"=="6" goto ABORT
if "%choice%"=="7" goto HELP
if "%choice%"=="0" goto EXIT

echo   Choix invalide !
timeout /t 2 >nul
goto MENU

:RESOLVE_OURS
cls
echo.
echo ═══════════════════════════════════════════════════════════════
echo   🔧 RÉSOLUTION AVEC VERSION LOCALE
echo ═══════════════════════════════════════════════════════════════
echo.
echo   Cette action va :
echo   ✓ Accepter VOTRE version (locale) pour tous les fichiers
echo   ✓ Écraser les modifications de la branche distante
echo   ✓ Marquer tous les fichiers comme résolus
echo.
echo   ⚠️  ATTENTION : Les modifications distantes seront PERDUES
echo.
set /p confirm="   Continuer ? (oui/non) : "

if /i not "%confirm%"=="oui" (
    echo.
    echo   Opération annulée.
    timeout /t 2 >nul
    goto MENU
)

echo.
echo   🔄 Résolution en cours...
echo.

git checkout --ours . 2>nul
git add . 2>nul

if %errorlevel% equ 0 (
    echo   ✅ Résolution terminée avec succès !
    echo.
    echo   📊 Prochaines étapes :
    echo.
    echo   1. git commit -m "Merge: Version locale conservée"
    echo   2. git push origin main
) else (
    echo   ❌ Erreur lors de la résolution
    echo.
    echo   Vérifiez que vous êtes bien dans un repository Git
)

echo.
pause
goto MENU

:RESOLVE_THEIRS
cls
echo.
echo ═══════════════════════════════════════════════════════════════
echo   🔧 RÉSOLUTION AVEC VERSION DISTANTE
echo ═══════════════════════════════════════════════════════════════
echo.
echo   Cette action va :
echo   ✓ Accepter la version DISTANTE pour tous les fichiers
echo   ✓ Écraser VOS modifications locales
echo   ✓ Marquer tous les fichiers comme résolus
echo.
echo   ⚠️  ATTENTION : VOS modifications seront PERDUES
echo.
set /p confirm="   Continuer ? (oui/non) : "

if /i not "%confirm%"=="oui" (
    echo.
    echo   Opération annulée.
    timeout /t 2 >nul
    goto MENU
)

echo.
echo   🔄 Résolution en cours...
echo.

git checkout --theirs . 2>nul
git add . 2>nul

if %errorlevel% equ 0 (
    echo   ✅ Résolution terminée avec succès !
    echo.
    echo   📊 Prochaines étapes :
    echo.
    echo   1. git commit -m "Merge: Version distante conservée"
    echo   2. git push origin main
) else (
    echo   ❌ Erreur lors de la résolution
    echo.
    echo   Vérifiez que vous êtes bien dans un repository Git
)

echo.
pause
goto MENU

:STATUS
cls
echo.
echo ═══════════════════════════════════════════════════════════════
echo   📊 ÉTAT ACTUEL DU REPOSITORY
echo ═══════════════════════════════════════════════════════════════
echo.

git status

echo.
echo ───────────────────────────────────────────────────────────────
echo   Fichiers en conflit :
echo ───────────────────────────────────────────────────────────────
echo.

git diff --name-only --diff-filter=U

echo.
pause
goto MENU

:VERIFY
cls
echo.
echo ═══════════════════════════════════════════════════════════════
echo   ✅ VÉRIFICATION DES CONFLITS
echo ═══════════════════════════════════════════════════════════════
echo.

for /f %%i in ('git diff --name-only --diff-filter=U ^| find /c /v ""') do set CONFLICTS=%%i

if %CONFLICTS%==0 (
    echo   ✅ Aucun conflit détecté !
    echo.
    echo   Votre repository est propre et prêt pour le commit.
) else (
    echo   ❌ %CONFLICTS% fichier(s) en conflit restant(s)
    echo.
    echo   Utilisez l'option [1] ou [2] pour les résoudre.
)

echo.
pause
goto MENU

:GUIDE
cls
echo.
echo ═══════════════════════════════════════════════════════════════
echo   📖 OUVERTURE DU GUIDE COMPLET
echo ═══════════════════════════════════════════════════════════════
echo.

if exist "📖_GUIDE_RÉSOLUTION_CONFLITS.md" (
    start "" "📖_GUIDE_RÉSOLUTION_CONFLITS.md"
    echo   ✅ Guide ouvert dans votre éditeur par défaut
) else (
    echo   ❌ Fichier guide non trouvé
    echo.
    echo   Consultez : 🚨_CONFLITS_GIT_README.md
)

echo.
pause
goto MENU

:ABORT
cls
echo.
echo ═══════════════════════════════════════════════════════════════
echo   🚨 ANNULATION DU MERGE
echo ═══════════════════════════════════════════════════════════════
echo.
echo   Cette action va :
echo   ✓ Annuler le merge en cours
echo   ✓ Remettre le repository dans l'état avant le merge
echo.
echo   ⚠️  Les résolutions de conflits seront perdues
echo.
set /p confirm="   Continuer ? (oui/non) : "

if /i not "%confirm%"=="oui" (
    echo.
    echo   Opération annulée.
    timeout /t 2 >nul
    goto MENU
)

echo.
echo   🔄 Annulation en cours...
echo.

git merge --abort 2>nul

if %errorlevel% equ 0 (
    echo   ✅ Merge annulé avec succès
    echo.
    echo   Votre repository est revenu à l'état d'avant le merge.
) else (
    echo   ❌ Aucun merge en cours à annuler
)

echo.
pause
goto MENU

:HELP
cls
echo.
echo ═══════════════════════════════════════════════════════════════
echo   🆘 AIDE RAPIDE
echo ═══════════════════════════════════════════════════════════════
echo.
echo   📋 COMMANDES GIT UTILES :
echo.
echo   • Voir les conflits :
echo     git diff --name-only --diff-filter=U
echo.
echo   • Accepter version locale pour UN fichier :
echo     git checkout --ours chemin/fichier.tsx
echo     git add chemin/fichier.tsx
echo.
echo   • Accepter version distante pour UN fichier :
echo     git checkout --theirs chemin/fichier.tsx
echo     git add chemin/fichier.tsx
echo.
echo   • Annuler le merge :
echo     git merge --abort
echo.
echo   • Voir l'historique :
echo     git log --oneline --graph --all
echo.
echo ───────────────────────────────────────────────────────────────
echo   🎯 SCRIPTS DISPONIBLES :
echo ───────────────────────────────────────────────────────────────
echo.
echo   • 🔧_RESOLVE_ALL_CONFLICTS.js (Node.js - Recommandé)
echo   • 🔧_RESOLVE_ALL_CONFLICTS.bat (Ce menu)
echo   • 📖_GUIDE_RÉSOLUTION_CONFLITS.md (Documentation complète)
echo   • 🚨_CONFLITS_GIT_README.md (Guide rapide)
echo.
echo ───────────────────────────────────────────────────────────────
echo   📞 EN CAS DE PROBLÈME :
echo ───────────────────────────────────────────────────────────────
echo.
echo   1. Ne paniquez pas - vos fichiers sont dans Git
echo   2. Utilisez "git status" pour voir l'état
echo   3. Utilisez "git merge --abort" si nécessaire
echo   4. Consultez la documentation complète
echo.
pause
goto MENU

:EXIT
cls
echo.
echo   👋 Au revoir !
echo.
timeout /t 1 >nul
exit /b 0
