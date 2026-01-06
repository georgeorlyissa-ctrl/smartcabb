#!/usr/bin/env python3
"""
Script de restauration rapide des imports pour Figma Make
Convertit framer-motion → motion/react dans TOUS les fichiers
"""

import os
import re

def fix_file(filepath):
    """Corrige un fichier TypeScript/TSX"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        # Corrections
        content = re.sub(r"from ['\"]framer-motion['\"]", "from 'motion/react'", content)
        content = re.sub(r"from ['\"]lucide-react@[^'\"]*['\"]", "from 'lucide-react'", content)
        content = re.sub(r"from ['\"]sonner@[^'\"]*['\"]", "from 'sonner'", content)
        
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
    except Exception as e:
        print(f"❌ Erreur: {filepath}: {e}")
    return False

def main():
    print("🔄 RESTAURATION DES IMPORTS POUR FIGMA MAKE")
    print("=" * 50)
    
    fixed = 0
    for root, dirs, files in os.walk('.'):
        # Ignorer certains dossiers
        dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules', '.next', 'dist', '.vercel']]
        
        for file in files:
            if file.endswith(('.tsx', '.ts')):
                filepath = os.path.join(root, file)
                if fix_file(filepath):
                    fixed += 1
                    print(f"✅ {filepath}")
    
    print("=" * 50)
    print(f"✅ {fixed} fichiers corrigés")
    print("\n📦 Imports restaurés pour Figma Make (esm.sh):")
    print("   • framer-motion → motion/react")
    print("   • lucide-react (sans version)")
    print("   • sonner (sans version)")

if __name__ == '__main__':
    main()
