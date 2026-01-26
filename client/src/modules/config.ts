function configError(message: string) {
    throw new Error(message);
}

if (!import.meta.env.VITE_MAIN_SERVER_ORIGIN) {
    configError("VITE_MAIN_SERVER_ORIGIN is not defined");
}

if (!import.meta.env.VITE_AUTH_SERVER_ORIGIN) {
    configError("VITE_AUTH_SERVER_ORIGIN is not defined");
}

if (!import.meta.env.VITE_CDN_SERVER_ORIGIN) {
    configError("VITE_CDN_SERVER_ORIGIN is not defined");
}

if (!import.meta.env.VITE_MANAGER_SERVER_ORIGIN) {
    configError("VITE_MANAGER_SERVER_ORIGIN is not defined");
}

export const VITE_MAIN_SERVER_ORIGIN = import.meta.env.VITE_MAIN_SERVER_ORIGIN;
export const VITE_AUTH_SERVER_ORIGIN = import.meta.env.VITE_AUTH_SERVER_ORIGIN;
export const VITE_CDN_SERVER_ORIGIN = import.meta.env.VITE_CDN_SERVER_ORIGIN;
export const VITE_MANAGER_SERVER_ORIGIN = import.meta.env.VITE_MANAGER_SERVER_ORIGIN;
