#!/bin/bash

# Script pour remplacer tous les imports motion/react par ../lib/motion ou ../../lib/motion

echo "🔧 Remplacement des imports motion/react..."

# Fichiers à la racine (/ )
sed -i "s|from 'motion/react'|from './lib/motion'|g" /1_NavigationScreen.tsx
sed -i "s|from 'motion/react'|from './lib/motion'|g" /2_EarningsScreen.tsx
sed -i "s|from 'motion/react'|from './lib/motion'|g" /GITHUB_EstimateScreen.tsx

# Fichiers dans /components
sed -i "s|from 'motion/react'|from '../lib/motion'|g" /components/ActiveRidesList.tsx
sed -i "s|from 'motion/react'|from '../lib/motion'|g" /components/AddressSearchInput.tsx
sed -i "s|from 'motion/react'|from '../lib/motion'|g" /components/AvailableDriversMap.tsx
sed -i "s|from 'motion/react'|from '../lib/motion'|g" /components/CurrencySelector.tsx
sed -i "s|from 'motion/react'|from '../lib/motion'|g" /components/DebugPanel.tsx
sed -i "s|from 'motion/react'|from '../lib/motion'|g" /components/DiagnosticFloatingButton.tsx
sed -i "s|from 'motion/react'|from '../lib/motion'|g" /components/LiveStatsPanel.tsx
sed -i "s|from 'motion/react'|from '../lib/motion'|g" /components/MarketingNotification.tsx
sed -i "s|from 'motion/react'|from '../lib/motion'|g" /components/MixedPaymentSelector.tsx
sed -i "s|from 'motion/react'|from '../lib/motion'|g" /components/OTPVerification.tsx
sed -i "s|from 'motion/react'|from '../lib/motion'|g" /components/PageTransition.tsx
sed -i "s|from 'motion/react'|from '../lib/motion'|g" /components/RideCompletionSummary.tsx
sed -i "s|from 'motion/react'|from '../lib/motion'|g" /components/RideCompletionSummaryDialog.tsx
sed -i "s|from 'motion/react'|from '../lib/motion'|g" /components/RouteMapPreview.tsx
sed -i "s|from 'motion/react'|from '../lib/motion'|g" /components/TestimonialsCarousel.tsx
sed -i "s|from 'motion/react'|from '../lib/motion'|g" /components/WelcomeBackScreen.tsx
sed -i "s|from 'motion/react'|from '../lib/motion'|g" /components/WelcomeDialog.tsx
sed -i "s|from 'motion/react'|from '../lib/motion'|g" /components/WelcomeMessage.tsx

# Fichiers dans /components/admin
sed -i "s|from 'motion/react'|from '../../lib/motion'|g" /components/admin/AdminRegisterScreen.tsx
sed -i "s|from 'motion/react'|from '../../lib/motion'|g" /components/admin/AdminToolsScreen.tsx
sed -i "s|from 'motion/react'|from '../../lib/motion'|g" /components/admin/AdvancedAnalyticsDashboard.tsx
sed -i "s|from 'motion/react'|from '../../lib/motion'|g" /components/admin/AuditLogsScreen.tsx
sed -i "s|from 'motion/react'|from '../../lib/motion'|g" /components/admin/ClientsListScreen.tsx
sed -i "s|from 'motion/react'|from '../../lib/motion'|g" /components/admin/DataCleanupPanel.tsx
sed -i "s|from 'motion/react'|from '../../lib/motion'|g" /components/admin/DriversListScreen.tsx
sed -i "s|from 'motion/react'|from '../../lib/motion'|g" /components/admin/EmailHistoryScreen.tsx
sed -i "s|from 'motion/react'|from '../../lib/motion'|g" /components/admin/EmailSettingsScreen.tsx
sed -i "s|from 'motion/react'|from '../../lib/motion'|g" /components/admin/FinancialReportsScreen.tsx
sed -i "s|from 'motion/react'|from '../../lib/motion'|g" /components/admin/GlobalSettingsScreen.tsx
sed -i "s|from 'motion/react'|from '../../lib/motion'|g" /components/admin/PostpaidRequestsScreen.tsx
sed -i "s|from 'motion/react'|from '../../lib/motion'|g" /components/admin/RefundManagementScreen.tsx
sed -i "s|from 'motion/react'|from '../../lib/motion'|g" /components/admin/SettingsScreen.tsx

# Fichiers dans /components/auth
sed -i "s|from 'motion/react'|from '../../lib/motion'|g" /components/auth/CreateAuthFromProfilePage.tsx
sed -i "s|from 'motion/react'|from '../../lib/motion'|g" /components/auth/ResetPasswordByPhonePage.tsx
sed -i "s|from 'motion/react'|from '../../lib/motion'|g" /components/auth/ResetPasswordPage.tsx

# Fichiers dans /components/driver
sed -i "s|from 'motion/react'|from '../../lib/motion'|g" /components/driver/DriverDashboard.tsx
sed -i "s|from 'motion/react'|from '../../lib/motion'|g" /components/driver/DriverLoginScreenNew.tsx
sed -i "s|from 'motion/react'|from '../../lib/motion'|g" /components/driver/DriverProfileScreen.tsx
sed -i "s|from 'motion/react'|from '../../lib/motion'|g" /components/driver/DriverWelcomeScreen.tsx
sed -i "s|from 'motion/react'|from '../../lib/motion'|g" /components/driver/EarningsScreen.tsx
sed -i "s|from 'motion/react'|from '../../lib/motion'|g" /components/driver/NewRideNotification.tsx

# Fichiers dans /components/passenger
sed -i "s|from 'motion/react'|from '../../lib/motion'|g" /components/passenger/BookForSomeoneElse.tsx
sed -i "s|from 'motion/react'|from '../../lib/motion'|g" /components/passenger/EstimateScreen.tsx
sed -i "s|from 'motion/react'|from '../../lib/motion'|g" /components/passenger/MapScreen.tsx
sed -i "s|from 'motion/react'|from '../../lib/motion'|g" /components/passenger/PaymentReceiptScreen.tsx
sed -i "s|from 'motion/react'|from '../../lib/motion'|g" /components/passenger/PrivacySettingsScreen.tsx
sed -i "s|from 'motion/react'|from '../../lib/motion'|g" /components/passenger/RechargeModal.tsx
sed -i "s|from 'motion/react'|from '../../lib/motion'|g" /components/passenger/RideCompletedScreen.tsx
sed -i "s|from 'motion/react'|from '../../lib/motion'|g" /components/passenger/RideInProgressScreen.tsx
sed -i "s|from 'motion/react'|from '../../lib/motion'|g" /components/passenger/RideScreen.tsx
sed -i "s|from 'motion/react'|from '../../lib/motion'|g" /components/passenger/SettingsScreen.tsx
sed -i "s|from 'motion/react'|from '../../lib/motion'|g" /components/passenger/LiveTrackingMap.tsx
sed -i "s|from 'motion/react'|from '../../lib/motion'|g" /components/passenger/YangoStyleSearch.tsx

# Fichiers dans /pages
sed -i "s|from 'motion/react'|from '../lib/motion'|g" /pages/AboutPage.tsx
sed -i "s|from 'motion/react'|from '../lib/motion'|g" /pages/LandingPage.tsx
sed -i "s|from 'motion/react'|from '../lib/motion'|g" /pages/LegalPage.tsx
sed -i "s|from 'motion/react'|from '../lib/motion'|g" /pages/PrivacyPage.tsx

echo "✅ Tous les imports motion/react ont été remplacés!"
