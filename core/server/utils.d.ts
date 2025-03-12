import { RequestHandler } from "express";
import { Cookie } from "web-common";

export function reqHandler(fn: RequestHandler): RequestHandler;

export function createCookie(name: string, value: string, options: Cookie): string;

export function generateRandomString(length: number): string;

type Cookies = {
    [key: string]: string;
    session_id?: string;
    public_id?: string;
    env: string;
};

declare module "http" {
    interface IncomingMessage {
        getCookies(): Cookies;
    }

    interface ServerResponse {
        setCookie(name: string, value: string, options: CookieOptions): void;
    }
}
