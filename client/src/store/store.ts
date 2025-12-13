import { type InjectionKey } from "vue";
import { createStore, Store } from "vuex";
import type { User } from "@darco2903/auth-api/client";

export interface State {
    user: User | null;
    userIconUrl?: string;
}

export const key: InjectionKey<Store<State>> = Symbol();

export const store = createStore<State>({
    state: {
        user: null,
        userIconUrl: undefined,
    },
});
