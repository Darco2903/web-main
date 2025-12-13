import { createApp } from "vue";
import { IS_MOBILE } from "@darco2903/web-common";
import { authApi } from "@/modules/api";
import { router } from "@router/index";
import { store, key } from "@store/store";
import { i18n } from "./locales";

import "@styles/style.css";
import App from "@/App.vue";

// import { sessionRefresh } from "@config/auth-server.json";

// async function refreshSession() {
//     const res = await AuthAPI.session.refresh();
//     if (res.error || !res.result) {
//         console.error("Failed to refresh session", res.error || res.result);
//         return;
//     }
//     // console.log("sessionRefresh", res);
//     console.log("Session refreshed");
// }

export async function loadUser() {
    const res = await authApi.user.me();
    console.log("User response:", res);
    if (res.status === 200) {
        store.state.user = res.body;
        console.log("User loaded");
    } else if (res.status === 401) {
        const refreshRes = await authApi.refresh({ body: undefined });
        if (refreshRes.status === 200) {
            await loadUser();
        } else {
            console.error("Failed to reload user", refreshRes.body);
        }
    } else if (res.status === 500) {
        console.error("Failed to reload user", res.body.error);
    } else {
        console.error("Failed to reload user");
    }
}

window.addEventListener("load", async () => {
    document.body.classList.remove("no-transition");
    document.body.toggleAttribute("mobile", IS_MOBILE);

    // const res = await AuthAPI.user.me();
    // if (res.error) {
    //     console.log("User error", res.error);
    // } else if (!res.result) {
    //     console.log("User not found");
    // } else {
    //     // const userId = res.user?.public_id;
    //     // store.commit("setUserId", userId);
    //     // store.commit("setUser", res.user);
    //     store.state.user = res.user || null;
    //     console.log("user_id set in store");

    //     refreshSession();
    //     setInterval(refreshSession, sessionRefresh * 1000);
    // }

    await loadUser().catch((err) => {
        console.error("Error loading user:", err);
    });

    createApp(App)
        //
        .use(router)
        .use(store, key)
        .use(i18n)
        .mount("#app");
});

if (import.meta.hot) {
    import.meta.hot.on("vite:beforeUpdate", () => {
        const n = 24;
        const message = "Hot Reload";
        const middle = " ".repeat(Math.floor((n - message.length) / 2));
        console.log(
            "%c" + "-".repeat(n) + `\n${middle}${message}\n` + "-".repeat(n),
            "color: #42b983; font-weight: bold; font-size: 1.5em;"
        );
    });
}
