// expo-notifications 스케줄 API 래퍼
// docs: https://docs.expo.dev/versions/latest/sdk/notifications/#schedulenotificationasync
import * as Notifications from 'expo-notifications';
import type { PlannedNotification } from './scheduler';

// 포그라운드 알림 표시 핸들러 — _layout 에서 1회 등록 권장이지만 idempotent
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export type ScheduledHandle = {
  notification_id: string; // OS 측 ID
  meta: PlannedNotification;
};

// fire_at (로컬 ISO) → DateTriggerInput
function buildTrigger(fire_at: string): Notifications.NotificationTriggerInput {
  return {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date: new Date(fire_at),
  };
}

export async function scheduleLocal(meta: PlannedNotification): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: {
      title: meta.title,
      body: meta.body,
      data: { event_id: meta.event_id, kind: meta.kind },
    },
    trigger: buildTrigger(meta.fire_at),
  });
}

export async function cancelLocal(notification_id: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notification_id);
}

export async function cancelAllLocal(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
