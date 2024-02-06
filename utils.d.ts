declare module "http" {
    interface IncomingMessage {
        getBody(): Promise<string>;
        getCookies(): { [key: string]: string };
    }
}

import http = require("http");

export function printLog(...message: any[]): void;
export function determineContentType(filePath: string): string;
export function GETRequestHandler(req: http.IncomingMessage, res: http.ServerResponse): void;
export function POSTRequestHandler(req: http.IncomingMessage, res: http.ServerResponse, query: object): Promise<void>;
export function HEADRequestHandler(req: http.IncomingMessage, res: http.ServerResponse): void;
