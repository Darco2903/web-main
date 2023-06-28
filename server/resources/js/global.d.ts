declare const DOMAIN: string;
declare const IS_MOBILE: boolean;

declare function hasCookie(name: string): boolean;

declare function getCookie(name: string): string;

declare function setCookie(
    name: string,
    value: string,
    options?: {
        path?: string;
        domain?: string;
        expires?: number | string;
        maxAge?: number;
        secure?: boolean;
        sameSite?: "strict" | "lax";
    }
): void;

declare function deleteCookie(
    name: string,
    options?: {
        path?: string;
        domain?: string;
    }
): void;
