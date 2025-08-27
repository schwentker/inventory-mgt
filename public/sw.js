const CACHE_NAME = "slab-inventory-v1"
const STATIC_CACHE = "static-v1"
const DYNAMIC_CACHE = "dynamic-v1"

const STATIC_ASSETS = ["/", "/slabs", "/reports", "/settings", "/manifest.json", "/icon-192.png", "/icon-512.png"]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting()),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE)
            .map((cacheName) => caches.delete(cacheName)),
        )
      })
      .then(() => self.clients.claim()),
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return

  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        if (response) {
          return response
        }

        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          const responseToCache = response.clone()
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
      })
      .catch(() => {
        // Return offline page for navigation requests
        if (event.request.mode === "navigate") {
          return caches.match("/")
        }
      }),
  )
})

// Background sync for data updates
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(syncData())
  }
})

async function syncData() {
  try {
    // Sync pending slab updates
    const pendingUpdates = await getStoredUpdates()
    for (const update of pendingUpdates) {
      await syncSlabUpdate(update)
    }
    await clearStoredUpdates()
  } catch (error) {
    console.error("Background sync failed:", error)
  }
}

async function getStoredUpdates() {
  const stored = localStorage.getItem("pendingUpdates")
  return stored ? JSON.parse(stored) : []
}

async function syncSlabUpdate(update) {
  // This would sync with a real backend in production
  console.log("Syncing update:", update)
}

async function clearStoredUpdates() {
  localStorage.removeItem("pendingUpdates")
}
