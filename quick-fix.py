import os
import re

fixed = 0
for root, dirs, files in os.walk('.'):
    dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules', '.next', 'dist']]
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                new_content = content
                new_content = re.sub(r"from ['\"]motion/react['\"]", "from 'framer-motion'", new_content)
                new_content = re.sub(r"from ['\"]lucide-react@[^'\"]*['\"]", "from 'lucide-react'", new_content)
                new_content = re.sub(r"from ['\"]sonner@[^'\"]*['\"]", "from 'sonner'", new_content)
                if new_content != content:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"✅ {path}")
                    fixed += 1
            except Exception as e:
                print(f"❌ {path}: {e}")

print(f"\n✨ {fixed} fichiers corrigés\n")
