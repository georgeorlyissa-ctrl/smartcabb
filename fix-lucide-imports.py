#!/usr/bin/env python3
"""
🔧 Script de correction des imports lucide-react
Remplace tous les imports 'lucide-react' par 'lucide-react@0.550.0'
"""

import os
import re

def fix_lucide_imports(file_path):
    """Corrige les imports lucide-react dans un fichier"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Pattern pour détecter les imports lucide-react
        pattern = r"from ['\"]lucide-react['\"]"
        replacement = "from 'lucide-react@0.550.0'"
        
        # Compter les occurrences
        matches = re.findall(pattern, content)
        if not matches:
            return False
        
        # Remplacer
        new_content = re.sub(pattern, replacement, content)
        
        # Écrire le fichier modifié
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        return True
    except Exception as e:
        print(f"❌ Erreur avec {file_path}: {e}")
        return False

def main():
    """Parcourt tous les fichiers .tsx et corrige les imports"""
    fixed_count = 0
    total_files = 0
    
    # Parcourir récursivement tous les fichiers .tsx
    for root, dirs, files in os.walk('.'):
        # Ignorer node_modules et autres dossiers
        dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules', 'dist', 'build']]
        
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                total_files += 1
                file_path = os.path.join(root, file)
                
                if fix_lucide_imports(file_path):
                    fixed_count += 1
                    print(f"✅ {file_path}")
    
    print(f"\n🎉 Terminé !")
    print(f"📊 {fixed_count}/{total_files} fichiers corrigés")
    print(f"\n💡 Prochaine étape : Corriger les imports sonner")
    print(f"   Rechercher : from 'sonner';")
    print(f"   Remplacer par : from 'sonner@2.0.3';")

if __name__ == "__main__":
    main()
