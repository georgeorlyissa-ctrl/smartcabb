#!/bin/bash

echo "🔧 CORRECTION AUTOMATIQUE DES IMPORTS - SmartCabb Production"
echo "=============================================================="
echo ""

# Compteur
count=0

# Fonction pour remplacer dans un fichier
fix_file() {
    local file="$1"
    if [ -f "$file" ]; then
        # Remplacer lucide-react@0.550.0 par lucide-react
        if grep -q "lucide-react@0\.550\.0" "$file"; then
            sed -i.bak "s/lucide-react@0\.550\.0/lucide-react/g" "$file"
            rm -f "${file}.bak"
            echo "  ✅ $file"
            count=$((count + 1))
        fi
        
        # Remplacer sonner@2.0.3 par sonner
        if grep -q "sonner@2\.0\.3" "$file"; then
            sed -i.bak "s/sonner@2\.0\.3/sonner/g" "$file"
            rm -f "${file}.bak"
            echo "  ✅ $file"
            count=$((count + 1))
        fi
    fi
}

echo "🔍 Recherche et correction des imports avec versions..."
echo ""

# Liste des fichiers à corriger
files=(
"/components/CancellationCompensation.tsx"
"/components/CommissionSettings.tsx"
"/components/ConnectionDiagnostic.tsx"
"/components/DatabaseSetupModal.tsx"
"/components/DebugPanel.tsx"
"/components/DebugPaymentModal.tsx"
"/components/DiagnosticFloatingButton.tsx"
"/components/EmailPhoneInput.tsx"
"/components/EmergencyAlert.tsx"
"/components/ErrorBoundary.tsx"
"/components/ForgotPasswordScreen.tsx"
"/components/FreeWaitingToggle.tsx"
"/components/InteractiveMapView.tsx"
"/components/LandingScreen.tsx"
"/components/LiveStatsPanel.tsx"
"/components/MarketingNotification.tsx"
"/components/MixedPaymentSelector.tsx"
"/components/OTPVerification.tsx"
"/components/PWAInstallPrompt.tsx"
"/components/PassengerCountSelector.tsx"
"/components/PaymentSuccessDialog.tsx"
"/components/PerformanceMonitor.tsx"
"/components/PhoneInput.tsx"
"/components/PolicyModal.tsx"
"/components/PromoCodeInput.tsx"
"/components/PushNotifications.tsx"
"/components/RLSBlockingScreen.tsx"
"/components/RLSFixModal.tsx"
"/components/ResetPasswordOTPScreen.tsx"
"/components/RideCompletionDialog.tsx"
"/components/RideCompletionSummary.tsx"
"/components/RideCompletionSummaryDialog.tsx"
"/components/RideTimer.tsx"
"/components/TestimonialsCarousel.tsx"
"/components/TipSelector.tsx"
"/components/UserSelectionScreen.tsx"
"/components/admin/AdminDashboard.tsx"
"/components/auth/CreateAuthFromProfilePage.tsx"
"/components/auth/ForgotPasswordPage.tsx"
"/components/auth/ResetPasswordByPhonePage.tsx"
"/components/auth/ResetPasswordPage.tsx"
"/components/driver/ClientInfoScreen.tsx"
"/components/driver/DriverLoginScreen.tsx"
"/components/driver/DriverSettingsScreen.tsx"
"/components/driver/EarningsScreen.tsx"
"/components/driver/ConfirmationCodeScreen.tsx"
"/components/driver/ActiveRideScreen.tsx"
"/components/driver/PaymentConfirmationScreen.tsx"
"/components/ui/accordion.tsx"
"/components/ui/breadcrumb.tsx"
"/components/ui/button.tsx"
"/components/ui/calendar.tsx"
"/components/ui/carousel.tsx"
"/components/ui/checkbox.tsx"
"/components/ui/command.tsx"
"/components/ui/context-menu.tsx"
"/components/ui/dialog.tsx"
"/components/ui/dropdown-menu.tsx"
"/components/ui/input-otp.tsx"
"/components/ui/menubar.tsx"
"/components/ui/navigation-menu.tsx"
"/components/ui/pagination.tsx"
"/components/ui/radio-group.tsx"
"/components/ui/resizable.tsx"
"/components/ui/select.tsx"
"/components/ui/sheet.tsx"
"/components/ui/sidebar.tsx"
)

# Ajouter le chemin racine si on est dans le projet
for file in "${files[@]}"; do
    fix_file "$file"
done

echo ""
echo "=============================================================="
echo "✅ TERMINÉ ! $count fichier(s) corrigé(s)"
echo ""
echo "Prochaines étapes :"
echo "  1. npm install"
echo "  2. npm run build"
echo "  3. git add . && git commit -m 'fix: correction imports production'"
echo "  4. git push origin main"
echo ""
