import AuthAPI from "./utils/AuthApi.js";

import data from "../data.json" with { type: "json" };

const THEME = {
    dark: "dark",
    light: "light",
};

const UPPER_PANEL_PATH = "/resources/html/upper-panel.html";

/** @type {HTMLInputElement} */
let themeCheckbox;

async function refreshSession() {
    const { result, session } = await AuthAPI.session();
    // console.log("Session", session);
    if (!result) return;

    const now = new Date();
    // const expires = new Date(res.session.expires_at);
    // const created = new Date(res.session.created_at);
    const updated = new Date(session.updated_at);
    const lastUpdated = (now - updated) / 1000;
    // console.log(`Expires at: ${expires.toLocaleTimeString("fr")}`);
    console.log(`Session updated: ${Math.round(lastUpdated)} seconds ago`);
    if (lastUpdated > data.sessionRefresh) {
        console.log("Refreshing session");
        AuthAPI.refresh();
    }
}

window.addEventListener("load", async () => {
    await loadUpperPanel();

    loadTheme();

    const css = document.querySelector("[href='/resources/css/upper-panel/index.css']");
    css.onload = () => {
        document.body.removeAttribute("hidden");
        // console.log("CSS loaded");
    };
    // console.log("Page loaded");

    const isAuth = await AuthAPI.auth().then((res) => res.result);
    console.log("Auth", isAuth);

    if (isAuth) {
        await refreshSession();
        await initUserSession();
    } else initLoginButton();
});

async function loadUpperPanel() {
    const upperPanel = document.querySelector("#upper-panel");
    const elementString = await fetch(UPPER_PANEL_PATH).then((res) => res.text());
    const upperPanelContent = new DOMParser().parseFromString(elementString, "text/html").body.firstChild;
    upperPanel.replaceWith(upperPanelContent);
    document.querySelector("#main-site").href = data.WebServer;
}

/**
 * @param {HTMLImageElement} userIcon
 * @param {string} src
 * @returns  {Promise<void>}
 */
async function loadImage(userIcon, src) {
    userIcon.src = src;
    return new Promise((resolve, reject) => {
        userIcon.addEventListener("load", resolve);
        userIcon.addEventListener("error", reject);
    });
}

export async function initUserSession() {
    const userAccount = document.querySelector("#user-account");
    const userSession = document.querySelector("#user-session");
    const userSessionContainer = document.querySelector("#user-session-container");
    // const userLinks = document.querySelector("#user-links");
    const userImageContainer = document.querySelector("#userbox-image-container");
    const userIcon = document.querySelector("#userbox-image");
    // const userAccountInfo = document.querySelector("#user-account-info");
    const userName = document.querySelector("#user-account-name");
    // const myAccountButton = document.querySelector("#user-account-my-account");
    const logoutButton = document.querySelector("#user-account-logout");

    userAccount.toggleAttribute("session-active", true);

    const userId = getCookie("user_id");
    // console.log("User ID", userId);
    const { user } = await AuthAPI.user.id(userId);
    // console.log(user);

    const logoutURL = new URL(data.authServer + "/logout");
    logoutURL.searchParams.append("redirect", data.WebServer);
    logoutButton.setAttribute("href", logoutURL.href);

    userName.textContent = user.name;
    userImageContainer.toggleAttribute("round-border", user.round_border);

    const img = await AuthAPI.user.picture.profile.get(userId);
    if (img.size > 0) {
        const src = URL.createObjectURL(img);
        await loadImage(userIcon, src).then(() => {
            const border = 0.01;
            const topLeft = getAverageRGB(userIcon, userIcon.naturalWidth * border, userIcon.naturalHeight * border);
            const bottomRight = getAverageRGB(userIcon, userIcon.naturalWidth * (1 - border), userIcon.naturalHeight * (1 - border));
            const color1 = rgbToHex(topLeft);
            const color2 = rgbToHex(bottomRight);
            document.documentElement.style.setProperty("--user-gradient-color-1", color1);
            document.documentElement.style.setProperty("--user-gradient-color-2", color2);
        });
    } else {
        userIcon.removeAttribute("src");
        document.documentElement.style.setProperty("--user-gradient-color-1", "var(--default-gradient-color)");
        document.documentElement.style.setProperty("--user-gradient-color-2", "var(--default-gradient-color)");
        // userIcon.removeAttribute("crossorigin");
        // userIcon.setAttribute("default", "");
    }

    window.addEventListener("touchstart", (e) => {
        // const toggle = (e.target === userSessionContainer || userSessionContainer.contains(e.target)) && !userSession.hasAttribute("active");
        const toggle = (e.target === userSessionContainer || userSessionContainer.contains(e.target));
        userSession.toggleAttribute("active", toggle);
    });

    userSession.removeAttribute("loading");
}

