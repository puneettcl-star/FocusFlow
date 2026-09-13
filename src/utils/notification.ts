/**
 * Safe Browser Notification Utilities
 * Guards against "TypeError: Illegal constructor" which occurs in:
 * - Cross-origin or sandboxed iframes (e.g. AI Studio preview environment)
 * - Chrome on Android (where new Notification() is forbidden and throws Illegal constructor)
 * - Environments where Notification is not supported or constructor access is blocked
 */

export function isNotificationSupported(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    // Cross-origin iframes are forbidden from using Desktop Notifications
    let isIframe = false;
    try {
      isIframe = window.self !== window.top;
    } catch {
      isIframe = true;
    }
    if (isIframe) {
      return false;
    }
    if (!('Notification' in window)) {
      return false;
    }
    if (typeof window.Notification !== 'function') {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function getNotificationPermission(): NotificationPermission | 'denied' {
  try {
    if (!isNotificationSupported()) return 'denied';
    return Notification.permission;
  } catch {
    return 'denied';
  }
}

export async function safeRequestNotificationPermission(): Promise<NotificationPermission | 'denied'> {
  try {
    if (!isNotificationSupported()) {
      return 'denied';
    }
    const result = await Notification.requestPermission();
    return result;
  } catch {
    return 'denied';
  }
}

export function safeSendNotification(title: string, options?: NotificationOptions): boolean {
  try {
    if (!isNotificationSupported()) return false;
    if (getNotificationPermission() !== 'granted') return false;

    try {
      new Notification(title, options);
      return true;
    } catch {
      return false;
    }
  } catch {
    return false;
  }
}
