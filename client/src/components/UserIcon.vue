<script setup lang="ts">
import { computed, ref } from "vue";

import UserSvg from "@icons/user.svg";

const {
  iconUrl,
  roundBorder = false,
  size = "128px",
  borderSize = "4px",
  ring,
} = defineProps<{
  iconUrl?: string;
  roundBorder?: boolean;
  size?: string;
  borderSize?: string;
  /** background of the ring, defaults to the brand gradient */
  ring?: string;
}>();

const useFallback = computed<boolean>(() => iconUrl === undefined);
const errored = ref<boolean>(false);

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
  <div
    class="user-icon g-avatar"
    :class="{ round: roundBorder }"
    :style="{ '--size': size, padding: borderSize, background: ring }"
  >
    <UserSvg class="user-icon-fallback" v-show="useFallback || errored" />
    <img :src="iconUrl" alt="" @load="onLoad" @error="onError" v-show="!useFallback && !errored" />
  </div>
</template>

<style scoped>
.user-icon-fallback {
  color: var(--g-text-muted);
}
</style>
