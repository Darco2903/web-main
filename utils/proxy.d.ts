import http from "http";

/**
 * Whether the proxy is configured correctly
 */
export const configOk: boolean;

/**
 * Whether the proxy is enabled
 */
export const enabled: boolean;

/**
 * Check if the URL is allowed
 * @param url The URL to check.
 * @returns Whether the URL is allowed
 */
export function isAllowed(url: string): boolean;

/**
 * Check if the request is a proxy request
 * @param req The request to check.
 * @returns Whether the request is a proxy request
 */
export function isRequest(req: http.IncomingMessage): boolean;

/**
 * Parse the URL from the request
 * @param req The request to parse.
 * @returns The URL
 */
export function parseUrl(req: http.IncomingMessage): string;

/**
 * Proxy the request
 * @param req The request to proxy.
 * @param res The response to proxy.
 * @param url The URL to proxy.
 */
export async function proxy(req: http.IncomingMessage, res: http.ServerResponse, url: string): Promise<void>;

/**
 * Proxy the request
 * @param req The request to proxy.
 * @param res The response to proxy.
 */
export async function proxyRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void>;
