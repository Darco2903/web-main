export function hasCookie(name: string): boolean;

export function getCookie(name: string): string;

export function setCookie(
    name: string,
    value: string,
    options: {
        path: string;
        domain: string;
        expires: number | string;
        maxAge: number;
        secure: boolean;
        sameSite: "strict" | "lax";
    }
): void;

export function deleteCookie(name: string): void;
