const DOMAIN: string;
const IS_MOBILE: boolean;

function hasCookie(name: string): boolean;

function getCookie(name: string): string;

function setCookie(
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

function deleteCookie(
    name: string,
    options?: {
        path?: string;
        domain?: string;
    }
): void;

function wait(ms: number): Promise<void>;

async function waitForAnim(elem: HTMLElement, options?: { animName?: string; iter?: number }): Promise<void>;
async function waitForTransition(elem: HTMLElement, options?: { propertyName?: string }): Promise<void>;
