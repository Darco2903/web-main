import { watchEffect } from "vue";
import { createI18n } from "vue-i18n";
import type { Locale } from "./types";

import en from "./en/index";
import fr from "./fr/index";

const savedLang = localStorage.getItem("lang");
const defaultLang = savedLang || navigator.language.split("-")[0] || "en";

export const i18n = createI18n({
    legacy: false,
    locale: defaultLang,
    fallbackLocale: "en",
    messages: {
        en,
        fr,
    },
});

export async function loadLocale(lang: Locale) {
    i18n.global.locale.value = lang;
}

watchEffect(() => {
    localStorage.setItem("lang", i18n.global.locale.value);
});
