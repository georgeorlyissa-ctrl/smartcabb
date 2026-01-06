#!/bin/bash

# Script de nettoyage complet des conflits Git pour SmartCabb
# Résout TOUS les conflits en gardant la version locale (OURS)

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   🧹 NETTOYAGE COMPLET DES CONFLITS GIT - SMARTCABB       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Compteurs
TOTAL_FILES=0
CLEANED_FILES=0

# Créer un backup horodaté
BACKUP_DIR="backup_cleanup_$(date +%Y%m%d_%H%M%S)"
echo "📦 Création du backup: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Fonction pour nettoyer un fichier en conflit
clean_conflict_file() {
    local file="$1"
    
    # Copier dans le backup
    cp "$file" "$BACKUP_DIR/$(basename "$file")"
    
    # Créer un fichier temporaire
    temp_file="${file}.tmp"
    
    # Variables pour suivre l'état
    in_conflict=false
    keep_section=false
    
    while IFS= read -r line; do
        if [[ "$line" =~ ^\<\<\<\<\<\<\<[[:space:]] ]]; then
            # Début du conflit - on garde la section OURS (locale)
            in_conflict=true
            keep_section=true
            continue
        elif [[ "$line" =~ ^=======[[:space:]]* ]] && [ "$in_conflict" = true ]; then
            # Milieu du conflit - on passe à la section THEIRS (on ignore)
            keep_section=false
            continue
        elif [[ "$line" =~ ^\>\>\>\>\>\>\>[[:space:]] ]]; then
            # Fin du conflit
            in_conflict=false
            keep_section=false
            continue
        fi
        
        # Écrire la ligne seulement si on n'est pas dans un conflit ou si on garde cette section
        if [ "$in_conflict" = false ] || [ "$keep_section" = true ]; then
            echo "$line" >> "$temp_file"
        fi
    done < "$file"
    
    # Remplacer le fichier original
    mv "$temp_file" "$file"
    
    echo "  ✅ Nettoyé: $file"
    ((CLEANED_FILES++))
}

echo ""
echo "🔍 Recherche des fichiers avec marqueurs de conflit..."
echo ""

# Chercher tous les fichiers avec des marqueurs de conflit
while IFS= read -r file; do
    if [ -f "$file" ]; then
        ((TOTAL_FILES++))
        echo "📄 Traitement: $file"
        clean_conflict_file "$file"
    fi
done < <(grep -rl "<<<<<<< HEAD" components/ hooks/ lib/ pages/ styles/ utils/ 2>/dev/null || true)

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                     📊 RÉSUMÉ FINAL                        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "✅ Fichiers traités: $TOTAL_FILES"
echo "✅ Fichiers nettoyés: $CLEANED_FILES"
echo "✅ Backup créé: $BACKUP_DIR"
echo ""

# Vérification finale
REMAINING_CONFLICTS=$(grep -r "<<<<<<< HEAD" components/ hooks/ lib/ pages/ styles/ utils/ 2>/dev/null | wc -l)

if [ "$REMAINING_CONFLICTS" -eq 0 ]; then
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║  ✅ PARFAIT ! Tous les conflits ont été nettoyés          ║"
    echo "║  Vous pouvez maintenant commiter et pusher ! 🚀           ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo "📋 Prochaines étapes:"
    echo ""
    echo "1. Vérifier les imports:"
    echo "   ./verify-imports.sh"
    echo ""
    echo "2. Ajouter les changements:"
    echo "   git add ."
    echo ""
    echo "3. Commiter:"
    echo "   git commit -m \"fix: nettoyage complet conflits Git + correction imports\""
    echo ""
    echo "4. Pusher:"
    echo "   git push origin main"
    echo ""
else
    echo "⚠️  ATTENTION: $REMAINING_CONFLICTS marqueur(s) de conflit restant(s)"
    echo ""
    echo "Fichiers concernés:"
    grep -r "<<<<<<< HEAD" components/ hooks/ lib/ pages/ styles/ utils/ 2>/dev/null | cut -d: -f1 | sort -u
    echo ""
    echo "💡 Vous pouvez ré-exécuter ce script ou résoudre manuellement."
fi
