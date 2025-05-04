import AuthAPI from "auth-api";
import { createApp } from "vue";
// import { socket } from "@mod/socket";
import { IS_MOBILE } from "web-common";

import { router } from "@router/index";
import store from "@store/store";

import "@styles/style.css";
import App from "@/App.vue";

import { origin, sessionRefresh } from "@config/auth-server.json";

AuthAPI.setApiOrigin(origin);

async function refreshSession() {
    const res = await AuthAPI.session.refresh();
    if (res.error || !res.result) {
        console.error("Failed to refresh session", res.error || res.result);
        return;
    }
    // console.log("sessionRefresh", res);
    console.log("Session refreshed");
}

window.addEventListener("load", async () => {
    document.body.classList.remove("no-transition");
    document.body.toggleAttribute("mobile", IS_MOBILE);

    const res = await AuthAPI.user.me();
    if (res.error) {
        console.log("User error", res.error);
    } else if (!res.result) {
        console.log("User not found");
    } else {
        const userId = res.user.public_id;
        // store.commit("setUserId", userId);
        store.commit("setUser", res.user);
        console.log("user_id set in store");

        refreshSession();
        setInterval(refreshSession, sessionRefresh * 1000);
    }

    createApp(App)
        //
        .use(router)
        .use(store)
        .mount("#app");
});

if (import.meta.hot) {
    import.meta.hot.on(
        "vite:beforeUpdate",
        /* eslint-disable-next-line no-console */
        () => console.clear()
    );
}
