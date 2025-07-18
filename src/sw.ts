/// <reference lib="WebWorker" />
/// <reference types="vite/client" />

import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'

declare const self: ServiceWorkerGlobalScope
declare const clients: Clients

interface MessageEventData extends ExtendableEvent {
  data: {
    type: 'SKIP_WAITING'
  }
}

self.addEventListener('message', (event: MessageEventData) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    void self.skipWaiting()
  }
})

const entries = self.__WB_MANIFEST

precacheAndRoute(entries)

// Clean old assets
cleanupOutdatedCaches()

// Only cache pages and external assets on local build + start or in production
if (import.meta.env.PROD) {
  // To allow work offline
  registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')))
}

// Push notification event listener
self.addEventListener('push', (event: PushEvent) => {
  console.log('[Service Worker] Push Received.')

  if (event.data) {
    const { title, ...rest } = event.data.json() as {
      title: string
      body: string
      icon: string
      badge: string
    }

    event.waitUntil(
      self.registration.showNotification(title, {
        ...rest,
        icon: '/assets/meta.png',
        badge: '/assets/meta.png',
        requireInteraction: false,
        silent: false,
      })
    )
  }
})

// Notification click event listener
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  console.log('[Service Worker] Notification click received.')

  event.notification.close()

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus()
        }
      }
      // If no window/tab is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow('/')
      }
    })
  )
})
