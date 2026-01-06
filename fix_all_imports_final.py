#!/usr/bin/env python3
"""
✅ Script de correction COMPLÈTE des imports lucide-react et sonner
Pour SmartCabb - Tous fichiers .ts et .tsx
"""

import os
import re
from pathlib import Path

def fix_file(filepath):
    """Corrige tous les imports dans un fichier"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        # Pattern 1: from 'lucide-react';
        content = re.sub(
            r"from\s+['\"]lucide-react['\"];",
            "from 'lucide-react@0.550.0';",
            content
        )
        
        # Pattern 2: from "lucide-react";
        content = re.sub(
            r'from\s+["\']lucide-react["\']\s*;',
            'from "lucide-react@0.550.0";',
            content
        )
        
        # Pattern 3: from 'sonner';
        content = re.sub(
            r"from\s+['\"]sonner['\"];",
            "from 'sonner@2.0.3';",
            content
        )
        
        # Pattern 4: from "sonner";
        content = re.sub(
            r'from\s+["\']sonner["\']\s*;',
            'from "sonner@2.0.3";',
            content
        )
        
        # Si modifié, sauvegarder
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
        
    except Exception as e:
        print(f"❌ Erreur dans {filepath}: {e}")
        return False

def main():
    print("=" * 70)
    print("🔧 CORRECTION AUTOMATIQUE - SmartCabb")
    print("   lucide-react → lucide-react@0.550.0")
    print("   sonner → sonner@2.0.3")
    print("=" * 70)
    print()
    
    # Trouver tous les fichiers
    all_files = []
    for ext in ['**/*.ts', '**/*.tsx']:
        all_files.extend(Path('.').glob(ext))
    
    # Exclure node_modules, .git, etc.
    files_to_fix = [
        f for f in all_files
        if 'node_modules' not in str(f)
        and '.git' not in str(f)
        and 'dist' not in str(f)
        and 'build' not in str(f)
    ]
    
    print(f"📂 {len(files_to_fix)} fichiers à vérifier\n")
    
    fixed_count = 0
    fixed_files = []
    
    for filepath in files_to_fix:
        if fix_file(filepath):
            fixed_count += 1
            fixed_files.append(str(filepath))
            print(f"✅ {filepath}")
    
    print()
    print("=" * 70)
    print(f"✅ TERMINÉ ! {fixed_count} fichier(s) corrigé(s)")
    print("=" * 70)
    
    if fixed_count > 0:
        print("\n📋 Fichiers modifiés:")
        for f in fixed_files[:20]:  # Afficher les 20 premiers
            print(f"   • {f}")
        if len(fixed_files) > 20:
            print(f"   ... et {len(fixed_files) - 20} autres")
    
    print("\n🚀 Prochaines étapes:")
    print("   1. Copiez les fichiers corrigés vers GitHub")
    print("   2. Commit + Push")
    print("   3. Vercel va automatiquement redéployer")
    print()

if __name__ == '__main__':
    main()
