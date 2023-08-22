const THEME = {
    dark: "dark",
    light: "light",
};
const themeCheckbox = document.querySelector("#theme-input");

/**
 * Sets the theme of the page
 * @param {string} theme
 */
function setTheme(theme) {
    if (themeCheckbox) themeCheckbox.checked = theme === THEME.dark;
    document.body.setAttribute("theme", theme);
    setCookie("theme", theme, {
        path: "/",
        domain: "." + DOMAIN,
        maxAge: 60 * 60 * 24 * 365,
    });
}

themeCheckbox?.addEventListener("change", () => {
    const themeToSet = themeCheckbox.checked ? THEME.dark : THEME.light;
    setTheme(themeToSet);
    console.log("Changing theme to", themeToSet);
});

window.addEventListener("load", () => {
    const theme = hasCookie("theme") ? getCookie("theme") : THEME.light;
    setTheme(theme);
    console.log("Theme loaded!");

    document.body.removeAttribute("hidden");
});
