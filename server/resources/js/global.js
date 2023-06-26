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
 * @param {object} data
 * @param {string} data.path
 * @param {string} data.domain
 * @param {string} data.expires
 * @param {string} data.maxAge
 * @param {boolean} data.secure
 * @param {string} data.samesite
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

function deleteCookie(name) {
    document.cookie = `${name}=;max-age=0`;
}
