import { createClient as createAuthApi } from "auth-api";
import { createClient as createCdnApi } from "cdn-api";

export const authApi = createAuthApi(import.meta.env.VITE_AUTH_SERVER_ORIGIN);
export const cdnApi = createCdnApi(import.meta.env.VITE_CDN_SERVER_ORIGIN);
