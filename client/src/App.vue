<script setup lang="ts">
import { ref } from "vue";
import { RouterView } from "vue-router";

import UpperPanel from "@comp/UpperPanel/Index.vue";

const upperPanel = ref(true);
</script>

<template>
    <UpperPanel v-if="upperPanel" />

    <RouterView :upperPanel @toggleUpperPanel="(value: boolean) => (upperPanel = value)" />
</template>

<style scoped></style>
