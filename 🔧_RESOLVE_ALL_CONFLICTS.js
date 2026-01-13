#!/usr/bin/env node

/**
 * 🔧 SCRIPT DE RÉSOLUTION AUTOMATIQUE DES CONFLITS GIT
 * SmartCabb v517.161.3
 * 
 * Ce script résout automatiquement les conflits de merge en acceptant
 * toujours la version locale (HEAD) pour tous les fichiers
 * 
 * Usage:
 *   node 🔧_RESOLVE_ALL_CONFLICTS.js
 *   
 * Options:
 *   --theirs    Accepter la version distante au lieu de la locale
 *   --skip-confirm  Ne pas demander de confirmation
 */

const { execSync } = require('child_process');
const fs = require('fs');
const readline = require('readline');

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function executeCommand(command, silent = false) {
  try {
    const output = execSync(command, { encoding: 'utf8' });
    return { success: true, output: output.trim() };
  } catch (error) {
    if (!silent) {
      logError(`Erreur lors de l'exécution de: ${command}`);
      console.error(error.message);
    }
    return { success: false, output: '' };
  }
}

function getConflictedFiles() {
  const result = executeCommand('git diff --name-only --diff-filter=U', true);
  if (!result.success || !result.output) {
    return [];
  }
  return result.output.split('\n').filter(f => f.trim());
}

async function askConfirmation(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(`${question} (oui/non) `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'oui' || answer.toLowerCase() === 'yes');
    });
  });
}

async function main() {
  console.log('\n🔧 RÉSOLUTION AUTOMATIQUE DES CONFLITS GIT');
  console.log('===========================================\n');

  // Vérifier si on est dans un repo git
  if (!fs.existsSync('.git')) {
    logError('Pas de dossier .git trouvé');
    log('Ce script doit être exécuté à la racine du projet git\n');
    process.exit(1);
  }

  // Récupérer les arguments
  const args = process.argv.slice(2);
  const useTheirs = args.includes('--theirs');
  const skipConfirm = args.includes('--skip-confirm');
  const strategy = useTheirs ? 'theirs' : 'ours';
  const strategyName = useTheirs ? 'DISTANTE' : 'LOCALE';

  // Obtenir les fichiers en conflit
  const conflictedFiles = getConflictedFiles();
  
  if (conflictedFiles.length === 0) {
    logSuccess('Aucun conflit détecté\n');
    log('Vérification du statut git:');
    executeCommand('git status');
    return;
  }

  logWarning(`${conflictedFiles.length} fichier(s) en conflit détectés\n`);
  log('Liste des fichiers en conflit:');
  conflictedFiles.forEach(file => {
    log(`  • ${file}`, 'red');
  });
  console.log('');

  // Demander confirmation
  if (!skipConfirm) {
    logWarning('ATTENTION:');
    log(`Ce script va résoudre TOUS les conflits en acceptant la version ${strategyName} (${strategy})`);
    log('Les modifications de l\'autre branche seront ÉCRASÉES\n');
    
    const confirmed = await askConfirmation('Êtes-vous sûr de vouloir continuer?');
    if (!confirmed) {
      logInfo('Opération annulée\n');
      return;
    }
  }

  console.log('\n🔄 Résolution des conflits en cours...\n');

  // Résoudre chaque conflit
  let resolved = 0;
  let failed = 0;

  for (const file of conflictedFiles) {
    process.stdout.write(`  Résolution de: ${file} ... `);
    
    // Accepter notre version (ours) ou leur version (theirs)
    const checkoutResult = executeCommand(`git checkout --${strategy} "${file}"`, true);
    if (!checkoutResult.success) {
      log('✗ (échec checkout)', 'red');
      failed++;
      continue;
    }

    // Marquer comme résolu
    const addResult = executeCommand(`git add "${file}"`, true);
    if (addResult.success) {
      log('✓', 'green');
      resolved++;
    } else {
      log('✗ (échec git add)', 'red');
      failed++;
    }
  }

  console.log('\n===========================================');
  logSuccess('Résolution terminée\n');

  // Afficher le résumé
  log('📊 Résumé:');
  log(`   Résolus: ${resolved}`, 'green');
  if (failed > 0) {
    log(`   Échecs: ${failed}`, 'red');
  }
  console.log('');

  const statusResult = executeCommand('git status --short');
  if (statusResult.success && statusResult.output) {
    log(statusResult.output);
  }

  console.log('\n🎯 Prochaines étapes:\n');
  log('1. Vérifier les modifications:', 'cyan');
  log('   git status\n', 'blue');
  log('2. Finaliser le merge:', 'cyan');
  log(`   git commit -m "Merge: Résolution automatique des conflits - Version ${strategyName.toLowerCase()} conservée"`, 'blue');
  log('\n3. Pousser les changements:', 'cyan');
  log('   git push origin main\n', 'blue');
  log('===========================================\n');
}

// Exécuter le script
main().catch(error => {
  logError('Erreur critique:');
  console.error(error);
  process.exit(1);
});
