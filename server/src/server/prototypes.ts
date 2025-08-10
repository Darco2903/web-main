import { IncomingMessage, ServerResponse } from "http";
import { type Cookie } from "web-common";
import { createCookie } from "./utils.js";

type Cookies = {
    [key: string]: string | undefined;
    session_id?: string;
    public_id?: string;
};

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
