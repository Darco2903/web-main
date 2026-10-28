<script setup lang="ts">
import { RouterLink } from "vue-router";

const {
  size = "64px",
  url,
  external = false,
  target = "_self",
  clickable = false,
} = defineProps<{
  size: string;
  url?: string;
  external?: boolean;
  target?: string;
  clickable?: boolean;
}>();
</script>

<template>
  <div class="site-icon no-select" :clickable>
    <div v-if="url">
      <a class="site-icon-redirect" :href="url" :target="target" v-if="external">
        <slot />
      </a>
      <RouterLink :to="url" v-else-if="url">
        <slot />
      </RouterLink>
    </div>
    <div v-else>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.site-icon {
  width: v-bind(size);
  height: v-bind(size);
  /* max-width: 64px; */
  /* max-height: 64px; */
  /* overflow: hidden; */
  /* background-size: contain; */
  /* background-repeat: no-repeat; */
  user-select: none;
  transition: filter 200ms ease;

  &[clickable="true"] {
    cursor: pointer;

    &:hover {
      filter: drop-shadow(0 4px 12px rgba(99, 102, 241, 0.35));
    }
  }
}
</style>
