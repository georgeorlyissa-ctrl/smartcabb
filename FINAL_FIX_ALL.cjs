#!/usr/bin/env node

/**
 * Script FINAL pour corriger TOUS les imports restants
 */

const fs = require('fs');
const path = require('path');

const files = [
  '/components/LandingScreen.tsx',
  '/components/PassengerCountSelector.tsx',
  '/components/PaymentSuccessDialog.tsx',
  '/components/PerformanceMonitor.tsx',
  '/components/PhoneInput.tsx',
  '/components/PromoCodeInput.tsx',
  '/components/ResetPasswordOTPScreen.tsx',
  '/components/RideCompletionDialog.tsx',
  '/components/RideCompletionSummary.tsx',
  '/components/RideCompletionSummaryDialog.tsx',
  '/components/RideTimer.tsx',
  '/components/TipSelector.tsx',
  '/components/UserSelectionScreen.tsx',
  '/components/WelcomeBackScreen.tsx',
  '/components/ui/dialog.tsx'
];

let fixed = 0;

files.forEach(filePath => {
  const fullPath = process.cwd() + filePath;
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⏭️  Fichier introuvable : ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const original = content;
  
  // Fix lucide-react@0.550.0 → lucide-react
  content = content.replace(/lucide-react@0\.550\.0/g, 'lucide-react');
  
  // Fix sonner@2.0.3 → sonner
  content = content.replace(/sonner@2\.0\.3/g, 'sonner');
  
  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ ${filePath}`);
    fixed++;
  }
});

console.log(`\n🎉 ${fixed} fichiers corrigés !`);
