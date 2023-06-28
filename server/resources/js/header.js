const THEME = {
    dark: {
        backgroundColor: "#1a1a1a",
        name: "dark",
        textColor: "#ffffff",
    },
    light: {
        backgroundColor: "#ffffff",
        name: "light",
        textColor: "#000000",
    },
};

const themeCheckbox = document.querySelector("#theme-input");

/**
 * Sets the theme of the page
 * @param {string} themeName
 */
function seTheme(themeName) {
    const theme = THEME[themeName];
    if (themeCheckbox) themeCheckbox.checked = theme === THEME.dark;
    document.body.setAttribute("theme", theme.name);
    setCookie("theme", theme.name, { domain: "." + DOMAIN, path: "/" });
}

themeCheckbox?.addEventListener("change", () => {
    const themeToSet = themeCheckbox.checked ? THEME.dark.name : THEME.light.name;
    seTheme(themeToSet);
    console.log("Changing theme to", themeToSet.name);
});

window.addEventListener("load", () => {
    const theme = hasCookie("theme") ? getCookie("theme") : THEME.light.name;
    seTheme(theme);
    console.log("Theme loaded!");
    document.body.removeAttribute("hidden");
});