function initLoginButton() {
    const loginButton = document.querySelector("#user-account-login");
    const redirectUrl = new URL(data.authServer + "/login");
    redirectUrl.searchParams.append("redirect", window.location.href);
    loginButton.setAttribute("href", redirectUrl.href);

    if (IS_MOBILE) {
        loginButton.addEventListener("touchstart", () => {
            window.location.href = loginButton.href;
        });
        return;
    }

    let i = 0;
    const angle = 60;
    let hovering = false;
    const calcDeg = (i) => (angle * (i / 100) + 135).toFixed(1);
    const setStyle = (i) => loginButton.style.setProperty("background-image", `linear-gradient(${calcDeg(i)}deg, var(--blue-pink-gradient))`);
    const timeout = () => new Promise((resolve) => setTimeout(resolve, 10));

    loginButton.addEventListener("mouseenter", async () => {
        hovering = true;
        for (; i < 100 && hovering; i++) {
            setStyle(i);
            await timeout();
        }
    });

    loginButton.addEventListener("mouseleave", async () => {
        hovering = false;
        for (; i > 0 && !hovering; i--) {
            setStyle(i);
            await timeout();
        }
    });
}

/**
 * Sets the theme of the page
 * @param {string} theme
 */
function setTheme(theme) {
    themeCheckbox.checked = theme === THEME.dark;
    document.body.setAttribute("theme", theme);
}

/**
 * Saves the theme in the local storage
 * @param {string} theme
 */
function saveTheme(theme) {
    window.localStorage.setItem("theme", theme);
}

function loadTheme() {
    themeCheckbox = document.querySelector("#theme-input");
    themeCheckbox.addEventListener("change", () => {
        const themeToSet = themeCheckbox.checked ? THEME.dark : THEME.light;
        setTheme(themeToSet);
        saveTheme(themeToSet);
        console.log("Changing theme to", themeToSet);
    });

    let theme = window.localStorage.getItem("theme");
    if (!theme) {
        theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? THEME.dark : THEME.light;
    }
    setTheme(theme);
    console.log("Theme loaded!");
}

/**
 * @param args {[image: HTMLImageElement, x1: ?number, y1: ?number, x2: ?number, y2: ?number]}
 * @returns {{r: number, g: number, b: number}}
 */
function getAverageRGB(...args) {
    switch (true) {
        case args.length === 0:
        case args.length === 2:
        case args.length === 4:
        case args.length > 5:
            throw new Error("Expected 1, 3 or 5 argument, got", args.length);

        case !(args[0] instanceof HTMLImageElement):
            throw new Error("Expected image to be an instance of HTMLImageElement");

        case args.length === 1:
            return getAverageRGB(args[0], 0, 0, args[0].naturalHeight, args[0].naturalWidth);

        case args.length === 3:
            return getAverageRGB(args[0], args[1], args[2], args[1] + 1, args[2] + 1);

        case args[1] > args[3]:
            [args[1], args[3]] = [args[3], args[1]];
            break;

        case args[2] > args[4]:
            [args[2], args[4]] = [args[4], args[2]];
            break;

        case typeof args[1] !== "number":
        case typeof args[2] !== "number":
        case typeof args[3] !== "number":
        case typeof args[4] !== "number":
            throw new Error("Expected x1, y1, x2, y2 to be numbers");
    }

    const [image, x1, y1, x2, y2] = args;
    const blockSize = Math.floor(Math.sqrt((x2 - x1) * (y2 - y1)) / 10) || 1;
    const defaultRGB = { r: 0, g: 0, b: 0 };
    const canvas = document.createElement("canvas");
    canvas.height = image.naturalHeight;
    canvas.width = image.naturalWidth;
    const context = canvas.getContext && canvas.getContext("2d");
    const width = x2 - x1;
    const height = y2 - y1;
    let data;
    let i = -4;
    let length;
    let rgb = { r: 0, g: 0, b: 0 };
    let count = 0;

    if (!context) {
        return defaultRGB;
    }

    context.drawImage(image, 0, 0);

    try {
        data = context.getImageData(x1, y1, width, height);
    } catch (e) {
        /* security error, img on diff domain */
        alert("x");
        return defaultRGB;
    }

    length = data.data.length;

    while ((i += blockSize * 4) < length) {
        ++count;
        rgb.r += data.data[i];
        rgb.g += data.data[i + 1];
        rgb.b += data.data[i + 2];
    }

    // ~~ used to floor values
    rgb.r = ~~(rgb.r / count);
    rgb.g = ~~(rgb.g / count);
    rgb.b = ~~(rgb.b / count);

    return rgb;
}

/**
 * @param c {number}
 * @returns {string}
 */
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

/**
 * @param {{r: number, g: number, b: number}} param0
 * @returns {string}
 */
function rgbToHex({ r, g, b }) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
