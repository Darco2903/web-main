<script setup lang="ts">
import { computed, ref, type CSSProperties } from "vue";

import UserSvg from "@icons/user.svg";

const {
    iconUrl,
    roundBorder = false,
    size = "128px",
    borderSize = "4px",
} = defineProps<{
    iconUrl?: string;
    roundBorder?: boolean;
    size?: string;
    borderSize?: string;
}>();

const useFallback = computed<boolean>(() => iconUrl === undefined);
const errored = ref<boolean>(false);

const userBoxImageStyle = computed<CSSProperties>(() => {
    return {
        "border-radius": roundBorder ? "50%" : "0%",
    };
});

const emit = defineEmits<{
    (e: "load", event: Event): void;
    (e: "error", event: Event): void;
}>();

function onLoad(event: Event) {
    errored.value = false;
    emit("load", event);
    console.log("User icon loaded successfully.");
}

function onError(event: Event) {
    errored.value = true;
    emit("error", event);

    const elem = event.target as HTMLImageElement;
    console.error(`Error loading user icon at ${elem.src}, using default icon.`);
}
</script>

<template>
    <div class="user-image-container">
        <div class="user-image-box" :style="userBoxImageStyle">
            <UserSvg class="user-image" v-show="useFallback || errored" />
            <img class="user-image" :src="iconUrl" @load="onLoad" @error="onError" v-show="!useFallback && !errored" />
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
    transition:
        outline 200ms ease,
        border-radius 200ms ease;
}

.user-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
</style>
