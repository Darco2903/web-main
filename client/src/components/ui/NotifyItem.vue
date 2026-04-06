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
    <div class="notification" :class="notification.type">
        <span>{{ notification.message }}</span>
        <button @click="$emit('close')">✕</button>
    </div>
</template>

<style scoped>
.notification {
    min-width: 280px;
    padding: 12px 14px;
    border-radius: 6px;
    color: white;

    display: flex;
    justify-content: space-between;
    align-items: center;

    pointer-events: auto;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
    z-index: 1000;
}

.success {
    background: var(--color-success);
}
.error {
    background: var(--color-error);
}
.info {
    background: var(--color-info);
}
.warning {
    background: var(--color-warning);
}

button {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
}
</style>
