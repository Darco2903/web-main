import { Store } from "vuex";
import AuthAPI from "auth-api";

declare module "vue" {
    interface State {
        user: AuthAPI.Types.User;
    }

    type Action = {
        //
    };

    type Mutation = {
        setUser(state: State, user: AuthAPI.Types.User): void;
    };

    interface CustomStore<S> extends Store<S> {
        commit<K extends keyof Mutation>(key: K, payload: Parameters<Mutation[K]>[1]): ReturnType<Mutation[K]>;
        dispatch<K extends keyof Action>(key: K, payload: Parameters<Action[K]>[1]): ReturnType<Action[K]>;
    }

    interface ComponentCustomProperties {
        $store: CustomStore<State>;
    }
}
