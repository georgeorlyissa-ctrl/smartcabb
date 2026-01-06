#!/usr/bin/env python3
"""
Script de correction COMPLÈTE des imports pour VERCEL BUILD
- Supprime TOUTES les versions des packages (@X.X.X)
- Convertit motion/react → framer-motion
"""

import os
import re
import glob

def fix_imports_in_file(filepath):
    """Corrige les imports dans un fichier"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # 1. Supprimer lucide-react@X.X.X → lucide-react
        content = re.sub(
            r"from ['\"]lucide-react@[0-9]+\.[0-9]+\.[0-9]+['\"]",
            "from 'lucide-react'",
            content
        )
        
        # 2. Supprimer sonner@X.X.X → sonner
        content = re.sub(
            r"from ['\"]sonner@[0-9]+\.[0-9]+\.[0-9]+['\"]",
            "from 'sonner'",
            content
        )
        
        # 3. Supprimer framer-motion@X.X.X → framer-motion
        content = re.sub(
            r"from ['\"]framer-motion@[0-9]+\.[0-9]+\.[0-9]+['\"]",
            "from 'framer-motion'",
            content
        )
        
        # 4. Convertir motion/react → framer-motion (déjà fait mais au cas où)
        content = re.sub(
            r"from ['\"]motion/react['\"]",
            "from 'framer-motion'",
            content
        )
        
        # 5. Supprimer TOUS les autres packages avec versions
        content = re.sub(
            r"from ['\"]([a-zA-Z0-9@/_-]+)@[0-9]+\.[0-9]+\.[0-9]+[^'\"]*['\"]",
            r"from '\1'",
            content
        )
        
        # Écrire seulement si modifié
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"❌ Erreur dans {filepath}: {e}")
        return False

def main():
    print("🚀 CORRECTION COMPLÈTE DES IMPORTS POUR VERCEL")
    print("=" * 70)
    
    # Trouver tous les fichiers TypeScript/React
    extensions = ['**/*.tsx', '**/*.ts', '**/*.jsx', '**/*.js']
    excluded_dirs = ['node_modules', '.git', '.next', 'dist', '.vercel']
    
    all_files = []
    for ext in extensions:
        for filepath in glob.glob(ext, recursive=True):
            # Exclure certains dossiers
            if not any(excluded in filepath for excluded in excluded_dirs):
                all_files.append(filepath)
    
    print(f"📂 {len(all_files)} fichiers trouvés\n")
    
    fixed_count = 0
    fixed_files = []
    
    for filepath in all_files:
        if fix_imports_in_file(filepath):
            fixed_count += 1
            fixed_files.append(filepath)
            print(f"✅ {filepath}")
    
    print("\n" + "=" * 70)
    print(f"✅ {fixed_count} fichiers corrigés sur {len(all_files)}")
    print("\n📋 CORRECTIONS APPLIQUÉES:")
    print("   ✓ lucide-react@0.550.0 → lucide-react")
    print("   ✓ sonner@2.0.3 → sonner")
    print("   ✓ framer-motion@X.X.X → framer-motion")
    print("   ✓ motion/react → framer-motion")
    print("   ✓ Toutes autres versions supprimées")
    print("\n🎯 PRÊT POUR VERCEL BUILD !")
    print("\n📦 PROCHAINES ÉTAPES:")
    print("   1. git add .")
    print("   2. git commit -m 'fix: Suppression versions imports pour Vercel build'")
    print("   3. git push origin main")
    print("\n✨ Vercel va automatiquement redéployer smartcabb.com")

if __name__ == '__main__':
    main()
