import { readonly, ref } from "vue";
import { defineStore } from "pinia";
import { getCookie, setCookie, DOMAIN } from "@darco2903/web-common";

export type Theme = "system" | "light" | "dark";

export const useThemeStore = defineStore("theme", () => {
    const theme = ref<Theme>("system");

    function setTheme(newTheme: Theme) {
        theme.value = newTheme;
        localStorage.setItem("theme", newTheme);
        setCookie("theme", newTheme, { domain: DOMAIN, path: "/" });

        if (newTheme === "system") {
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            newTheme = prefersDark ? "dark" : "light";
        }
        document.documentElement.setAttribute("data-theme", newTheme);
    }

    function getTheme(): Theme {
        const storedTheme = localStorage.getItem("theme") || getCookie("theme");

        if (storedTheme && (storedTheme === "system" || storedTheme === "light" || storedTheme === "dark")) {
            return storedTheme;
        }
        return "system";
    }

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", ({ matches }) => {
        if (theme.value !== "system") return;
        setTheme("system");
    });

    return {
        // state
        theme: readonly(theme),

        // actions
        setTheme,
        getTheme,
    };
});
