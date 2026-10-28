<script setup lang="ts">
import { RouterView } from "vue-router";
import UpperPanel from "@comp/UpperPanel/Index.vue";
</script>

<template>
  <div class="layout">
    <UpperPanel />

    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1100px;
  margin: 0 auto;
  padding: 16px 16px 48px;
}

body[mobile] .layout {
  gap: 16px;
  padding: 10px 10px 32px;
}
</style>
