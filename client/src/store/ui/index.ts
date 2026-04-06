import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { useConfirmStore } from "./confirm";
import { useNotifyStore } from "./notify";

export type * from "./confirm";
export type * from "./notify";

const useUIStore = defineStore("ui", () => {
    const confirmStore = useConfirmStore();

    const dialogActive = computed<boolean>(() => confirmStore.isActive);
    const overlayActive = ref<boolean>(false);
    const qrCodeActive = ref<boolean>(false);
    const deviceSendActive = ref<boolean>(false);

    function isBodyInert(): boolean {
        return dialogActive.value || overlayActive.value;
    }

    return {
        // state
        dialogActive,
        overlayActive,
        qrCodeActive,
        deviceSendActive,

        // actions
        isBodyInert,
    };
});

export {
    //
    useConfirmStore,
    useNotifyStore,
    useUIStore,
};
