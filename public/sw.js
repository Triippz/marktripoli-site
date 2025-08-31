// Mission Control Service Worker
// Tactical offline operations capability

const CACHE_NAME = 'mission-control-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Mission critical resources that must be cached
const TACTICAL_RESOURCES = [
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/data/sites.json'
];

// Install event - Cache tactical resources
self.addEventListener('install', (event) => {
  console.log('[SW] Mission Control service worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching tactical resources');
        return cache.addAll([...STATIC_ASSETS, ...TACTICAL_RESOURCES]);
      })
      .then(() => {
        console.log('[SW] Service worker installed - Mission ready');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Installation failed:', error);
      })
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating new service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== CACHE_NAME;
            })
            .map((cacheName) => {
              console.log('[SW] Removing old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated - Taking control');
        return self.clients.claim();
      })
  );
});

// Fetch event - Implement tactical caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-HTTP requests
  if (!request.url.startsWith('http')) {
    return;
  }

  // Skip Mapbox API requests (they need real-time data)
  if (url.hostname.includes('mapbox') || url.hostname.includes('tiles')) {
    return;
  }

  // Cache-first strategy for static assets
  if (isStaticAsset(request.url)) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(request)
            .then((response) => {
              // Cache the response for future use
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(request, responseClone);
                  });
              }
              return response;
            })
            .catch(() => {
              // Return offline fallback if available
              if (request.destination === 'document') {
                return caches.match('/index.html');
              }
            });
        })
    );
  }
  // Network-first strategy for dynamic content
  else {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.status === 200 && request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              // Return offline page for navigation requests
              if (request.destination === 'document') {
                return caches.match('/index.html');
              }
            });
        })
    );
  }
});

// Helper function to determine if asset is static
function isStaticAsset(url) {
  const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf'];
  return staticExtensions.some(ext => url.includes(ext)) || 
         url.includes('/icons/') || 
         url.endsWith('/manifest.json');
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag);
  
  if (event.tag === 'background-telemetry') {
    event.waitUntil(syncTelemetryData());
  }
});

// Sync telemetry data when back online
async function syncTelemetryData() {
  try {
    // Get stored telemetry data
    const storedData = await getStoredTelemetryData();
    if (storedData && storedData.length > 0) {
      console.log('[SW] Syncing offline telemetry data');
      // Process stored data when back online
      await processOfflineTelemetryData(storedData);
    }
  } catch (error) {
    console.error('[SW] Failed to sync telemetry data:', error);
  }
}

// Placeholder functions for telemetry data handling
async function getStoredTelemetryData() {
  // Implementation would retrieve data from IndexedDB
  return [];
}

async function processOfflineTelemetryData(data) {
  // Implementation would send data to server when online
  console.log('[SW] Processing offline data:', data);
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW] Push message received');
  
  const options = {
    body: 'Mission Control update available',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'View Updates',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Dismiss',
        icon: '/icons/icon-96x96.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Mission Control', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click received');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});