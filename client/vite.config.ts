import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
// import svgLoader from "vite-svg-loader";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        //
        vue(),
        vueDevTools(),
        // svgLoader(),
    ],

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
            ".darco2903.fr",
        ],
    },

    resolve: {
        alias: {
            "@": "/src",
            "@assets": "/src/assets",
            "@fonts": "/src/assets/fonts",
            "@icons": "/src/assets/icons",
            "@comp": "/src/components",
            "@loc": "/src/locales",
            "@mod": "/src/modules",
            "@api": "/src/modules/api",
            "@pages": "/src/pages",
            "@router": "/src/router",
            "@store": "/src/store",
            "@styles": "/src/styles",
            "@utils": "/src/utils",
        },
    },
});
