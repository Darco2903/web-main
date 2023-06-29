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
