/**
 * Notifications abstraction. Gentle, opt-in, offline-scheduled. One daily
 * "Today's Adventure is ready" at the parent's chosen hour, respecting quiet
 * hours. No manipulative re-engagement. Scheduling is stubbed here; the real
 * impl uses expo-notifications.
 */
export interface DailyReminder {
  hour: number; // 0-23 local
  enabled: boolean;
}

export interface NotificationService {
  requestPermission(): Promise<boolean>;
  scheduleDaily(reminder: DailyReminder): Promise<void>;
  cancelAll(): Promise<void>;
}

class StubNotificationService implements NotificationService {
  async requestPermission() {
    return true;
  }
  async scheduleDaily() {
    /* no-op in stub */
  }
  async cancelAll() {
    /* no-op in stub */
  }
}

let instance: NotificationService | null = null;
export function getNotificationService(): NotificationService {
  if (!instance) {
    // Local notifications work offline; use the real one unless on web.
    const isWeb = typeof navigator !== 'undefined' && typeof document !== 'undefined';
    if (isWeb) {
      instance = new StubNotificationService();
    } else {
      const { ExpoNotificationService } = require('./expo');
      instance = new ExpoNotificationService();
    }
  }
  return instance!;
}
