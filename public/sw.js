// 🚀 SMARTCABB SERVICE WORKER - PWA OPTIMISÉ
// Version 100.0 - Stratégie de cache intelligente pour performances optimales

const CACHE_VERSION = 'smartcabb-v100.1-' + Date.now(); // 🔥 VERSION DYNAMIQUE
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;
const API_CACHE = `${CACHE_VERSION}-api`;

// Fichiers essentiels à mettre en cache immédiatement
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Durée de vie des caches (en millisecondes)
const CACHE_LIFETIME = {
  static: 1 * 60 * 60 * 1000,     // 🔥 1 heure (au lieu de 30 jours)
  dynamic: 30 * 60 * 1000,         // 🔥 30 minutes (au lieu de 7 jours)
  images: 24 * 60 * 60 * 1000,     // 24 heures
  api: 1 * 60 * 1000,              // 🔥 1 minute (au lieu de 5)
};

// URLs à ne JAMAIS mettre en cache
const NO_CACHE_URLS = [
  '/supabase',
  '/functions',
  '/auth',
  'supabase.co',
  'africas-talking',
  'flutterwave',
];

// 📦 Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('🚀 SmartCabb SW: Installation...', CACHE_VERSION);
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 SmartCabb SW: Cache des fichiers statiques');
        return cache.addAll(STATIC_ASSETS).catch((err) => {
          console.warn('⚠️ Certains fichiers n\'ont pas pu être cachés:', err);
        });
      })
      .then(() => {
        console.log('✅ Nouveau SW installé - activation immédiate');
        return self.skipWaiting(); // 🔥 ACTIVATION IMMÉDIATE
      })
  );
});

// 🔄 Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('✅ SmartCabb SW: Activation...', CACHE_VERSION);
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Supprimer TOUS les anciens caches (même version précédente)
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== IMAGE_CACHE && 
                cacheName !== API_CACHE) {
              console.log('🗑️ SmartCabb SW: Suppression ancien cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('🎯 Prise de contrôle immédiate de tous les clients');
        return self.clients.claim(); // 🔥 CONTRÔLE IMMÉDIAT
      })
  );
});

// 🌐 Stratégie de cache pour les requêtes
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-HTTP
  if (!request.url.startsWith('http')) {
    return;
  }

  // Ne JAMAIS cacher les requêtes Supabase et APIs externes
  if (NO_CACHE_URLS.some(pattern => request.url.includes(pattern))) {
    return event.respondWith(fetch(request));
  }

  // Stratégie selon le type de ressource
  if (request.destination === 'image') {
    // Images: Cache First, puis Network
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
  } else if (request.url.includes('/api/') || request.method !== 'GET') {
    // API: Network First, puis Cache si offline
    event.respondWith(networkFirst(request, API_CACHE));
  } else if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font'
  ) {
    // CSS/JS/Fonts: Stale While Revalidate
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
  } else {
    // Autres: Network First
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
  }
});

// 📡 STRATÉGIE 1: Cache First (pour images)
async function cacheFirst(request, cacheName) {
  try {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    
    // Image de fallback
    return new Response(
      '<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect fill="#00BFA5" width="400" height="300"/><text x="50%" y="50%" text-anchor="middle" fill="white" font-size="20">Image non disponible</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
}

// 📡 STRATÉGIE 2: Network First (pour contenu dynamique)
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    
    if (response && response.status === 200 && request.method === 'GET') {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      console.log('📦 SmartCabb SW: Réponse depuis le cache (offline)');
      return cached;
    }
    
    // Page offline personnalisée
    if (request.destination === 'document') {
      return new Response(
        `<!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>SmartCabb - Hors ligne</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #00BFA5 0%, #00897B 100%);
              color: white;
              text-align: center;
              padding: 20px;
            }
            h1 { font-size: 2.5rem; margin-bottom: 1rem; }
            p { font-size: 1.1rem; opacity: 0.9; margin-bottom: 2rem; }
            button {
              background: white;
              color: #00BFA5;
              border: none;
              padding: 12px 32px;
              font-size: 1rem;
              border-radius: 8px;
              cursor: pointer;
              font-weight: 600;
            }
            button:hover { transform: scale(1.05); }
          </style>
        </head>
        <body>
          <h1>📡 Vous êtes hors ligne</h1>
          <p>Veuillez vérifier votre connexion Internet<br>pour accéder à SmartCabb</p>
          <button onclick="location.reload()">Réessayer</button>
        </body>
        </html>`,
        {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/html',
          }),
        }
      );
    }
    
    throw error;
  }
}

// 📡 STRATÉGIE 3: Stale While Revalidate (pour assets statiques)
async function staleWhileRevalidate(request, cacheName) {
  const cached = await caches.match(request);
  
  const fetchPromise = fetch(request).then(async (response) => {
    if (response && response.status === 200) {
      // Clone AVANT d'utiliser la response
      const responseToCache = response.clone();
      const cache = await caches.open(cacheName);
      cache.put(request, responseToCache);
    }
    return response;
  }).catch(error => {
    console.error('Fetch error:', error);
    return cached || new Response('Network error', { status: 503 });
  });

  return cached || fetchPromise;
}

// 📱 Messages du client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('🔥 Force SKIP_WAITING reçu');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }).then(() => {
        console.log('🗑️ SmartCabb SW: Tous les caches supprimés');
        // 🔥 Notifier le client que le cache est vidé
        event.ports[0]?.postMessage({ success: true });
      })
    );
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
  
  // 🔥 NOUVEAU : Force reload de tous les clients
  if (event.data && event.data.type === 'RELOAD_ALL_CLIENTS') {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          clientList.forEach(client => {
            client.postMessage({ type: 'FORCE_RELOAD' });
          });
        })
    );
  }
});

// 🔔 Notifications Push
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'Nouvelle notification',
      icon: '/vite.svg',
      badge: '/vite.svg',
      vibrate: [200, 100, 200],
      data: data.data || {},
      actions: data.actions || [],
      tag: data.tag || 'smartcabb-notification',
      requireInteraction: data.requireInteraction || false,
    };
    
    event.waitUntil(
      self.registration.showNotification(
        data.title || 'SmartCabb',
        options
      )
    );
  } catch (error) {
    console.error('❌ SmartCabb SW: Erreur notification push:', error);
  }
});

// 🖱️ Click sur notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Si une fenêtre est déjà ouverte, la focus et naviguer
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        // Sinon, ouvrir une nouvelle fenêtre
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// 🧹 Nettoyage automatique des vieux caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    cleanupOldCaches()
  );
});

async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const now = Date.now();
  
  for (const cacheName of cacheNames) {
    if (!cacheName.startsWith(CACHE_VERSION)) {
      await caches.delete(cacheName);
    }
  }
  
  console.log('🧹 SmartCabb SW: Nettoyage des caches terminé');
}

console.log('✅ SmartCabb Service Worker v100.1 prêt - AUTO-UPDATE ACTIVÉ');