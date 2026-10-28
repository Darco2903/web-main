<script setup lang="ts">
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const router = useRouter();
const { t } = useI18n();

function goBack() {
  if (window.history.length <= 2) {
    router.push("/");
  } else {
    router.back();
  }
}
</script>

<template>
  <div class="not-found">
    <div class="container g-glass g-card">
      <span class="title">404</span>
      <span class="message g-text-muted">{{ t("notFound.message") }}</span>
      <button class="g-btn g-btn-primary" @click="goBack">{{ t("notFound.goBack") }}</button>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 16px;
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 40px 56px;
  text-align: center;
}

.title {
  font-size: 72px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.03em;
}

.message {
  font-size: 1.2em;
}
</style>
