import http = require("http");

declare module "http" {
    interface IncomingMessage {
        getBody(): Promise<string>;
        getCookies(): { [key: string]: string };
    }
}

export const DEBUG: boolean;
export const DEV_MODE: boolean;

export function printLog(...message: any[]): void;
export function printDebug(...message: any[]): void;
export function printObject(any): void;

export function exists(filePath: string): Promise<boolean>;

export async function GETRequestHandler(req: http.IncomingMessage, res: http.ServerResponse): Promise<void>;
export async function POSTRequestHandler(req: http.IncomingMessage, res: http.ServerResponse, query: object): Promise<void>;
export async function HEADRequestHandler(req: http.IncomingMessage, res: http.ServerResponse): Promise<void>;

export function getPathPermission(reqPath: string): number;
export async function isAuthenticated(req: http.IncomingMessage): Promise<boolean>;
export async function hasPermission(req: http.IncomingMessage): Promise<boolean>;
