<script setup lang="ts">
import { onMounted, onUnmounted, watch } from "vue";
import { useUIStore } from "@store/ui/index";

const ui = useUIStore();

const { active = undefined, zIndex = 500 } = defineProps<{
    active?: boolean;
    zIndex?: number;
}>();

const emit = defineEmits<{
    close: [];
}>();

watch(
    () => active,
    (newVal) => {
        if (newVal === undefined) return;

        if (newVal) {
            activateOverlay();
        } else {
            deactivateOverlay();
        }
    },
    { immediate: true },
);

function onKeyDown(event: KeyboardEvent) {
    if (ui.dialogActive) return;

    if (event.key === "Escape") {
        emit("close");
    }
}

function activateOverlay() {
    ui.overlayActive = true;
    window.addEventListener("keydown", onKeyDown);
}

function deactivateOverlay() {
    ui.overlayActive = false;
    window.removeEventListener("keydown", onKeyDown);
}

onMounted(() => {
    console.log("Overlay mounted, active =", active);
    if (active === false) return;
    activateOverlay();
});

onUnmounted(() => {
    deactivateOverlay();
});
</script>

<template>
    <Teleport to="body">
        <div class="overlay-content" :style="{ zIndex: zIndex }" :inert="ui.dialogActive">
            <slot />
        </div>
    </Teleport>
</template>

<style scoped>
.overlay-content {
    position: fixed;
    inset: 0;
    /* z-index: 999; */
    pointer-events: none;

    & > * {
        pointer-events: auto;
    }
}
</style>
