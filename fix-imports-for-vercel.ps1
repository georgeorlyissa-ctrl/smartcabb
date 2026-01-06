# ============================================
# 🔧 SCRIPT POWERSHELL - CORRECTION DES IMPORTS POUR VERCEL
# ============================================
# Version Windows PowerShell du script de correction
#
# USAGE:
#   1. Ouvrez PowerShell en tant qu'administrateur
#   2. Autorisez l'exécution: Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
#   3. Naviguez vers la racine du projet: cd C:\chemin\vers\smartcabb
#   4. Exécutez: .\fix-imports-for-vercel.ps1
# ============================================

# Couleurs
function Write-Success { param($Message) Write-Host $Message -ForegroundColor Green }
function Write-Error { param($Message) Write-Host $Message -ForegroundColor Red }
function Write-Warning { param($Message) Write-Host $Message -ForegroundColor Yellow }
function Write-Info { param($Message) Write-Host $Message -ForegroundColor Cyan }

# Compteurs
$script:TotalFiles = 0
$script:FramerFixed = 0
$script:LucideFixed = 0
$script:Errors = 0

# ============================================
# FONCTION: Afficher le header
# ============================================
function Show-Header {
    Write-Info @"

╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🔧 SMARTCABB - CORRECTEUR D'IMPORTS POUR VERCEL        ║
║                     (Version Windows)                      ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

"@
}

# ============================================
# FONCTION: Créer un backup
# ============================================
function New-Backup {
    Write-Warning "📦 Création du backup..."
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupDir = "backup_imports_$timestamp"
    
    if (-not (Test-Path $backupDir)) {
        New-Item -ItemType Directory -Path $backupDir | Out-Null
    }
    
    # Backup de tous les fichiers .tsx et .ts
    Get-ChildItem -Path "components" -Recurse -Include "*.tsx","*.ts" | ForEach-Object {
        $relativePath = $_.FullName.Substring((Get-Location).Path.Length + 1)
        $backupPath = Join-Path $backupDir $relativePath
        $backupFolder = Split-Path $backupPath -Parent
        
        if (-not (Test-Path $backupFolder)) {
            New-Item -ItemType Directory -Path $backupFolder -Force | Out-Null
        }
        
        Copy-Item $_.FullName -Destination $backupPath
    }
    
    Write-Success "✅ Backup créé dans: $backupDir`n"
    return $backupDir
}

# ============================================
# FONCTION: Corriger un fichier
# ============================================
function Fix-File {
    param($FilePath)
    
    $hasChanges = $false
    $content = Get-Content $FilePath -Raw -Encoding UTF8
    
    # Corriger framer-motion
    if ($content -match "from ['""]../../framer-motion['""]") {
        $content = $content -replace "from ['""]../../framer-motion['""]", "from 'framer-motion'"
        $script:FramerFixed++
        $hasChanges = $true
        Write-Host "  " -NoNewline
        Write-Success "✓ framer-motion"
    }
    
    # Corriger lucide-react
    if ($content -match "from ['""]../../lucide-react['""]") {
        $content = $content -replace "from ['""]../../lucide-react['""]", "from 'lucide-react'"
        $script:LucideFixed++
        $hasChanges = $true
        Write-Host "  " -NoNewline
        Write-Success "✓ lucide-react"
    }
    
    if ($hasChanges) {
        try {
            Set-Content -Path $FilePath -Value $content -Encoding UTF8 -NoNewline
            $script:TotalFiles++
            return $true
        }
        catch {
            Write-Error "  ✗ Erreur lors de l'écriture du fichier"
            $script:Errors++
            return $false
        }
    }
    
    return $false
}

# ============================================
# FONCTION: Scanner et corriger
# ============================================
function Scan-AndFix {
    Write-Info "🔍 Scan des fichiers...`n"
    
    $directories = @(
        "components\driver",
        "components\passenger",
        "components\admin",
        "components\auth",
        "components"
    )
    
    foreach ($dir in $directories) {
        if (-not (Test-Path $dir)) {
            continue
        }
        
        Write-Info "📁 Dossier: $dir"
        
        Get-ChildItem -Path $dir -Filter "*.tsx" -File | ForEach-Object {
            $content = Get-Content $_.FullName -Raw -Encoding UTF8
            
            if ($content -match "from ['""]../../(framer-motion|lucide-react)['""]") {
                Write-Warning "  📝 $($_.Name)"
                Fix-File $_.FullName | Out-Null
            }
        }
        
        Get-ChildItem -Path $dir -Filter "*.ts" -File | ForEach-Object {
            $content = Get-Content $_.FullName -Raw -Encoding UTF8
            
            if ($content -match "from ['""]../../(framer-motion|lucide-react)['""]") {
                Write-Warning "  📝 $($_.Name)"
                Fix-File $_.FullName | Out-Null
            }
        }
        
        Write-Host ""
    }
}

# ============================================
# FONCTION: Afficher le rapport
# ============================================
function Show-Report {
    param($BackupDir)
    
    Write-Info @"

╔════════════════════════════════════════════════════════════╗
║                   📊 RAPPORT FINAL                         ║
╚════════════════════════════════════════════════════════════╝

"@
    
    Write-Success "✅ Fichiers modifiés: $script:TotalFiles"
    Write-Success "✅ Corrections framer-motion: $script:FramerFixed"
    Write-Success "✅ Corrections lucide-react: $script:LucideFixed"
    
    if ($script:Errors -gt 0) {
        Write-Error "❌ Erreurs: $script:Errors"
    }
    
    Write-Host ""
    Write-Warning "📦 Backup sauvegardé dans: $BackupDir"
    Write-Host ""
    
    if ($script:Errors -eq 0) {
        Write-Success @"
╔════════════════════════════════════════════════════════════╗
║  ✅ SUCCÈS ! Tous les imports ont été corrigés            ║
║                                                            ║
║  Prochaines étapes:                                        ║
║  1. Vérifiez les changements: git diff                    ║
║  2. Testez localement: npm run dev                        ║
║  3. Commitez: git add . && git commit -m "fix: imports"   ║
║  4. Poussez: git push origin main                         ║
╚════════════════════════════════════════════════════════════╝
"@
    }
    else {
        Write-Error "⚠️  Certaines erreurs sont survenues. Vérifiez les fichiers manuellement."
    }
}

# ============================================
# FONCTION: Vérifier les prérequis
# ============================================
function Test-Requirements {
    if (-not (Test-Path "components")) {
        Write-Error "❌ ERREUR: Ce script doit être exécuté à la racine du projet SmartCabb"
        Write-Warning "   (le dossier 'components' est introuvable)"
        exit 1
    }
    
    # Vérifier si git est installé
    try {
        git --version | Out-Null
        
        # Vérifier s'il y a des modifications non commitées
        $gitStatus = git status --porcelain
        if ($gitStatus) {
            Write-Warning "⚠️  WARNING: Vous avez des modifications non commitées."
            Write-Warning "   Il est recommandé de commit ou stash vos changements avant de continuer."
            $response = Read-Host "   Voulez-vous continuer quand même? (y/N)"
            if ($response -ne "y" -and $response -ne "Y") {
                Write-Error "❌ Opération annulée"
                exit 1
            }
        }
    }
    catch {
        Write-Warning "⚠️  WARNING: Git n'est pas installé. Le backup sera votre seule sauvegarde."
    }
}

# ============================================
# FONCTION PRINCIPALE
# ============================================
function Main {
    Show-Header
    Test-Requirements
    
    $backupDir = New-Backup
    Scan-AndFix
    Show-Report $backupDir
}

# ============================================
# EXÉCUTION
# ============================================
Main
