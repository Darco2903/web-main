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
    }
);
</script>

<template>
    <Teleport to="body">
        <TransitionGroup name="confirm" tag="div">
            <div
                class="confirm-content flex col"
                v-if="confirmStore.isActive && confirmStore.currentOptions"
                role="dialog"
                aria-modal="true"
            >
                <div class="confirm-info max" style="margin-bottom: 5px">
                    <span class="title text" style="font-weight: 600">{{ confirmStore.currentOptions.message }}</span>
                    <span
                        class="message text"
                        v-if="confirmStore.currentOptions.subMessage"
                        style="margin-top: 10px; display: block; font-size: 0.9em"
                    >
                        {{ confirmStore.currentOptions.subMessage }}
                    </span>
                </div>

                <div class="flex row align-center" style="justify-content: end; gap: 10px">
                    <button
                        ref="buttonOk"
                        class="confirm-btn usr-btn"
                        :style="{ backgroundColor: confirmStore.currentOptions.danger ? 'var(--color-error)' : 'var(--color-primary)' }"
                        @click="confirmStore.confirmOk"
                    >
                        {{ confirmStore.currentOptions.isAlert ? "OK" : "Confirm" }}
                    </button>

                    <button
                        ref="buttonCancel"
                        class="confirm-btn usr-btn"
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
.confirm-content {
    position: fixed;
    /* inset: 0; */
    z-index: 1010;
    border-radius: 8px;
    padding: 20px;
    left: 50%;
    top: 10px;
    transform: translateX(-50%);
    border: 1px solid var(--border);
    width: 300px;
    /* height: 150px; */
    gap: 20px;
    pointer-events: none;
    background-color: var(--bg-card);
    opacity: 0.95;

    & > * {
        pointer-events: auto;
    }
}

.title,
.message {
    white-space: pre-line;
}

.confirm-btn {
    &:hover,
    &:focus {
        border: 2px solid #eee;
    }
}

/*  */

/* Fade Slide Down Transition */
.confirm-enter-active,
.confirm-leave-active {
    transition: all v-bind(CONFIRM_LEAVE_TIME + "ms") ease;
}

.confirm-enter-from,
.confirm-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
}

.confirm-enter-to,
.confirm-leave-from {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
}
</style>
