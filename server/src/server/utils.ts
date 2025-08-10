import { RequestHandler } from "express";
import { type Cookie } from "web-common";

export function reqHandler(fn: RequestHandler) {
    return fn;
}

export function createCookie(name: string, value: string, { path, domain, maxAge, expires, secure, sameSite, httpOnly }: Cookie) {
    let cookie = `${name}=${value}`;
    if (path) cookie += `;path=${path}`;
    if (domain) cookie += `;domain=${domain}`;
    if (maxAge) cookie += `;max-age=${maxAge}`;
    if (expires) cookie += `;expires=${expires}`;
    if (secure) cookie += `;secure`;
    if (sameSite) cookie += `;samesite=${sameSite}`;
    if (httpOnly) cookie += `;HttpOnly`;
    return cookie;
}

export function generateRandomString(length: number): string {
    let str = "";
    do {
        str += Math.random().toString(36).substring(2);
    } while (str.length < length);
    return str.substring(0, length);
}
