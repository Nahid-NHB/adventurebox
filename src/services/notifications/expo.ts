/**
 * Real notifications via expo-notifications. Gentle + local: a single daily
 * "Today's Adventure is ready" at the parent's chosen hour, scheduled on-device
 * so it works offline. No manipulative re-engagement.
 */
import * as Notifications from 'expo-notifications';
import type { DailyReminder, NotificationService } from './index';

const DAILY_ID = 'daily-adventure';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export class ExpoNotificationService implements NotificationService {
  async requestPermission(): Promise<boolean> {
    try {
      const existing = await Notifications.getPermissionsAsync();
      if (existing.granted) return true;
      const req = await Notifications.requestPermissionsAsync();
      return req.granted;
    } catch {
      return false;
    }
  }

  async scheduleDaily(reminder: DailyReminder): Promise<void> {
    try {
      await this.cancelAll();
      if (!reminder.enabled) return;
      const granted = await this.requestPermission();
      if (!granted) return;

      await Notifications.scheduleNotificationAsync({
        identifier: DAILY_ID,
        content: {
          title: "Today's Adventure is ready 🧭",
          body: 'A fresh, screen-free activity is waiting for your explorer.',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: reminder.hour,
          minute: 0,
        },
      });
    } catch {
      // Non-fatal; notifications are a nicety, not a requirement.
    }
  }

  async cancelAll(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch {
      /* ignore */
    }
  }
}
