const THEME = {
    dark: "dark",
    light: "light",
};

const UPPER_PANEL_PATH = "/resources/html/upper-panel.html";
const USER_ICON_PATH = "/user/resources/images/profile/";
const USER_DEFAULT_ICON = "default";

let themeCheckbox;
let userSession;
let userLinks;

window.addEventListener("load", async () => {
    await loadUpperPanel();

    themeCheckbox = document.querySelector("#theme-input");
    themeCheckbox.addEventListener("change", () => {
        const themeToSet = themeCheckbox.checked ? THEME.dark : THEME.light;
        setTheme(themeToSet);
        console.log("Changing theme to", themeToSet);
    });

    const theme = hasCookie("theme") ? getCookie("theme") : THEME.light;
    setTheme(theme);
    console.log("Theme loaded!");

    document.body.removeAttribute("hidden");

    if (hasCookie("session_active")) await initUserSession();
    else if (!IS_MOBILE) initLoginButton();
});

async function loadUpperPanel() {
    const upperPanel = document.querySelector("#upper-panel");
    if (!upperPanel) {
        throw new Error("upper-panel not found");
    } else if (upperPanel.hasChildNodes()) {
        console.warn("upper-panel already exists");
    } else if (!document.querySelector('link[href$="upper-panel.css"]')) {
        throw new Error("upper-panel.css not found");
    } else {
        const elementString = await fetch(UPPER_PANEL_PATH).then((res) => res.text());
        const upperPanelContent = new DOMParser().parseFromString(elementString, "text/html").body.firstChild;
        upperPanel.replaceWith(upperPanelContent);
    }
}

async function initUserSession() {
    userSession = document.querySelector("#user-session");
    userLinks = document.querySelector("#user-links");
    const userIcon = document.querySelector("#user-account-icon");
    const userAccountInfo = document.querySelector("#user-account-info");
    const userName = document.querySelector("#user-account-name");
    const logoutButton = document.querySelector("#user-account-logout");

    const redirectUrl = new URL(`http://${AUTH_SERVER}/logout`);
    redirectUrl.searchParams.append("redirect", window.location.href);
    logoutButton.setAttribute("href", redirectUrl.href);
    userSession.toggleAttribute("active");
    userLinks.toggleAttribute("active");
    userSession.style.width = userAccountInfo.offsetWidth + 1 + "px";
    userLinks.toggleAttribute("active");
    userIcon.crossOrigin = "anonymous";
    userIcon.src = getUserIconPath(getCookie("user_id"));
    userSession.style.setProperty("display", "none");

    if (getCookie("user_role") >= 3) {
        document.querySelector("#admin-link")?.toggleAttribute("active");
    }

    userSession.addEventListener("click", () => {
        userLinks.toggleAttribute("active");
    });

    return new Promise((resolve, reject) => {
        const timeout = setTimeout(reject, 2000);
        userIcon.addEventListener("load", () => {
            clearTimeout(timeout);
            resolve();
        });
        userIcon.addEventListener("error", () => {
            userIcon.removeAttribute("src");
            clearTimeout(timeout);
            reject();
        });
    })
        .then(() => {
            const border = 0.01;
            const topLeft = getAverageRGB(userIcon, userIcon.naturalWidth * border, userIcon.naturalHeight * border);
            const bottomRight = getAverageRGB(userIcon, userIcon.naturalWidth * (1 - border), userIcon.naturalHeight * (1 - border));
            const color1 = rgbToHex(topLeft);
            const color2 = rgbToHex(bottomRight);
            document.documentElement.style.setProperty("--user-gradient-color-1", color1);
            document.documentElement.style.setProperty("--user-gradient-color-2", color2);
        })
        .catch(() => {
            userIcon.removeAttribute("crossorigin");
            userIcon.setAttribute("default", "");
            userIcon.src = getUserIconPath();
        })
        .finally(() => {
            userName.textContent = hasCookie("user_name") ? getCookie("user_name") : "User";
            userSession.removeAttribute("preload");
            userSession.style.removeProperty("display");
        });
}

function initLoginButton() {
    const loginButton = document.querySelector("#user-account-login");
    let i = 0;
    const angle = 60;
    let hovering = false;
    const calcDeg = (i) => (angle * (i / 100) + 135).toFixed(1);
    const setStyle = (i) => loginButton.style.setProperty("background-image", `linear-gradient(${calcDeg(i)}deg, var(--blue-pink-gradient))`);
    const timeout = () => new Promise((resolve) => setTimeout(resolve, 10));

    // const redirectUrl = new URL(`http://${AUTH_SERVER}/login`);
    // redirectUrl.searchParams.append("redirect", window.location.href);
    // loginButton.setAttribute("href", redirectUrl.href);
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
    setCookie("theme", theme, {
        path: "/",
        domain: "." + DOMAIN,
        maxAge: 60 * 60 * 24 * 365,
    });
}

/**
 * @param id {number}
 * @returns {string}
 */
function getUserIconPath(id = USER_DEFAULT_ICON) {
    return `http://${AUTH_SERVER}${USER_ICON_PATH}user-${id}.png`;
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
