// Script Node.js pour corriger automatiquement tous les imports CDN

const fs = require('fs');
const path = require('path');

// Liste exhaustive des fichiers à corriger avec leur chemin relatif vers /lib
const filesToFix = [
  // Fichiers à la racine (profondeur 0) - utilisent ./lib
  { file: '/2_EarningsScreen.tsx', libPath: '../../lib' },
  { file: '/GITHUB_EstimateScreen.tsx', libPath: './lib' },
  
  // Fichiers dans /components (profondeur 1) - utilisent ../lib
  { file: '/components/AddressSearchInput.tsx', libPath: '../lib' },
  { file: '/components/AvailableDriversMap.tsx', libPath: '../lib' },
  { file: '/components/CancellationCompensation.tsx', libPath: '../lib' },
  { file: '/components/DebugPanel.tsx', libPath: '../lib' },
  { file: '/components/DiagnosticFloatingButton.tsx', libPath: '../lib' },
  { file: '/components/FreeWaitingToggle.tsx', libPath: '../lib' },
  { file: '/components/MarketingNotification.tsx', libPath: '../lib' },
  { file: '/components/OTPVerification.tsx', libPath: '../lib' },
  { file: '/components/PageTransition.tsx', libPath: '../lib' },
  { file: '/components/PaymentSuccessDialog.tsx', libPath: '../lib' },
  { file: '/components/PushNotifications.tsx', libPath: '../lib' },
  { file: '/components/RideCompletionSummary.tsx', libPath: '../lib' },
  { file: '/components/RideCompletionSummaryDialog.tsx', libPath: '../lib' },
  { file: '/components/RouteMapPreview.tsx', libPath: '../lib' },
  { file: '/components/UsersManagementScreen.tsx', libPath: '../lib' },
  { file: '/components/WelcomeDialog.tsx', libPath: '../lib' },
  { file: '/components/WelcomeMessage.tsx', libPath: '../lib' },
  
  // Fichiers dans /components/admin (profondeur 2) - utilisent ../../lib
  { file: '/components/admin/AdminAnalyticsDashboard.tsx', libPath: '../../lib' },
  { file: '/components/admin/AdminNotificationsCenter.tsx', libPath: '../../lib' },
  { file: '/components/admin/AdminRegisterScreen.tsx', libPath: '../../lib' },
  { file: '/components/admin/AdminToolsScreen.tsx', libPath: '../../lib' },
  { file: '/components/admin/AdvancedAnalyticsDashboard.tsx', libPath: '../../lib' },
  { file: '/components/admin/AuditLogsScreen.tsx', libPath: '../../lib' },
  { file: '/components/admin/BackupAndRecoveryScreen.tsx', libPath: '../../lib' },
  { file: '/components/admin/ChatMessagesScreen.tsx', libPath: '../../lib' },
  { file: '/components/admin/ClientsListScreen.tsx', libPath: '../../lib' },
  { file: '/components/admin/CustomerSupportScreen.tsx', libPath: '../../lib' },
  { file: '/components/admin/DataCleanupPanel.tsx', libPath: '../../lib' },
  { file: '/components/admin/DriverDetailModal.tsx', libPath: '../../lib' },
  { file: '/components/admin/DriversListScreen.tsx', libPath: '../../lib' },
  { file: '/components/admin/EmailHistoryScreen.tsx', libPath: '../../lib' },
  { file: '/components/admin/EmailSettingsScreen.tsx', libPath: '../../lib' },
  { file: '/components/admin/FinancialReportsScreen.tsx', libPath: '../../lib' },
  { file: '/components/admin/GlobalSettingsScreen.tsx', libPath: '../../lib' },
  { file: '/components/admin/PendingRechargesScreenNew.tsx', libPath: '../../lib' },
  { file: '/components/admin/PostpaidRequestsScreen.tsx', libPath: '../../lib' },
  { file: '/components/admin/QuickSMSActivation.tsx', libPath: '../../lib' },
  { file: '/components/admin/RefundManagementScreen.tsx', libPath: '../../lib' },
  { file: '/components/admin/SMSSettingsScreen.tsx', libPath: '../../lib' },
  { file: '/components/admin/SettingsScreen.tsx', libPath: '../../lib' },
  
  // Fichiers dans /components/driver (profondeur 2) - utilisent ../../lib
  { file: '/components/driver/DriverBalanceManager.tsx', libPath: '../../lib' },
  { file: '/components/driver/DriverLoginScreenNew.tsx', libPath: '../../lib' },
  { file: '/components/driver/NewRideNotification.tsx', libPath: '../../lib' },
  { file: '/components/driver/TimerControl.tsx', libPath: '../../lib' },
  
  // Fichiers dans /components/passenger (profondeur 2) - utilisent ../../lib
  { file: '/components/passenger/BookForSomeoneElse.tsx', libPath: '../../lib' },
  { file: '/components/passenger/CancelRideReasonModal.tsx', libPath: '../../lib' },
  { file: '/components/passenger/CustomerAssistant.tsx', libPath: '../../lib' },
  { file: '/components/passenger/LoginScreen.tsx', libPath: '../../lib' },
  { file: '/components/passenger/PaymentMethodScreen.tsx', libPath: '../../lib' },
  { file: '/components/passenger/PaymentReceiptScreen.tsx', libPath: '../../lib' },
  { file: '/components/passenger/ProfileScreen.tsx', libPath: '../../lib' },
  { file: '/components/passenger/RatingDialog.tsx', libPath: '../../lib' },
  { file: '/components/passenger/RechargeModal.tsx', libPath: '../../lib' },
  { file: '/components/passenger/RideCompletedScreen.tsx', libPath: '../../lib' },
  { file: '/components/passenger/RideHistoryScreen.tsx', libPath: '../../lib' },
  { file: '/components/passenger/RideTrackingScreen.tsx', libPath: '../../lib' },
  { file: '/components/passenger/ShareRide.tsx', libPath: '../../lib' },
  { file: '/components/passenger/WalletScreen.tsx', libPath: '../../lib' },
  { file: '/components/passenger/YangoStyleSearch.tsx', libPath: '../../lib' },
];

