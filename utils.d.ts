import http = require("http");

declare module "http" {
    interface IncomingMessage {
        getBody(): Promise<string>;
        getCookies(): { [key: string]: string };
    }
}

export const DEBUG: boolean;
export const DEV_MODE: boolean;

export async function printLog(...message: any[]): Promise<void>;
export async function printDebug(...message: any[]): Promise<void>;
export async function printObject(obj: Object): Promise<void>;

export function getHost(req: http.IncomingMessage): string;
export function getDomain(host: string): string;
export function isIp(host: string): boolean;
export function createCookie(
    name: string,
    value: string,
    options: {
        path: string;
        domain: string;
        maxAge: number;
        expires: Date;
        secure: boolean;
        samesite: "Strict" | "Lax" | "None";
        httpOnly: boolean;
    }
): string;

export async function exists(filePath: string): Promise<boolean>;

export async function GETRequestHandler(req: http.IncomingMessage, res: http.ServerResponse): Promise<void>;
export async function POSTRequestHandler(req: http.IncomingMessage, res: http.ServerResponse, query: object): Promise<void>;
export async function HEADRequestHandler(req: http.IncomingMessage, res: http.ServerResponse): Promise<void>;

export function getPathPermission(reqPath: string): number;
export async function isAuthenticated(req: http.IncomingMessage): Promise<boolean>;
export async function hasPermission(req: http.IncomingMessage): Promise<boolean>;
