#!/usr/bin/env python3
"""
🚀 CORRECTION GLOBALE - lucide-react + sonner
Corrige tous les imports dans tous les fichiers .tsx et .ts
"""

import os
import re
from pathlib import Path

def count_pattern(pattern):
    """Compte les occurrences d'un pattern dans tous les fichiers"""
    count = 0
    for root, dirs, files in os.walk('.'):
        # Ignorer certains dossiers
        dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules', 'dist', 'build']]
        
        for file in files:
            if file.endswith(('.tsx', '.ts')):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        count += len(re.findall(pattern, content))
                except:
                    pass
    return count

def fix_file(file_path, patterns):
    """Applique les corrections à un fichier"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        # Appliquer chaque pattern
        for pattern, replacement in patterns:
            content = re.sub(pattern, replacement, content)
        
        # Seulement écrire si modifié
        if content != original:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
    except Exception as e:
        print(f"❌ Erreur avec {file_path}: {e}")
    return False

def main():
    print("🚀 CORRECTION GLOBALE - lucide-react + sonner")
    print("=" * 50)
    print()
    
    # Patterns de correction
    patterns = [
        # lucide-react
        (r"from ['\"]lucide-react['\"]", "from 'lucide-react@0.550.0'"),
        # sonner
        (r"from ['\"]sonner['\"]\;", "from 'sonner@2.0.3';"),
    ]
    
    # 1. LUCIDE-REACT
    print("📦 Étape 1/2 : Correction de lucide-react")
    print("-" * 50)
    lucide_before = count_pattern(r"from ['\"]lucide-react['\"]")
    print(f"   Fichiers à corriger : {lucide_before}")
    
    # 2. SONNER
    print()
    print("📦 Étape 2/2 : Correction de sonner")
    print("-" * 50)
    sonner_before = count_pattern(r"from ['\"]sonner['\"]\;")
    print(f"   Fichiers à corriger : {sonner_before}")
    
    print()
    print("🔧 Correction en cours...")
    print()
    
    # Parcourir tous les fichiers
    fixed_count = 0
    total_files = 0
    
    for root, dirs, files in os.walk('.'):
        # Ignorer certains dossiers
        dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules', 'dist', 'build']]
        
        for file in files:
            if file.endswith(('.tsx', '.ts')):
                total_files += 1
                file_path = os.path.join(root, file)
                
                if fix_file(file_path, patterns):
                    fixed_count += 1
                    print(f"   ✅ {file_path}")
    
    print()
    print("=" * 50)
    print("🎉 CORRECTION TERMINÉE !")
    print()
    print(f"📊 Statistiques :")
    print(f"   - Fichiers scannés : {total_files}")
    print(f"   - Fichiers modifiés : {fixed_count}")
    print()
    
    # Vérification finale
    print("📊 Vérification finale :")
    lucide_after = count_pattern(r"from ['\"]lucide-react['\"]")
    sonner_after = count_pattern(r"from ['\"]sonner['\"]\;")
    print(f"   - lucide-react sans version : {lucide_after}")
    print(f"   - sonner sans version : {sonner_after}")
    print()
    
    if lucide_after == 0 and sonner_after == 0:
        print("✅ Tous les imports sont corrigés !")
    else:
        print("⚠️  Il reste des imports à corriger")
    
    print()
    print("🚀 Prochaines étapes :")
    print("   1. Vérifier le build dans Figma Make")
    print("   2. git add .")
    print("   3. git commit -m '✅ Fix all imports: lucide-react@0.550.0 + sonner@2.0.3'")
    print("   4. git push origin main")
    print()

if __name__ == "__main__":
    main()
