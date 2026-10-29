/**
 * Client IP. Behind a proxy (TRUST_PROXY) it comes from the headers the proxy sets,
 * otherwise anyone could fake it, so only the socket address is used.
 */
export function getClientIP(
    headers: Record<string, string | string[] | undefined>,
    remoteAddress: string | undefined,
    trustProxy: boolean,
) {
    if (trustProxy) {
        const cf = headers["cf-connecting-ip"];
        if (typeof cf === "string" && cf) return cf;
        const xff = headers["x-forwarded-for"];
        const first = (Array.isArray(xff) ? xff[0] : xff)?.split(",")[0].trim();
        if (first) return first;
    }
    return remoteAddress || "unknown";
}
