import { createClient as createAuthApi } from "@darco2903/auth-api/client";
import { createClient as createCdnApi } from "@darco2903/cdn-api/client";
import { AUTH_SERVER_ORIGIN, CDN_SERVER_ORIGIN } from "../config";

export const authApi = createAuthApi(AUTH_SERVER_ORIGIN);
export const cdnApi = createCdnApi(CDN_SERVER_ORIGIN);
