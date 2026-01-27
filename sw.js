// sw.js - Enhanced Service Worker
const CACHE_NAME = 'consulting-crew-v3';
const OFFLINE_URL = '/offline.html';

const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/about.html',
    '/services.html',
    '/process.html',
    '/blog.html',
    '/contact.html',
    '/css/main-enhanced.css',
    '/js/script-enhanced.js',
    '/images/CC_logo.png',
    '/offline.html',
    '/manifest.json'
];

// Install event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE_URLS))
            .then(() => self.skipWaiting())
    );
});

// Activate event
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event with network-first strategy for API, cache-first for assets
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Handle API requests with network-first
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Clone the response to cache it
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => cache.put(event.request, responseToCache));
                    return response;
                })
                .catch(() => {
                    // Fallback to cache if network fails
                    return caches.match(event.request);
                })
        );
        return;
    }

    // For HTML pages, use network-first with offline fallback
    if (event.request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Cache the page
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => cache.put(event.request, responseToCache));
                    return response;
                })
                .catch(() => {
                    // Return offline page if navigation request
                    if (event.request.mode === 'navigate') {
                        return caches.match(OFFLINE_URL);
                    }
                    return caches.match(event.request);
                })
        );
        return;
    }

    // For assets, use cache-first strategy
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    // Update cache in background
                    fetch(event.request)
                        .then(response => {
                            const responseToCache = response.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => cache.put(event.request, responseToCache));
                        })
                        .catch(() => {
                            // Ignore fetch errors for background updates
                        });
                    return cachedResponse;
                }
                
                // Not in cache, fetch from network
                return fetch(event.request)
                    .then(response => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Cache the response
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => cache.put(event.request, responseToCache));
                        
                        return response;
                    })
                    .catch(() => {
                        // If fetch fails and it's an image, return a placeholder
                        if (event.request.url.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
                            return new Response(
                                `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="100%" height="100%" fill="#f0f0f0"/>
                                    <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#ccc" font-family="Arial" font-size="20">
                                        Image not available offline
                                    </text>
                                </svg>`,
                                { headers: { 'Content-Type': 'image/svg+xml' } }
                            );
                        }
                    });
            })
    );
});

// Background sync for form submissions
self.addEventListener('sync', event => {
    if (event.tag === 'sync-forms') {
        event.waitUntil(syncForms());
    }
});

async function syncForms() {
    const db = await openFormsDB();
    const forms = await db.getAll('forms');
    
    for (const form of forms) {
        try {
            const response = await fetch('/api/form-submission', {
                method: 'POST',
                body: JSON.stringify(form.data),
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (response.ok) {
                await db.delete('forms', form.id);
            }
        } catch (error) {
            console.error('Failed to sync form:', error);
        }
    }
}

function openFormsDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('FormsDB', 1);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            db.createObjectStore('forms', { keyPath: 'id' });
        };
        
        request.onsuccess = (event) => {
            const db = event.target.result;
            resolve({
                getAll: (storeName) => {
                    return new Promise((resolve, reject) => {
                        const transaction = db.transaction(storeName, 'readonly');
                        const store = transaction.objectStore(storeName);
                        const request = store.getAll();
                        
                        request.onsuccess = () => resolve(request.result);
                        request.onerror = () => reject(request.error);
                    });
                },
                delete: (storeName, id) => {
                    return new Promise((resolve, reject) => {
                        const transaction = db.transaction(storeName, 'readwrite');
                        const store = transaction.objectStore(storeName);
                        const request = store.delete(id);
                        
                        request.onsuccess = () => resolve();
                        request.onerror = () => reject(request.error);
                    });
                }
            });
        };
        
        request.onerror = () => reject(request.error);
    });
}

// Push notifications
self.addEventListener('push', event => {
    const options = {
        body: event.data?.text() || 'New update from Consulting Crew',
        icon: '/images/CC_logo.png',
        badge: '/images/CC_logo.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '1'
        },
        actions: [
            {
                action: 'explore',
                title: 'Explore',
                icon: '/images/icon-72x72.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/images/icon-72x72.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Consulting Crew', options)
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});