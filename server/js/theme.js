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

const themeCheckbox = document.getElementById("theme-checkbox");
const themeLabel = document.getElementById("theme-label");

window.addEventListener("load", () => {
    document.body.removeAttribute("hidden");
    const cookie = document.cookie;
    if (cookie.includes("dark_theme=true")) {
        seTheme(THEME.dark);
        themeCheckbox.checked = true;
    }
    console.log("Theme loaded!");
});

/**
 * Sets the theme of the page
 * @param {object} theme
 * @param {string} theme.backgroundColor
 * @param {string} theme.name
 * @param {string} theme.textColor
 */
function seTheme(theme) {
    document.body.setAttribute("theme", theme.name);
}

/**
 * Changes the theme of the page
 * @param {HTMLInputElement} checkbox
 */
function changeTheme() {
    const currentTheme = document.body.getAttribute("theme");
    const themeToSet = currentTheme === "dark" ? THEME.light : THEME.dark;

    console.log("Changing theme to", themeToSet.name);
    seTheme(themeToSet);

    const cookie = "dark_theme=" + (themeToSet === THEME.dark);
    document.cookie = cookie + ";path=/";

    // if (document.cookie.includes(cookie)) {
    //     console.log("Theme saved!");
    // } else {
    //     console.log("Theme not saved!");
    // }
}
