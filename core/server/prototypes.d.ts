declare module "http" {
    interface IncomingMessage {
        getBody(): Promise<string>;
        getCookies(): { [key: string]: string };
    }

    interface ServerResponse {
        setCookie(name: string, value: string, options: CookieOptions): void;
        endJSON(data: object): void;
    }
}
