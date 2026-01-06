#!/usr/bin/env python3
"""
Script pour corriger TOUS les imports de lucide-react et sonner
dans tous les fichiers TypeScript/TSX
"""

import os
import re
from pathlib import Path

def fix_imports_in_file(file_path):
    """Corrige les imports dans un fichier"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        modified = False
        
        # Correction 1: lucide-react avec guillemets simples
        if "from 'lucide-react';" in content:
            content = content.replace("from 'lucide-react';", "from 'lucide-react@0.550.0';")
            modified = True
            print(f"  ✓ Corrigé 'lucide-react' → 'lucide-react@0.550.0' dans {file_path}")
        
        # Correction 2: lucide-react avec guillemets doubles
        if 'from "lucide-react";' in content:
            content = content.replace('from "lucide-react";', 'from "lucide-react@0.550.0";')
            modified = True
            print(f"  ✓ Corrigé \"lucide-react\" → \"lucide-react@0.550.0\" dans {file_path}")
        
        # Correction 3: sonner avec guillemets simples
        if "from 'sonner';" in content:
            content = content.replace("from 'sonner';", "from 'sonner@2.0.3';")
            modified = True
            print(f"  ✓ Corrigé 'sonner' → 'sonner@2.0.3' dans {file_path}")
        
        # Correction 4: sonner avec guillemets doubles
        if 'from "sonner";' in content:
            content = content.replace('from "sonner";', 'from "sonner@2.0.3";')
            modified = True
            print(f"  ✓ Corrigé \"sonner\" → \"sonner@2.0.3\" dans {file_path}")
        
        # Sauvegarder seulement si modifié
        if modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        
        return False
        
    except Exception as e:
        print(f"  ❌ Erreur dans {file_path}: {e}")
        return False

def main():
    """Fonction principale"""
    print("🔧 Correction de TOUS les imports lucide-react et sonner...")
    print()
    
    # Trouver tous les fichiers .tsx et .ts
    files_to_check = []
    for ext in ['*.tsx', '*.ts']:
        files_to_check.extend(Path('.').rglob(ext))
    
    # Exclure node_modules et autres dossiers
    files_to_check = [
        f for f in files_to_check 
        if 'node_modules' not in str(f) 
        and '.git' not in str(f)
        and 'dist' not in str(f)
        and 'build' not in str(f)
    ]
    
    print(f"📂 {len(files_to_check)} fichiers à vérifier")
    print()
    
    fixed_count = 0
    
    for file_path in files_to_check:
        if fix_imports_in_file(file_path):
            fixed_count += 1
    
    print()
    print("=" * 60)
    print(f"✅ Terminé ! {fixed_count} fichiers corrigés")
    print("=" * 60)
    print()
    print("📝 Prochaines étapes:")
    print("   git add .")
    print('   git commit -m "✅ Fix: Use lucide-react@0.550.0 and sonner@2.0.3"')
    print("   git push origin main")
    print()

if __name__ == '__main__':
    main()
