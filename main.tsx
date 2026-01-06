/**
 * 🚀 SmartCabb - Application de transport à Kinshasa
 * BUILD v517.74 - FIX BUILD VITE + MAIN.TSX
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';
import { logStartupDiagnostics, setupErrorInterceptors } from './utils/diagnostics';

const { createRoot } = ReactDOM;

console.log('🚀 SmartCabb v517.74 - Démarrage...');

// 🔍 DIAGNOSTICS AU DÉMARRAGE
logStartupDiagnostics();
setupErrorInterceptors();

// ✅ PROTECTION SSR: Vérifier que nous sommes côté client
if (typeof window === 'undefined') {
  throw new Error('❌ main.tsx ne devrait jamais s\'exécuter côté serveur');
}

// ✅ PROTECTION: Vérifier que le DOM est prêt
if (typeof document === 'undefined') {
  throw new Error('❌ Document non disponible');
}

// 🚀 ACTIVATION DU SERVICE WORKER PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker enregistré:', registration.scope);

        // Vérifier les mises à jour toutes les heures
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);

        // Écouter les mises à jour du SW
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🔄 Nouvelle version disponible');
                
                if (confirm('Une nouvelle version de SmartCabb est disponible. Voulez-vous actualiser ?')) {
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                  window.location.reload();
                }
              }
            });
          }
        });
      })
      .catch((error) => {
        console.warn('⚠️ Erreur Service Worker:', error);
      });

    // Recharger quand le nouveau SW prend le contrôle
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🔄 Service Worker mis à jour, rechargement...');
      window.location.reload();
    });
  });
}

// ✅ Initialisation de l'application
const initApp = () => {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error('❌ Element root non trouvé dans le DOM');
    return;
  }

  try {
    createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('✅ Application React montée avec succès');
  } catch (error) {
    console.error('❌ Erreur lors du montage de l\'application:', error);
    
    // Afficher une erreur à l'utilisateur
    rootElement.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        font-family: system-ui, -apple-system, sans-serif;
      ">
        <div style="
          background: white;
          padding: 2rem;
          border-radius: 1rem;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          max-width: 500px;
          text-align: center;
        ">
          <h1 style="color: #dc2626; margin-bottom: 1rem;">Erreur de chargement</h1>
          <p style="color: #666; margin-bottom: 1.5rem;">
            SmartCabb n'a pas pu démarrer correctement.<br>
            Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}
          </p>
          <button 
            onclick="window.location.reload()" 
            style="
              background: #0891b2;
              color: white;
              border: none;
              padding: 0.75rem 2rem;
              border-radius: 0.5rem;
              cursor: pointer;
              font-size: 1rem;
            "
          >
            Réessayer
          </button>
        </div>
      </div>
    `;
  }
};

// Exécuter l'initialisation
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  // DOM déjà chargé
  initApp();
}