/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SERVER_ORIGIN: string;
    readonly VITE_AUTH_SERVER_ORIGIN: string;
    readonly VITE_CDN_SERVER_ORIGIN: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
