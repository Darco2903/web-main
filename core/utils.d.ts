type CookieOptions = {
    path: string;
    domain: string;
    maxAge: number;
    expires: Date;
    secure: boolean;
    samesite: "Strict" | "Lax" | "None";
    httpOnly: boolean;
};

export const DEBUG: boolean;
export const DEV_MODE: boolean;

export function getLocalIp(name?: "Wi-Fi" | "Ethernet"): string;

export async function printObject(obj: Object): Promise<void>;

export function createCookie(name: string, value: string, options: CookieOptions): string;

export async function exists(filePath: string): Promise<boolean>;
export async function wait(ms: number): Promise<void>;

export function padAddr(addr: string): string;
