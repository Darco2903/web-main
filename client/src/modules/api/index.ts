import { createClient as createAuthApi } from "@darco2903/auth-api/client";
import { createClient as createCdnApi } from "@darco2903/cdn-api/client";
import { VITE_AUTH_SERVER_ORIGIN, VITE_CDN_SERVER_ORIGIN } from "../config";

export const authApi = createAuthApi(VITE_AUTH_SERVER_ORIGIN);
export const cdnApi = createCdnApi(VITE_CDN_SERVER_ORIGIN);
