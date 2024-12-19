const hostname = new URL(document.baseURI).hostname;
const DOMAIN = !["localhost", "127.0.0.1"].includes(hostname) && hostname.match(/\./g).length > 1 ? hostname.replace(/^[^.]+\./g, "") : hostname;
const IS_MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

function hasCookie(name) {
    return document.cookie.includes(name);
}

function getCookie(name) {
    return document.cookie
        .split("; ")
        .find((row) => row.startsWith(name))
        ?.split("=")[1];
}

/**
 * Sets a cookie
 * @param {string} name
 * @param {string} value
 * @param {object} [#data]
 * @param {string} [#data.path]
 * @param {string} [#data.domain]
 * @param {string} [#data.expires]
 * @param {string} [#data.maxAge]
 * @param {boolean} [#data.secure]
 * @param {string} [#data.samesite]
 * @returns {void}
 */
function setCookie(name, value, data = {}) {
    const { path, domain, expires, maxAge, secure, samesite } = data;
    let cookie = `${name}=${value}`;
    if (path) cookie += `;path=${path}`;
    if (domain) cookie += `;domain=${domain}`;
    if (expires) cookie += `;expires=${expires}`;
    if (maxAge) cookie += `;max-age=${maxAge}`;
    if (secure) cookie += `;secure`;
    if (samesite) cookie += `;samesite=${samesite}`;
    document.cookie = cookie;
}

/**
 * Deletes a cookie
 * @param {string} name
 * @param {object} [#data]
 * @param {string} [#data.path]
 * @param {string} [#data.domain]
 * @returns {void}
 */
function deleteCookie(name, data = {}) {
    data.maxAge = 0;
    data.expires = "Thu, 01 Jan 1970 00:00:00 UTC";
    setCookie(name, "", data);
}

String.prototype.capitalizeFirstLetter = function () {
    return this[0].toUpperCase() + this.slice(1);
};

async function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @param {HTMLElement} elem
 */
async function waitForEvent(elem, type) {
    return new Promise((resolve) => {
        elem.addEventListener(type, resolve, { once: true });
    });
}

/**
 * @param {HTMLElement} elem
 */
async function waitForAnim(elem, animName) {
    await new Promise((resolve) => {
        const animHandler = (e) => {
            if (!animName || animName === e.animationName) {
                resolve();
                elem.removeEventListener("animationend", animHandler);
            }
        };
        elem.addEventListener("animationend", animHandler);
    });
}

async function waitForAnimIter(elem, iter, animName) {
    await new Promise((resolve) => {
        const iterHandler = (e) => {
            if (!animName || animName === e.animationName) {
                iter--;
                if (iter <= 0) {
                    resolve();
                    elem.removeEventListener("animationiteration", iterHandler);
                }
            }
        };
        elem.addEventListener("animationiteration", iterHandler);
    });
}

/**
 * @param {HTMLElement} elem
 */
async function waitForTransition(elem, { propertyName } = {}) {
    return new Promise((resolve) => {
        elem.addEventListener("transitionend", (e) => {
            if (!propertyName || propertyName === e.propertyName) {
                resolve();
            }
        });
    });
}

window.addEventListener("load", async () => {
    document.body.toggleAttribute("mobile", IS_MOBILE);

    // set the language
    const lang = navigator.language.split("-")[0];
    document.documentElement.lang = lang;
});
