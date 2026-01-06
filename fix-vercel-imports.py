#!/usr/bin/env python3
"""
Script de correction des imports pour Vercel
Supprime TOUTES les versions des imports (@X.X.X)
"""

import os
import re

def fix_file(filepath):
    """Corrige un fichier en supprimant les versions des imports"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        # Supprimer TOUTES les versions dans les imports
        # Exemple: 'framer-motion@10.18.0' → 'framer-motion'
        content = re.sub(
            r"from ['\"]([a-zA-Z0-9@/_-]+)@[0-9]+\.[0-9]+\.[0-9]+[^'\"]*['\"]",
            r"from '\1'",
            content
        )
        
        # Cas spécifiques
        content = re.sub(r"from ['\"]framer-motion@[^'\"]*['\"]", "from 'framer-motion'", content)
        content = re.sub(r"from ['\"]lucide-react@[^'\"]*['\"]", "from 'lucide-react'", content)
        content = re.sub(r"from ['\"]sonner@[^'\"]*['\"]", "from 'sonner'", content)
        content = re.sub(r"from ['\"]motion/react['\"]", "from 'framer-motion'", content)
        
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
    except Exception as e:
        print(f"❌ Erreur: {filepath}: {e}")
    return False

def main():
    print("🔧 CORRECTION DES IMPORTS POUR VERCEL")
    print("=" * 60)
    print("Suppression des versions (@X.X.X) dans tous les imports...")
    print("")
    
    fixed = 0
    fixed_files = []
    
    for root, dirs, files in os.walk('.'):
        # Ignorer certains dossiers
        dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules', '.next', 'dist', '.vercel']]
        
        for file in files:
            if file.endswith(('.tsx', '.ts', '.jsx', '.js')):
                filepath = os.path.join(root, file)
                if fix_file(filepath):
                    fixed += 1
                    fixed_files.append(filepath)
                    print(f"✅ {filepath}")
    
    print("")
    print("=" * 60)
    print(f"✅ {fixed} fichiers corrigés")
    print("")
    print("📦 Corrections appliquées :")
    print("   • framer-motion@X.X.X → framer-motion")
    print("   • lucide-react@X.X.X → lucide-react")
    print("   • sonner@X.X.X → sonner")
    print("   • motion/react → framer-motion")
    print("   • Toutes autres versions supprimées")
    print("")
    print("🚀 Prêt pour déploiement Vercel !")

if __name__ == '__main__':
    main()
