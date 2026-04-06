import { createApp } from "vue";
import { IS_MOBILE, wait } from "@darco2903/web-common";
import { router } from "@router/index";
import { createPinia } from "pinia";
import { i18n } from "@loc/index";

import "@styles/style.css";

import App from "@/App.vue";

window.addEventListener("DOMContentLoaded", async () => {
    document.body.toggleAttribute("mobile", IS_MOBILE);

    createApp(App)
        //
        .use(createPinia())
        .use(router)
        .use(i18n)
        .mount("#app");
});

window.addEventListener("load", async () => {
    await wait(500);
    document.documentElement.style.background = "unset";
});

if (import.meta.hot) {
    import.meta.hot.on("vite:beforeUpdate", () => {
        const n = 24;
        const message = "Hot Reload";
        const middle = " ".repeat(Math.floor((n - message.length) / 2));
        console.log(
            "%c" + "-".repeat(n) + `\n${middle}${message}\n` + "-".repeat(n),
            "color: #42b983; font-weight: bold; font-size: 1.5em;",
        );
    });
}
