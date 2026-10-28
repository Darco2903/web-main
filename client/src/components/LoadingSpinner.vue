<script setup lang="ts">
const { loading, color, size, width } = defineProps({
  loading: {
    type: Boolean,
    required: true,
  },
  color: {
    type: String,
    default: "var(--color-primary)",
    required: false,
  },
  size: {
    type: String,
    default: "32px",
    required: false,
  },
  width: {
    type: String,
    default: "3px",
    required: false,
  },
});
</script>

<template>
  <div class="loading-ring-container">
    <span
      class="loading-ring g-spinner"
      :loading
      :style="{ '--size': size, borderWidth: width, borderTopColor: color }"
    ></span>
  </div>
</template>

<style scoped>
.loading-ring-container {
  display: flex;
}

.loading-ring {
  transition: opacity var(--g-duration);
}

.loading-ring[loading="false"] {
  opacity: 0;
}
</style>
