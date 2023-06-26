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

const logoutButton = document.querySelector("#user-logout");
const themeCheckbox = document.querySelector("#theme-input");
const DOMAIN = new URL(document.baseURI).hostname;
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// logoutButton.addEventListener("click", async () => {
//     const res = await fetch("/", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//             request: "logout",
//         }),
//     });
//     if (res.status === 200) {
//         window.location.reload();
//     } else {
//         alert("Error logging out!");
//     }
// });

/**
 * Sets the theme of the page
 * @param {object} theme
 * @param {string} theme.backgroundColor
 * @param {string} theme.name
 * @param {string} theme.textColor
 */
function seTheme(theme) {
    themeCheckbox.checked = theme === THEME.dark;
    setCookie("theme", theme.name, { domain: DOMAIN, path: "/" });
}

themeCheckbox.addEventListener("change", () => {
    const themeToSet = themeCheckbox.checked ? THEME.dark : THEME.light;
    seTheme(themeToSet);
    console.log("Changing theme to", themeToSet.name);
});

window.addEventListener("load", () => {
    const theme = hasCookie("theme") ? THEME[getCookie("theme")] : THEME.light;
    seTheme(theme);
    console.log("Theme loaded!");
    document.body.removeAttribute("hidden");
});
