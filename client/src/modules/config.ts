import { z } from "zod";

/**
 * Runtime config, put in index.html by the server (server/src/server/clientConfig.ts) so one
 * build works with any environment.
 */
const configSchema = z.object({
    serverOrigin: z.string().url(),
    authServerOrigin: z.string().url(),
    cdnServerOrigin: z.string().url(),
    managerServerOrigin: z.string().url(),
    altvServerOrigin: z.string().url(),
});

function readConfig() {
    const el = document.getElementById("app-config");
    if (!el?.textContent) {
        throw new Error("Missing #app-config in index.html, it is added by the server");
    }
    const parsed = configSchema.safeParse(JSON.parse(el.textContent));
    if (!parsed.success) {
        throw new Error(`Invalid #app-config: ${parsed.error.message}`);
    }
    return parsed.data;
}

const config = readConfig();

export const SERVER_ORIGIN = config.serverOrigin;
export const AUTH_SERVER_ORIGIN = config.authServerOrigin;
export const CDN_SERVER_ORIGIN = config.cdnServerOrigin;
export const MANAGER_SERVER_ORIGIN = config.managerServerOrigin;
export const ALTV_SERVER_ORIGIN = config.altvServerOrigin;
