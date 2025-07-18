// VAPID keys for push notifications
const VAPID_PUBLIC_KEY =
  'BI33FBcUqME-8Zm7EZLf4K7saASQPfq2wJ5EqmbEa17toEo-UBejoyIpheYErM2mT_FEDT-QP9valLzSXj2Ei9U'

class NotificationManager {
  private registration: ServiceWorkerRegistration | null = null
  private subscription: PushSubscription | null = null

  async initialize(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported')
      return false
    }

    try {
      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker registered:', this.registration)

      // Request notification permission
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        console.warn('Notification permission denied')
        return false
      }

      // Subscribe to push notifications
      await this.subscribeToPush()
      return true
    } catch (error) {
      console.error('Failed to initialize notifications:', error)
      return false
    }
  }

  private async subscribeToPush(): Promise<void> {
    if (!this.registration) return

    try {
      // Convert VAPID public key to Uint8Array
      const vapidPublicKey = this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY)

      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey,
      })

      console.log('Push subscription created:', this.subscription)
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error)
    }
  }

  async sendBreakFinishedNotification(): Promise<void> {
    if (!this.subscription) {
      console.warn('No push subscription available')
      return
    }

    try {
      // For now, we'll send a local notification since we don't have a backend
      // In a real app, you'd send this to your backend which would then push to the subscription
      if ('serviceWorker' in navigator && this.registration) {
        await this.registration.showNotification('Break Finished! 💪', {
          body: 'Time to get back to your workout!',
          icon: '/assets/meta.png',
          badge: '/assets/meta.png',
          requireInteraction: false,
          silent: false,
          tag: 'break-finished', // Prevents duplicate notifications
        })
      }
    } catch (error) {
      console.error('Failed to send notification:', error)
    }
  }

  // Helper function to convert VAPID public key
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  getSubscription(): PushSubscription | null {
    return this.subscription
  }

  isSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window
  }
}

// Singleton instance
let notificationManager: NotificationManager | null = null

export function getNotificationManager(): NotificationManager {
  if (!notificationManager) {
    notificationManager = new NotificationManager()
  }
  return notificationManager
}
