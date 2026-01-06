#!/usr/bin/env python3
"""
Script de correction automatique des imports pour compatibilité Vercel
Corrige motion/react, lucide-react@version, sonner@version, etc.
"""

import os
import re
from pathlib import Path

# Patterns de remplacement
REPLACEMENTS = [
    (r"from ['\"]motion/react['\"]", "from 'framer-motion'"),
    (r"from ['\"]lucide-react@[^'\"]*['\"]", "from 'lucide-react'"),
    (r"from ['\"]sonner@[^'\"]*['\"]", "from 'sonner'"),
    (r"from ['\"]framer-motion@[^'\"]*['\"]", "from 'framer-motion'"),
    (r"from ['\"]react-hook-form@[^'\"]*['\"]", "from 'react-hook-form'"),
]

def fix_file(filepath):
    """Corrige les imports dans un fichier"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        modified = False
        
        for pattern, replacement in REPLACEMENTS:
            if re.search(pattern, content):
                content = re.sub(pattern, replacement, content)
                modified = True
        
        if modified:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ {filepath}")
            return 1
        return 0
    except Exception as e:
        print(f"❌ Erreur {filepath}: {e}")
        return 0

def main():
    """Parcourt et corrige tous les fichiers .tsx et .ts"""
    print("\n🔧 Correction des imports en cours...\n")
    
    files_fixed = 0
    ignored_dirs = {'.git', 'node_modules', '.next', 'dist', 'build', '.vercel'}
    
    for root, dirs, files in os.walk('.'):
        # Filtrer les dossiers à ignorer
        dirs[:] = [d for d in dirs if d not in ignored_dirs]
        
        for file in files:
            if file.endswith(('.tsx', '.ts', '.jsx', '.js')):
                filepath = os.path.join(root, file)
                files_fixed += fix_file(filepath)
    
    print(f"\n✨ {files_fixed} fichiers corrigés!\n")
    print("📋 Prochaines étapes:")
    print("   git add .")
    print('   git commit -m "fix: Correction imports pour Vercel"')
    print("   git push origin main\n")

if __name__ == "__main__":
    main()
