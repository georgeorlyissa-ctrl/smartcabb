#!/usr/bin/env python3
"""
🚀 Script de correction MASSIVE des imports pour Figma Make
Corrige tous les imports framer-motion et lucide-react
v517.123 - SmartCabb Auto-Fix
"""

import os
import re
from pathlib import Path

# Compteurs
files_processed = 0
files_fixed = 0

# Fichiers à ignorer
IGNORED_FILES = {'framer-motion.tsx', 'lucide-react.ts', 'lucide-react.tsx', 'framer-motion.ts'}
IGNORED_DIRS = {'node_modules', '.git', '.next', 'dist', 'build', '.vercel', 'supabase', 'imports'}

def calculate_relative_path(file_path):
    """Calcule le chemin relatif vers la racine"""
    depth = len(Path(file_path).parents) - 1
    if depth <= 0:
        return '.'
    return '../' * depth

def fix_imports(file_path):
    """Corrige les imports dans un fichier"""
    global files_processed, files_fixed
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Calculer le chemin relatif
        relative_path = calculate_relative_path(file_path).rstrip('/')
        framer_path = f"{relative_path}/framer-motion"
        lucide_path = f"{relative_path}/lucide-react"
        
        # Patterns à corriger
        patterns = [
            # framer-motion direct
            (r"from\s+['\"]framer-motion['\"]", f"from '{framer_path}'"),
            # motion/react
            (r"from\s+['\"]motion/react['\"]", f"from '{framer_path}'"),
            # framer-motion avec version
            (r"from\s+['\"]framer-motion@[^'\"]*['\"]", f"from '{framer_path}'"),
            # lucide-react direct
            (r"from\s+['\"]lucide-react['\"]", f"from '{lucide_path}'"),
            # lucide-react avec version
            (r"from\s+['\"]lucide-react@[^'\"]*['\"]", f"from '{lucide_path}'"),
        ]
        
        # Appliquer toutes les corrections
        for pattern, replacement in patterns:
            content = re.sub(pattern, replacement, content)
        
        # Vérifier si le fichier a été modifié
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Corrigé: {file_path}")
            files_fixed += 1
            return True
        
        files_processed += 1
        return False
        
    except Exception as e:
        print(f"❌ Erreur sur {file_path}: {e}")
        return False

def walk_directory(directory='.'):
    """Parcourt récursivement le répertoire"""
    for root, dirs, files in os.walk(directory):
        # Filtrer les dossiers à ignorer
        dirs[:] = [d for d in dirs if d not in IGNORED_DIRS]
        
        for file in files:
            # Vérifier l'extension
            if not (file.endswith('.tsx') or file.endswith('.ts') or file.endswith('.jsx') or file.endswith('.js')):
                continue
            
            # Ignorer les wrappers
            if file in IGNORED_FILES:
                continue
            
            file_path = os.path.join(root, file)
            
            # Vérifier si le fichier contient les imports problématiques
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    if ("from 'framer-motion'" in content or 
                        "from \"framer-motion\"" in content or
                        "from 'motion/react'" in content or
                        "from 'lucide-react'" in content or
                        "from \"lucide-react\"" in content or
                        'framer-motion@' in content or
                        'lucide-react@' in content):
                        fix_imports(file_path)
                    else:
                        files_processed += 1
            except Exception as e:
                print(f"⚠️ Erreur lecture {file_path}: {e}")

def main():
    """Fonction principale"""
    print("\n🚀 SmartCabb Import Fixer v517.123\n")
    print("=" * 60)
    print("🎯 Objectif: Corriger les imports pour Figma Make")
    print("📦 Utilisation des wrappers locaux")
    print("=" * 60 + "\n")
    
    print("🔍 Recherche des fichiers à corriger...\n")
    
    # Lancer la correction
    walk_directory('.')
    
    # Afficher le résumé
    print("\n" + "=" * 60)
    print("✨ RÉSULTAT FINAL")
    print("=" * 60)
    print(f"📁 Fichiers analysés: {files_processed + files_fixed}")
    print(f"🔄 Fichiers corrigés: {files_fixed}")
    print("=" * 60)
    
    if files_fixed > 0:
        print("\n✅ Tous les imports ont été corrigés pour Figma Make!")
        print("🎨 L'application devrait maintenant se compiler sans erreurs.")
    else:
        print("\n✅ Aucun fichier à corriger - tout est déjà bon!")
    
    print("\n")

if __name__ == '__main__':
    main()
