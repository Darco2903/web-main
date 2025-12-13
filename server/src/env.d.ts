declare namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV: "development" | "production" | "test";

        SERVER_LISTEN: string;
        SERVER_PORT: string;
        SSL_KEY_PATH: string;
        SSL_CERT_PATH: string;
        SSL_CA_PATH: string;

        SERVER_ORIGIN: string;
        AUTH_SERVER_ORIGIN: string;
    }
}
