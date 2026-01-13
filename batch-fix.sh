#!/bin/bash

# Script pour corriger tous les imports lucide-react vers lib/icons
# Ce script va être exécuté manuellement via l'outil

# Pour chaque fichier, remplacer :
# - 'lucide-react' par le bon chemin relatif vers lib/icons
# - "lucide-react" par le bon chemin relatif vers lib/icons

# Fichiers racine
sed -i "s|from 'lucide-react'|from './lib/icons'|g" /GITHUB_EstimateScreen.tsx

# /components/*
for file in \
  /components/CancellationCompensation.tsx \
  /components/CommissionSettings.tsx \
  /components/ConnectionDiagnostic.tsx \
  /components/DatabaseSetupModal.tsx \
  /components/DebugPanel.tsx \
  /components/DebugPaymentModal.tsx \
  /components/DiagnosticFloatingButton.tsx \
  /components/EmailPhoneInput.tsx \
  /components/EmergencyAlert.tsx \
  /components/ErrorBoundary.tsx \
  /components/ForgotPasswordScreen.tsx \
  /components/FreeWaitingToggle.tsx \
  /components/InteractiveMapView.tsx \
  /components/LandingScreen.tsx \
  /components/LiveStatsPanel.tsx \
  /components/MarketingNotification.tsx \
  /components/MixedPaymentSelector.tsx \
  /components/OTPVerification.tsx \
  /components/PassengerCountSelector.tsx \
  /components/PaymentSuccessDialog.tsx \
  /components/PerformanceMonitor.tsx \
  /components/PhoneInput.tsx \
  /components/PolicyModal.tsx \
  /components/PromoCodeInput.tsx \
  /components/PushNotifications.tsx \
  /components/RLSBlockingScreen.tsx \
  /components/RLSFixModal.tsx \
  /components/ResetPasswordOTPScreen.tsx \
  /components/RideCompletionDialog.tsx \
  /components/RideCompletionSummary.tsx \
  /components/RideCompletionSummaryDialog.tsx \
  /components/RideTimer.tsx \
  /components/RouteMapPreview.tsx \
  /components/TestimonialsCarousel.tsx \
  /components/TipSelector.tsx \
  /components/UserSelectionScreen.tsx \
  /components/UsersManagementScreen.tsx \
  /components/WelcomeBackScreen.tsx \
  /components/WelcomeDialog.tsx \
  /components/WelcomeMessage.tsx
do
  sed -i "s|from 'lucide-react'|from '../lib/icons'|g" "$file"
done

# /components/ui/*
for file in \
  /components/ui/accordion.tsx \
  /components/ui/breadcrumb.tsx \
  /components/ui/carousel.tsx \
  /components/ui/checkbox.tsx \
  /components/ui/command.tsx \
  /components/ui/context-menu.tsx \
  /components/ui/dialog.tsx \
  /components/ui/dropdown-menu.tsx \
  /components/ui/input-otp.tsx \
  /components/ui/menubar.tsx \
  /components/ui/radio-group.tsx \
  /components/ui/resizable.tsx \
  /components/ui/sheet.tsx
do
  sed -i "s|from \"lucide-react\"|from \"../../lib/icons\"|g" "$file"
done

# /components/admin/*, auth/*, driver/*, passenger/*, shared/*, test/*
# (ces dossiers utilisent ../../lib/icons)
for file in \
  /components/admin/*.tsx \
  /components/auth/*.tsx \
  /components/driver/*.tsx \
  /components/passenger/*.tsx \
  /components/shared/*.tsx \
  /components/test/*.tsx
do
  sed -i "s|from 'lucide-react'|from '../../lib/icons'|g" "$file" 2>/dev/null
done

# /pages/*
sed -i "s|from 'lucide-react'|from '../lib/icons'|g" /pages/AdminApp.tsx

echo "✅ Tous les imports lucide-react ont été remplacés"
