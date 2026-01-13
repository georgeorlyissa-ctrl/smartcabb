#!/usr/bin/env node

/**
 * 🔧 SCRIPT DE CORRECTION AUTOMATIQUE DES IMPORTS CDN
 * 
 * Ce script corrige TOUS les imports CDN restants dans le projet SmartCabb:
 * 
 * 1. 'motion/react' → '../lib/motion' ou '../../lib/motion' (selon le chemin)
 * 2. 'framer-motion' → '../lib/motion' ou '../../lib/motion'
 * 3. 'sonner' → '../lib/toast' ou '../../lib/toast'
 * 
 * Version: v517.161 - Correction finale des imports CDN
 * Date: 13/01/2026
 */

const fs = require('fs');
const path = require('path');

// Liste des fichiers à corriger avec leurs corrections spécifiques
const filesToFix = [
  // Components (niveau 1 - un seul ../)
  {
    path: '/components/PaymentSuccessDialog.tsx',
    replacements: [
      { from: "from 'framer-motion'", to: "from '../lib/motion'" }
    ]
  },
  {
    path: '/components/DiagnosticFloatingButton.tsx',
    replacements: [
      { from: "from 'motion/react'", to: "from '../lib/motion'" }
    ]
  },
  {
    path: '/components/MarketingNotification.tsx',
    replacements: [
      { from: "from 'motion/react'", to: "from '../lib/motion'" }
    ]
  },
  {
    path: '/components/PageTransition.tsx',
    replacements: [
      { from: "from 'motion/react'", to: "from '../lib/motion'" }
    ]
  },
  {
    path: '/components/RideCompletionSummary.tsx',
    replacements: [
      { from: "from 'motion/react'", to: "from '../lib/motion'" }
    ]
  },
  {
    path: '/components/RideCompletionSummaryDialog.tsx',
    replacements: [
      { from: "from 'motion/react'", to: "from '../lib/motion'" }
    ]
  },
  {
    path: '/components/RouteMapPreview.tsx',
    replacements: [
      { from: "from 'motion/react'", to: "from '../lib/motion'" }
    ]
  },
  {
    path: '/components/WelcomeDialog.tsx',
    replacements: [
      { from: "from 'motion/react'", to: "from '../lib/motion'" }
    ]
  },
  {
    path: '/components/WelcomeMessage.tsx',
    replacements: [
      { from: "from 'motion/react'", to: "from '../lib/motion'" }
    ]
  },

  // Components/admin (niveau 2 - deux ../)
  {
    path: '/components/admin/AdminAnalyticsDashboard.tsx',
    replacements: [
      { from: "from 'sonner'", to: "from '../../lib/toast'" }
    ]
  },
  {
    path: '/components/admin/AdminNotificationsCenter.tsx',
    replacements: [
      { from: "from 'sonner'", to: "from '../../lib/toast'" }
    ]
  },
  {
    path: '/components/admin/AdminRegisterScreen.tsx',
    replacements: [
      { from: "from 'motion/react'", to: "from '../../lib/motion'" }
    ]
  },
  {
    path: '/components/admin/AdminToolsScreen.tsx',
    replacements: [
      { from: "from 'sonner'", to: "from '../../lib/toast'" },
      { from: "from 'motion/react'", to: "from '../../lib/motion'" }
    ]
  },
  {
    path: '/components/admin/AdvancedAnalyticsDashboard.tsx',
    replacements: [
      { from: "from 'motion/react'", to: "from '../../lib/motion'" },
      { from: "from 'sonner'", to: "from '../../lib/toast'" }
    ]
  },
  {
    path: '/components/admin/AuditLogsScreen.tsx',
    replacements: [
      { from: "from 'motion/react'", to: "from '../../lib/motion'" },
      { from: "from 'sonner'", to: "from '../../lib/toast'" }
    ]
  },
  {
    path: '/components/admin/BackupAndRecoveryScreen.tsx',
    replacements: [
      { from: "from 'sonner'", to: "from '../../lib/toast'" }
    ]
  },
  {
    path: '/components/admin/ChatMessagesScreen.tsx',
    replacements: [
      { from: "from 'sonner'", to: "from '../../lib/toast'" }
    ]
  },
  {
    path: '/components/admin/ClientsListScreen.tsx',
    replacements: [
      { from: "from 'motion/react'", to: "from '../../lib/motion'" },
      { from: "from 'sonner'", to: "from '../../lib/toast'" }
    ]
  },
  {
    path: '/components/admin/CustomerSupportScreen.tsx',
    replacements: [
      { from: "from 'sonner'", to: "from '../../lib/toast'" }
    ]
  },
  {
    path: '/components/admin/DataCleanupPanel.tsx',
    replacements: [
      { from: "from 'motion/react'", to: "from '../../lib/motion'" }
    ]
  },
];

console.log('🔧 CORRECTION AUTOMATIQUE DES IMPORTS CDN');
console.log('==========================================\n');

let totalFixed = 0;
let totalFiles = 0;

filesToFix.forEach(file => {
  try {
    const content = fs.readFileSync(file.path, 'utf8');
    let newContent = content;
    let fileChanged = false;

    file.replacements.forEach(replacement => {
      if (newContent.includes(replacement.from)) {
        newContent = newContent.replace(new RegExp(replacement.from, 'g'), replacement.to);
        fileChanged = true;
        totalFixed++;
        console.log(`✅ ${file.path}`);
        console.log(`   ${replacement.from} → ${replacement.to}`);
      }
    });

    if (fileChanged) {
      fs.writeFileSync(file.path, newContent, 'utf8');
      totalFiles++;
    }
  } catch (error) {
    console.log(`❌ Erreur avec ${file.path}: ${error.message}`);
  }
});

console.log('\n==========================================');
console.log(`✅ TERMINÉ: ${totalFixed} imports corrigés dans ${totalFiles} fichiers`);
console.log('==========================================\n');
