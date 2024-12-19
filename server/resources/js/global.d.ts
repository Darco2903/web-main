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

async function waitForEvent<K extends keyof HTMLElementEventMap>(
    elem: HTMLElement,
    type: K,
    // options?: boolean | AddEventListenerOptions
): Promise<HTMLElementEventMap[K]>;
async function waitForAnim(elem: HTMLElement, animName?: string): Promise<void>;
async function waitForAnimIter(elem: HTMLElement, iter: number, animName?: string): Promise<void>;
async function waitForTransition(elem: HTMLElement, options?: { propertyName?: string }): Promise<void>;
