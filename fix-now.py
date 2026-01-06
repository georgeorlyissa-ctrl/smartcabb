#!/usr/bin/env python3
"""
Script de correction automatique des imports pour Figma Make
Corrige tous les imports framer-motion et lucide-react@version
"""

import os
import re

def get_relative_path(filepath):
    """Calcule le chemin relatif vers la racine"""
    # Enlever './' du début
    clean_path = filepath.lstrip('./')
    # Compter le nombre de '/'
    depth = clean_path.count(os.sep)
    
    if depth == 0:
        return './'
    return '../' * depth

def fix_file(filepath):
    """Corrige un fichier"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        relative_path = get_relative_path(filepath)
        
        # Fix 1: from 'framer-motion' → from '../framer-motion'
        content = re.sub(
            r"from\s+['\"]framer-motion['\"]",
            f"from '{relative_path}framer-motion'",
            content
        )
        
        # Fix 2: from 'lucide-react@x.x.x' → from '../lucide-react'
        content = re.sub(
            r"from\s+['\"]lucide-react@[^'\"]+['\"]",
            f"from '{relative_path}lucide-react'",
            content
        )
        
        # Sauvegarder si modifié
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ {filepath}")
            return True
        
        return False
    
    except Exception as e:
        print(f"❌ Erreur dans {filepath}: {e}")
        return False

def main():
    """Fonction principale"""
    print("🔧 Correction automatique des imports pour Figma Make\n")
    
    fixed_count = 0
    total_count = 0
    
    # Parcourir tous les fichiers
    for root, dirs, files in os.walk('.'):
        # Ignorer certains dossiers
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', '.next', 'dist', 'build']]
        
        for file in files:
            # Traiter uniquement .ts et .tsx (sauf .d.ts)
            if file.endswith(('.tsx', '.ts')) and not file.endswith('.d.ts'):
                filepath = os.path.join(root, file)
                total_count += 1
                
                if fix_file(filepath):
                    fixed_count += 1
    
    print(f"\n📊 Résumé:")
    print(f"   Fichiers analysés: {total_count}")
    print(f"   Fichiers corrigés: {fixed_count}")
    print(f"\n✅ Terminé!")
    
    if fixed_count > 0:
        print(f"\n🎯 Prochaines étapes:")
        print(f"   1. Testez l'application dans Figma Make")
        print(f"   2. Si tout fonctionne, commitez les changements")
        print(f"   3. Avant de déployer sur Vercel, exécutez: bash fix-vercel.sh")

if __name__ == '__main__':
    main()
