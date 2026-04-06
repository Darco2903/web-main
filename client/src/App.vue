<script setup lang="ts">
import { RouterView } from "vue-router";
import { useThemeStore } from "@store/theme";

const themeStore = useThemeStore();

const currentTheme = themeStore.getTheme();
themeStore.setTheme(currentTheme);
</script>

<template>
    <RouterView />
</template>

<style scoped>
/*  */
</style>
