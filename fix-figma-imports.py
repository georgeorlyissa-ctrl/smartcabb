#!/usr/bin/env python3
"""
Script de correction automatique des imports pour Figma Make
Corrige tous les imports framer-motion et lucide-react@version
"""

import os
import re
from pathlib import Path

def get_relative_path(file_path):
    """Calcule le chemin relatif vers la racine selon la profondeur du fichier"""
    depth = len(Path(file_path).parts) - 1
    if depth == 0:
        return './'
    return '../' * depth

def fix_file(file_path):
    """Corrige un fichier TypeScript/TSX"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        relative_path = get_relative_path(file_path)
        
        # 1. Corriger framer-motion → wrapper local
        # Pattern: from 'framer-motion'
        content = re.sub(
            r"from\s+['\"]framer-motion['\"]",
            f"from '{relative_path}framer-motion'",
            content
        )
        
        # 2. Corriger lucide-react@version → wrapper local
        # Pattern: from 'lucide-react@0.550.0'
        content = re.sub(
            r"from\s+['\"]lucide-react@[^'\"]+['\"]",
            f"from '{relative_path}lucide-react'",
            content
        )
        
        # 3. Vérifier si le fichier a changé
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Corrigé: {file_path}")
            return True
        
        return False
    
    except Exception as e:
        print(f"❌ Erreur dans {file_path}: {e}")
        return False

def main():
    """Fonction principale"""
    print("🔧 Correction automatique des imports pour Figma Make\n")
    
    fixed_count = 0
    total_count = 0
    
    # Parcourir tous les fichiers .tsx et .ts
    for root, dirs, files in os.walk('.'):
        # Ignorer node_modules, .git, etc.
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', '.next', 'dist', 'build']]
        
        for file in files:
            if file.endswith(('.tsx', '.ts')) and not file.endswith('.d.ts'):
                file_path = os.path.join(root, file)
                total_count += 1
                
                if fix_file(file_path):
                    fixed_count += 1
    
    print(f"\n📊 Résumé:")
    print(f"   Fichiers analysés: {total_count}")
    print(f"   Fichiers corrigés: {fixed_count}")
    print(f"\n✅ Terminé!")

if __name__ == '__main__':
    main()
