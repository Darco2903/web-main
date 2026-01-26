/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_MAIN_SERVER_ORIGIN: string;
    readonly VITE_AUTH_SERVER_ORIGIN: string;
    readonly VITE_CDN_SERVER_ORIGIN: string;
    readonly VITE_MANAGER_SERVER_ORIGIN: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
