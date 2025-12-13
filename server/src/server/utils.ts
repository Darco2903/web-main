import { RequestHandler } from "express";

export function reqHandler(fn: RequestHandler) {
    return fn;
}

export function generateRandomString(length: number): string {
    let str = "";
    do {
        str += Math.random().toString(36).substring(2);
    } while (str.length < length);
    return str.substring(0, length);
}
