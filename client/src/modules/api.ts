import { createClient as createAuthApi } from "@darco2903/auth-api/client";
import { createClient as createCdnApi } from "@darco2903/cdn-api";

export const authApi = createAuthApi(import.meta.env.VITE_AUTH_SERVER_ORIGIN);
export const cdnApi = createCdnApi(import.meta.env.VITE_CDN_SERVER_ORIGIN);
