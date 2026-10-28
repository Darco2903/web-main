<script setup lang="ts">
import type { Notification } from "@store/ui";

defineProps<{
  notification: Notification;
}>();

defineEmits<{
  close: [];
}>();
</script>

<template>
  <div class="notification g-toast" :class="`g-${notification.type}`">
    <span class="notification-message">{{ notification.message }}</span>
    <button class="g-btn g-btn-ghost g-btn-icon g-btn-sm" aria-label="Close" @click="$emit('close')">✕</button>
  </div>
</template>

<style scoped>
.notification {
  pointer-events: auto;
}

.notification-message {
  flex: 1;
}
</style>
