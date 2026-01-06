#!/usr/bin/env python3
"""
Script de correction automatique des imports pour production Vercel
Corrige tous les imports de lucide-react et sonner pour enlever les versions
"""

import os
import re
from pathlib import Path

# Compteurs
files_processed = 0
files_modified = 0
total_replacements = 0

# Patterns de recherche et remplacement
patterns = [
    (r"from ['\"]lucide-react@0\.550\.0['\"]", "from 'lucide-react'"),
    (r"from ['\"]lucide-react@0\.562\.0['\"]", "from 'lucide-react'"),
    (r"from ['\"]sonner@2\.0\.3['\"]", "from 'sonner'"),
]

def fix_file(filepath):
    """Corrige les imports dans un fichier"""
    global files_processed, files_modified, total_replacements
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        file_replacements = 0
        
        # Appliquer tous les patterns
        for pattern, replacement in patterns:
            matches = len(re.findall(pattern, content))
            if matches > 0:
                content = re.sub(pattern, replacement, content)
                file_replacements += matches
        
        # Écrire le fichier si modifié
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            files_modified += 1
            total_replacements += file_replacements
            print(f"✅ {filepath} - {file_replacements} remplacement(s)")
        
        files_processed += 1
        
    except Exception as e:
        print(f"❌ Erreur avec {filepath}: {e}")

def process_directory(directory, extensions=['.tsx', '.ts', '.jsx', '.js']):
    """Parcourt récursivement un dossier et corrige les fichiers"""
    exclude_dirs = {'node_modules', 'dist', '.git', '.next', 'build'}
    
    for root, dirs, files in os.walk(directory):
        # Filtrer les dossiers à exclure
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        
        for file in files:
            if any(file.endswith(ext) for ext in extensions):
                filepath = os.path.join(root, file)
                fix_file(filepath)

def main():
    print("🚀 CORRECTION DES IMPORTS POUR PRODUCTION VERCEL\n")
    print("=" * 60)
    
    # Dossiers et fichiers à traiter
    targets = ['components', 'pages', 'lib', 'hooks', 'App.tsx']
    
    for target in targets:
        if os.path.exists(target):
            print(f"\n📁 Traitement de /{target}...")
            if os.path.isdir(target):
                process_directory(target)
            else:
                fix_file(target)
    
    # Résumé
    print("\n" + "=" * 60)
    print(f"✅ TERMINÉ !")
    print(f"📊 Fichiers traités : {files_processed}")
    print(f"📝 Fichiers modifiés : {files_modified}")
    print(f"🔄 Total remplacements : {total_replacements}")
    print("=" * 60)
    
    if files_modified > 0:
        print('\n✨ Tous les imports sont maintenant compatibles avec Vercel !')
        print('💡 Vous pouvez maintenant lancer : npm run build')
    else:
        print('\n✅ Aucune modification nécessaire - tout est déjà correct !')

if __name__ == '__main__':
    main()
