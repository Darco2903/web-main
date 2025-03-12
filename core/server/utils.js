import http from "http";

export function reqHandler(fn) {
    return fn;
}

export function createCookie(name, value, { path, domain, maxAge, expires, secure, samesite, httpOnly }) {
    let cookie = `${name}=${value}`;
    if (path) cookie += `;path=${path}`;
    if (domain) cookie += `;domain=${domain}`;
    if (maxAge) cookie += `;max-age=${maxAge}`;
    if (expires) cookie += `;expires=${expires}`;
    if (secure) cookie += `;secure`;
    if (samesite) cookie += `;samesite=${samesite}`;
    if (httpOnly) cookie += `;HttpOnly`;
    return cookie;
}

export function generateRandomString(length) {
    let str = "";
    do {
        str += Math.random().toString(36).substring(2);
    } while (str.length < length);
    return str.substring(0, length);
}

http.IncomingMessage.prototype.getCookies = function () {
    return Object.fromEntries(
        this.headers?.cookie?.split("; ").map((cookie) => {
            const [key, value] = cookie.split("=");
            return [key, value];
        }) ?? []
    );
};

http.ServerResponse.prototype.setCookie = function (name, value, options = {}) {
    this.setHeader("Set-Cookie", createCookie(name, value, options));
};
