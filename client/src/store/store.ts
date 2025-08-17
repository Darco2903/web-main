import { type InjectionKey } from "vue";
import { createStore, Store } from "vuex";
import type { User } from "auth-api";

export interface State {
    user: User | null;
}

export const key: InjectionKey<Store<State>> = Symbol();

export const store = createStore<State>({
    state: {
        user: null,
    },
});
