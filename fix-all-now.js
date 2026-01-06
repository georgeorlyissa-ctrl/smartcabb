#!/usr/bin/env node
/**
 * 🚀 Script de correction ULTRA-RAPIDE des imports
 * Corrige TOUS les fichiers en une seule passe
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🚀 SmartCabb ULTRA-FIX v517.124\n');
console.log('='.repeat(60));

const files = [
  // Driver
  '/components/driver/DriverDashboard.tsx',
  '/components/driver/DriverLoginScreenNew.tsx',
  '/components/driver/DriverProfileScreen.tsx',
  '/components/driver/DriverRegistrationScreen.tsx',
  '/components/driver/DriverSettingsScreen.tsx',
  '/components/driver/DriverWalletScreen.tsx',
  '/components/driver/DriverWelcomeScreen.tsx',
  '/components/driver/EarningsScreen.tsx',
  '/components/driver/NavigationScreen.tsx',
  '/components/driver/NewRideNotification.tsx',
  '/components/driver/ConfirmationCodeScreen.tsx',
  '/components/driver/ActiveRideScreen.tsx',
  '/components/driver/PaymentConfirmationScreen.tsx',
  
  // Passenger
  '/components/passenger/AlternativeVehicleDialog.tsx',
  '/components/passenger/BookForSomeoneElse.tsx',
  '/components/passenger/CancelRideReasonModal.tsx',
  '/components/passenger/EstimateScreen.tsx',
  '/components/passenger/FavoriteLocations.tsx',
  '/components/passenger/PaymentMethodScreen.tsx',
  '/components/passenger/PaymentReceiptScreen.tsx',
  '/components/passenger/PaymentScreen.tsx',
  '/components/passenger/PrivacySettingsScreen.tsx',
  '/components/passenger/ProfileScreen.tsx',
  '/components/passenger/PromoCodeScreen.tsx',
  '/components/passenger/RatingDialog.tsx',
  '/components/passenger/RatingModal.tsx',
  '/components/passenger/RatingScreen.tsx',
  '/components/passenger/RechargeModal.tsx',
  '/components/passenger/RideCompletedScreen.tsx',
  '/components/passenger/RideHistoryScreen.tsx',
  '/components/passenger/RideInProgressScreen.tsx',
  '/components/passenger/RideScreen.tsx',
  '/components/passenger/RideTrackingScreen.tsx',
  '/components/passenger/SettingsScreen.tsx',
  '/components/passenger/SupportScreen.tsx',
  '/components/passenger/WalletScreen.tsx',
  '/components/passenger/DriverFoundScreen.tsx',
  '/components/passenger/LiveTrackingMap.tsx',
  '/components/passenger/DriverApproachingScreen.tsx',
  
  // Shared
  '/components/shared/UnifiedPolicyModal.tsx',
  
  // Pages
  '/pages/LandingPage.tsx',
  
  // Root
  '/1_NavigationScreen.tsx',
  '/2_EarningsScreen.tsx'
];

let fixed = 0;

files.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  try {
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  Non trouvé: ${filePath}`);
      return;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    const original = content;
    
    // Déterminer le chemin relatif basé sur la profondeur
    const depth = filePath.split('/').length - 2; // -2 car on enlève le premier / et le nom du fichier
    const prefix = depth === 0 ? '.' : '../'.repeat(depth).slice(0, -1);
    
    // Corrections
    content = content.replace(/from ['"]framer-motion['"]/g, `from '${prefix}/framer-motion'`);
    content = content.replace(/from ['"]motion\/react['"]/g, `from '${prefix}/framer-motion'`);
    content = content.replace(/from ['"]framer-motion@[^'"]*['"]/g, `from '${prefix}/framer-motion'`);
    content = content.replace(/from ['"]lucide-react['"]/g, `from '${prefix}/lucide-react'`);
    content = content.replace(/from ['"]lucide-react@[^'"]*['"]/g, `from '${prefix}/lucide-react'`);
    
    if (content !== original) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ ${filePath}`);
      fixed++;
    }
  } catch (error) {
    console.log(`❌ Erreur sur ${filePath}:`, error.message);
  }
});

console.log('\n' + '='.repeat(60));
console.log(`✨ RÉSULTAT: ${fixed}/${files.length} fichiers corrigés`);
console.log('='.repeat(60) + '\n');

if (fixed > 0) {
  console.log('✅ Corrections appliquées avec succès!');
  console.log('🎨 Testez maintenant l\'application dans Figma Make\n');
} else {
  console.log('✅ Aucune correction nécessaire!\n');
}
