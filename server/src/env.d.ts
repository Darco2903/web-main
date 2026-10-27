declare namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV: "development" | "production" | "test";

        SERVER_LISTEN?: string;
        SERVER_PORT?: string;
        /** Relative to the root folder or absolute */
        SSL_KEY_PATH?: string;
        SSL_CERT_PATH?: string;
        SSL_CA_PATH?: string;

        /** Optional, "true" to trust the CF-Connecting-IP / X-Forwarded-For headers, defaults to "false" */
        TRUST_PROXY?: string;

        /** URL or bare host (https:// is assumed) */
        SERVER_ORIGIN?: string;
        AUTH_SERVER_ORIGIN?: string;
        CDN_SERVER_ORIGIN?: string;
        MANAGER_SERVER_ORIGIN?: string;
    }
}
