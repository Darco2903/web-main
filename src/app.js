import AuthAPI from "auth-api";
import { createApp } from "vue";
// import { socket } from "@mod/socket";
import { IS_MOBILE } from "web-common";

import { router } from "@router/index";
import store from "@store/store";

import App from "@/App.vue";

import { origin, sessionRefresh } from "@config/auth-server.json";

import "@styles/style.css";

AuthAPI.setApiOrigin(origin);

createApp(App)
    //
    .use(router)
    .use(store)
    .mount("#app");

async function refreshSession() {
    const ref = await AuthAPI.session.refresh();
    if (ref.error || !ref.result) {
        console.error("Failed to refresh session", ref.error || ref.result);
    }
    // console.log("sessionRefresh", ref);
    console.log("Session refreshed");
}

window.addEventListener("load", async () => {
    document.body.classList.remove("no-transition");
    document.body.toggleAttribute("mobile", IS_MOBILE);

    setInterval(refreshSession, sessionRefresh * 1000);

    await refreshSession();
});

if (import.meta.hot) {
    import.meta.hot.on(
        "vite:beforeUpdate",
        /* eslint-disable-next-line no-console */
        () => console.clear()
    );
}
