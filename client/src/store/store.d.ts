import { Store } from "vuex";
import { type Types } from "auth-api";

declare module "vue" {
    interface State {
        user: Types.User;
    }

    interface ComponentCustomProperties {
        $store: Store<State>;
    }
}
