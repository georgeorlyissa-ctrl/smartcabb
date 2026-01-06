#!/usr/bin/env python3
"""
Script de correction automatique des imports pour SmartCabb Production
Corrige tous les imports lucide-react@ et sonner@ dans tous les fichiers .tsx et .ts
"""

import os
import re
from pathlib import Path

def fix_imports_in_file(file_path):
    """Corrige les imports dans un fichier donné"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Remplacer lucide-react@x.x.x par lucide-react
        content = re.sub(
            r"from\s+['\"]lucide-react@[^'\"]+['\"]",
            "from 'lucide-react'",
            content
        )
        
        # Remplacer sonner@x.x.x par sonner
        content = re.sub(
            r"from\s+['\"]sonner@[^'\"]+['\"]",
            "from 'sonner'",
            content
        )
        
        # Écrire seulement si modifié
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    
    except Exception as e:
        print(f"❌ Erreur dans {file_path}: {e}")
        return False

def main():
    print("🔧 CORRECTION AUTOMATIQUE DES IMPORTS - SmartCabb Production")
    print("=" * 70)
    print("")
    
    # Trouver tous les fichiers .tsx et .ts
    count = 0
    fixed_files = []
    
    for root, dirs, files in os.walk('.'):
        # Ignorer node_modules, dist, .git
        dirs[:] = [d for d in dirs if d not in ['node_modules', 'dist', '.git', '.vite']]
        
        for file in files:
            if file.endswith(('.tsx', '.ts')):
                file_path = os.path.join(root, file)
                if fix_imports_in_file(file_path):
                    count += 1
                    fixed_files.append(file_path)
                    print(f"  ✅ {file_path}")
    
    print("")
    print("=" * 70)
    print(f"✅ Terminé ! {count} fichier(s) corrigé(s)")
    print("")
    
    # Vérification
    remaining = 0
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in ['node_modules', 'dist', '.git']]
        for file in files:
            if file.endswith(('.tsx', '.ts')):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        if '@0.550.0' in content or '@2.0.3' in content or '@0.562.0' in content:
                            remaining += 1
                            print(f"⚠️  Encore des imports avec version dans: {file_path}")
                except:
                    pass
    
    if remaining == 0:
        print("✅ SUCCÈS ! Aucun import avec version trouvé")
    else:
        print(f"⚠️  {remaining} fichier(s) contiennent encore des imports avec version")
    
    print("")
    print("Prochaines étapes :")
    print("  1. npm install")
    print("  2. npm run build")
    print("  3. git add .")
    print("  4. git commit -m 'fix: correction imports production'")
    print("  5. git push origin main")
    print("")

if __name__ == "__main__":
    main()
