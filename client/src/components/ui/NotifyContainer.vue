<script setup lang="ts">
import { useNotifyStore } from "@/store/ui/notify";
import { NOTIFICATION_LEAVE_TIME } from "@mod/consts"; // used in style

import NotificationItem from "./NotifyItem.vue";

const notifyStore = useNotifyStore();
</script>

<template>
    <div class="notifications">
        <TransitionGroup name="notif" tag="div" class="flex col" style="gap: 8px">
            <NotificationItem
                v-for="notif in notifyStore.notifications.values()"
                :key="notif.id"
                :notification="notif"
                @close="notifyStore.notifyRemove(notif.id)"
            />
        </TransitionGroup>
    </div>
</template>

<style scoped>
.notifications {
    position: fixed;
    bottom: 20px;
    right: 20px;
    min-width: 280px;
    max-width: 26vw;

    z-index: 1000;
    pointer-events: none;
}

.notif-enter-active,
.notif-leave-active {
    transition: all v-bind(NOTIFICATION_LEAVE_TIME + "ms") ease;
}

.notif-enter-from {
    opacity: 0;
    transform: translateY(20px);
}

.notif-leave-to {
    opacity: 0;
    transform: translateX(40px);
}
</style>
