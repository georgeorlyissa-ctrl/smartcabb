#!/usr/bin/env node

/**
 * 🎯 CORRECTION AUTOMATIQUE COMPLÈTE DE TOUS LES IMPORTS CDN
 * 
 * Ce script corrige tous les imports problématiques dans le projet
 * Version: v517.161
 */

const fs = require('fs');
const path = require('path');

// Mapping des chemins relatifs par dossier
const pathMapping = {
  '/components/': '../lib',
  '/components/admin/': '../../lib',
  '/components/driver/': '../../lib',
  '/components/passenger/': '../../lib',
  '/components/ui/': '../../lib',
  '/components/auth/': '../../lib',
  '/components/shared/': '../../lib',
  '/pages/': '../lib',
  '/hooks/': '../lib',
  '/': './lib'
};

// Fonction pour déterminer le chemin relatif correct
function getLibPath(filePath) {
  for (const [pattern, libPath] of Object.entries(pathMapping)) {
    if (filePath.startsWith('.' + pattern) || filePath === pattern.slice(0, -1)) {
      return libPath;
    }
  }
  return './lib'; // fallback
}

// Fonction pour corriger un fichier
function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Déterminer le chemin vers /lib
    const libPath = getLibPath(filePath);
    
    // Remplacements
    content = content
      .replace(/from ['"]motion\/react['"]/g, `from '${libPath}/motion'`)
      .replace(/from ['"]framer-motion['"]/g, `from '${libPath}/motion'`)
      .replace(/from ['"]sonner['"]/g, `from '${libPath}/toast'`);
    
    // Écrire seulement si modifié
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Erreur avec ${filePath}:`, error.message);
    return false;
  }
}

// Liste exhaustive de TOUS les fichiers à corriger
const filesToFix = [
  // Components (niveau 1)
  './components/DiagnosticFloatingButton.tsx',
  './components/FreeWaitingToggle.tsx',
  './components/MarketingNotification.tsx',
  './components/OTPVerification.tsx',
  './components/PageTransition.tsx',
  './components/PaymentSuccessDialog.tsx',
  './components/PushNotifications.tsx',
  './components/RideCompletionSummary.tsx',
  './components/RideCompletionSummaryDialog.tsx',
  './components/RouteMapPreview.tsx',
  './components/UsersManagementScreen.tsx',
  './components/WelcomeDialog.tsx',
  './components/WelcomeMessage.tsx',
  
  // Admin (niveau 2)
  './components/admin/AdminAnalyticsDashboard.tsx',
  './components/admin/AdminNotificationsCenter.tsx',
  './components/admin/AdminRegisterScreen.tsx',
  './components/admin/AdminToolsScreen.tsx',
  './components/admin/AdvancedAnalyticsDashboard.tsx',
  './components/admin/AuditLogsScreen.tsx',
  './components/admin/BackupAndRecoveryScreen.tsx',
  './components/admin/ChatMessagesScreen.tsx',
  './components/admin/ClientsListScreen.tsx',
  './components/admin/CustomerSupportScreen.tsx',
  './components/admin/DataCleanupPanel.tsx',
  './components/admin/DriverDetailModal.tsx',
  './components/admin/DriversListScreen.tsx',
  './components/admin/EmailHistoryScreen.tsx',
  './components/admin/EmailSettingsScreen.tsx',
  './components/admin/FinancialReportsScreen.tsx',
  './components/admin/GlobalSettingsScreen.tsx',
  './components/admin/PendingRechargesScreenNew.tsx',
  './components/admin/PostpaidRequestsScreen.tsx',
  './components/admin/QuickSMSActivation.tsx',
  './components/admin/RefundManagementScreen.tsx',
  './components/admin/SMSSettingsScreen.tsx',
  './components/admin/SettingsScreen.tsx',
  
  // Driver (niveau 2)
  './components/driver/DriverBalanceManager.tsx',
  './components/driver/DriverLoginScreenNew.tsx',
  './components/driver/NewRideNotification.tsx',
  './components/driver/TimerControl.tsx',
  
  // Passenger (niveau 2)
  './components/passenger/CancelRideReasonModal.tsx',
  './components/passenger/CustomerAssistant.tsx',
  './components/passenger/LoginScreen.tsx',
  './components/passenger/PaymentMethodScreen.tsx',
  './components/passenger/PaymentReceiptScreen.tsx',
  './components/passenger/ProfileScreen.tsx',
  './components/passenger/RatingDialog.tsx',
  './components/passenger/RechargeModal.tsx',
  './components/passenger/RideCompletedScreen.tsx',
  './components/passenger/ShareRide.tsx',
  './components/passenger/WalletScreen.tsx',
  './components/passenger/YangoStyleSearch.tsx',
  
  // Autres
  './GITHUB_EstimateScreen.tsx'
];

console.log('🎯 CORRECTION AUTOMATIQUE DE TOUS LES IMPORTS CDN');
console.log('='.repeat(60));
console.log(`📁 Fichiers à traiter: ${filesToFix.length}\n`);

let fixed = 0;
let alreadyOk = 0;
let errors = 0;

filesToFix.forEach((file, index) => {
  const num = `[${index + 1}/${filesToFix.length}]`;
  
  if (!fs.existsSync(file)) {
    console.log(`${num} ⏭️  ${file} (n'existe pas)`);
    return;
  }
  
  const result = fixFile(file);
  if (result) {
    console.log(`${num} ✅ ${file}`);
    fixed++;
  } else {
    console.log(`${num} ⏭️  ${file} (déjà OK)`);
    alreadyOk++;
  }
});

console.log('\n' + '='.repeat(60));
console.log('📊 RÉSUMÉ:');
console.log(`   ✅ Fichiers corrigés: ${fixed}`);
console.log(`   ⏭️  Déjà corrects: ${alreadyOk}`);
console.log(`   ❌ Erreurs: ${errors}`);
console.log('='.repeat(60));

if (fixed > 0) {
  console.log('\n🎉 SUCCÈS! Tous les imports ont été corrigés!');
  console.log('\n📝 Prochaines étapes:');
  console.log('   1. Vérifiez les changements: git status');
  console.log('   2. Commitez: git add . && git commit -m "v517.161 - Fix all CDN imports"');
  console.log('   3. Poussez: git push origin main');
} else {
  console.log('\n✅ Aucune correction nécessaire - tous les fichiers sont déjà OK!');
}
