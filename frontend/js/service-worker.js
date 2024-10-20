const CACHE_NAME = 'app-cache-v1';
const urlsToCache = [
	/*	'/',
	'/components/',
	'/index.html',
	'/css/main.css',
	'/js/main.js',
	'/manifest.json',*/
];

// Install the service worker
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(urlsToCache);
		})
	);
});

// Cache and return requests
self.addEventListener('fetch', (event) => {
	event.respondWith(
		caches.match(event.request).then((response) => {
			return response || fetch(event.request);
		})
	);
});

// Update the service worker
self.addEventListener('activate', (event) => {
	const cacheWhitelist = [CACHE_NAME];
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames.map((cacheName) => {
					if (cacheWhitelist.indexOf(cacheName) === -1) {
						return caches.delete(cacheName);
					}
				})
			);
		})
	);
});
// In your service-worker.js

self.addEventListener('push', function (event) {
	let data = {};

	if (event.data) {
		data = event.data.json();
	}

	const title = data.title || 'New Notification';
	const options = {
		body: data.body || 'You have a new message!',
		icon: data.icon || '/images/icons/icon-192x192.png',
		badge: data.badge || '/images/icons/badge.png',
		tag: data.tag || 'pwa-push',
		data: data.url || '/', // Optional URL to open on notification click
	};

	event.waitUntil(self.registration.showNotification(title, options));
});

// Handling notification click
self.addEventListener('notificationclick', function (event) {
	event.notification.close();

	const urlToOpen = event.notification.data || '/';
	event.waitUntil(clients.openWindow(urlToOpen));
});
