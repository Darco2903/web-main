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
 * @param {object} [data]
 * @param {string} [data.path]
 * @param {string} [data.domain]
 * @param {string} [data.expires]
 * @param {string} [data.maxAge]
 * @param {boolean} [data.secure]
 * @param {string} [data.samesite]
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
 * @param {object} [data]
 * @param {string} [data.path]
 * @param {string} [data.domain]
 * @returns {void}
 */
function deleteCookie(name, data = {}) {
    data.maxAge = 0;
    data.expires = "Thu, 01 Jan 1970 00:00:00 UTC";
    setCookie(name, "", data);
}

/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
async function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

window.addEventListener("load", () => {
    if (IS_MOBILE) {
        document.body.setAttribute("mobile", "");
    }
});
