const CACHE_NAME = 'bokko-v1';
const OFFLINE_URL = '/';

const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Installation : pré-cache des ressources essentielles
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activation : nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch : stratégie Network First avec fallback au cache
self.addEventListener('fetch', (event) => {
  // Ne pas cacher les requêtes API (données dynamiques)
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return response;
        })
        .catch(() => {
          // Si hors ligne, retourner une réponse offline pour les API
          return new Response(
            JSON.stringify({ error: 'Hors ligne - Vérifiez votre connexion' }),
            {
              headers: { 'Content-Type': 'application/json' },
              status: 503,
            }
          );
        })
    );
    return;
  }

  // Stratégie Network First pour les ressources statiques
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Mettre en cache la réponse
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Retourner depuis le cache si hors ligne
        return caches.match(event.request).then((response) => {
          if (response) return response;
          // Fallback pour les pages
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
          return new Response('Hors ligne', { status: 503 });
        });
      })
  );
});

// Background Sync pour les réservations hors ligne
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-reservations') {
    event.waitUntil(syncReservations());
  }
});

async function syncReservations() {
  // Récupérer les réservations en attente depuis IndexedDB
  // et les envoyer au serveur
  console.log('Synchronisation des réservations...');
}
