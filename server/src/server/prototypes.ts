import { IncomingMessage, ServerResponse } from "http";
import { createCookie, type Cookie } from "web-common";
import { Cookies } from "../types/cookie.js";

declare module "http" {
    interface IncomingMessage {
        getCookies(): Cookies;
    }
    interface ServerResponse {
        setCookie(name: string, value: string, options?: Cookie): void;
    }
}

IncomingMessage.prototype.getCookies = function () {
    return Object.fromEntries(
        this.headers?.cookie?.split("; ").map((cookie) => {
            const [key, value] = cookie.split("=");
            return [key, value];
        }) ?? []
    );
};

ServerResponse.prototype.setCookie = function (name, value, options = {}) {
    this.setHeader("Set-Cookie", createCookie(name, value, options));
};
