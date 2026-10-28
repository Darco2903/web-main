<script setup lang="ts">
import { nextTick, watch, useTemplateRef } from "vue";
import { useConfirmStore } from "@store/ui";
import { CONFIRM_LEAVE_TIME } from "@mod/consts"; // used in style

const confirmStore = useConfirmStore();

const buttonOk = useTemplateRef<HTMLButtonElement>("buttonOk");
const buttonCancel = useTemplateRef<HTMLButtonElement>("buttonCancel");

function onKeyDown(e: KeyboardEvent) {
  if (e.key === "Escape") {
    confirmStore.confirmCancel();
  } else if (e.key === "ArrowLeft") {
    buttonOk.value?.focus();
  } else if (e.key === "ArrowRight") {
    buttonCancel.value?.focus();
  } else if (e.key === "Tab") {
    e.preventDefault();
  }
}

watch(
  () => confirmStore.isActive && confirmStore.currentOptions,
  async (active) => {
    if (active) {
      await nextTick();
      buttonOk.value?.focus();
      window.addEventListener("keydown", onKeyDown);
    } else {
      window.removeEventListener("keydown", onKeyDown);
    }
  },
);
</script>

<template>
  <Teleport to="body">
    <Transition name="confirm-scrim">
      <div class="confirm-scrim g-scrim" v-if="confirmStore.isActive"></div>
    </Transition>

    <TransitionGroup name="confirm" tag="div">
      <div
        class="confirm-content g-dialog g-glass-strong"
        v-if="confirmStore.isActive && confirmStore.currentOptions"
        role="dialog"
        aria-modal="true"
      >
        <div class="confirm-info">
          <span class="title">{{ confirmStore.currentOptions.message }}</span>
          <span class="message g-text-muted" v-if="confirmStore.currentOptions.subMessage">
            {{ confirmStore.currentOptions.subMessage }}
          </span>
        </div>

        <div class="g-dialog-actions">
          <button
            ref="buttonOk"
            class="g-btn"
            :class="confirmStore.currentOptions.danger ? 'g-btn-danger' : 'g-btn-primary'"
            @click="confirmStore.confirmOk"
          >
            {{ confirmStore.currentOptions.isAlert ? "OK" : "Confirm" }}
          </button>

          <button
            ref="buttonCancel"
            class="g-btn"
            @click="confirmStore.confirmCancel"
            v-if="!confirmStore.currentOptions.isAlert"
          >
            Cancel
          </button>
        </div>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<style scoped>
.confirm-scrim {
  position: fixed;
  inset: 0;
  z-index: 1009;
}

.confirm-content {
  position: fixed;
  z-index: 1010;
  left: 50%;
  top: 30%;
  transform: translate(-50%, -50%);
}

.confirm-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.title {
  font-weight: 600;
  white-space: pre-line;
}

.message {
  font-size: 14px;
  white-space: pre-line;
}

/*  */

.confirm-scrim-enter-active,
.confirm-scrim-leave-active {
  transition: opacity v-bind(CONFIRM_LEAVE_TIME + "ms") ease;
}

.confirm-scrim-enter-from,
.confirm-scrim-leave-to {
  opacity: 0;
}

/* Fade Scale Transition */
.confirm-enter-active,
.confirm-leave-active {
  transition:
    opacity v-bind(CONFIRM_LEAVE_TIME + "ms") ease,
    transform v-bind(CONFIRM_LEAVE_TIME + "ms") ease;
}

.confirm-enter-from,
.confirm-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.95);
}

.confirm-enter-to,
.confirm-leave-from {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}
</style>
