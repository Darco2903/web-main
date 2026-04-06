import { ref } from "vue";
import { defineStore } from "pinia";
import { NOTIFICATION_DEFAULT_TIME, NOTIFICATION_LEAVE_TIME, NOTIFICATION_MAX_COUNT } from "@mod/consts";

export type NotificationType = "success" | "error" | "info" | "warning";

export interface Notification {
    message: string;
    type: NotificationType;
    duration?: number;
}

interface NotificationWithID extends Notification {
    id: string;
}

export const useNotifyStore = defineStore("notify", () => {
    const notifications = ref<Map<string, NotificationWithID>>(new Map());
    const notificationQueue: NotificationWithID[] = [];

    const createNotifyId: () => string =
        crypto.randomUUID !== undefined
            ? () => crypto.randomUUID()
            : () => Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);

    function notify(notification: Notification): void {
        const id = createNotifyId();

        if (notifications.value.size >= NOTIFICATION_MAX_COUNT) {
            notificationQueue.push({
                id,
                ...notification,
            });
        } else {
            _p({
                id,
                ...notification,
            });
        }
    }

    function _p(notification: NotificationWithID): void {
        notifications.value.set(notification.id, notification);

        setTimeout(() => {
            notifyRemove(notification.id);
        }, notification.duration ?? NOTIFICATION_DEFAULT_TIME);
    }

    function notifyRemove(id: string): void {
        if (notifications.value.delete(id)) {
            // if delete was successful, try to add next from queue
            setTimeout(() => {
                if (notificationQueue.length > 0) {
                    const next = notificationQueue.shift()!;
                    _p(next);
                }
            }, NOTIFICATION_LEAVE_TIME);
        }
    }

    return {
        notifications,
        notify,
        notifyRemove,
    };
});
