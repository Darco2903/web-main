import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue()],
    server: {
        middlewareMode: true,
        hmr: {
            host: "localhost",
            protocol: "ws",
            port: 8081,
        },
        allowedHosts: [
            //
            "darco2903.fr",
            "dev-www.darco2903.fr", 
        ],
        // origin: "https://dev-www.darco2903.fr",
    },
    resolve: {
        alias: {
            "@": "/src",
            "@assets": "/src/assets",
            "@fonts": "/src/assets/fonts",
            "@icons": "/src/assets/icons",
            "@comp": "/src/components",
            "@config": "/src/config",
            "@mod": "/src/modules",
            "@pages": "/src/pages",
            "@router": "/src/router",
            "@store": "/src/store",
            "@styles": "/src/styles",
            "@utils": "/src/utils",
        },
    },
});
