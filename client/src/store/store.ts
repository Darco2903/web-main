import { type InjectionKey } from "vue";
import { createStore, Store } from "vuex";
import { type Types } from "auth-api";

export interface State {
    user: Types.User | null;
}

export const key: InjectionKey<Store<State>> = Symbol();

export const store = createStore<State>({
    state: {
        user: null,
    },
});