console.log('🎯 Correction automatique de tous les imports CDN\n');
console.log(`📁 Nombre de fichiers à corriger: ${filesToFix.length}\n`);

let fixedCount = 0;
let errorCount = 0;

filesToFix.forEach(({ file, libPath }) => {
  try {
    const filePath = `.${file}`;
    
    // Lire le fichier
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Remplacer les imports
    content = content
      .replace(/from ['"]motion\/react['"]/g, `from '${libPath}/motion'`)
      .replace(/from ['"]framer-motion['"]/g, `from '${libPath}/motion'`)
      .replace(/from ['"]sonner['"]/g, `from '${libPath}/toast'`);
    
    // Vérifier si des changements ont été effectués
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${file}`);
      fixedCount++;
    } else {
      console.log(`⏭️  ${file} (déjà corrigé)`);
    }
  } catch (error) {
    console.log(`❌ ${file}: ${error.message}`);
    errorCount++;
  }
});

console.log(`\n📊 RÉSUMÉ:`);
console.log(`   ✅ Fichiers corrigés: ${fixedCount}`);
console.log(`   ⏭️  Fichiers déjà OK: ${filesToFix.length - fixedCount - errorCount}`);
console.log(`   ❌ Erreurs: ${errorCount}`);

if (fixedCount + errorCount === 0) {
  console.log('\n🎉 Tous les fichiers sont déjà corrects!');
} else if (errorCount === 0) {
  console.log('\n🎉 Tous les imports ont été corrigés avec succès!');
} else {
  console.log('\n⚠️  Certains fichiers ont rencontré des erreurs.');
}
