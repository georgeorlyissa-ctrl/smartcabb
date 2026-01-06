#!/usr/bin/env python3
"""
Script de correction massive des imports pour Figma Make
Corrige:
- from 'framer-motion' → from '../../../framer-motion'
- from 'lucide-react@x.x.x' → from '../../../lucide-react'
"""

import os
import re

def calculate_depth(filepath):
    """Calcule la profondeur du fichier pour déterminer le chemin relatif"""
    parts = filepath.split(os.sep)
    # Retirer le '.' du début et compter
    parts = [p for p in parts if p and p != '.']
    depth = len(parts) - 1
    
    if depth == 0:
        return './'
    return '../' * depth

def fix_imports(filepath):
    """Corrige les imports dans un fichier"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    relative_path = calculate_depth(filepath)
    
    # Fix 1: framer-motion
    content = re.sub(
        r'''from\s+['"]framer-motion['"]''',
        f'''from '{relative_path}framer-motion\'''',
        content
    )
    
    # Fix 2: lucide-react@version
    content = re.sub(
        r'''from\s+['"]lucide-react@[^'"]+['"]''',
        f'''from '{relative_path}lucide-react\'''',
        content
    )
    
    # Sauvegarder si modifié
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ {filepath}")
        return True
    return False

def main():
    """Parcourir et corriger tous les fichiers"""
    print("🔧 Correction massive des imports...\n")
    
    count = 0
    for root, dirs, files in os.walk('.'):
        # Ignorer node_modules, .git, etc.
        dirs[:] = [d for d in dirs if d not in {'node_modules', '.git', '.next', 'dist', 'build'}]
        
        for file in files:
            if file.endswith(('.tsx', '.ts')) and not file.endswith('.d.ts'):
                filepath = os.path.join(root, file)
                if fix_imports(filepath):
                    count += 1
    
    print(f"\n📊 {count} fichiers corrigés")

if __name__ == '__main__':
    main()
