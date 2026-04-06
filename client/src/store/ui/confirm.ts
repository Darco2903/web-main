import { ref } from "vue";
import { defineStore } from "pinia";
import { CONFIRM_LEAVE_TIME } from "@mod/consts";

export type ConfirmType = "success" | "error" | "info" | "warning";

export type ConfirmOptions = {
    message: string;
    subMessage?: string;
    // confirmText?: string;
    // cancelText?: string;
    danger?: boolean; // makes confirm button red
    isAlert?: boolean; // if true, only shows confirm button
};

type ConfirmOptionsWithID = ConfirmOptions & {
    id: string;
};

type Resolver = (value: boolean) => void;

export const useConfirmStore = defineStore("confirm", () => {
    const pMap = new Map<string, Resolver>();
    const isActive = ref<boolean>(false);
    const isAlert = ref<boolean>(false);
    const currentOptions = ref<ConfirmOptions | null>(null);
    const queue: ConfirmOptionsWithID[] = [];

    const createConfirmId: () => string =
        crypto.randomUUID !== undefined
            ? () => crypto.randomUUID()
            : () => Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);

    let resolver: Resolver | null = null;

    function _c(options: ConfirmOptionsWithID): Promise<boolean> {
        currentOptions.value = options;
        isActive.value = true;

        return new Promise<boolean>((resolve) => {
            resolver = (value: boolean) => {
                resolve(value);

                const p = pMap.get(options.id);
                if (p) {
                    p(value);
                    pMap.delete(options.id);
                }

                if (queue.length > 0) {
                    currentOptions.value = null; // reset for transition

                    setTimeout(() => {
                        const next = queue.shift()!;
                        _c(next);
                    }, CONFIRM_LEAVE_TIME);
                } else {
                    cleanup();
                }
            };
        });
    }

    function confirm(options: ConfirmOptions): Promise<boolean>;
    function confirm(message: string, subMessage?: string): Promise<boolean>;
    function confirm(options: ConfirmOptions | string, subMessage?: string): Promise<boolean> {
        const id = createConfirmId();
        const opts: ConfirmOptionsWithID =
            typeof options === "string"
                ? //
                  {
                      id,
                      message: options,
                      subMessage,
                  }
                : Object.assign({}, options, { id });

        if (isActive.value) {
            queue.push(opts);
            return new Promise<boolean>((resolve) => {
                pMap.set(id, resolve);
            });
        } else {
            return _c(opts);
        }
    }

    async function alert(message: string, subMessage?: string): Promise<void> {
        return confirm({
            message,
            subMessage,
            isAlert: true,
        }).then(() => undefined);
    }

    function confirmOk() {
        if (!isActive.value) return;
        resolver?.(true);
    }

    function confirmCancel() {
        if (!isActive.value) return;
        resolver?.(false);
    }

    function cleanup() {
        resolver = null;
        isActive.value = false;
        currentOptions.value = null;
    }

    return {
        // state
        isActive,
        isAlert,
        currentOptions,

        // public api
        alert,
        confirm,
        confirmOk,
        confirmCancel,
    };
});
