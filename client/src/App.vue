<script setup lang="ts">
import { RouterView } from "vue-router";
import { useUIStore } from "@store/ui";
import { useThemeStore } from "@store/theme";

import Confirm from "@comp/ui/Confirm.vue";
// import NotifyContainer from "@comp/ui/NotifyContainer.vue";

const ui = useUIStore();
const themeStore = useThemeStore();

const currentTheme = themeStore.getTheme();
themeStore.setTheme(currentTheme);
</script>

<template>
  <div>
    <Confirm />
    <!-- <NotifyContainer /> -->

    <RouterView class="router-view" :inert="ui.isBodyInert()" />
  </div>
</template>

<style scoped>
.router-view {
  /* --margin: 8px; */
  /* height: calc(100vh - 2 * var(--margin)); */
  /* width: calc(100vw - 2 * var(--margin)); */
  /* margin: var(--margin); */
  /* overflow: auto; */
}
</style>
