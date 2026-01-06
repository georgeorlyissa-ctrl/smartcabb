#!/bin/bash

echo "📅 MISE À JOUR DE L'ANNÉE 2025 → 2026"
echo "======================================"
echo ""

# Compteur
FICHIERS_MODIFIES=0

# Liste des fichiers à modifier
FILES=(
  "supabase/functions/server/chat-auto-replies.tsx"
  "supabase/functions/server/index.tsx"
  "components/SocialFooter.tsx"
  "components/driver/DriverProfileScreen.tsx"
  "components/passenger/SettingsScreen.tsx"
  "components/shared/PrivacyPolicy.tsx"
  "components/shared/TermsOfService.tsx"
  "pages/AboutPage.tsx"
  "pages/ContactPage.tsx"
  "pages/DriversLandingPage.tsx"
  "pages/LegalPage.tsx"
  "pages/PrivacyPage.tsx"
  "pages/ServicesPage.tsx"
  "pages/TermsPage.tsx"
  "website/about-new-design.html"
  "website/cgu.html"
  "website/contact-new-design.html"
  "website/index-new-design.html"
  "website/mentions-legales.html"
  "website/politique-confidentialite.html"
)

echo "🔍 Fichiers à traiter : ${#FILES[@]}"
echo ""

# Remplacer 2025 par 2026 dans chaque fichier
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    # Remplacer toutes les occurrences de 2025 par 2026
    sed -i 's/2025/2026/g' "$file"
    echo "✅ $file"
    FICHIERS_MODIFIES=$((FICHIERS_MODIFIES + 1))
  else
    echo "⚠️  $file (fichier non trouvé)"
  fi
done

# Aussi remplacer 2024 → 2026 dans SettingsScreen (trouvé dans la recherche)
if [ -f "components/passenger/SettingsScreen.tsx" ]; then
  sed -i 's/2024/2026/g' "components/passenger/SettingsScreen.tsx"
fi

echo ""
echo "======================================"
echo "✅ MISE À JOUR TERMINÉE !"
echo ""
echo "📊 Résumé :"
echo "   - Fichiers modifiés : $FICHIERS_MODIFIES"
echo "   - Année actuelle : 2026 ✨"
echo ""
echo "🚀 Prochaines étapes :"
echo "   1. git add ."
echo "   2. git commit -m 'chore: update copyright year to 2026'"
echo "   3. git push origin main"
echo ""
