#!/usr/bin/env python3
"""
🔧 Correction automatique COMPLÈTE des imports lucide-react et sonner
Script pour SmartCabb - Correction de TOUS les fichiers
"""

import os
import re
from pathlib import Path

def fix_file(filepath):
    """Corrige les imports lucide-react et sonner dans un fichier"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Correction pattern 1: from 'lucide-react';
        content = re.sub(
            r"from\s+['\"]lucide-react['\"];",
            "from 'lucide-react@0.550.0';",
            content
        )
        
        # Correction pattern 2: from 'lucide-react' (sans point-virgule, pour les multilignes)
        content = re.sub(
            r"from\s+['\"]lucide-react['\"](?!@)",
            "from 'lucide-react@0.550.0'",
            content
        )
        
        # Correction pattern 3: from 'sonner';
        content = re.sub(
            r"from\s+['\"]sonner['\"];",
            "from 'sonner@2.0.3';",
            content
        )
        
        # Correction pattern 4: from 'sonner' (sans point-virgule)
        content = re.sub(
            r"from\s+['\"]sonner['\"](?!@)",
            "from 'sonner@2.0.3'",
            content
        )
        
        # Si le fichier a été modifié, le sauvegarder
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        
        return False
        
    except Exception as e:
        print(f"❌ Erreur dans {filepath}: {e}")
        return False

def main():
    print("╔════════════════════════════════════════════════════════════════╗")
    print("║  🔧 CORRECTION AUTOMATIQUE - SMARTCABB                         ║")
    print("║  Correction de TOUS les imports lucide-react et sonner        ║")
    print("╚════════════════════════════════════════════════════════════════╝")
    print()
    
    # Trouver tous les fichiers TypeScript et TSX
    all_files = []
    for pattern in ['**/*.ts', '**/*.tsx']:
        all_files.extend(Path('.').glob(pattern))
    
    # Filtrer les fichiers à ignorer
    files_to_process = [
        f for f in all_files
        if 'node_modules' not in str(f)
        and '.git' not in str(f)
        and 'dist' not in str(f)
        and 'build' not in str(f)
        and '.next' not in str(f)
    ]
    
    print(f"📂 Fichiers trouvés : {len(files_to_process)}\n")
    
    fixed_count = 0
    fixed_files = []
    
    for filepath in files_to_process:
        if fix_file(filepath):
            fixed_count += 1
            fixed_files.append(str(filepath))
            print(f"✅ {filepath}")
    
    print()
    print("╔════════════════════════════════════════════════════════════════╗")
    print(f"║  ✅ TERMINÉ ! {fixed_count} fichier(s) corrigé(s)")
    print("╚════════════════════════════════════════════════════════════════╝")
    print()
    
    if fixed_count > 0:
        print("📋 Résumé des corrections :")
        print("   • from 'lucide-react' → from 'lucide-react@0.550.0'")
        print("   • from 'sonner' → from 'sonner@2.0.3'")
        print()
        
        if len(fixed_files) <= 30:
            print(f"📁 Fichiers modifiés ({len(fixed_files)}) :")
            for f in fixed_files:
                print(f"   • {f}")
        else:
            print(f"📁 Fichiers modifiés ({len(fixed_files)}) :")
            for f in fixed_files[:20]:
                print(f"   • {f}")
            print(f"   ... et {len(fixed_files) - 20} autres fichiers")
    
    print()
    print("🚀 Prochaines étapes :")
    print("   1. Les fichiers sont maintenant corrigés")
    print("   2. Copiez-les vers votre dépôt GitHub")
    print("   3. Commit + Push")
    print("   4. Vercel déploiera automatiquement")
    print()

if __name__ == '__main__':
    main()
