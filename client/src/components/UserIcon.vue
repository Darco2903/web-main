<script setup lang="ts">
import { computed } from "vue";

import userIconDark from "@icons/profile/user-default-dark.jpg";

const { iconUrl, roundBorder, size, borderSize } = defineProps({
    iconUrl: {
        type: String,
        required: false,
        default: userIconDark,
    },

    roundBorder: {
        type: Boolean,
        required: false,
        default: false,
    },

    size: {
        type: String,
        required: false,
        default: "128px",
    },

    borderSize: {
        type: String,
        required: false,
        default: "4px",
    },
});

const imageSrc = computed(() => {
    return iconUrl || userIconDark;
});

const userBoxImageStyle = computed(() => {
    return {
        "border-radius": roundBorder ? "50%" : "0%",
    };
});

const emit = defineEmits<{
    (e: "load", event: Event): void;
    (e: "error", event: Event): void;
}>();

function onLoad(event: Event) {
    emit("load", event);
}

function onError(event: Event) {
    const elem = event.target as HTMLImageElement;
    console.error(`Error loading user icon at ${elem.src}, using default icon.`);
    emit("error", event);
    elem.src = userIconDark;
}
</script>

<template>
    <div class="user-image-container">
        <div class="user-image-box" :style="userBoxImageStyle">
            <img class="user-image" :src="imageSrc" @load="onLoad" @error="onError" />
        </div>
    </div>
</template>

<style>
.user-image-container {
    width: v-bind(size);
    height: v-bind(size);
    display: flex;
    align-items: center;
    justify-content: center;
}

.user-image-box {
    width: calc(v-bind(size) - v-bind(borderSize) * 2);
    height: calc(v-bind(size) - v-bind(borderSize) * 2);
    outline: v-bind(borderSize) solid #eee;
    outline-offset: -1px;
    overflow: hidden;
    transition: outline var(--theme-time) ease, border-radius 0.2s ease;
}

.user-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
</style>
